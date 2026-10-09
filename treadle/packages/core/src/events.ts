/** The event seam (specweb-events/0.1): the only write path. Events carry
 *  human claims — an agent cannot press the pedal. */
export const EVENT_KINDS = ['answer', 'unknown', 'choice', 'approve'] as const;
export type EventKind = (typeof EVENT_KINDS)[number];

export interface BaseEvent {
  readonly kind: EventKind;
  readonly by: string; // must start with 'human:' — the claim
  readonly at: string; // ISO instant; injected clock for determinism
}

export interface QuestionEvent extends BaseEvent {
  readonly kind: 'answer' | 'unknown' | 'choice';
  readonly q: string;
  readonly text?: string;
  readonly option?: string;
}

export interface ApproveEvent extends BaseEvent {
  readonly kind: 'approve';
}

export type Event = QuestionEvent | ApproveEvent;

export function eventKindOf(e: Event): EventKind {
  return e.kind;
}
