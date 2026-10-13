/**
 * The two localhost surfaces, served from TypeScript over the TS core:
 * the interview room (one pack, block until approved) and the library
 * (every pack, standing). The pages are the engine's own portable assets —
 * vendored, engine-name-free by contract; admission runs through the same
 * machine rules the corpus proves. Refusals are 400 JSON, verbatim.
 */
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import { existsSync, realpathSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, resolve, dirname, sep, relative, isAbsolute } from 'node:path';
import { brand } from '@treadle/brand';
import {
  alignment,
  withPackLock,
  ownerAction,
  workflowGate,
  acceptDecision,
  rejectDecision,
  closePack,
  type OwnerAct,
  gapCount,
  closureGaps,
  answerQuestion,
  approveSpec,
  deriveStage,
  loadPackWithMeta,
  isArmed,
  savePack,
  writeEvent,
  eventsPath,
  type PackDoc,
} from '@treadle/core';

/** the asset root: import.meta.url is rewritten under some runners (vitest
 *  resolves src modules to graph URLs), so verify the candidate and fall
 *  back to the workspace-relative path — both hosts serve the same files. */
function assetRoot(): string {
  const candidates = [
    join(dirname(fileURLToPath(import.meta.url))),
    join(process.cwd(), 'packages', 'web', 'src'),
  ];
  for (const c of candidates) {
    if (existsSync(join(c, 'page.html'))) return c;
  }
  return candidates[0]!;
}
const WEB = assetRoot();
const NAME_RE = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
const FILE_RE = /^[A-Za-z0-9][A-Za-z0-9._-]*\.md$/;

export type Handler = (req: IncomingMessage, res: ServerResponse, body: string) => Promise<void>;

function denied(status: number, message: string): Error & { status: number } {
  return Object.assign(new Error(message), { status });
}

/** decode or refuse: malformed encodings are 404s, never 500s */
function decodeOr(path: string): string {
  try {
    return decodeURIComponent(path);
  } catch {
    return '\x00invalid';
  }
}

