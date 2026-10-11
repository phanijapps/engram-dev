import {
  existsSync,
  lstatSync,
  realpathSync,
  statSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  openSync,
  fsyncSync,
  closeSync,
  renameSync,
  readdirSync,
  rmSync,
} from 'node:fs';
import { resolve, relative, dirname, join, sep, isAbsolute } from 'node:path';
import { randomUUID, createHash } from 'node:crypto';
import { withPackLock } from '../specpack/transaction.js';
import { loadPackWithMeta } from '../specpack/loader.js';
import { syncPublishedPath } from '../specpack/durability.js';
import { canonical } from '../specpack/workflow.js';
import {
  FeedbackError,
  FEEDBACK_LIMITS,
  type FeedbackLedger,
  type FeedbackMutation,
  type FeedbackReceipt,
  type FeedbackSession,
  type FeedbackAnchor,
  type FeedbackRound,
  type FeedbackSelection,
  type FeedbackContent,
  type FeedbackSnapshotInput,
  type FeedbackThread,
  type FeedbackTarget,
} from './model.js';

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const digestPattern = /^[0-9a-f]{64}$/;
const hash = (bytes: string | Buffer): string => createHash('sha256').update(bytes).digest('hex');
function fail(code: FeedbackError['code'], message: string): never {
  throw new FeedbackError(code, message);
}
function requireValue(value: unknown, message: string): asserts value {
  if (!value) fail('invalid', message);
}
const object = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);
const validId = (value: unknown): value is string => typeof value === 'string' && uuid.test(value);
const integer = (value: unknown): value is number =>
  Number.isSafeInteger(value) && Number(value) >= 0;
const stamp = (value: unknown): boolean =>
  typeof value === 'string' &&
  /^\d{4}-\d\d-\d\dT/.test(value) &&
  Number.isFinite(Date.parse(value));
const claim = (value: unknown, role: string): value is string =>
  typeof value === 'string' &&
  value.startsWith(`${role}:`) &&
  value.slice(role.length + 1).trim().length > 0 &&
  value.length <= 256;
const safePath = (value: unknown): value is string =>
  typeof value === 'string' &&
  value.length > 0 &&
  value.length <= 4096 &&
  !isAbsolute(value) &&
  !value.includes('\\') &&
  !value.includes('\0') &&
  value.split('/').every((s) => !!s && s !== '.' && s !== '..');
function body(value: unknown): asserts value is string {
  requireValue(typeof value === 'string' && value.trim(), 'A nonempty text body is required');
  if (Buffer.byteLength(value) > FEEDBACK_LIMITS.body)
    fail('bounds', 'Feedback text exceeds 8 KiB');
}

