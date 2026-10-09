/**
 * The refusal taxonomy (standards R11): domain refusals are RETURNED, never
 * thrown. The message text is a published contract (adapter-contract.md) —
 * golden-tested, not paraphrased.
 */
export const REFUSAL_CODES = [
  'not_one_of_the_options',
  'already_resolved',
  'already_recorded_unknown',
  'no_such_question',
  'open_questions_block_approval',
  'already_approved',
  'pack_is_frozen',
  'pack_refused_to_load',
  'answer_text_empty',
  'human_claim_required',
] as const;

export type RefusalCode = (typeof REFUSAL_CODES)[number];

export type Refusal = {
  readonly ok: false;
  readonly code: RefusalCode;
  readonly message: string;
};

export type Admitted<T> = { readonly ok: true; readonly value: T };

export type Admission<T> = Admitted<T> | Refusal;

export function refuse(code: RefusalCode, message: string): Refusal {
  return { ok: false, code, message };
}