function json(res: ServerResponse, code: number, obj: unknown): void {
  const bytes = JSON.stringify(obj) + '\n';
  res.writeHead(code, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  res.end(bytes);
}

/** The security headers every surface speaks (R25): CSP pins the page to
 *  itself + inline config injection; no sniffing; same-origin framing only. */
export const SECURITY_HEADERS: Record<string, string> = {
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'self'; base-uri 'none'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'no-referrer',
};

export async function readWebAsset(file: string): Promise<Buffer> {
  const bytes = await readFile(join(WEB, file));
  if (file !== 'library.html') return bytes;
  const name = brand.name
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
  return Buffer.from(bytes.toString('utf8').replaceAll('{{PRODUCT_NAME}}', () => name));
}

export async function asset(res: ServerResponse, file: string, type: string): Promise<void> {
  try {
    const bytes = await readWebAsset(file);
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store', ...SECURITY_HEADERS });
    res.end(bytes);
  } catch {
    json(res, 404, { ok: false, error: 'not found' });
  }
}

/** One event through machine admission — the only write path. */
async function admit(
  packDir: string,
  body: Record<string, unknown>,
): Promise<{ ok: true; revision: number }> {
  const by = typeof body['by'] === 'string' ? body['by'] : 'human:owner';
  const kind = String(body['kind'] ?? '');
  const q = typeof body['q'] === 'string' ? body['q'] : undefined;
  const text = typeof body['text'] === 'string' ? body['text'] : undefined;
  const option = typeof body['option'] === 'string' ? body['option'] : undefined;
  const at = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  const transaction = withPackLock(packDir, () => {
    const loaded = loadContainedPack(packDir);
    if (!loaded.ok) throw denied(400, loaded.message);
    const { doc, path } = loaded.value;
    if (
      (body['expected_revision'] !== undefined && body['expected_revision'] !== doc.revision) ||
      (doc.workflow && body['expected_revision'] === undefined)
    )
      throw denied(409, 'The spec changed; reload before this action');
    if (kind === 'answer' || kind === 'unknown' || kind === 'choice') {
      const r = answerQuestion(doc, q ?? '', by, {
        text: kind === 'choice' ? (text ?? option) : text,
        unknown: kind === 'unknown',
        at,
      });
      if (!r.ok) throw denied(400, r.message);
      doc.revision = (doc.revision ?? 1) + 1;
    } else if (kind === 'approve' && doc.workflow) {
      const out = ownerAction(
        doc,
        { kind: 'approve', by, at, expected_revision: Number(body['expected_revision']) },
        path,
      );
      if (!out.ok) throw denied(400, out.message);
      const saved = savePack(doc, path, { at });
      return {
        ok: true as const,
        revision: doc.revision!,
        audit_pending: doc.workflow.pending_audit.length,
        ...(saved?.durability_error ? { durability_error: saved.durability_error } : {}),
      };
    } else if (kind === 'approve') {
      const r = approveSpec(doc, by, { at });
      if (!r.ok) throw denied(400, r.message);
      doc.revision = (doc.revision ?? 1) + 1;
    } else {
      throw denied(
        400,
        `unknown event kind: '${kind}' (expected one of answer, unknown, choice, approve)`,
      );
    }
    savePack(doc, path, { at });
    writeEvent(eventsPath(packDir), {
      kind: kind as 'answer',
      by,
      at,
      ...(q !== undefined ? { q } : {}),
      ...(text !== undefined ? { text } : {}),
      ...(option !== undefined ? { option } : {}),
    });
    return { ok: true as const, revision: doc.revision! };
  });
  if (!transaction.ok) throw denied(409, transaction.message);
  return transaction.value;
}

function admitWorkflow(
  packDir: string,
  body: Record<string, unknown>,
  owner: string,
): Record<string, unknown> {
  const transaction = withPackLock(packDir, () => {
    const loaded = loadContainedPack(packDir);
    if (!loaded.ok) throw denied(400, loaded.message);
    const { doc, path } = loaded.value;
    const by = typeof body['by'] === 'string' ? body['by'] : owner;
    const kind = String(body['kind']);
    const at = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
    if (
      !Number.isSafeInteger(body['expected_revision']) ||
      body['expected_revision'] !== doc.revision
    )
      throw denied(409, 'The spec changed; reload before this action');
    if (!['accept', 'reject', 'approve', 'start', 'close'].includes(kind))
      throw denied(400, 'Unknown owner action');
    if (doc.workflow) {
      const action: Parameters<typeof ownerAction>[1] = {
        kind: kind as OwnerAct['kind'],
        by,
        at,
        expected_revision: Number(body['expected_revision']),
      };
      if (typeof body['decision'] === 'string') action.decision = body['decision'];
      if (typeof body['because'] === 'string') action.because = body['because'];
      const out = ownerAction(doc, action, path);
      if (!out.ok) throw denied(400, out.message);
    } else {
      // Legacy owner resolution and closure use their original evidence contract.
      const out =
        kind === 'accept'
          ? acceptDecision(doc, String(body['decision'] ?? ''), by)
          : kind === 'reject'
            ? rejectDecision(doc, String(body['decision'] ?? ''), by, String(body['because'] ?? ''))
            : kind === 'close'
              ? closePack(doc, by, { at })
              : kind === 'approve'
                ? approveSpec(doc, by, { at })
                : null;
      if (!out) throw denied(400, 'Adopt the owner workflow before start approval');
      if (!out.ok) throw denied(400, out.message);
      if (kind === 'approve') doc.revision = (doc.revision ?? 1) + 1;
    }
    const saved = savePack(doc, path, { at });
    return {
      ok: true,
      recorded: true,
      revision: doc.revision,
      audit_pending: doc.workflow?.pending_audit.length ?? 0,
      ...(saved?.durability_error ? { durability_error: saved.durability_error } : {}),
    };
  });
  if (!transaction.ok) throw denied(409, transaction.message);
  return transaction.value;
}
function workflowReport(doc: PackDoc, path: string): Record<string, unknown> {
  if (!doc.workflow) {
    const gaps = closureGaps(doc);
    const all = doc.tasks.every(
      (t) => t.status === 'done' && Array.isArray(t['evidence']) && t['evidence'].length > 0,
    );
    const phase =
      doc.status === 'complete'
        ? 'delivered'
        : gaps.pending_decisions.length
          ? 'decisions'
          : gaps.open_questions.length
            ? 'spec'
            : !all
              ? 'implementation'
              : !gaps.review_pass
                ? 'review'
                : 'closure';
    return {
      legacy: true,
      revision: doc.revision,
      phase,
      reasons: [...gaps.pending_decisions, ...gaps.open_questions],
      can_start: false,
      can_close: phase === 'closure',
    };
  }
  const gate = workflowGate(doc, path);
  return {
    ...gate,
    revision: doc.revision,
    audit_pending: doc.workflow.pending_audit.length,
    can_start: gate.phase === 'start',
    can_close: gate.phase === 'closure',
  };
}

function guardOrigin(req: IncomingMessage): void {
  const origin = req.headers.origin;
  if (origin && origin !== `http://${req.headers.host}`)
    throw denied(403, 'Use this page to record owner actions');
}
function loadContainedPack(dir: string): ReturnType<typeof loadPackWithMeta> {
  const root = realpathSync(dir);
  for (const file of readdirSync(root).filter((file) => file.endsWith('.json'))) {
    const rel = relative(root, realpathSync(join(root, file)));
    if (!rel || rel === '..' || rel.startsWith('..' + sep) || isAbsolute(rel))
      throw denied(404, 'Spec JSON escapes its directory');
  }
  return loadPackWithMeta(dir);
}
function packDirectory(root: string, name: string): string {
  if (name === 'archive' || name.startsWith('.')) throw denied(404, 'No such spec');
  try {
    const parent = realpathSync(root);
    const dir = realpathSync(join(root, name));
    const rel = relative(parent, dir);
    if (!rel || rel === '..' || rel.startsWith('..' + sep) || isAbsolute(rel))
      throw denied(404, 'No such spec');
    return dir;
  } catch {
    throw denied(404, 'No such spec');
  }
}
function makeServer(handler: Handler): Server {
  return createServer(async (req, res) => {
    const chunks: Buffer[] = [];
    for await (const c of req) chunks.push(c as Buffer);
    const body = Buffer.concat(chunks).toString('utf8');
    try {
      await handler(req, res, body);
    } catch (e) {
      const status = (e as { status?: number }).status ?? 500;
      json(res, status, { ok: false, error: (e as Error).message });
    }
  });
}

export interface RoomHandle {
  readonly url: string;
  close(): Promise<void>;
}

/** The interview room: one pack, the born-spec ceremony. */
export function startRoom(packDir: string, port = 0, owner = 'human:owner'): Promise<RoomHandle> {
  const server = makeServer(async (req, res, body) => {
    const url = req.url ?? '/';
    if (url === '/' || url === '/index.html') {
      const html = (await readFile(join(WEB, 'page.html'))).toString('utf8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', ...SECURITY_HEADERS });
      res.end(
        html.replace(
          '</head>',
          `<script>window.INTERVIEW_CONFIG = ${JSON.stringify({ by: owner })};</script>\n</head>`,
        ),
      );
      return;
    }
    if (url === '/app.js' || url === '/page.js')
      return asset(res, 'page.js', 'text/javascript; charset=utf-8');
    if (url === '/marked.min.js')
      return asset(res, 'marked.min.js', 'text/javascript; charset=utf-8');
    if (url === '/spec') {
      const loaded = loadContainedPack(packDir);
      if (!loaded.ok) throw denied(400, loaded.message);
      const { emit } = await import('@treadle/core');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(emit(loaded.value.doc), null, 2) + '\n');
      return;
    }
    if (url === '/workflow') {
      if (req.method === 'GET') {
        const l = loadContainedPack(packDir);
        if (!l.ok) throw denied(400, l.message);
        json(res, 200, workflowReport(l.value.doc, l.value.path));
        return;
      }
      if (req.method === 'POST') {
        guardOrigin(req);
        if (!req.headers['content-type']?.startsWith('application/json'))
          throw denied(415, 'Send an owner action as JSON');
        let parsed: unknown;
        try {
          parsed = JSON.parse(body);
        } catch {
          throw denied(400, 'The body is not JSON');
        }
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
          throw denied(400, 'The body must be an owner action');
        json(res, 200, admitWorkflow(packDir, parsed as Record<string, unknown>, owner));
        return;
      }
    }
    if (url === '/event' && req.method === 'POST') {
      guardOrigin(req);
      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(body || '{}');
      } catch {
        throw denied(400, 'the body is not JSON');
      }
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
        throw denied(400, 'The body must be an event');
      parsed['by'] = typeof parsed['by'] === 'string' && parsed['by'] ? parsed['by'] : owner;
      const out = await admit(packDir, parsed);
      json(res, 200, out);
      return;
    }
    json(res, 404, { ok: false, error: 'not found' });
  });
  return new Promise((resolveP) => {
    server.listen(port, '127.0.0.1', () => {
      const addr = server.address();
      const p = typeof addr === 'object' && addr ? addr.port : port;
      resolveP({
        url: `http://127.0.0.1:${p}/`,
        close: () => new Promise<void>((done) => server.close(() => done())),
      });
    });
  });
}

