import { describe, it, expect, afterEach } from 'vitest';
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  appendFileSync,
  rmSync,
  symlinkSync,
} from 'node:fs';
import { tmpdir, hostname } from 'node:os';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { startLibrary, startRoom } from '../src/servers.js';
import {
  savePack,
  loadPackWithMeta,
  ownerAction,
  readOwnerEvents,
  ownerEventsPath,
  appendPendingAudit,
  planDigest,
  evidenceDigest,
  nextTask,
  record,
  withPackLock,
  recoverPackLock,
  type PackDoc,
} from '@treadle/core';
const at = '2026-10-10T21:57:36Z';
const roots: string[] = [];
// The HTTP fixture shares this event loop. Blocking it during CLI work can
// leave keep-alive socket closure queued until the next browser request.
function run(command: string, args: string[], cwd?: string) {
  return new Promise<{ status: number | null; stdout: string; stderr: string }>((done) => {
    execFile(command, args, { cwd, encoding: 'utf8', timeout: 15000 }, (error, stdout, stderr) =>
      done({
        status: error ? (typeof error.code === 'number' ? error.code : null) : 0,
        stdout,
        stderr,
      }),
    );
  });
}
afterEach(() => {
  for (const r of roots.splice(0)) rmSync(r, { recursive: true, force: true });
});
function fixture(legacy = false) {
  const root = mkdtempSync(join(tmpdir(), 'web-owner-'));
  roots.push(root);
  const dir = join(root, 'p');
  mkdirSync(dir);
  const path = join(dir, 'p.json');
  const doc: PackDoc = {
    format: legacy ? 'specpack/0.3' : 'specpack/0.4',
    name: 'p',
    status: 'active',
    revision: 1,
    artifacts: {},
    spec: { requirements: [], clarifications: [] },
    plan: { decisions: [{ id: 'D-1', decision: 'Wait for owner', status: 'proposed' }] },
    tasks: [
      {
        id: 'T-1',
        title: 'Work',
        status: 'todo',
        requires_decisions: ['D-1'],
        verify: { cmd: 'true', expect: 'exit 0' },
        context: { touch: [] },
      },
    ],
  };
  if (!legacy)
    doc.workflow = {
      policy: 'owner-gated/1',
      plan: 1,
      phase_questions: { spec: [] },
      acts: [],
      pending_audit: [],
    };
  for (const id of ['brief', 'spec', 'design', 'plan']) {
    writeFileSync(join(dir, id + '.md'), 'Approved plan');
    doc.artifacts![id] = { file: id + '.md' };
  }
  savePack(doc, path, { at });
  return { root, dir, path, doc };
}
function loaded(dir: string) {
  const l = loadPackWithMeta(dir);
  if (!l.ok) throw Error(l.message);
  return l.value;
}
async function post(url: string, body: unknown, headers = {}) {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
  return { status: r.status, body: (await r.json()) as Record<string, unknown> };
}

