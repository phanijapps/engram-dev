import { execFileSync } from 'node:child_process';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { buildProgram } from '../src/main.js';
import {
  publishFeedbackSnapshots,
  waitForFeedback,
  feedbackProject,
} from '../src/commands/feedback.js';
import {
  emitBytes,
  mutateFeedback,
  readFeedback,
  type PackDoc,
  type FeedbackMutation,
} from '@treadle/core';

const runtime = vi.hoisted(() => ({ registry: '', running: true }));
vi.mock('../src/serve/runtime.js', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../src/serve/runtime.js')>()),
  stateDirectory: () => runtime.registry,
  serviceStatus: async () => ({
    state: runtime.running ? 'running' : 'unavailable',
    service: { url: 'http://127.0.0.1:12345/' },
  }),
}));
const roots: string[] = [];
afterEach(() => {
  process.exitCode = 0;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  for (const p of roots.splice(0)) rmSync(p, { recursive: true, force: true });
});
function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'feedback-cli-'));
  roots.push(root);
  const dir = join(root, 'specs', 'test');
  mkdirSync(dir, { recursive: true });
  const registry = join(root, 'registry');
  mkdirSync(registry);
  runtime.registry = registry;
  runtime.running = true;
  writeFileSync(
    join(registry, 'projects.json'),
    JSON.stringify({
      format: 'projects/1',
      projects: [
        {
          id: 'a'.repeat(24),
          label: 'test',
          workspace: root,
          specs: join(root, 'specs'),
          wiki: join(root, 'wiki'),
        },
      ],
    }),
  );
  const pack: PackDoc = {
    name: 'test',
    format: 'specpack/0.4',
    revision: 1,
    spec: { requirements: [], clarifications: [] },
    plan: { decisions: [] },
    tasks: [],
    workflow: {
      policy: 'owner-gated/1',
      plan: 1,
      phase_questions: { spec: [] },
      acts: [],
      pending_audit: [],
    },
  };
  writeFileSync(join(dir, 'test.json'), emitBytes(pack));
  writeFileSync(join(root, 'doc.md'), 'one\ntwo\n');
  const envelope = (): Omit<FeedbackMutation, 'action'> => ({
    by: 'agent:test',
    operation_id: randomUUID(),
    expected_revision: readFeedback(dir, root)?.revision ?? 0,
  });
  const open = () =>
    publishFeedbackSnapshots(dir, root, { mode: 'documents', paths: ['doc.md'] }, envelope());
  return { root, dir, envelope, open };
}
async function cli(args: string[]) {
  process.exitCode = 0;
  const print = vi.spyOn(console, 'log').mockImplementation(() => {});
  await buildProgram().parseAsync(['node', 'bin', 'do', 'feedback', ...args]);
  const outputs = print.mock.calls.map((c) => JSON.parse(String(c[0])));
  print.mockRestore();
  return { code: process.exitCode ?? 0, output: outputs.at(-1) };
}
describe('portable CLI feedback', () => {
  it('resolves only an enrolled canonical pack and rejects absent registry matches', () => {
    const f = fixture();
    expect(feedbackProject(f.dir).workspace).toBe(f.root);
    mkdirSync(join(f.root, 'arbitrary'));
    expect(() => feedbackProject(join(f.root, 'arbitrary'))).toThrow('enrolled');
  });
  it('opens through capability detection, echoes selection and returns the precise project URL', async () => {
    const f = fixture();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ format: 'feedback/1' }))),
    );
    const r = await cli([
      'open',
      f.dir,
      '--mode',
      'documents',
      '--file',
      'doc.md',
      '--expected-revision',
      '0',
      '--operation-id',
      randomUUID(),
      '--by',
      'agent:codex',
      '--json',
    ]);
    expect(r.code).toBe(0);
    expect(r.output).toMatchObject({
      format: 'feedback-result/1',
      status: 'pending',
      cursor: 0,
      project: 'a'.repeat(24),
      selection: { paths: ['doc.md'] },
    });
    expect(r.output.url).toContain('#/test/feedback?session=');
    expect(readFeedback(f.dir, f.root)!.sessions).toHaveLength(1);
  });
  it('returns original cursor on an open retry after a submitted batch', async () => {
    const f = fixture();
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockImplementation(async () => new Response(JSON.stringify({ format: 'feedback/1' }))),
    );
    writeFileSync(join(f.root, 'doc.md'), '\uFEFFone\n');
    const args = [
      'open',
      f.dir,
      '--mode',
      'documents',
      '--file',
      'doc.md',
      '--expected-revision',
      '0',
      '--operation-id',
      randomUUID(),
      '--by',
      'agent:codex',
      '--json',
    ];
    const first = (await cli(args)).output;
    mutateFeedback(f.dir, f.root, {
      ...f.envelope(),
      by: 'human:test',
      action: { kind: 'submit', session: first.session, round: first.round },
    });
    const retry = (await cli(args)).output;
    expect(retry.cursor).toBe(0);
    expect(await waitForFeedback(f.dir, f.root, retry.session, retry.cursor, 1)).toMatchObject({
      status: 'submitted',
      cursor: 1,
    });
  });
  it('refuses older or unavailable applications before publishing snapshots', async () => {
    const f = fixture();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 404 })));
    const args = [
      'open',
      f.dir,
      '--mode',
      'documents',
      '--file',
      'doc.md',
      '--expected-revision',
      '0',
      '--operation-id',
      randomUUID(),
      '--by',
      'agent:pi',
      '--json',
    ];
    expect((await cli(args)).output).toMatchObject({ status: 'unavailable', code: 'unavailable' });
    expect(readFeedback(f.dir, f.root)).toBeNull();
    runtime.running = false;
    expect((await cli(args)).code).toBe(1);
  });
  it('replays open and round operations from original immutable bytes after live-source changes', () => {
    const f = fixture();
    const envelope = f.envelope();
    const request = { mode: 'documents' as const, paths: ['doc.md'] };
    const first = publishFeedbackSnapshots(f.dir, f.root, request, envelope);
    writeFileSync(join(f.root, 'doc.md'), 'revision two');
    expect(publishFeedbackSnapshots(f.dir, f.root, request, envelope)).toEqual(first);
    const s = readFeedback(f.dir, f.root)!.sessions[0]!;
    const e = f.envelope();
    const next = publishFeedbackSnapshots(f.dir, f.root, request, e, s);
    const latest = readFeedback(f.dir, f.root)!.sessions[0]!;
    writeFileSync(join(f.root, 'doc.md'), 'revision three');
    expect(publishFeedbackSnapshots(f.dir, f.root, request, e, latest)).toEqual(next);
    expect(readFeedback(f.dir, f.root)!.sessions[0]!.rounds).toHaveLength(2);
    expect(() =>
      publishFeedbackSnapshots(f.dir, f.root, { ...request, paths: ['different.md'] }, envelope),
    ).toThrow('another payload');
  });
  it('replays an identical diff open after a symbolic baseline moves and rejects changed request identity', () => {
    const f = fixture();
    const git = (...args: string[]) =>
      execFileSync(
        'git',
        ['-c', 'core.hooksPath=/dev/null', '-c', 'commit.gpgsign=false', ...args],
        { cwd: f.root, stdio: ['ignore', 'pipe', 'pipe'] },
      );
    git('init', '-q');
    git('config', 'user.name', 'test');
    git('config', 'user.email', 'test@example.invalid');
    git('add', 'doc.md');
    git('commit', '-qm', 'baseline');
    const request = { mode: 'diff' as const, paths: ['doc.md'], base: 'HEAD' },
      envelope = f.envelope();
    const first = publishFeedbackSnapshots(f.dir, f.root, request, envelope);
    writeFileSync(join(f.root, 'other.txt'), 'unrelated');
    git('add', 'other.txt');
    git('commit', '-qm', 'unrelated');
    expect(publishFeedbackSnapshots(f.dir, f.root, request, envelope)).toEqual(first);
    expect(() =>
      publishFeedbackSnapshots(f.dir, f.root, { ...request, base: 'HEAD~1' }, envelope),
    ).toThrow('another payload');
    expect(() =>
      publishFeedbackSnapshots(
        f.dir,
        f.root,
        { mode: 'documents', paths: ['doc.md'], base: 'HEAD' },
        f.envelope(),
      ),
    ).toThrow('only to diff');
  });
  it('does not expose draft bodies to a CLI reader; submitted batches retain cursor IDs', async () => {
    const f = fixture();
    const r = f.open();
    mutateFeedback(f.dir, f.root, {
      ...f.envelope(),
      by: 'human:test',
      action: {
        kind: 'comment',
        session: r.session,
        anchor: { round: r.round! },
        body: 'Draft secret',
      },
    });
    const args = ['read', f.dir, '--session', r.session, '--after', '0', '--json'];
    expect((await cli(args)).output).toMatchObject({ status: 'pending', batches: [] });
    mutateFeedback(f.dir, f.root, {
      ...f.envelope(),
      by: 'human:test',
      action: { kind: 'submit', session: r.session, round: r.round! },
    });
    const first = (await cli(args)).output;
    expect(first).toMatchObject({
      status: 'submitted',
      cursor: 1,
      batches: [{ items: [{ body: 'Draft secret' }] }],
    });
    expect((await cli(args)).output).toEqual(first);
  });
  it('resumes a bounded wait when a batch arrives without consuming it', async () => {
    const f = fixture();
    const r = f.open();
    const timer = setTimeout(
      () =>
        mutateFeedback(f.dir, f.root, {
          ...f.envelope(),
          by: 'human:test',
          action: { kind: 'submit', session: r.session, round: r.round! },
        }),
      50,
    );
    try {
      expect(await waitForFeedback(f.dir, f.root, r.session, 0, 1)).toMatchObject({
        status: 'submitted',
        cursor: 1,
      });
    } finally {
      clearTimeout(timer);
    }
    expect(await waitForFeedback(f.dir, f.root, r.session, 0, 1)).toMatchObject({
      status: 'submitted',
      cursor: 1,
    });
  });
  it('returns pending on timeout/cancellation, refuses invalid bounds and never mutates state', async () => {
    const f = fixture();
    const r = f.open();
    const before = readFileSync(join(f.dir, 'feedback/state.json'));
    expect(await waitForFeedback(f.dir, f.root, r.session, 0, 1)).toMatchObject({
      status: 'pending',
    });
    const cancel = new AbortController();
    const waiting = waitForFeedback(f.dir, f.root, r.session, 0, 60, cancel.signal);
    cancel.abort();
    expect(await waiting).toMatchObject({ status: 'pending', cancelled: true });
    await expect(waitForFeedback(f.dir, f.root, r.session, 0, 61)).rejects.toThrow('1 and 60');
    await expect(waitForFeedback(f.dir, f.root, r.session, 0, 0)).rejects.toThrow('1 and 60');
    expect(readFileSync(join(f.dir, 'feedback/state.json'))).toEqual(before);
  });
  it('records replies with explicit agent identity and rejects human role or oversized body files', async () => {
    const f = fixture();
    const r = f.open();
    const c = mutateFeedback(f.dir, f.root, {
      ...f.envelope(),
      by: 'human:test',
      action: {
        kind: 'comment',
        session: r.session,
        anchor: { round: r.round! },
        body: 'Feedback',
      },
    });
    const body = join(f.root, 'reply.txt');
    writeFileSync(body, 'Responding');
    const args = [
      'reply',
      f.dir,
      '--session',
      r.session,
      '--thread',
      c.thread!,
      '--body-file',
      body,
      '--expected-revision',
      String(readFeedback(f.dir, f.root)!.revision),
      '--operation-id',
      randomUUID(),
      '--by',
      'agent:claude',
      '--json',
    ];
    expect((await cli(args)).code).toBe(0);
    expect(readFeedback(f.dir, f.root)!.threads[0]!.replies[0]!.by).toBe('agent:claude');
    args[args.indexOf('agent:claude')] = 'human:test';
    expect((await cli(args)).output.code).toBe('forbidden');
    writeFileSync(body, 'x'.repeat(8193));
    expect((await cli(args)).output.code).toBe('bounds');
  });
});
