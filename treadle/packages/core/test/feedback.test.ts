import { afterEach, describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync, symlinkSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import {
  mutateFeedback,
  readFeedback,
  readFeedbackSnapshot,
  feedbackReadResult,
  feedbackThreadState,
  recoverFeedbackOrphans,
  feedbackContainedPath,
  FEEDBACK_LIMITS,
  FeedbackError,
  emitBytes,
  withPackLock,
  type FeedbackAction,
  type FeedbackAnchor,
  type FeedbackMutation,
  type PackDoc,
} from '../src/index.js';

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});
function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'feedback-'));
  roots.push(root);
  const dir = join(root, 'specs', 'test');
  mkdirSync(dir, { recursive: true });
  const pack: PackDoc = {
    name: 'test',
    id: 'test',
    status: 'active',
    format: 'specpack/0.4',
    revision: 1,
    spec: { requirements: [], clarifications: [] },
    plan: { decisions: [], designs: [] },
    tasks: [],
    workflow: {
      policy: 'owner-gated/1',
      plan: 1,
      phase_questions: { spec: [] },
      acts: [],
      pending_audit: [],
    },
  };
  const path = join(dir, 'test.json');
  writeFileSync(path, emitBytes(pack));
  const apply = (
    action: FeedbackAction,
    by = ['open', 'round', 'reply'].includes(action.kind) ? 'agent:test' : 'human:test',
  ) =>
    mutateFeedback(dir, root, {
      operation_id: randomUUID(),
      expected_revision: readFeedback(dir, root)?.revision ?? 0,
      by,
      action,
    });
  const open = () =>
    apply({
      kind: 'open',
      selection: { mode: 'documents', paths: ['doc.md'], artifacts: [] },
      snapshots: [{ key: 'doc.md', path: 'doc.md', before: null, after: 'one\ntwo\n' }],
    });
  const anchor = (sessionId: string): FeedbackAnchor => {
    const round = readFeedback(dir, root)!
      .sessions.find((s) => s.id === sessionId)!
      .rounds.at(-1)!;
    const target = round.targets[0]!;
    return {
      round: round.id,
      target: target.id,
      side: 'after',
      sha256: target.after!.sha256,
      start: 2,
      end: 2,
      quote: 'two',
    };
  };
  return { root, dir, path, pack, apply, open, anchor };
}
function expectCode(fn: () => unknown, code: FeedbackError['code']) {
  try {
    fn();
    throw Error('Expected refusal');
  } catch (error) {
    expect(error).toBeInstanceOf(FeedbackError);
    expect((error as FeedbackError).code).toBe(code);
  }
}