/** No symlink below the trusted real root may redirect storage or snapshot reads. */
export function feedbackContainedPath(root: string, path: string): string {
  const realRoot = realpathSync(root);
  const candidate = resolve(realRoot, path);
  const rel = relative(realRoot, candidate);
  if (isAbsolute(rel) || rel === '..' || rel.startsWith(`..${sep}`))
    fail('forbidden', 'Path leaves the trusted workspace');
  let current = realRoot;
  for (const part of rel.split(sep).filter(Boolean)) {
    current = join(current, part);
    if (
      existsSync(current) ||
      (() => {
        try {
          lstatSync(current);
          return true;
        } catch {
          return false;
        }
      })()
    ) {
      if (lstatSync(current).isSymbolicLink())
        fail('forbidden', 'Symlink paths are not feedback targets');
      const actual = realpathSync(current);
      if (actual !== current) fail('forbidden', 'Path changed its real location');
    }
  }
  return candidate;
}
function location(
  packDir: string,
  workspace: string,
): { dir: string; home: string; file: string; pack: ReturnType<typeof loadPackWithMeta> } {
  const dir = feedbackContainedPath(workspace, packDir);
  if (!existsSync(dir) || !statSync(dir).isDirectory())
    fail('missing', 'Pack directory is missing');
  const home = feedbackContainedPath(dir, 'feedback');
  const file = feedbackContainedPath(dir, 'feedback/state.json');
  return { dir, home, file, pack: loadPackWithMeta(dir) };
}
function compatible(pack: ReturnType<typeof loadPackWithMeta>, writing: boolean): string {
  if (!pack.ok) fail('unavailable', pack.message);
  if (
    pack.value.doc.format !== 'specpack/0.4' ||
    pack.value.doc.workflow?.policy !== 'owner-gated/1'
  )
    fail(
      'unavailable',
      'Feedback requires an owner-gated pack; legacy adoption is a separate owner action',
    );
  if (writing && pack.value.doc.status === 'complete')
    fail('conflict', 'Completed packs are read-only');
  if (writing && pack.value.doc.workflow.pending_audit.length)
    fail('conflict', 'Owner audit recovery is pending');
  return pack.value.doc.id ?? pack.value.doc.name;
}
function selection(value: FeedbackSelection): void {
  requireValue(
    object(value) && ['documents', 'diff'].includes(value.mode),
    'Unsupported selection mode',
  );
  requireValue(
    Array.isArray(value.paths) && Array.isArray(value.artifacts),
    'Explicit path and artifact selections are required',
  );
  requireValue(
    value.paths.every(safePath) &&
      value.artifacts.every((k) => typeof k === 'string' && /^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(k)),
    'Invalid selected path or artifact key',
  );
  requireValue(
    value.paths.length + value.artifacts.length > 0 &&
      new Set(value.paths).size === value.paths.length &&
      new Set(value.artifacts).size === value.artifacts.length,
    'Selection must be nonempty and unique',
  );
  if (value.paths.length + value.artifacts.length > FEEDBACK_LIMITS.targets)
    fail('bounds', 'Too many selected targets');
  if (value.mode === 'diff')
    requireValue(
      typeof value.base === 'string' &&
        /^[0-9a-f]{40,64}$/.test(value.base) &&
        !value.artifacts.length,
      'Diff selection needs an immutable commit baseline and explicit paths',
    );
  if (value.head !== undefined)
    requireValue(/^[0-9a-f]{40,64}$/.test(value.head), 'Head must be a resolved commit');
}
function contentValid(
  content: FeedbackContent | null,
  round: string,
  target: string,
  side: string,
): boolean {
  return (
    content === null ||
    (object(content) &&
      content.ref === `rounds/${round}/${target}-${side}.txt` &&
      digestPattern.test(content.sha256) &&
      integer(content.bytes) &&
      content.bytes <= FEEDBACK_LIMITS.file &&
      integer(content.lines))
  );
}
function validateLedger(value: unknown, packId: string): FeedbackLedger {
  try {
    requireValue(
      object(value) &&
        value['format'] === 'feedback/1' &&
        value['pack_id'] === packId &&
        integer(value['revision']) &&
        value['revision'] > 0,
      'Feedback format, pack identity or revision is invalid',
    );
    const state = value as unknown as FeedbackLedger;
    requireValue(
      Array.isArray(state.sessions) &&
        Array.isArray(state.threads) &&
        Array.isArray(state.batches) &&
        Array.isArray(state.operations),
      'Feedback collections are invalid',
    );
    const ids = new Set<string>();
    const unique = (id: string): void => {
      requireValue(validId(id) && !ids.has(id), 'Invalid or duplicate record ID');
      ids.add(id);
    };
    for (const s of state.sessions) {
      requireValue(object(s), 'Invalid session');
      unique(s.id);
      selection(s.selection);
      requireValue(
        Array.isArray(s.rounds) &&
          s.rounds.length > 0 &&
          s.rounds.length <= FEEDBACK_LIMITS.rounds &&
          Array.isArray(s.drafts) &&
          integer(s.cursor),
        'Invalid session state',
      );
      for (const [i, r] of s.rounds.entries()) {
        unique(r.id);
        requireValue(
          r.sequence === i + 1 &&
            stamp(r.at) &&
            claim(r.by, 'agent') &&
            typeof r.sealed === 'boolean' &&
            digestPattern.test(r.digest) &&
            Array.isArray(r.targets) &&
            r.targets.length > 0 &&
            r.targets.length <= FEEDBACK_LIMITS.targets,
          'Invalid round',
        );
        requireValue(i === s.rounds.length - 1 || r.sealed, 'An earlier round is not sealed');
        const targets = new Set<string>();
        const keys = new Set<string>();
        let bytes = 0;
        for (const t of r.targets) {
          requireValue(
            validId(t.id) &&
              !targets.has(t.id) &&
              typeof t.key === 'string' &&
              !keys.has(t.key) &&
              safePath(t.path) &&
              (t.old_path === undefined || safePath(t.old_path)),
            'Invalid target',
          );
          targets.add(t.id);
          keys.add(t.key);
          requireValue(
            contentValid(t.before, r.id, t.id, 'before') &&
              contentValid(t.after, r.id, t.id, 'after') &&
              (t.before || t.after),
            'Invalid snapshot reference',
          );
          bytes += (t.before?.bytes ?? 0) + (t.after?.bytes ?? 0);
        }
        requireValue(
          bytes <= FEEDBACK_LIMITS.round && r.digest === hash(canonical(r.targets)),
          'Round digest or byte bound is invalid',
        );
      }
    }
    for (const t of state.threads) {
      unique(t.id);
      body(t.body);
      const s = session(state, t.session);
      requireValue(
        claim(t.by, 'human') && stamp(t.at) && Array.isArray(t.replies) && Array.isArray(t.events),
        'Invalid thread',
      );
      anchor(s, t.original);
      anchor(s, t.current);
      for (const reply of t.replies) {
        unique(reply.id);
        body(reply.body);
        requireValue(claim(reply.by, 'agent') && stamp(reply.at), 'Invalid reply');
      }
      for (const event of t.events) {
        unique(event.id);
        requireValue(
          ['resolve', 'reattach'].includes(event.kind) &&
            claim(event.by, 'human') &&
            stamp(event.at),
          'Invalid thread event',
        );
        if (event.kind === 'reattach') {
          requireValue(event.anchor, 'Missing reattachment');
          anchor(s, event.anchor);
        }
      }
    }
    for (const s of state.sessions) {
      const batches = state.batches.filter((b) => b.session === s.id);
      requireValue(batches.length === s.cursor, 'Cursor has missing batches');
      for (const [i, b] of batches.entries()) {
        unique(b.id);
        requireValue(
          b.cursor === i + 1 &&
            claim(b.by, 'human') &&
            stamp(b.at) &&
            Array.isArray(b.items) &&
            s.rounds.some((r) => r.id === b.round && r.sealed),
          'Invalid batch',
        );
        for (const item of b.items) validateItem(state, s, item, unique);
      }
      for (const item of s.drafts) {
        validateItem(state, s, item, unique);
        requireValue(
          item.anchor.round === s.rounds.at(-1)?.id && !s.rounds.at(-1)?.sealed,
          'Draft belongs to sealed or old round',
        );
      }
    }
    requireValue(
      state.batches.every((b) => state.sessions.some((s) => s.id === b.session)),
      'Unknown batch session',
    );
    for (const op of state.operations) {
      unique(op.id);
      requireValue(
        digestPattern.test(op.digest) &&
          op.result.operation_id === op.id &&
          integer(op.result.revision) &&
          op.result.revision <= state.revision &&
          state.sessions.some((s) => s.id === op.result.session),
        'Invalid operation receipt',
      );
    }
    return state;
  } catch (error) {
    fail(
      'unavailable',
      `Feedback ledger is corrupt or incompatible: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
function validateItem(
  state: FeedbackLedger,
  s: FeedbackSession,
  item: FeedbackSession['drafts'][number],
  unique: (id: string) => void,
): void {
  unique(item.id);
  body(item.body);
  anchor(s, item.anchor);
  requireValue(
    ['comment', 'reattach'].includes(item.kind) &&
      claim(item.by, 'human') &&
      stamp(item.at) &&
      state.threads.some((t) => t.id === item.thread && t.session === s.id),
    'Invalid delivery item',
  );
  if (item.kind === 'reattach') {
    requireValue(item.original, 'Missing original anchor');
    anchor(s, item.original);
    requireValue(
      state.threads.some(
        (t) =>
          t.id === item.thread &&
          t.events.some((e) => e.id === item.event && e.kind === 'reattach'),
      ),
      'Missing human reattachment event',
    );
  }
}
export function readFeedback(packDir: string, workspace: string): FeedbackLedger | null {
  const loc = location(packDir, workspace);
  const packId = compatible(loc.pack, false);
  if (!existsSync(loc.file)) return null;
  if (!statSync(loc.file).isFile() || statSync(loc.file).size > FEEDBACK_LIMITS.ledger)
    fail('unavailable', 'Feedback ledger is not a bounded file');
  try {
    return validateLedger(JSON.parse(readFileSync(loc.file, 'utf8')), packId);
  } catch (error) {
    if (error instanceof FeedbackError) throw error;
    fail('unavailable', 'Feedback ledger cannot be read');
  }
}
function session(state: FeedbackLedger, id: string): FeedbackSession {
  requireValue(validId(id), 'Invalid session ID');
  return state.sessions.find((s) => s.id === id) ?? fail('missing', 'Unknown feedback session');
}
function thread(state: FeedbackLedger, s: FeedbackSession, id: string): FeedbackThread {
  requireValue(validId(id), 'Invalid thread ID');
  return (
    state.threads.find((t) => t.id === id && t.session === s.id) ??
    fail('missing', 'Unknown feedback thread')
  );
}
function anchor(s: FeedbackSession, a: FeedbackAnchor, open = false): FeedbackRound {
  requireValue(object(a) && validId(a.round), 'Invalid round anchor');
  const round = s.rounds.find((r) => r.id === a.round) ?? fail('missing', 'Unknown feedback round');
  if (open && (round !== s.rounds.at(-1) || round.sealed))
    fail('conflict', 'Comment on the latest open round');
  if (a.target === undefined) {
    requireValue(
      a.side === undefined &&
        a.sha256 === undefined &&
        a.start === undefined &&
        a.end === undefined &&
        a.quote === undefined,
      'Round anchor has file fields',
    );
    return round;
  }
  requireValue(
    validId(a.target) &&
      (a.side === 'before' || a.side === 'after') &&
      typeof a.sha256 === 'string',
    'File anchor needs target, side and hash',
  );
  const target = round.targets.find((t) => t.id === a.target) ?? fail('missing', 'Unknown target');
  const content = target[a.side];
  requireValue(content && a.sha256 === content.sha256, 'Anchor hash or diff side is invalid');
  if (a.start !== undefined || a.end !== undefined)
    requireValue(
      integer(a.start) &&
        integer(a.end) &&
        a.start > 0 &&
        a.end >= a.start &&
        a.end <= content.lines,
      'Line range is outside snapshot',
    );
  if (a.quote !== undefined)
    requireValue(
      typeof a.quote === 'string' &&
        Buffer.byteLength(a.quote) <= FEEDBACK_LIMITS.body &&
        a.start !== undefined,
      'Quote requires a bounded line range',
    );
  return round;
}
export function readFeedbackSnapshot(
  packDir: string,
  workspace: string,
  sessionId: string,
  roundId: string,
  targetId: string,
  side: string,
): string {
  const state = readFeedback(packDir, workspace) ?? fail('missing', 'Feedback has not been opened');
  const s = session(state, sessionId);
  requireValue(
    validId(roundId) && validId(targetId) && (side === 'before' || side === 'after'),
    'Invalid snapshot identity',
  );
  const target =
    s.rounds.find((r) => r.id === roundId)?.targets.find((t) => t.id === targetId) ??
    fail('missing', 'Unknown snapshot target');
  const content = target[side] ?? fail('missing', 'Snapshot side has no content');
  const path = feedbackContainedPath(realpathSync(packDir), `feedback/${content.ref}`);
  try {
    if (!statSync(path).isFile() || statSync(path).size !== content.bytes)
      fail('unavailable', 'Stored snapshot size changed');
    const bytes = readFileSync(path);
    if (hash(bytes) !== content.sha256) fail('unavailable', 'Stored snapshot hash changed');
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch (error) {
    if (error instanceof FeedbackError) throw error;
    fail('unavailable', 'Stored snapshot is missing or invalid');
  }
}
function verifyQuote(
  packDir: string,
  workspace: string,
  s: FeedbackSession,
  a: FeedbackAnchor,
): void {
  if (a.quote === undefined) return;
  const text = readFeedbackSnapshot(packDir, workspace, s.id, a.round, a.target!, a.side!);
  const lines = text.split('\n');
  if (text.endsWith('\n')) lines.pop();
  requireValue(
    lines.slice(a.start! - 1, a.end).join('\n') === a.quote,
    'Quote does not match snapshot lines',
  );
}
function flushFile(path: string): void {
  const fd = openSync(path, 'r+');
  try {
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
}
function diskBytes(path: string): number {
  if (!existsSync(path)) return 0;
  if (lstatSync(path).isSymbolicLink()) fail('forbidden', 'Feedback storage contains a symlink');
  if (statSync(path).isFile()) return statSync(path).size;
  if (!statSync(path).isDirectory()) fail('unavailable', 'Unsupported feedback storage entry');
  return readdirSync(path).reduce((sum, child) => sum + diskBytes(join(path, child)), 0);
}
export interface FeedbackWriteOptions {
  /** Trusted test/fault-injection hook, never exposed through browser input. */
  fault?: (phase: 'snapshots' | 'ledger-flushed' | 'published') => void;
  /** Recheck builder-observed source bytes inside the shared lock before publication. */
  verifySources?: () => void;
}
function newRound(
  loc: ReturnType<typeof location>,
  s: FeedbackSession,
  inputs: FeedbackSnapshotInput[],
  by: string,
  at: string,
  options: FeedbackWriteOptions,
): FeedbackRound {
  requireValue(Array.isArray(inputs) && inputs.length > 0, 'A round needs explicit snapshots');
  if (s.drafts.length) fail('conflict', 'Submit drafts before publishing another round');
  if (inputs.length > FEEDBACK_LIMITS.targets || s.rounds.length >= FEEDBACK_LIMITS.rounds)
    fail('bounds', 'Target or round bound exceeded');
  const id = randomUUID();
  const old = s.rounds.at(-1);
  const staging = feedbackContainedPath(loc.dir, `feedback/rounds/.staging-${id}`);
  const published = feedbackContainedPath(loc.dir, `feedback/rounds/${id}`);
  const writes: { filename: string; text: string }[] = [];
  const keys = new Set<string>();
  let bytes = 0;
  const targets: FeedbackTarget[] = inputs.map((input) => {
    requireValue(
      object(input) &&
        typeof input.key === 'string' &&
        input.key.length > 0 &&
        input.key.length <= 4096 &&
        !keys.has(input.key) &&
        safePath(input.path) &&
        (input.old_path === undefined || safePath(input.old_path)),
      'Invalid or duplicate snapshot target',
    );
    keys.add(input.key);
    const targetId = old?.targets.find((t) => t.key === input.key)?.id ?? randomUUID();
    const make = (text: string | null, side: string): FeedbackContent | null => {
      if (text === null) return null;
      requireValue(
        typeof text === 'string' &&
          !text.includes('\0') &&
          Buffer.from(text).toString('utf8') === text,
        'Snapshot must be valid UTF-8 text',
      );
      const count = Buffer.byteLength(text);
      bytes += count;
      if (count > FEEDBACK_LIMITS.file || bytes > FEEDBACK_LIMITS.round)
        fail('bounds', 'Snapshot byte bound exceeded');
      const filename = `${targetId}-${side}.txt`;
      writes.push({ filename, text });
      return {
        ref: `rounds/${id}/${filename}`,
        sha256: hash(text),
        bytes: count,
        lines: text.length ? text.split('\n').length - Number(text.endsWith('\n')) : 0,
      };
    };
    const before = make(input.before, 'before');
    const after = make(input.after, 'after');
    requireValue(before || after, 'Both snapshot sides are absent');
    return {
      id: targetId,
      key: input.key,
      path: input.path,
      ...(input.old_path === undefined ? {} : { old_path: input.old_path }),
      before,
      after,
    };
  });
  if (old)
    requireValue(
      keys.size === old.targets.length && old.targets.every((t) => keys.has(t.key)),
      'A new round must preserve its target selection',
    );
  if (diskBytes(loc.home) + bytes + FEEDBACK_LIMITS.ledger > FEEDBACK_LIMITS.total)
    fail(
      'bounds',
      'Per-pack feedback storage bound exceeded; explicit orphan recovery may be needed',
    );
  options.verifySources?.();
  mkdirSync(dirname(staging), { recursive: true });
  mkdirSync(staging);
  for (const write of writes) {
    const file = join(staging, write.filename);
    writeFileSync(file, write.text, { flag: 'wx' });
    flushFile(file);
  }
  // Flush the directory entries before publishing its name.
  if (process.platform !== 'win32') syncPublishedPath(join(staging, 'manifest'));
  options.verifySources?.();
  renameSync(staging, published);
  if (process.platform === 'win32') {
    for (const write of writes) syncPublishedPath(join(published, write.filename));
  } else syncPublishedPath(published);
  options.fault?.('snapshots');
  if (old) old.sealed = true;
  const round: FeedbackRound = {
    id,
    sequence: s.rounds.length + 1,
    at,
    by,
    digest: hash(canonical(targets)),
    sealed: false,
    targets,
  };
  s.rounds.push(round);
  return round;
}
/** This is the sole feedback writer. Canonical owner receipts are only read. */
export function mutateFeedback(
  packDir: string,
  workspace: string,
  input: FeedbackMutation,
  options: FeedbackWriteOptions = {},
): FeedbackReceipt {
  requireValue(
    object(input) &&
      validId(input.operation_id) &&
      integer(input.expected_revision) &&
      object(input.action),
    'Invalid mutation envelope',
  );
  const role = ['open', 'round', 'reply'].includes(input.action.kind) ? 'agent' : 'human';
  requireValue(
    ['open', 'round', 'comment', 'submit', 'reply', 'resolve', 'reattach'].includes(
      input.action.kind,
    ),
    'Unknown feedback action',
  );
  if (!claim(input.by, role)) fail('forbidden', `This feedback action needs a ${role} claim`);
  const loc = location(packDir, workspace);
  const result = withPackLock(loc.dir, () => {
    const packId = compatible(loadPackWithMeta(loc.dir), true);
    const state: FeedbackLedger = readFeedback(loc.dir, workspace) ?? {
      format: 'feedback/1',
      pack_id: packId,
      revision: 0,
      sessions: [],
      threads: [],
      batches: [],
      operations: [],
    };
    const digest = hash(canonical({ by: input.by, action: input.action }));
    const previous = state.operations.find((o) => o.id === input.operation_id);
    if (previous) {
      if (previous.digest !== digest)
        fail('conflict', 'Operation ID was reused with another payload');
      flushFile(loc.file);
      syncPublishedPath(loc.file);
      return previous.result;
    }
    if (state.revision !== input.expected_revision)
      fail(
        'conflict',
        `Feedback changed: held ${input.expected_revision}, current ${state.revision}`,
      );
    const at = new Date().toISOString();
    const action = input.action;
    let s: FeedbackSession;
    const receipt: FeedbackReceipt = {
      operation_id: input.operation_id,
      revision: state.revision + 1,
      session: '',
    };
    if (action.kind === 'open') {
      selection(action.selection);
      s = {
        id: randomUUID(),
        selection: structuredClone(action.selection),
        rounds: [],
        drafts: [],
        cursor: 0,
      };
      state.sessions.push(s);
      receipt.round = newRound(loc, s, action.snapshots, input.by, at, options).id;
    } else {
      s = session(state, action.session);
      switch (action.kind) {
        case 'round':
          receipt.round = newRound(loc, s, action.snapshots, input.by, at, options).id;
          break;
        case 'comment': {
          anchor(s, action.anchor, true);
          body(action.body);
          verifyQuote(loc.dir, workspace, s, action.anchor);
          const id = randomUUID();
          const original = structuredClone(action.anchor);
          state.threads.push({
            id,
            session: s.id,
            body: action.body,
            by: input.by,
            at,
            original,
            current: structuredClone(original),
            replies: [],
            events: [],
          });
          s.drafts.push({
            id: randomUUID(),
            kind: 'comment',
            thread: id,
            body: action.body,
            by: input.by,
            at,
            anchor: original,
          });
          receipt.thread = id;
          break;
        }
        case 'submit': {
          requireValue(validId(action.round), 'Invalid submission round');
          const r = s.rounds.at(-1)!;
          if (r.id !== action.round || r.sealed)
            fail('conflict', 'Round is old or already submitted');
          const batch = {
            id: randomUUID(),
            session: s.id,
            round: r.id,
            cursor: ++s.cursor,
            by: input.by,
            at,
            items: s.drafts,
          };
          state.batches.push(batch);
          s.drafts = [];
          r.sealed = true;
          receipt.batch = batch.id;
          receipt.cursor = batch.cursor;
          break;
        }
        case 'reply': {
          body(action.body);
          const t = thread(state, s, action.thread);
          t.replies.push({ id: randomUUID(), by: input.by, at, body: action.body });
          receipt.thread = t.id;
          break;
        }
        case 'resolve': {
          const t = thread(state, s, action.thread);
          t.events.push({ id: randomUUID(), kind: 'resolve', by: input.by, at });
          receipt.thread = t.id;
          break;
        }
        case 'reattach': {
          const t = thread(state, s, action.thread);
          anchor(s, action.anchor, true);
          verifyQuote(loc.dir, workspace, s, action.anchor);
          const id = randomUUID();
          const a = structuredClone(action.anchor);
          t.events.push({ id, kind: 'reattach', by: input.by, at, anchor: a });
          t.current = a;
          s.drafts.push({
            id: randomUUID(),
            kind: 'reattach',
            thread: t.id,
            body: t.body,
            by: input.by,
            at,
            anchor: a,
            original: t.original,
            event: id,
          });
          receipt.thread = t.id;
          break;
        }
      }
    }
    receipt.session = s.id;
    state.revision++;
    state.operations.push({ id: input.operation_id, digest, result: receipt });
    const bytes = JSON.stringify(state, null, 2) + '\n';
    if (
      Buffer.byteLength(bytes) > FEEDBACK_LIMITS.ledger ||
      diskBytes(loc.home) + Buffer.byteLength(bytes) > FEEDBACK_LIMITS.total
    )
      fail('bounds', 'Feedback ledger or total storage bound exceeded');
    validateLedger(state, packId);
    feedbackContainedPath(loc.dir, 'feedback/state.json');
    mkdirSync(loc.home, { recursive: true });
    const tmp = feedbackContainedPath(loc.dir, `feedback/.state-${input.operation_id}.tmp`);
    writeFileSync(tmp, bytes, { flag: 'wx' });
    flushFile(tmp);
    options.fault?.('ledger-flushed');
    renameSync(tmp, loc.file);
    options.fault?.('published');
    syncPublishedPath(loc.file);
    if (process.platform !== 'win32') syncPublishedPath(loc.home);
    return receipt;
  });
  if (!result.ok) fail('conflict', result.message);
  return result.value;
}
export function feedbackThreadState(
  s: FeedbackSession,
  t: FeedbackThread,
): { resolved: boolean; stale: boolean } {
  const resolved = t.events.at(-1)?.kind === 'resolve';
  const latest = s.rounds.at(-1);
  const target = latest?.targets.find((target) => target.id === t.current.target);
  const stale =
    t.current.target === undefined
      ? t.current.round !== latest?.id
      : !target || !t.current.side || target[t.current.side]?.sha256 !== t.current.sha256;
  return { resolved, stale };
}
export function feedbackReadResult(
  packDir: string,
  workspace: string,
  sessionId: string,
  after = 0,
): Record<string, unknown> {
  requireValue(integer(after), 'Cursor must be a nonnegative integer');
  const loc = location(packDir, workspace);
  const state = readFeedback(packDir, workspace) ?? fail('missing', 'Feedback has not been opened');
  const s = session(state, sessionId);
  requireValue(after <= s.cursor, 'Cursor is ahead of this session');
  const batches = state.batches.filter((b) => b.session === s.id && b.cursor > after);
  const closed = loc.pack.ok && loc.pack.value.doc.status === 'complete';
  return {
    format: 'feedback-result/1',
    pack_id: state.pack_id,
    session: s.id,
    revision: state.revision,
    cursor: s.cursor,
    status: closed ? 'closed' : batches.length ? 'submitted' : 'pending',
    batches,
    threads: state.threads
      .filter((t) => t.session === s.id)
      .map((t) => ({ id: t.id, ...feedbackThreadState(s, t) })),
  };
}
/** Explicit recovery: only UUID-named entries absent from the committed ledger. */
export function recoverFeedbackOrphans(packDir: string, workspace: string): string[] {
  const loc = location(packDir, workspace);
  const result = withPackLock(loc.dir, () => {
    compatible(loadPackWithMeta(loc.dir), true);
    const state = readFeedback(packDir, workspace);
    const referenced = new Set(state?.sessions.flatMap((s) => s.rounds.map((r) => r.id)) ?? []);
    const removed: string[] = [];
    const rounds = feedbackContainedPath(loc.dir, 'feedback/rounds');
    if (existsSync(rounds))
      for (const name of readdirSync(rounds)) {
        const id = name.startsWith('.staging-') ? name.slice(9) : name;
        if (!uuid.test(id) || referenced.has(id)) continue;
        const path = feedbackContainedPath(rounds, name);
        rmSync(path, { recursive: true });
        removed.push(`rounds/${name}`);
      }
    if (existsSync(loc.home))
      for (const name of readdirSync(loc.home)) {
        const match = /^\.state-(.+)\.tmp$/.exec(name);
        if (!match || !uuid.test(match[1]!)) continue;
        rmSync(feedbackContainedPath(loc.home, name));
        removed.push(name);
      }
    if (removed.length) {
      if (existsSync(rounds) && process.platform !== 'win32')
        syncPublishedPath(join(rounds, 'unused'));
      if (process.platform !== 'win32') syncPublishedPath(loc.file);
    }
    return removed;
  });
  if (!result.ok) fail('conflict', result.message);
  return result.value;
}
