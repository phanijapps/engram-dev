/**
 * The internal (normalized) pack model. The FILE carries the contract
 * (canonical layout); this is the working shape both roots normalize to.
 * Types are honest where behavior depends on them; extras ride along.
 */
export interface Question {
  id: string;
  question: string;
  status: string;
  owner?: string;
  kind?: string;
  options?: string[];
  default?: string;
  answer?: string;
  unknown?: boolean;
  answered_by?: string;
  answered_at?: string;
  [k: string]: unknown;
}

export interface Decision {
  id: string;
  decision: string;
  because?: string;
  status: string;
  accepted_by?: string;
  [k: string]: unknown;
}

export interface Task {
  id: string;
  title: string;
  status: string;
  [k: string]: unknown;
}

export interface Artifact {
  file: string;
  type?: string;
  description?: string;
  sha256?: string;
}

/** Internal working doc (post-normalize). Field names are historical. */
export interface PackDoc {
  id?: string;
  name: string;
  title?: string;
  created?: string;
  updated?: string;
  approved_at?: string;
  approved_by?: string;
  closed_at?: string;
  closed_by?: string;
  status?: string;
  deliverable?: string;
  artifacts?: Record<string, Artifact>;
  spec: { why?: string; clarifications?: Question[]; [k: string]: unknown };
  plan: { decisions?: Decision[]; [k: string]: unknown };
  tasks: Task[];
  review?: { verdicts?: { on?: string; verdict?: string }[]; [k: string]: unknown };
  env?: Record<string, unknown>;
  format: string;
  revision?: number;
  [k: string]: unknown;
}