describe('durable artifact feedback', () => {
  it('publishes immutable sides and never changes canonical owner bytes', () => {
    const f = fixture();
    const canonical = readFileSync(f.path);
    const r = f.open();
    const state = readFeedback(f.dir, f.root)!;
    const target = state.sessions[0]!.rounds[0]!.targets[0]!;
    expect(readFeedbackSnapshot(f.dir, f.root, r.session, r.round!, target.id, 'after')).toBe(
      'one\ntwo\n',
    );
    expectCode(
      () => readFeedbackSnapshot(f.dir, f.root, r.session, r.round!, target.id, 'before'),
      'missing',
    );
    f.apply({
      kind: 'comment',
      session: r.session,
      anchor: f.anchor(r.session),
      body: '<script>feedback</script>',
    });
    f.apply({ kind: 'submit', session: r.session, round: r.round! });
    expect(readFileSync(f.path)).toEqual(canonical);
    expect(state.format).toBe('feedback/1');
    expect(readFeedback(f.dir, f.root)!.revision).toBe(3);
  });
  it('keeps drafts private to state until explicit submission and supports restart/redelivery', () => {
    const f = fixture();
    const r = f.open();
    const comment = f.apply({
      kind: 'comment',
      session: r.session,
      anchor: f.anchor(r.session),
      body: 'Change this',
    });
    expect(feedbackReadResult(f.dir, f.root, r.session)).toMatchObject({
      status: 'pending',
      batches: [],
    });
    const submit = f.apply({ kind: 'submit', session: r.session, round: r.round! });
    const first = feedbackReadResult(f.dir, f.root, r.session);
    expect(first).toMatchObject({
      status: 'submitted',
      cursor: 1,
      batches: [{ id: submit.batch, items: [{ thread: comment.thread }] }],
    });
    expect(feedbackReadResult(f.dir, f.root, r.session)).toEqual(first);
    expect(feedbackReadResult(f.dir, f.root, r.session, 1)).toMatchObject({ status: 'pending' });
    expectCode(() => feedbackReadResult(f.dir, f.root, r.session, 2), 'invalid');
    expectCode(() => feedbackReadResult(f.dir, f.root, r.session, -1), 'invalid');
  });
  it('returns the same operation receipt before stale revision checks and rejects changed retries', () => {
    const f = fixture();
    const input: FeedbackMutation = {
      by: 'agent:test',
      operation_id: randomUUID(),
      expected_revision: 0,
      action: {
        kind: 'open',
        selection: { mode: 'documents', paths: ['doc.md'], artifacts: [] },
        snapshots: [{ key: 'doc.md', path: 'doc.md', before: null, after: 'text' }],
      },
    };
    const receipt = mutateFeedback(f.dir, f.root, input);
    expect(mutateFeedback(f.dir, f.root, input)).toEqual(receipt);
    expect(readFeedback(f.dir, f.root)!.sessions).toHaveLength(1);
    expectCode(() => mutateFeedback(f.dir, f.root, { ...input, by: 'agent:other' }), 'conflict');
    expectCode(
      () => mutateFeedback(f.dir, f.root, { ...input, operation_id: randomUUID() }),
      'conflict',
    );
  });
  it('seals submissions, delivers empty batches without granting approval, and permits new rounds', () => {
    const f = fixture();
    const before = readFileSync(f.path);
    const r = f.open();
    f.apply({ kind: 'submit', session: r.session, round: r.round! });
    expect(feedbackReadResult(f.dir, f.root, r.session)).toMatchObject({
      status: 'submitted',
      batches: [{ items: [] }],
    });
    expectCode(() => f.apply({ kind: 'submit', session: r.session, round: r.round! }), 'conflict');
    expectCode(
      () =>
        f.apply({ kind: 'comment', session: r.session, anchor: f.anchor(r.session), body: 'late' }),
      'conflict',
    );
    f.apply({
      kind: 'round',
      session: r.session,
      snapshots: [{ key: 'doc.md', path: 'doc.md', before: 'one\ntwo\n', after: 'one\nnew\n' }],
    });
    expect(readFeedback(f.dir, f.root)!.sessions[0]!.rounds).toHaveLength(2);
    expect(readFileSync(f.path)).toEqual(before);
  });
  it('recovers stale threads through refreshed snapshots and human reattachment plus Submit', () => {
    const f = fixture();
    const r = f.open();
    const original = f.anchor(r.session);
    const comment = f.apply({
      kind: 'comment',
      session: r.session,
      anchor: original,
      body: 'Revise two',
    });
    f.apply({ kind: 'submit', session: r.session, round: r.round! });
    f.apply({
      kind: 'reply',
      session: r.session,
      thread: comment.thread!,
      body: 'Source is stale; please reattach',
    });
    const next = f.apply({
      kind: 'round',
      session: r.session,
      snapshots: [{ key: 'doc.md', path: 'doc.md', before: 'one\ntwo\n', after: 'one\nchanged\n' }],
    });
    let state = readFeedback(f.dir, f.root)!;
    const t = state.threads[0]!;
    expect(feedbackThreadState(state.sessions[0]!, t)).toEqual({ stale: true, resolved: false });
    expect(t.original).toEqual(original);
    expect(t.replies).toHaveLength(1);
    const reattached = { ...f.anchor(r.session), quote: 'changed' };
    f.apply({ kind: 'reattach', session: r.session, thread: t.id, anchor: reattached });
    expect(feedbackReadResult(f.dir, f.root, r.session, 1)).toMatchObject({
      status: 'pending',
      batches: [],
    });
    f.apply({ kind: 'submit', session: r.session, round: next.round! });
    expect(feedbackReadResult(f.dir, f.root, r.session, 1)).toMatchObject({
      status: 'submitted',
      batches: [
        { cursor: 2, items: [{ kind: 'reattach', thread: t.id, original, anchor: reattached }] },
      ],
    });
    f.apply({ kind: 'resolve', session: r.session, thread: t.id });
    state = readFeedback(f.dir, f.root)!;
    expect(feedbackThreadState(state.sessions[0]!, state.threads[0]!)).toEqual({
      stale: false,
      resolved: true,
    });
    expect(feedbackReadResult(f.dir, f.root, r.session, 1)).toMatchObject({
      batches: [{ cursor: 2 }],
      threads: [{ resolved: true }],
    });
    expectCode(
      () => f.apply({ kind: 'resolve', session: r.session, thread: t.id }, 'agent:test'),
      'forbidden',
    );
  });
  it.each([
    { start: 0 },
    { end: 3 },
    { sha256: '0'.repeat(64) },
    { side: 'before' },
    { quote: 'forged' },
    { start: undefined, end: undefined, quote: 'two' },
  ])('refuses forged/invalid anchors %j without a revision change', (patch) => {
    const f = fixture();
    const r = f.open();
    expectCode(
      () =>
        f.apply({
          kind: 'comment',
          session: r.session,
          anchor: { ...f.anchor(r.session), ...patch } as FeedbackAnchor,
          body: 'edit',
        }),
      'invalid',
    );
    expect(readFeedback(f.dir, f.root)!.revision).toBe(1);
  });
  it('supports round/file comments and absent/deleted text sides with explicit line bounds', () => {
    const f = fixture();
    const r = f.open();
    f.apply({
      kind: 'comment',
      session: r.session,
      anchor: { round: r.round! },
      body: 'Overall feedback',
    });
    const a = f.anchor(r.session);
    delete a.start;
    delete a.end;
    delete a.quote;
    f.apply({ kind: 'comment', session: r.session, anchor: a, body: 'Whole file' });
    f.apply({ kind: 'submit', session: r.session, round: r.round! });
    const next = f.apply({
      kind: 'round',
      session: r.session,
      snapshots: [{ key: 'doc.md', path: 'doc.md', before: 'one\ntwo\n', after: null }],
    });
    const target = readFeedback(f.dir, f.root)!.sessions[0]!.rounds[1]!.targets[0]!;
    expect(readFeedbackSnapshot(f.dir, f.root, r.session, next.round!, target.id, 'before')).toBe(
      'one\ntwo\n',
    );
  });
  it('refuses role confusion, draft loss and changed target selection', () => {
    const f = fixture();
    const r = f.open();
    expectCode(
      () =>
        f.apply(
          { kind: 'comment', session: r.session, anchor: f.anchor(r.session), body: 'x' },
          'agent:test',
        ),
      'forbidden',
    );
    const comment = f.apply({
      kind: 'comment',
      session: r.session,
      anchor: f.anchor(r.session),
      body: 'x',
    });
    expectCode(
      () =>
        f.apply(
          { kind: 'reply', session: r.session, thread: comment.thread!, body: 'x' },
          'human:test',
        ),
      'forbidden',
    );
    expectCode(
      () =>
        f.apply({
          kind: 'round',
          session: r.session,
          snapshots: [{ key: 'doc.md', path: 'doc.md', before: null, after: 'new' }],
        }),
      'conflict',
    );
    f.apply({ kind: 'submit', session: r.session, round: r.round! });
    expectCode(
      () =>
        f.apply({
          kind: 'round',
          session: r.session,
          snapshots: [{ key: 'other', path: 'other.md', before: null, after: 'new' }],
        }),
      'invalid',
    );
  });
  it('uses the same writer lock and refuses audit recovery or completed writes', () => {
    const f = fixture();
    const r = f.open();
    withPackLock(f.dir, () =>
      expectCode(
        () => f.apply({ kind: 'submit', session: r.session, round: r.round! }),
        'conflict',
      ),
    );
    mkdirSync(join(f.dir, '.specpack-recovery'));
    expectCode(() => f.apply({ kind: 'submit', session: r.session, round: r.round! }), 'conflict');
    rmSync(join(f.dir, '.specpack-recovery'), { recursive: true });
    f.pack.status = 'complete';
    writeFileSync(f.path, emitBytes(f.pack));
    expectCode(() => f.apply({ kind: 'submit', session: r.session, round: r.round! }), 'conflict');
    expect(feedbackReadResult(f.dir, f.root, r.session)).toMatchObject({ status: 'closed' });
    f.pack.status = 'active';
    f.pack.format = 'specpack/0.3';
    writeFileSync(f.path, emitBytes(f.pack));
    expectCode(() => f.open(), 'unavailable');
  });
  it('fails closed on format corruption, changed snapshots and cross-project/symlink reads', () => {
    const f = fixture();
    const r = f.open();
    const state = readFeedback(f.dir, f.root)!;
    const target = state.sessions[0]!.rounds[0]!.targets[0]!;
    writeFileSync(join(f.dir, 'feedback', target.after!.ref), 'one\nBAD\n');
    expectCode(
      () => readFeedbackSnapshot(f.dir, f.root, r.session, r.round!, target.id, 'after'),
      'unavailable',
    );
    writeFileSync(join(f.dir, 'feedback/state.json'), '{bad');
    expectCode(() => readFeedback(f.dir, f.root), 'unavailable');
    expectCode(() => recoverFeedbackOrphans(f.dir, f.root), 'unavailable');
    expectCode(() => readFeedback(f.dir, join(f.root, 'specs', 'test')), 'unavailable');
    const other = fixture();
    expectCode(() => readFeedback(f.dir, other.root), 'forbidden');
    symlinkSync(other.dir, join(f.root, 'escape'));
    expectCode(() => feedbackContainedPath(f.root, 'escape/new-file'), 'forbidden');
  });
  it.each(['snapshots', 'ledger-flushed'] as const)(
    'preserves unacknowledged %s artifacts for explicit orphan recovery',
    (phase) => {
      const f = fixture();
      const input: FeedbackMutation = {
        by: 'agent:test',
        operation_id: randomUUID(),
        expected_revision: 0,
        action: {
          kind: 'open',
          selection: { mode: 'documents', paths: ['doc.md'], artifacts: [] },
          snapshots: [{ key: 'doc.md', path: 'doc.md', before: null, after: 'new' }],
        },
      };
      expect(() =>
        mutateFeedback(f.dir, f.root, input, {
          fault: (p) => {
            if (p === phase) throw Error('injected failure');
          },
        }),
      ).toThrow('injected failure');
      expect(readFeedback(f.dir, f.root)).toBeNull();
      const removed = recoverFeedbackOrphans(f.dir, f.root);
      expect(removed.length).toBeGreaterThan(0);
      const r = mutateFeedback(f.dir, f.root, input);
      expect(recoverFeedbackOrphans(f.dir, f.root)).toEqual([]);
      expect(readFeedback(f.dir, f.root)!.sessions[0]!.id).toBe(r.session);
    },
  );
  it('recovers a published-but-unacknowledged result by the same operation ID', () => {
    const f = fixture();
    const input: FeedbackMutation = {
      by: 'agent:test',
      operation_id: randomUUID(),
      expected_revision: 0,
      action: {
        kind: 'open',
        selection: { mode: 'documents', paths: ['doc.md'], artifacts: [] },
        snapshots: [{ key: 'doc.md', path: 'doc.md', before: null, after: 'new' }],
      },
    };
    expect(() =>
      mutateFeedback(f.dir, f.root, input, {
        fault: (p) => {
          if (p === 'published') throw Error('ack lost');
        },
      }),
    ).toThrow('ack lost');
    const r = mutateFeedback(f.dir, f.root, input);
    expect(readFeedback(f.dir, f.root)!.revision).toBe(r.revision);
    expect(readFeedback(f.dir, f.root)!.sessions).toHaveLength(1);
  });
  it('rechecks sources inside the lock before acknowledging and enforces body/file/round counts', () => {
    const f = fixture();
    const action: FeedbackAction = {
      kind: 'open',
      selection: { mode: 'documents', paths: ['doc.md'], artifacts: [] },
      snapshots: [{ key: 'doc.md', path: 'doc.md', before: null, after: 'new' }],
    };
    expect(() =>
      mutateFeedback(
        f.dir,
        f.root,
        { by: 'agent:test', operation_id: randomUUID(), expected_revision: 0, action },
        {
          verifySources: () => {
            throw Error('source drift');
          },
        },
      ),
    ).toThrow('source drift');
    expect(readFeedback(f.dir, f.root)).toBeNull();
    expectCode(
      () =>
        f.apply({
          ...action,
          snapshots: [
            {
              key: 'doc.md',
              path: 'doc.md',
              before: null,
              after: 'a'.repeat(FEEDBACK_LIMITS.file + 1),
            },
          ],
        }),
      'bounds',
    );
    const r = f.open();
    expectCode(
      () =>
        f.apply({
          kind: 'comment',
          session: r.session,
          anchor: f.anchor(r.session),
          body: 'é'.repeat(FEEDBACK_LIMITS.body),
        }),
      'bounds',
    );
    for (let i = 1; i < FEEDBACK_LIMITS.rounds; i++)
      f.apply({
        kind: 'round',
        session: r.session,
        snapshots: [{ key: 'doc.md', path: 'doc.md', before: null, after: 'text' }],
      });
    expectCode(
      () =>
        f.apply({
          kind: 'round',
          session: r.session,
          snapshots: [{ key: 'doc.md', path: 'doc.md', before: null, after: 'text' }],
        }),
      'bounds',
    );
  });
});
