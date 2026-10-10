/** The close act (FR-9): transition to the final state, refusing while
 *  naming every gap. Preconditions: all tasks done with evidence, no
 *  proposed decision, no open question, a PASS verdict on PACK. */
import { refuse, type Admission } from '../refusals.js';
import type { PackDoc } from './model.js';
import { closureGaps } from './derive.js';
import { workflowGate } from './workflow.js';

export interface CloseResult {
  readonly name: string;
  readonly status: 'complete';
  readonly closed_by: string;
  readonly revision: number;
}

export function closePack(
  doc: PackDoc,
  by: string,
  opts: { at?: string | undefined; packPath?: string | undefined },
): Admission<CloseResult> {
  if (doc.status === 'complete') return refuse('pack_is_frozen', frozenMessage());
  if (!by.startsWith('human:')) {
    return refuse('human_claim_required', 'closing needs a human claim: pass --by human:<owner>');
  }
  if (doc.format === 'specpack/0.4') {
    const gate = workflowGate(doc, opts.packPath);
    if (gate.phase !== 'closure')
      return refuse('cannot_close', `${gate.phase}: ${gate.reasons.join('; ')}`);
  }
  const problems: string[] = [];
  const undone = doc.tasks
    .filter((t) => t.status !== 'done')
    .map((t) => t.id)
    .sort();
  if (undone.length) problems.push(`tasks not done: ${undone.join(', ')}`);
  const unevidenced = doc.tasks
    .filter((t) => t.status === 'done' && !(t['evidence'] as unknown[] | undefined)?.length)
    .map((t) => t.id)
    .sort();
  if (unevidenced.length) problems.push(`done without evidence: ${unevidenced.join(', ')}`);
  const gaps = closureGaps(doc);
  if (gaps.pending_decisions.length)
    problems.push(`decisions proposed: ${gaps.pending_decisions.join(', ')}`);
  if (gaps.open_questions.length)
    problems.push(`questions open: ${gaps.open_questions.join(', ')}`);
  if (!gaps.review_pass) problems.push('no PASS verdict on PACK (review.verdicts)');
  if (problems.length) return refuse('cannot_close', 'cannot close: ' + problems.join('; '));
  doc.status = 'complete';
  doc.closed_by = by;
  if (opts.at) doc.closed_at = opts.at;
  doc.revision = (doc.revision ?? 1) + 1;
  return {
    ok: true,
    value: { name: doc.name, status: 'complete', closed_by: by, revision: doc.revision! },
  };
}

function frozenMessage(): string {
  return 'pack is complete: the record is frozen; open a new initiative instead';
}
