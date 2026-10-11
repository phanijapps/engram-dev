import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { realpathSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, expect, it } from 'vitest';
import {
  emitBytes,
  loadPackWithMeta,
  mutateFeedback,
  readFeedback,
  readFeedbackSnapshot,
  feedbackReadResult,
  feedbackThreadState,
  workflowGate,
  ownerAction,
  type PackDoc,
  type FeedbackAction,
} from '@treadle/core';
import { startProjects } from '@treadle/web';
import { publishFeedbackSnapshots, waitForFeedback } from '../src/commands/feedback.js';

// Synthetic integration fixtures prove boundary behavior, never native human witnesses.
const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});
async function fixture() {
  const root = realpathSync.native(mkdtempSync(join(tmpdir(), 'feedback-loop-')));
  roots.push(root);
  const dir = join(root, 'specs/loop'),
    path = join(dir, 'loop.json');
  mkdirSync(dir, { recursive: true });
  mkdirSync(join(root, 'wiki'));
  const pack: PackDoc = {
    name: 'loop',
    format: 'specpack/0.4',
    revision: 1,
    status: 'active',
    artifacts: Object.fromEntries(
      ['brief', 'spec', 'design', 'plan'].map((id) => [
        id,
        { file: id + '.md', sha256: 'a'.repeat(64) },
      ]),
    ),
    spec: { requirements: [], clarifications: [] },
    plan: { decisions: [] },
    tasks: [
      {
        id: 'T-1',
        title: 'Fixture task',
        status: 'todo',
        verify: { cmd: 'check', expect: 'exit0' },
        context: { touch: [] },
      },
    ],
    workflow: {
      policy: 'owner-gated/1',
      plan: 1,
      phase_questions: { spec: [] },
      acts: [],
      pending_audit: [],
    },
  };
  for (const id of ['brief', 'spec', 'design', 'plan'])
    writeFileSync(join(dir, id + '.md'), 'Fixture ' + id);
  writeFileSync(path, emitBytes(pack));
  writeFileSync(join(root, 'doc.md'), 'first\nsecond\n');
  const project = {
    id: 'a'.repeat(24),
    label: 'integration fixture',
    workspace: root,
    specs: join(root, 'specs'),
    wiki: join(root, 'wiki'),
    available: true,
    wikiAvailable: true,
    specsAvailable: true,
  };
  let server = await startProjects(() => [project]);
  const envelope = (by = 'agent:fixture') => ({
    by,
    operation_id: randomUUID(),
    expected_revision: readFeedback(dir, root)?.revision ?? 0,
  });
  const apply = (action: FeedbackAction, by = 'agent:fixture') =>
    mutateFeedback(dir, root, { ...envelope(by), action });
  const post = async (kind: string, fields: object) => {
    const base = server.url + `projects/${project.id}/library/`;
    const html = await (await fetch(base)).text();
    const token = /"ownerToken":"([a-f\d]+)"/.exec(html)![1]!;
    const response = await fetch(base + 'feedback/loop/' + kind, {
      method: 'POST',
      headers: {
        Origin: server.url.slice(0, -1),
        'X-Owner-Token': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...envelope('human:fixture'), ...fields }),
    });
    expect(response.status).toBe(200);
    return response.json();
  };
  const restart = async () => {
    await server.close();
    server = await startProjects(() => [project]);
  };
  return { root, dir, path, pack, envelope, apply, post, restart, close: () => server.close() };
}

