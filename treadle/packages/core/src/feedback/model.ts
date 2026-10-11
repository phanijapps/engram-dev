export const FEEDBACK_LIMITS = Object.freeze({
  targets: 32,
  file: 256 * 1024,
  round: 4 * 1024 * 1024,
  rounds: 20,
  ledger: 4 * 1024 * 1024,
  body: 8 * 1024,
  total: 84 * 1024 * 1024,
});
export type FeedbackMode = 'documents' | 'diff';
export type FeedbackSide = 'before' | 'after';
export interface FeedbackSelection {
  mode: FeedbackMode;
  paths: string[];
  artifacts: string[];
  base?: string;
  head?: string;
}
export interface FeedbackSnapshotInput {
  key: string;
  path: string;
  old_path?: string;
  before: string | null;
  after: string | null;
}
export interface FeedbackContent {
  ref: string;
  sha256: string;
  bytes: number;
  lines: number;
}
export interface FeedbackTarget {
  id: string;
  key: string;
  path: string;
  old_path?: string;
  before: FeedbackContent | null;
  after: FeedbackContent | null;
}
export interface FeedbackRound {
  id: string;
  sequence: number;
  at: string;
  by: string;
  digest: string;
  sealed: boolean;
  targets: FeedbackTarget[];
}
export interface FeedbackAnchor {
  round: string;
  target?: string;
  side?: FeedbackSide;
  sha256?: string;
  start?: number;
  end?: number;
  quote?: string;
}
export interface FeedbackItem {
  id: string;
  kind: 'comment' | 'reattach';
  thread: string;
  body: string;
  by: string;
  at: string;
  anchor: FeedbackAnchor;
  original?: FeedbackAnchor;
  event?: string;
}
export interface FeedbackThread {
  id: string;
  session: string;
  body: string;
  by: string;
  at: string;
  original: FeedbackAnchor;
  current: FeedbackAnchor;
  events: {
    id: string;
    kind: 'resolve' | 'reattach';
    by: string;
    at: string;
    anchor?: FeedbackAnchor;
  }[];
  replies: { id: string; by: string; at: string; body: string }[];
}
export interface FeedbackBatch {
  id: string;
  session: string;
  round: string;
  cursor: number;
  by: string;
  at: string;
  items: FeedbackItem[];
}
export interface FeedbackSession {
  id: string;
  selection: FeedbackSelection;
  rounds: FeedbackRound[];
  drafts: FeedbackItem[];
  cursor: number;
}
export interface FeedbackReceipt {
  operation_id: string;
  revision: number;
  session: string;
  round?: string;
  thread?: string;
  batch?: string;
  cursor?: number;
}
export interface FeedbackLedger {
  format: 'feedback/1';
  pack_id: string;
  revision: number;
  sessions: FeedbackSession[];
  threads: FeedbackThread[];
  batches: FeedbackBatch[];
  operations: { id: string; digest: string; result: FeedbackReceipt }[];
}
export type FeedbackAction =
  | { kind: 'open'; selection: FeedbackSelection; snapshots: FeedbackSnapshotInput[] }
  | { kind: 'round'; session: string; snapshots: FeedbackSnapshotInput[] }
  | { kind: 'comment'; session: string; anchor: FeedbackAnchor; body: string }
  | { kind: 'submit'; session: string; round: string }
  | { kind: 'reply'; session: string; thread: string; body: string }
  | { kind: 'resolve'; session: string; thread: string }
  | { kind: 'reattach'; session: string; thread: string; anchor: FeedbackAnchor };
export interface FeedbackMutation {
  operation_id: string;
  expected_revision: number;
  by: string;
  action: FeedbackAction;
}
export class FeedbackError extends Error {
  constructor(
    public readonly code:
      'invalid' | 'forbidden' | 'missing' | 'conflict' | 'bounds' | 'unavailable',
    message: string,
  ) {
    super(message);
    this.name = 'FeedbackError';
  }
}
