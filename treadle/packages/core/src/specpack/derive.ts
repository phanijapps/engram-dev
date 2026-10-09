/** The derived stage (status-model D-5): a pure function of task, decision,
 *  question, and review state. First match wins; never hand-set. */
import type { PackDoc } from './model.js';
import type { Stage } from '../stages.js';

const PACK_COMPLETE = 'complete';

export interface ClosureGaps {
  pending_decisions: string[];
  open_questions: string[];
  review_pass: boolean;
}

export function closureGaps(doc: PackDoc): ClosureGaps {
  const pending = (doc.plan.decisions ?? [])
    .filter((d) => d.status === 'proposed')
    .map((d) => d.id)
    .sort();
  const openq = (doc.spec.clarifications ?? [])
    .filter((q) => q.status === 'open')
    .map((q) => q.id)
    .sort();
  const review_pass = (doc.review?.verdicts ?? []).some(
    (v) => v.verdict === 'PASS' && v.on === 'PACK',
  );
  return { pending_decisions: pending, open_questions: openq, review_pass };
}

export function deriveStage(doc: PackDoc): Stage {
  const tasks = doc.tasks ?? [];
  const statuses = tasks.map((t) => t.status);
  if (doc.status === PACK_COMPLETE) return 'delivered';
  if (!statuses.includes('doing') && statuses.includes('blocked')) return 'blocked';
  if (tasks.length && statuses.every((st) => st === 'done')) {
    const gaps = closureGaps(doc);
    if (gaps.pending_decisions.length || gaps.open_questions.length) return 'awaiting_owner';
    if (!gaps.review_pass) return 'in_review';
    return 'in_progress'; // all done, review passed, not yet closed
  }
  if (statuses.includes('doing') || statuses.includes('done')) return 'in_progress';
  const openq = (doc.spec.clarifications ?? []).filter((q) => q.status === 'open');
  if (openq.length && !statuses.includes('done') && !statuses.includes('doing')) return 'planning';
  const pending = (doc.plan.decisions ?? []).filter((d) => d.status === 'proposed');
  if (pending.length) return 'drafted';
  // the owner's gate: ceremony settled, approval pending — the pack waits,
  // then proceeds when the approval act lands
  const ceremony = doc.spec.clarifications ?? doc.plan.decisions;
  if (ceremony && !doc.approved_at) return 'awaiting_owner';
  return doc.approved_at ? 'planning' : 'drafted';
}