it('delivers only explicit submitted document feedback during wait and retains it across service restart', async () => {
  const f = await fixture();
  try {
    const canonical = readFileSync(f.path);
    const open = publishFeedbackSnapshots(
      f.dir,
      f.root,
      { mode: 'documents', paths: ['doc.md'] },
      f.envelope(),
    );
    const session = open.session,
      round = open.round!;
    const target = readFeedback(f.dir, f.root)!.sessions[0]!.rounds[0]!.targets[0]!;
    const comment = await f.post('comment', {
      session,
      anchor: {
        round,
        target: target.id,
        side: 'after',
        sha256: target.after!.sha256,
        start: 2,
        end: 2,
      },
      body: 'Revise second line',
    });
    expect(feedbackReadResult(f.dir, f.root, session, 0)).toMatchObject({
      status: 'pending',
      batches: [],
    });
    const waiting = waitForFeedback(f.dir, f.root, session, 0, 2);
    await f.post('submit', { session, round });
    const first = await waiting;
    expect(first).toMatchObject({ status: 'submitted', cursor: 1 });
    await f.restart();
    const redelivered = await waitForFeedback(f.dir, f.root, session, 0, 1);
    expect(redelivered).toEqual(first);
    console.log(
      'FEEDBACK_RECOVERY ' +
        JSON.stringify({
          kind: 'restart-redelivery',
          session,
          before_cursor: first.cursor,
          after_cursor: redelivered.cursor,
          before_batches: (first.batches as { id: string }[]).map((b) => b.id),
          after_batches: (redelivered.batches as { id: string }[]).map((b) => b.id),
        }),
    );
    writeFileSync(join(f.root, 'doc.md'), 'first\nrevised second\n');
    f.apply({ kind: 'reply', session, thread: comment.thread, body: 'Revised' });
    const next = publishFeedbackSnapshots(
      f.dir,
      f.root,
      { mode: 'documents', paths: ['doc.md'] },
      f.envelope(),
      readFeedback(f.dir, f.root)!.sessions[0],
    );
    expect(readFeedbackSnapshot(f.dir, f.root, session, round, target.id, 'after')).toBe(
      'first\nsecond\n',
    );
    const state = readFeedback(f.dir, f.root)!;
    expect(next.round).not.toBe(round);
    expect(feedbackThreadState(state.sessions[0]!, state.threads[0]!)).toEqual({
      resolved: false,
      stale: true,
    });
    await f.post('resolve', { session, thread: comment.thread });
    expect(feedbackReadResult(f.dir, f.root, session, 0)).toMatchObject({
      status: 'submitted',
      threads: [{ resolved: true }],
    });
    expect(readFileSync(f.path)).toEqual(canonical);
  } finally {
    await f.close();
  }
});

it('delivers stale reattachment only after another human Submit and preserves the original code anchor', async () => {
  const f = await fixture();
  try {
    const git = (...args: string[]) =>
      execFileSync(
        'git',
        ['-c', 'core.hooksPath=/dev/null', '-c', 'commit.gpgsign=false', ...args],
        { cwd: f.root, stdio: ['ignore', 'pipe', 'pipe'] },
      );
    git('init', '-q');
    git('config', 'core.autocrlf', 'false');
    git('config', 'user.name', 'fixture');
    git('config', 'user.email', 'fixture@example.invalid');
    git('add', 'doc.md');
    git('commit', '-qm', 'baseline');
    writeFileSync(join(f.root, 'doc.md'), 'code review one\n');
    writeFileSync(join(f.root, 'unselected.txt'), 'never collected');
    const request = { mode: 'diff' as const, paths: ['doc.md'], base: 'HEAD' };
    const open = publishFeedbackSnapshots(f.dir, f.root, request, f.envelope());
    let s = readFeedback(f.dir, f.root)!.sessions[0]!;
    expect(s.rounds[0]!.targets.map((t) => t.path)).toEqual(['doc.md']);
    const target = s.rounds[0]!.targets[0]!,
      original = {
        round: open.round!,
        target: target.id,
        side: 'after' as const,
        sha256: target.after!.sha256,
        start: 1,
        end: 1,
      };
    const comment = await f.post('comment', {
      session: s.id,
      anchor: original,
      body: 'Change first line',
    });
    await f.post('submit', { session: s.id, round: open.round });
    writeFileSync(join(f.root, 'doc.md'), 'source moved\n');
    f.apply({
      kind: 'reply',
      session: s.id,
      thread: comment.thread,
      body: 'Stale; please reattach to the refreshed source',
    });
    publishFeedbackSnapshots(
      f.dir,
      f.root,
      { ...request, base: s.selection.base! },
      f.envelope(),
      s,
    );
    s = readFeedback(f.dir, f.root)!.sessions[0]!;
    const round = s.rounds.at(-1)!,
      fresh = round.targets[0]!;
    await f.post('reattach', {
      session: s.id,
      thread: comment.thread,
      anchor: {
        round: round.id,
        target: fresh.id,
        side: 'after',
        sha256: fresh.after!.sha256,
        start: 1,
        end: 1,
      },
    });
    expect(await waitForFeedback(f.dir, f.root, s.id, 1, 1)).toMatchObject({ status: 'pending' });
    await f.post('submit', { session: s.id, round: round.id });
    const batch = await waitForFeedback(f.dir, f.root, s.id, 1, 1);
    expect(batch).toMatchObject({
      cursor: 2,
      batches: [
        {
          items: [
            { kind: 'reattach', thread: comment.thread, original, anchor: { round: round.id } },
          ],
        },
      ],
    });
    expect(readFeedback(f.dir, f.root)!.threads[0]!.original).toMatchObject(original);
  } finally {
    await f.close();
  }
});

