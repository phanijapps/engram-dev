/** Admission (FR-3/FR-4): answers and approvals land through machine rules.
 *  Domain refusals RETURN (R11) with the exact published message — the
 *  refusal vocabulary is a contract, golden-tested byte for byte. */
import { refuse, type Admission, type RefusalCode } from '../refusals.js';
import type { PackDoc, Question } from './model.js';

const PACK_COMPLETE = 'complete';

function mutable(doc: PackDoc): RefusalCode | null {
  return doc.status === PACK_COMPLETE ? 'pack_is_frozen' : null;
}

export interface AnswerStamp {
  readonly question: Question;
}

export function answerQuestion(
  doc: PackDoc,
  questionId: string,
  by: string,
  opts: { text?: string | undefined; unknown?: boolean | undefined; at: string },
): Admission<AnswerStamp> {
  const frozen = mutable(doc);
  if (frozen) return refuse(frozen, frozenMessage());
  if (!by.startsWith('human:')) {
    return refuse(
      'human_claim_required',
      'an answer needs a human claim: pass --by human:<owner> (A7 shape check)',
    );
  }
  const q = (doc.spec.clarifications ?? []).find((c) => c.id === questionId);
  if (!q) return refuse('no_such_question', `${questionId}: no such question`);
  if (q.status === 'resolved') {
    const who = (q['resolved_by'] as string | undefined) ?? q.answer ?? 'answered';
    return refuse('already_resolved', `${questionId}: already resolved (${who})`);
  }
  const stamp = opts.at;
  if (opts.unknown) {
    if (q.unknown) {
      return refuse(
        'already_recorded_unknown',
        `${questionId}: already recorded unknown — answer for real or leave it`,
      );
    }
    q.answer = '(unknown)';
    q.unknown = true; // status stays open: the honest unknown still gates closure
  } else {
    const text = (opts.text ?? '').trim();
    if (!text) {
      return refuse('answer_text_empty', 'answer text is empty: pass --text or --unknown');
    }
    if (q.kind === 'choice' && q.options?.length && !q.options.includes(text)) {
      return refuse(
        'not_one_of_the_options',
        `${questionId}: '${text}' is not one of the options (${q.options.join(', ')})`,
      );
    }
    q.answer = text;
    q.status = 'resolved';
    delete q.unknown; // a real answer clears the earlier honest unknown
  }
  q.answered_by = by;
  q.answered_at = stamp;
  return { ok: true, value: { question: q } };
}

export interface ApproveStamp {
  readonly name: string;
  readonly approved_by: string;
  readonly approved_at: string;
}

export function approveSpec(
  doc: PackDoc,
  by: string,
  opts: { at: string },
): Admission<ApproveStamp> {
  const frozen = mutable(doc);
  if (frozen) return refuse(frozen, frozenMessage());
  if (!by.startsWith('human:')) {
    return refuse(
      'human_claim_required',
      'approval needs a human claim: pass --by human:<owner> (A7 shape check)',
    );
  }
  if (doc.approved_at) {
    return refuse(
      'already_approved',
      `already approved by ${doc.approved_by ?? ''} at ${doc.approved_at}`,
    );
  }
  const openq = (doc.spec.clarifications ?? [])
    .filter((q) => q.status === 'open')
    .map((q) => q.id)
    .sort();
  if (openq.length) {
    return refuse(
      'open_questions_block_approval',
      'approval refused: open questions remain — ' + openq.join(', '),
    );
  }
  doc.approved_at = opts.at;
  doc.approved_by = by;
  return {
    ok: true,
    value: { name: doc.name, approved_by: by, approved_at: opts.at },
  };
}

function frozenMessage(): string {
  return 'pack is complete: the record is frozen; open a new initiative instead';
}