async function listSpecs(root: string): Promise<{ specs: unknown[]; legacy: unknown[] }> {
  const specs: Record<string, unknown>[] = [];
  const legacy: Record<string, unknown>[] = [];
  let entries: import('node:fs').Dirent[];
  try {
    entries = await readdir(root, { withFileTypes: true });
  } catch {
    return { specs, legacy };
  }
  for (const e of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (!e.isDirectory() || ['archive', '.okf'].includes(e.name)) continue;
    const d = join(root, e.name);
    const loaded = loadContainedPack(d);
    if (!loaded.ok) {
      const files = (await readdir(d)).filter((f) => f.endsWith('.md')).sort();
      legacy.push({ name: e.name, title: e.name.replace(/-/g, ' '), files });
      continue;
    }
    const doc = loaded.value.doc;
    const qs = doc.spec.clarifications ?? [];
    specs.push({
      name: e.name,
      title: (doc.title ?? e.name).split('.')[0]!.slice(0, 100),
      stage: deriveStage(doc),
      revision: doc.revision ?? 1,
      lifecycle: doc.status ?? 'active',
      open_questions: qs.filter((q) => q.status === 'open').length,
      approved: Boolean(doc.approved_at),
      armed: isArmed(d),
      updated: doc.updated ?? doc.created ?? '',
      ...(doc.workflow ? { workflow: workflowReport(doc, loaded.value.path) } : {}),
      docs: (await readdir(d)).filter((f) => f.endsWith('.md')).sort(),
    });
  }
  return { specs, legacy };
}

