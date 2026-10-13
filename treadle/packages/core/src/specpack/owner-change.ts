/** Owner-visible change detection: a read model for waking an idle agent.
 *  A revision bump alone is never a change. A gate-phase change counts, and an
 *  agent's own evidence can move the phase, so treat the signal as "state may
 *  have changed", never as proof the owner acted. It carries no authority. */
import type { PackDoc } from './model.js';
import { workflowGate } from './workflow.js';

export interface OwnerCursor {
  revision: number;
  phase: string;
  act_ids: string[];
  answered: string[];
}
export interface OwnerChange {
  phase: string;
  new_acts: { id: string; kind: string }[];
  answered: string[];
}

/** Snapshot the owner-visible state of a pack. `packPath` lets the gate read artifact bytes. */
export function ownerCursor(doc: PackDoc, packPath?: string): OwnerCursor {
  const acts = [...(doc.workflow?.acts ?? []), ...(doc.workflow?.pending_audit ?? [])];
  const answered = (doc.spec.clarifications ?? [])
    .filter((q) => q.status === 'resolved')
    .map((q) => q.id);
  // Legacy packs keep no act ledger; decision status and approval stand in for acts.
  const legacy: string[] = [];
  if (!doc.workflow) {
    for (const d of doc.plan.decisions ?? [])
      if (d.status !== 'proposed') legacy.push(`legacy:${d.id}:${d.status}`);
    if (doc.approved_at) legacy.push('legacy:approved');
  }
  return {
    revision: doc.revision ?? 1,
    phase: doc.workflow ? workflowGate(doc, packPath).phase : 'legacy',
    act_ids: [...new Set([...acts.map((a) => a.id), ...legacy])],
    answered: answered.sort(),
  };
}

/** The owner-authored delta from `prev` to `cur`, or null when nothing owner-relevant changed. */
export function ownerChange(prev: OwnerCursor, cur: OwnerCursor, doc: PackDoc): OwnerChange | null {
  const known = new Set(prev.act_ids);
  const fresh = cur.act_ids.filter((id) => !known.has(id));
  const kinds = new Map(
    [...(doc.workflow?.acts ?? []), ...(doc.workflow?.pending_audit ?? [])].map((a) => [
      a.id,
      a.kind as string,
    ]),
  );
  const answeredNow = cur.answered.filter((id) => !prev.answered.includes(id));
  if (!fresh.length && !answeredNow.length && prev.phase === cur.phase) return null;
  return {
    phase: cur.phase,
    new_acts: fresh.map((id) => ({
      id,
      kind: kinds.get(id) ?? (id.startsWith('legacy:') ? 'legacy' : 'unknown'),
    })),
    answered: answeredNow,
  };
}

export function encodeCursor(c: OwnerCursor): string {
  return Buffer.from(JSON.stringify(c), 'utf8').toString('base64url');
}
export function decodeCursor(token: string): OwnerCursor | null {
  try {
    const v = JSON.parse(Buffer.from(token, 'base64url').toString('utf8')) as Partial<OwnerCursor>;
    if (
      !Number.isSafeInteger(v.revision) ||
      typeof v.phase !== 'string' ||
      !Array.isArray(v.act_ids) ||
      !Array.isArray(v.answered) ||
      ![...v.act_ids, ...v.answered].every((s) => typeof s === 'string')
    )
      return null;
    return v as OwnerCursor;
  } catch {
    return null;
  }
}
