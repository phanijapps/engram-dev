import { describe, it, expect } from 'vitest';
import {
  ownerAction,
  ownerCursor,
  ownerChange,
  encodeCursor,
  decodeCursor,
  type PackDoc,
} from '../src/index.js';
const at = '2026-10-10T21:57:36Z';
function pack(): PackDoc {
  const artifacts = Object.fromEntries(
    ['brief', 'spec', 'design', 'plan'].map((id) => [
      id,
      { file: id + '.md', sha256: 'a'.repeat(64) },
    ]),
  );
  return {
    name: 'test',
    format: 'specpack/0.4',
    revision: 1,
    status: 'active',
    artifacts,
    spec: {
      requirements: [{ id: 'FR-1', text: 'Owner gates' }],
      clarifications: [{ id: 'Q-1', question: 'Which?', status: 'open' }],
    },
    plan: { decisions: [{ id: 'D-1', decision: 'Wait', status: 'proposed' }] },
    tasks: [
      {
        id: 'T-1',
        title: 'Work',
        status: 'todo',
        requires_decisions: ['D-1'],
        verify: { cmd: 'check', expect: 'exit 0' },
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
}
describe('owner change read model', () => {
  it('detects a new owner act and the resulting phase', () => {
    const d = pack();
    const before = ownerCursor(d);
    const out = ownerAction(d, {
      kind: 'accept',
      decision: 'D-1',
      by: 'human:owner',
      at,
      expected_revision: d.revision!,
    });
    expect(out.ok).toBe(true);
    const change = ownerChange(before, ownerCursor(d), d);
    expect(change?.new_acts).toEqual([{ id: expect.any(String), kind: 'accept' }]);
    expect(change?.phase).toBe('start');
  });
  it('detects a changed answered-question set', () => {
    const d = pack();
    const before = ownerCursor(d);
    d.spec.clarifications![0]!.status = 'resolved';
    const change = ownerChange(before, ownerCursor(d), d);
    expect(change?.answered).toEqual(['Q-1']);
  });
  it('treats an agent-authored revision bump as no change', () => {
    const d = pack();
    const before = ownerCursor(d);
    d.revision = 5;
    d.tasks[0]!['detail'] = 'agent edit';
    expect(ownerChange(before, ownerCursor(d), d)).toBeNull();
  });
  it('reports each act once and reports nothing for an equal cursor', () => {
    const d = pack();
    ownerAction(d, {
      kind: 'accept',
      decision: 'D-1',
      by: 'human:owner',
      at,
      expected_revision: d.revision!,
    });
    const cur = ownerCursor(d);
    expect(ownerChange(cur, ownerCursor(d), d)).toBeNull();
  });
  it('round-trips cursors and rejects malformed tokens', () => {
    const c = ownerCursor(pack());
    expect(decodeCursor(encodeCursor(c))).toEqual(c);
    expect(decodeCursor('not-a-cursor')).toBeNull();
    expect(decodeCursor(Buffer.from('{"revision":"x"}').toString('base64url'))).toBeNull();
  });
  it('reports legacy phase for packs without a workflow', () => {
    const d = pack();
    delete d.workflow;
    expect(ownerCursor(d).phase).toBe('legacy');
  });
  it('detects a legacy decision acceptance and approval', () => {
    const d = pack();
    delete d.workflow;
    const prev = ownerCursor(d);
    d.plan.decisions![0]!.status = 'accepted';
    d.approved_at = at;
    const change = ownerChange(prev, ownerCursor(d), d);
    expect(change?.new_acts.map((a) => a.kind)).toEqual(['legacy', 'legacy']);
  });
});