it('replays a durably submitted batch after a lost acknowledgement without duplication', async () => {
  const f = await fixture();
  try {
    const open = publishFeedbackSnapshots(
      f.dir,
      f.root,
      { mode: 'documents', paths: ['doc.md'] },
      f.envelope(),
    );
    await f.post('comment', {
      session: open.session,
      anchor: { round: open.round },
      body: 'A synthetic recovery request',
    });
    const request = {
      ...f.envelope('human:fixture'),
      action: { kind: 'submit' as const, session: open.session, round: open.round! },
    };
    expect(() =>
      mutateFeedback(f.dir, f.root, request, {
        fault: (p) => {
          if (p === 'published') throw Error('lost acknowledgement');
        },
      }),
    ).toThrow('lost acknowledgement');
    await f.restart();
    const received = await waitForFeedback(f.dir, f.root, open.session, 0, 1);
    const replay = mutateFeedback(f.dir, f.root, request);
    expect(replay.batch).toBe((received.batches as { id: string }[])[0]!.id);
    expect(readFeedback(f.dir, f.root)!.batches).toHaveLength(1);
    expect(feedbackReadResult(f.dir, f.root, open.session, 0)).toEqual(received);
    console.log(
      'FEEDBACK_RECOVERY ' +
        JSON.stringify({
          kind: 'lost-ack',
          session: open.session,
          operation_id: request.operation_id,
          received_batch: (received.batches as { id: string }[])[0]!.id,
          replay_batch: replay.batch,
          committed_batches: readFeedback(f.dir, f.root)!.batches.length,
        }),
    );
  } finally {
    await f.close();
  }
});

it('never supplies Start through feedback, invalidates an old Start on plan change, and keeps closed history read-only', async () => {
  const f = await fixture();
  try {
    const before = readFileSync(f.path);
    const open = publishFeedbackSnapshots(
      f.dir,
      f.root,
      { mode: 'documents', paths: ['doc.md'] },
      f.envelope(),
    );
    const comment = await f.post('comment', {
      session: open.session,
      anchor: { round: open.round },
      body: 'Do it',
    });
    await f.post('submit', { session: open.session, round: open.round });
    await f.post('resolve', { session: open.session, thread: comment.thread });
    const loaded = loadPackWithMeta(f.dir);
    if (!loaded.ok) throw Error(loaded.message);
    expect(workflowGate(loaded.value.doc, f.path).phase).toBe('start');
    expect(readFileSync(f.path)).toEqual(before);
    // Explicit synthetic owner action in an isolated test fixture; never the real initiative.
    expect(
      ownerAction(
        f.pack,
        { kind: 'start', by: 'human:fixture', at: new Date().toISOString(), expected_revision: 1 },
        f.path,
      ).ok,
    ).toBe(true);
    expect(workflowGate(f.pack, f.path).phase).toBe('implementation');
    writeFileSync(join(f.dir, 'plan.md'), 'Changed plan');
    expect(workflowGate(f.pack, f.path).phase).toBe('start');
    f.pack.status = 'complete';
    writeFileSync(f.path, emitBytes(f.pack));
    expect(feedbackReadResult(f.dir, f.root, open.session, 0)).toMatchObject({ status: 'closed' });
    expect(() =>
      f.apply({ kind: 'reply', session: open.session, thread: comment.thread, body: 'Refused' }),
    ).toThrow('Completed packs are read-only');
    expect(
      readFeedbackSnapshot(
        f.dir,
        f.root,
        open.session,
        open.round!,
        readFeedback(f.dir, f.root)!.sessions[0]!.rounds[0]!.targets[0]!.id,
        'after',
      ),
    ).toBe('first\nsecond\n');
  } finally {
    await f.close();
  }
});
