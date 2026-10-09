/**
 * The frozen stage vocabulary (status-vocabulary rev 8, status-model rev 23).
 * Machine-derived, never hand-set. This union is the port of that contract:
 * adding a member without handling every switch breaks the build (R6).
 */
export const DELIVERABLE_STAGES = [
  'drafted',
  'planning',
  'in_progress',
  'blocked',
  'awaiting_owner',
  'in_review',
  'delivered',
] as const;

export type Stage = (typeof DELIVERABLE_STAGES)[number];

/** The owner-words layer is presentation (D-2): translation, never vocabulary. */
export const STAGE_WORDS: Readonly<Record<Stage, string>> = {
  drafted: 'Just started',
  planning: 'Being shaped',
  in_progress: 'In progress',
  blocked: 'Stuck — needs attention',
  awaiting_owner: 'Waiting on you',
  in_review: 'In review',
  delivered: 'Done',
};

export function stageWord(stage: Stage): string {
  return STAGE_WORDS[stage];
}