/** The library: every pack under a root, standing. */
export function libraryHandler(root: string, owner = 'human:owner'): Handler {
  return async (req, res, body) => {
    const url = req.url ?? '/';
    const path = url.split('?')[0]!;
    if (path === '/') return asset(res, 'library.html', 'text/html; charset=utf-8');
    if (path === '/app.js') return asset(res, 'library.js', 'text/javascript; charset=utf-8');
    if (path === '/marked.min.js')
      return asset(res, 'marked.min.js', 'text/javascript; charset=utf-8');
    if (path === '/specs') {
      json(res, 200, await listSpecs(root));
      return;
    }
    if (path.startsWith('/workflow/')) {
      const name = decodeOr(path.slice('/workflow/'.length));
      if (!NAME_RE.test(name)) throw denied(404, 'No such spec');
      const dir = packDirectory(root, name);
      if (req.method === 'POST') {
        guardOrigin(req);
        if (!req.headers['content-type']?.startsWith('application/json'))
          throw denied(415, 'Send an owner action as JSON');
        let parsed: unknown;
        try {
          parsed = JSON.parse(body);
        } catch {
          throw denied(400, 'The body is not JSON');
        }
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
          throw denied(400, 'The body must be an owner action');
        json(res, 200, admitWorkflow(dir, parsed as Record<string, unknown>, owner));
        return;
      }
      if (req.method === 'GET') {
        const loaded = loadContainedPack(dir);
        if (!loaded.ok) throw denied(400, loaded.message);
        json(res, 200, workflowReport(loaded.value.doc, loaded.value.path));
        return;
      }
      throw denied(405, 'Use GET or POST');
    }
    if (path.startsWith('/alignment/')) {
      // DES-5: a surface read composing what core exports — the pinned
      // sentence, no invented wording; corpus and engine untouched
      const name = decodeOr(path.slice('/alignment/'.length));
      if (!NAME_RE.test(name)) throw denied(404, `no spec named '${name}'`);
      const loaded = loadContainedPack(packDirectory(root, name));
      if (!loaded.ok) {
        throw denied(loaded.message.includes('no spec json') ? 404 : 400, loaded.message);
      }
      const a = alignment(loaded.value.doc);
      if (!a.ok) throw denied(400, a.message);
      json(res, 200, {
        violations: a.value.violations,
        gapCount: gapCount(a.value),
        sentence: `alignment: ${a.value.violations.length} violation(s), ${gapCount(a.value)} gap(s) — gaps are reported, never guessed`,
      });
      return;
    }
    if (path.startsWith('/spec/')) {
      const name = decodeOr(path.slice('/spec/'.length));
      if (!NAME_RE.test(name)) throw denied(404, `no spec named '${name}'`);
      const loaded = loadContainedPack(packDirectory(root, name));
      if (!loaded.ok)
        throw denied(loaded.message.includes('no spec json') ? 404 : 400, loaded.message);
      const { emit } = await import('@treadle/core');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(emit(loaded.value.doc), null, 2) + '\n');
      return;
    }
    if (path.startsWith('/artifact/')) {
      const rest = path.slice('/artifact/'.length);
      const name = decodeOr(rest.split('/')[0] ?? '');
      const file = decodeOr(rest.split('/')[1] ?? '');
      if (!NAME_RE.test(name) || !FILE_RE.test(file)) throw denied(404, 'no such document');
      const dir = packDirectory(root, name);
      try {
        const f = realpathSync(resolve(dir, file));
        const rel = relative(dir, f);
        if (!rel || rel === '..' || rel.startsWith('..' + sep) || isAbsolute(rel))
          throw denied(404, 'no such document');
        const bytes = await readFile(f);
        res.writeHead(200, { 'Content-Type': 'text/markdown; charset=utf-8' });
        res.end(bytes);
      } catch {
        json(res, 404, { ok: false, error: 'no such document' });
      }
      return;
    }
    if (path.startsWith('/event/') && req.method === 'POST') {
      guardOrigin(req);
      const name = decodeOr(path.slice('/event/'.length));
      if (!NAME_RE.test(name)) throw denied(404, `no spec named '${name}'`);
      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(body || '{}');
      } catch {
        throw denied(400, 'the body is not JSON');
      }
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
        throw denied(400, 'The body must be an event');
      parsed['by'] = typeof parsed['by'] === 'string' && parsed['by'] ? parsed['by'] : owner;
      const out = await admit(packDirectory(root, name), parsed);
      json(res, 200, out);
      return;
    }
    json(res, 404, { ok: false, error: 'not found' });
  };
}

export function startLibrary(root: string, port = 0, owner = 'human:owner'): Promise<RoomHandle> {
  const server = makeServer(libraryHandler(root, owner));
  return new Promise((resolveP) => {
    server.listen(port, '127.0.0.1', () => {
      const addr = server.address();
      const p = typeof addr === 'object' && addr ? addr.port : port;
      resolveP({
        url: `http://127.0.0.1:${p}/`,
        close: () => new Promise<void>((done) => server.close(() => done())),
      });
    });
  });
}

export type { PackDoc };
