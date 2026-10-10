import { describe, it, expect } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  ownerAction,
  workflowGate,
  planDigest,
  nextTask,
  record,
  closePack,
  evidenceDigest,
  emitBytes,
  loadPack,
  savePack,
  validateWorkflow,
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
    spec: { requirements: [{ id: 'FR-1', text: 'Owner gates' }], clarifications: [] },
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
function act(doc: PackDoc, kind: 'accept' | 'start' | 'close' | 'approve' | 'reject', extra = {}) {
  return ownerAction(doc, {
    kind,
    by: 'human:owner',
    at,
    expected_revision: doc.revision!,
    ...(kind === 'accept' || kind === 'reject' ? { decision: 'D-1' } : {}),
    ...extra,
  });
}
function started(): PackDoc {
  const d = pack();
  expect(act(d, 'accept').ok).toBe(true);
  expect(act(d, 'start').ok).toBe(true);
  return d;
}
describe('owner-gated contract', () => {
  it('requires decision consent and a separate start before handout or evidence', () => {
    const d = pack();
    expect(workflowGate(d).phase).toBe('decisions');
    expect(nextTask(d).value).toMatchObject({ status: 'owner_gate' });
    expect(
      record(d, 'T-1', 'pass', [{ command: 'check', exit: 0 }], d.revision!, 'agent:implementer', {
        at,
      }).ok,
    ).toBe(false);
    expect(act(d, 'accept').ok).toBe(true);
    expect(workflowGate(d).phase).toBe('start');
    expect(act(d, 'start').ok).toBe(true);
    expect(nextTask(d).value).toMatchObject({ status: 'task', task: 'T-1' });
  });
  it('refuses stale or agent approval without changing the pack', () => {
    const d = pack(),
      before = emitBytes(d);
    expect(
      ownerAction(d, { kind: 'accept', decision: 'D-1', by: 'agent:x', at, expected_revision: 1 })
        .ok,
    ).toBe(false);
    expect(
      ownerAction(d, {
        kind: 'accept',
        decision: 'D-1',
        by: 'human:owner',
        at,
        expected_revision: 0,
      }).ok,
    ).toBe(false);
    expect(emitBytes(d)).toBe(before);
  });
  it('stops resume after semantic changes, but ignores ordinary progress and actor stamps', () => {
    const d = started();
    const hash = planDigest(d);
    nextTask(d);
    d.updated = at;
    expect(planDigest(d)).toEqual(hash);
    d.tasks[0]!.title = 'Changed scope';
    const before = emitBytes(d);
    expect(nextTask(d).value).toMatchObject({ status: 'owner_gate', gate: { phase: 'start' } });
    expect(emitBytes(d)).toBe(before);
    expect(
      record(d, 'T-1', 'pass', [{ command: 'check', exit: 0 }], d.revision!, 'agent:runner', { at })
        .ok,
    ).toBe(false);
  });
  it('keeps rejected decision dependencies blocked and refuses reacceptance', () => {
    const d = pack();
    expect(act(d, 'reject', { because: 'Change it' }).ok).toBe(true);
    expect(workflowGate(d).phase).toBe('decisions');
    expect(act(d, 'accept').ok).toBe(false);
  });
  it('separates spec question ceremony from later design questions', () => {
    const d = pack();
    d.spec.clarifications = [
      {
        id: 'Q-1',
        question: 'Spec?',
        status: 'resolved',
        answer: 'Yes',
        answered_by: 'human:owner',
      },
      { id: 'Q-2', question: 'Design?', status: 'open' },
    ];
    d.workflow!.phase_questions.spec = ['Q-1'];
    expect(workflowGate(d).phase).toBe('spec');
    expect(act(d, 'approve').ok).toBe(true);
    expect(workflowGate(d).phase).toBe('decisions');
  });
  it('requires exact verification and current independent review before explicit closure', () => {
    const d = started();
    nextTask(d);
    expect(
      record(d, 'T-1', 'pass', [{ command: 'other', exit: 0 }], d.revision!, 'agent:runner', { at })
        .ok,
    ).toBe(false);
    expect(
      record(d, 'T-1', 'pass', [{ command: 'check', exit: 0 }], d.revision!, 'agent:runner', { at })
        .ok,
    ).toBe(true);
    expect(workflowGate(d).phase).toBe('review');
    expect(closePack(d, 'human:owner', { at }).ok).toBe(false);
    const digest = planDigest(d);
    if (!digest.ok) throw Error(digest.message);
    d.review = {
      verdicts: [
        {
          on: 'PACK',
          verdict: 'PASS',
          by: 'agent:runner',
          plan_digest: digest.value,
          evidence_digest: evidenceDigest(d),
        },
      ],
    };
    expect(workflowGate(d).phase).toBe('review');
    d.review.verdicts![0]!.by = 'agent:reviewer';
    expect(workflowGate(d).phase).toBe('closure');
    d.review.verdicts!.push({ on: 'PACK', verdict: 'FAIL', by: 'agent:reviewer' });
    expect(workflowGate(d).phase).toBe('review');
    d.review.verdicts!.pop();
    expect(act(d, 'close').ok).toBe(true);
    expect(workflowGate(d).phase).toBe('delivered');
    expect(act(d, 'close').ok).toBe(false);
  });
  it('does not treat a done label without passing evidence as a completed prerequisite', () => {
    const d = started();
    d.tasks[0]!.status = 'done';
    d.tasks.push({
      id: 'T-2',
      title: 'After',
      status: 'todo',
      needs: ['T-1'],
      verify: { cmd: 'check', expect: 'exit 0' },
    });
    expect(act(d, 'start').ok).toBe(true);
    expect(nextTask(d).value).toMatchObject({ status: 'WAITING' });
    expect(
      record(d, 'T-2', 'pass', [{ command: 'check', exit: 0 }], d.revision!, 'agent:x', { at }).ok,
    ).toBe(false);
  });
  it('loads 0.4, rejects malformed policy, and observes document changes on disk', () => {
    const dir = mkdtempSync(join(tmpdir(), 'owner-core-'));
    try {
      const d = pack(),
        path = join(dir, 'specpack.json');
      for (const a of Object.values(d.artifacts!)) writeFileSync(join(dir, a.file), 'Plan');
      const a = ownerAction(
        d,
        { kind: 'accept', decision: 'D-1', by: 'human:owner', at, expected_revision: 1 },
        path,
      );
      expect(a.ok).toBe(true);
      expect(
        ownerAction(
          d,
          { kind: 'start', by: 'human:owner', at, expected_revision: d.revision! },
          path,
        ).ok,
      ).toBe(true);
      savePack(d, path, { at });
      expect(loadPack(dir).ok).toBe(true);
      writeFileSync(join(dir, 'plan.md'), 'New plan');
      expect(workflowGate(d, path).phase).toBe('start');
      d.workflow!.start_receipt!.by = 'agent:x';
      expect(validateWorkflow(d)).toContain('malformed owner start receipt');
      writeFileSync(path, emitBytes(d));
      expect(loadPack(dir).ok).toBe(false);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
  it('emits no workflow section for legacy packs', () => {
    const d = pack();
    d.format = 'specpack/0.3';
    expect(JSON.parse(emitBytes(d))).not.toHaveProperty('workflow');
  });
});