describe('owner sequence across CLI and browser', () => {
  it('executes two checked tasks under one start receipt, then requires independent review and human closure', async () => {
    const f = fixture();
    const cmd = 'node -e "process.exit(0)"';
    f.doc.tasks[0]!.verify = { cmd, expect: 'exit 0' };
    f.doc.tasks.push({
      id: 'T-2',
      title: 'Dependent work',
      status: 'todo',
      needs: ['T-1'],
      requires_decisions: ['D-1'],
      verify: { cmd, expect: 'exit 0' },
      context: { touch: [] },
    });
    savePack(f.doc, f.path, { at });
    const lib = await startLibrary(f.root);
    const workspace = fileURLToPath(new URL('../../..', import.meta.url));
    const cli = (args: string[]) =>
      run(
        process.execPath,
        ['--import', 'tsx', 'packages/cli/src/main.ts', 'do', ...args],
        workspace,
      );
    try {
      expect((await cli(['next', f.dir, '--expected-revision', '1'])).status).toBe(1);
      expect(
        (
          await post(lib.url + 'workflow/p', {
            kind: 'accept',
            decision: 'D-1',
            expected_revision: 1,
          })
        ).status,
      ).toBe(200);
      expect((await cli(['next', f.dir, '--expected-revision', '2'])).status).toBe(1);
      expect(
        (await post(lib.url + 'workflow/p', { kind: 'start', expected_revision: 2 })).status,
      ).toBe(200);
      const start = loaded(f.dir).doc.workflow!.start_receipt;
      for (const task of ['T-1', 'T-2']) {
        expect(
          (await cli(['next', f.dir, '--expected-revision', String(loaded(f.dir).doc.revision)]))
            .status,
        ).toBe(0);
        const verified = await run('node', ['-e', 'process.exit(0)']);
        expect(verified.status).toBe(0);
        const result = await cli([
          'record',
          f.dir,
          '--task',
          task,
          '--result',
          'pass',
          '--cmd',
          cmd,
          '--exit',
          String(verified.status),
          '--expected-revision',
          String(loaded(f.dir).doc.revision),
          '--by',
          'agent:builder',
        ]);
        expect(result.status, result.stderr).toBe(0);
        expect(loaded(f.dir).doc.workflow!.start_receipt).toEqual(start);
      }
      const pending = await (await fetch(lib.url + 'workflow/p')).json();
      expect(pending.phase).toBe('review');
      expect(pending.can_close).toBe(false);
      const l = loaded(f.dir);
      const digest = planDigest(l.doc, l.path);
      if (!digest.ok) throw new Error(digest.message);
      l.doc.review = {
        verdicts: [
          {
            on: 'PACK',
            verdict: 'PASS',
            by: 'agent:independent-fixture-reviewer',
            at,
            findings: [],
            plan_digest: digest.value,
            evidence_digest: evidenceDigest(l.doc),
          },
        ],
      };
      l.doc.revision!++;
      savePack(l.doc, l.path, { at });
      expect(loaded(f.dir).doc.status).toBe('active');
      expect((await (await fetch(lib.url + 'workflow/p')).json()).can_close).toBe(true);
      expect(
        (
          await post(lib.url + 'workflow/p', {
            kind: 'close',
            expected_revision: loaded(f.dir).doc.revision,
          })
        ).status,
      ).toBe(200);
      expect(loaded(f.dir).doc.status).toBe('complete');
      expect(
        readOwnerEvents(ownerEventsPath(f.dir)).filter((e) => e.kind === 'start'),
      ).toHaveLength(1);
      expect(readOwnerEvents(ownerEventsPath(f.dir)).at(-1)?.kind).toBe('close');
    } finally {
      await lib.close();
    }
  }, 20000);
});
function action(d: PackDoc, kind: 'accept' | 'start', path: string) {
  const a = ownerAction(
    d,
    { kind, decision: 'D-1', by: 'human:owner', at, expected_revision: d.revision! },
    path,
  );
  if (!a.ok) throw Error(a.message);
  return a.value;
}
describe('browser owner admission', () => {
  it('requires separate decision/start acts, held revisions and owner claims', async () => {
    const f = fixture(),
      lib = await startLibrary(f.root);
    try {
      expect(
        (
          await post(lib.url + 'workflow/p', {
            kind: 'accept',
            decision: 'D-1',
            by: 'agent:x',
            expected_revision: 1,
          })
        ).status,
      ).toBe(400);
      expect(
        (await post(lib.url + 'workflow/p', { kind: 'start', expected_revision: 1 })).status,
      ).toBe(400);
      expect(
        (
          await post(lib.url + 'workflow/p', {
            kind: 'accept',
            decision: 'D-1',
            expected_revision: 1,
          })
        ).status,
      ).toBe(200);
      expect(
        (await post(lib.url + 'workflow/p', { kind: 'start', expected_revision: 1 })).status,
      ).toBe(409);
      expect(
        (await post(lib.url + 'workflow/p', { kind: 'start', expected_revision: 2 })).status,
      ).toBe(200);
      const d = loaded(f.dir).doc;
      expect(d.workflow!.acts.map((a) => a.kind)).toEqual(['accept', 'start']);
      expect(readOwnerEvents(ownerEventsPath(f.dir))).toHaveLength(2);
      expect(d.workflow!.pending_audit).toEqual([]);
      const r = await fetch(lib.url + 'workflow/p');
      expect(await r.json()).toMatchObject({
        phase: 'implementation',
        can_start: false,
        can_close: false,
      });
    } finally {
      await lib.close();
    }
  });
  it('serializes simultaneous browser writes and shares the CLI/core lock', async () => {
    const f = fixture(),
      lib = await startLibrary(f.root);
    try {
      const replies = await Promise.all([
        post(lib.url + 'workflow/p', { kind: 'accept', decision: 'D-1', expected_revision: 1 }),
        post(lib.url + 'workflow/p', { kind: 'accept', decision: 'D-1', expected_revision: 1 }),
      ]);
      expect(replies.map((r) => r.status).sort()).toEqual([200, 409]);
      expect(readOwnerEvents(ownerEventsPath(f.dir))).toHaveLength(1);
      mkdirSync(join(f.dir, '.specpack-lock'));
      expect(
        (await post(lib.url + 'workflow/p', { kind: 'start', expected_revision: 2 })).status,
      ).toBe(409);
      rmSync(join(f.dir, '.specpack-lock'), { recursive: true });
    } finally {
      await lib.close();
    }
  });
  it('shows missing review and admits explicit completion only after current independent review', async () => {
    const f = fixture();
    action(f.doc, 'accept', f.path);
    action(f.doc, 'start', f.path);
    nextTask(f.doc);
    expect(
      record(
        f.doc,
        'T-1',
        'pass',
        [{ command: 'true', exit: 0 }],
        f.doc.revision!,
        'agent:implementer',
        { at, packPath: f.path },
      ).ok,
    ).toBe(true);
    savePack(f.doc, f.path, { at });
    const lib = await startLibrary(f.root);
    try {
      expect((await fetch(lib.url + 'workflow/p').then((r) => r.json())).phase).toBe('review');
      expect(
        (await post(lib.url + 'workflow/p', { kind: 'close', expected_revision: f.doc.revision }))
          .status,
      ).toBe(400);
      const hash = planDigest(f.doc, f.path);
      if (!hash.ok) throw Error(hash.message);
      f.doc.review = {
        verdicts: [
          {
            on: 'PACK',
            verdict: 'PASS',
            by: 'agent:reviewer',
            plan_digest: hash.value,
            evidence_digest: evidenceDigest(f.doc),
          },
        ],
      };
      savePack(f.doc, f.path, { at });
      expect((await fetch(lib.url + 'workflow/p').then((r) => r.json())).can_close).toBe(true);
      expect(
        (await post(lib.url + 'workflow/p', { kind: 'close', expected_revision: f.doc.revision }))
          .status,
      ).toBe(200);
      expect(loaded(f.dir).doc.status).toBe('complete');
      expect(readOwnerEvents(ownerEventsPath(f.dir)).at(-1)?.kind).toBe('close');
      expect(
        (
          await post(lib.url + 'workflow/p', {
            kind: 'close',
            expected_revision: loaded(f.dir).doc.revision,
          })
        ).status,
      ).toBe(400);
    } finally {
      await lib.close();
    }
  });
  it('supports explicit resolution and closure on active legacy packs without changing their format', async () => {
    const f = fixture(true),
      lib = await startLibrary(f.root);
    try {
      expect(
        (
          await post(lib.url + 'workflow/p', {
            kind: 'accept',
            decision: 'D-1',
            expected_revision: 1,
          })
        ).status,
      ).toBe(200);
      const l = loaded(f.dir);
      l.doc.tasks[0]!.status = 'done';
      l.doc.tasks[0]!['evidence'] = [{ cmd: 'true', exit: 0 }];
      l.doc.review = { verdicts: [{ on: 'PACK', verdict: 'PASS', by: 'agent:reviewer' }] };
      savePack(l.doc, l.path, { at });
      expect((await fetch(lib.url + 'workflow/p').then((r) => r.json())).can_close).toBe(true);
      expect(
        (await post(lib.url + 'workflow/p', { kind: 'close', expected_revision: l.doc.revision }))
          .status,
      ).toBe(200);
      expect(loaded(f.dir).doc.format).toBe('specpack/0.3');
    } finally {
      await lib.close();
    }
  });
  it('rejects wrong origins, non-JSON actions and symlink escapes', async () => {
    const f = fixture(),
      other = fixture(),
      lib = await startLibrary(f.root);
    symlinkSync(other.dir, join(f.root, 'escape'));
    try {
      expect(
        (
          await post(
            lib.url + 'workflow/p',
            { kind: 'accept', decision: 'D-1', expected_revision: 1 },
            { Origin: 'https://evil.invalid' },
          )
        ).status,
      ).toBe(403);
      expect(
        (
          await post(
            lib.url + 'workflow/p',
            { kind: 'accept', decision: 'D-1', expected_revision: 1 },
            { 'Content-Type': 'text/plain' },
          )
        ).status,
      ).toBe(415);
      expect(
        (
          await post(lib.url + 'workflow/escape', {
            kind: 'accept',
            decision: 'D-1',
            expected_revision: 1,
          })
        ).status,
      ).toBe(404);
      expect(loaded(f.dir).doc.revision).toBe(1);
      expect(loaded(other.dir).doc.revision).toBe(1);
    } finally {
      await lib.close();
    }
  });
  it('checks held revisions for question answers in the room', async () => {
    const f = fixture();
    f.doc.spec.clarifications = [{ id: 'Q-1', question: 'Spec?', status: 'open' }];
    f.doc.workflow!.phase_questions.spec = ['Q-1'];
    savePack(f.doc, f.path, { at });
    const room = await startRoom(f.dir);
    try {
      expect(
        (await post(room.url + 'event', { kind: 'answer', q: 'Q-1', text: 'Yes' })).status,
      ).toBe(409);
      expect(
        (
          await post(room.url + 'event', {
            kind: 'answer',
            q: 'Q-1',
            text: 'Yes',
            expected_revision: 1,
          })
        ).status,
      ).toBe(200);
      expect(
        (await post(room.url + 'workflow', { kind: 'approve', expected_revision: 1 })).status,
      ).toBe(409);
      expect(
        (await post(room.url + 'workflow', { kind: 'approve', expected_revision: 2 })).status,
      ).toBe(200);
    } finally {
      await room.close();
    }
  });
});
describe('durable owner receipts and recovery', () => {
  it('persists an owner act before an audit failure and recovers without repeating approval', () => {
    const f = fixture();
    action(f.doc, 'accept', f.path);
    const result = savePack(f.doc, f.path, {
      at,
      auditAppend: () => {
        throw Error('disk fault');
      },
    });
    expect(result).toMatchObject({ recorded: true, audit_pending: 1 });
    const l = loaded(f.dir);
    expect(l.doc.plan.decisions![0]!.status).toBe('accepted');
    expect(l.doc.workflow!.pending_audit).toHaveLength(1);
    expect(
      ownerAction(
        l.doc,
        { kind: 'accept', decision: 'D-1', by: 'human:owner', at, expected_revision: 1 },
        l.path,
      ).ok,
    ).toBe(false);
    expect(withPackLock(f.dir, () => savePack(l.doc, l.path, { at })).ok).toBe(true);
    savePack(l.doc, l.path, { at });
    expect(readOwnerEvents(ownerEventsPath(f.dir))).toHaveLength(1);
    expect(loaded(f.dir).doc.workflow!.pending_audit).toEqual([]);
  });
  it('deduplicates a completed append whose acknowledgement failed', () => {
    const f = fixture();
    action(f.doc, 'accept', f.path);
    savePack(f.doc, f.path, {
      at,
      auditAppend: (p, rows) => {
        appendPendingAudit(p, rows);
        throw Error('interrupted acknowledgement');
      },
    });
    expect(loaded(f.dir).doc.workflow!.pending_audit).toHaveLength(1);
    savePack(f.doc, f.path, { at });
    expect(readOwnerEvents(ownerEventsPath(f.dir))).toHaveLength(1);
  });
  it('recovers only an incomplete fragment matching a known pending receipt', () => {
    const f = fixture();
    action(f.doc, 'accept', f.path);
    savePack(f.doc, f.path, { at });
    action(f.doc, 'start', f.path);
    savePack(f.doc, f.path, {
      at,
      auditAppend: (p, rows) => {
        appendFileSync(p, JSON.stringify(rows[0]).slice(0, 30));
        throw Error('partial append');
      },
    });
    savePack(f.doc, f.path, { at });
    expect(readOwnerEvents(ownerEventsPath(f.dir))).toHaveLength(2);
    f.doc.workflow!.pending_audit = [f.doc.workflow!.acts[0]!];
    appendFileSync(ownerEventsPath(f.dir), 'corrupt');
    const before = readFileSync(ownerEventsPath(f.dir), 'utf8');
    savePack(f.doc, f.path, { at });
    expect(readFileSync(ownerEventsPath(f.dir), 'utf8')).toBe(before);
    expect(loaded(f.dir).doc.workflow!.pending_audit).toHaveLength(1);
  });
  it('does not recover a live lock or infer stale ownership from age', () => {
    const f = fixture();
    mkdirSync(join(f.dir, '.specpack-lock'));
    writeFileSync(
      join(f.dir, '.specpack-lock', 'owner.json'),
      JSON.stringify({ token: 'known', pid: process.pid, host: hostname(), at: '2000-01-01' }),
    );
    expect(recoverPackLock(f.dir, 'known', 'human:owner').ok).toBe(false);
    expect(recoverPackLock(f.dir, 'known', 'agent:x').ok).toBe(false);
    writeFileSync(
      join(f.dir, '.specpack-lock', 'owner.json'),
      JSON.stringify({ token: 'known', pid: 2147483647, host: hostname() }),
    );
    expect(recoverPackLock(f.dir, 'wrong', 'human:owner').ok).toBe(false);
    expect(recoverPackLock(f.dir, 'known', 'human:owner').ok).toBe(true);
  });
});
