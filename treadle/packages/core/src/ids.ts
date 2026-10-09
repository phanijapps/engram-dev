/**
 * Branded IDs (standards R7): the pack's foreign keys. A TaskId cannot be
 * passed where a QuestionId is expected — the compiler refuses.
 */
declare const brand: unique symbol;
type Id<T extends string> = string & { readonly [brand]: T };

export type SpecId = Id<'Spec'>;
export type StoryId = Id<'Story'>;
export type AcceptanceId = Id<'Acceptance'>;
export type RequirementId = Id<'Requirement'>;
export type ConstraintId = Id<'Constraint'>;
export type QuestionId = Id<'Question'>;
export type DecisionId = Id<'Decision'>;
export type DesignCardId = Id<'DesignCard'>;
export type TaskId = Id<'Task'>;

/** The one parse point for IDs (R8): validate the shape once, brand forever. */
const ID_RE = /^(US|AC|FR|CON|Q|D|DES|T)-\d+[A-Za-z0-9-]*$/;
const FAMILY: Record<string, string> = {
  US: 'Story',
  AC: 'Acceptance',
  FR: 'Requirement',
  CON: 'Constraint',
  Q: 'Question',
  D: 'Decision',
  DES: 'DesignCard',
  T: 'Task',
};

export function parseId(raw: string): Id<string> | null {
  if (!ID_RE.test(raw)) return null;
  return raw as Id<string>;
}

export function idFamily(raw: string): string | null {
  const m = ID_RE.exec(raw);
  return m ? (FAMILY[m[1] ?? ''] ?? null) : null;
}
