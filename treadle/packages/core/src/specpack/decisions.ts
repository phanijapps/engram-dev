/**
 * Decision acceptance (FR-8, ported last of the admission family — the human
 * act the harness exists for): accept resolves the decision's questions;
 * reject keeps them open and is history. Declined/rejected keys never rise.
 */
import { refuse, type Admission } from '../refusals.js';
import type { PackDoc, Decision } from './model.js';

export interface AcceptResult {
  readonly decision: string;
  readonly status: 'accepted';
  readonly accepted_by: string;
  readonly resolved_questions: string[];
}

export interface RejectResult {
  readonly decision: string;
  readonly status: 'rejected';
  readonly rejected_because: string;
}

export function acceptDecision(
  doc: PackDoc,
  decisionId: string,
  by: string,
): Admission<AcceptResult> {
  if (doc.status === 'complete') return refuse('pack_is_frozen', frozenMessage());
  if (!by.startsWith('human:')) {
    return refuse(
      'human_claim_required',
      'acceptance needs a human claim: pass --by human:<owner> (A7 shape check)',
    );
  }
  const d = findDecision(doc, decisionId);
  if (!d.ok) return d;
  const dec = d.value;
  if (dec.status === 'accepted') {
    return refuse(
      'already_accepted',
      `${decisionId}: already accepted by ${dec.accepted_by ?? ''}`,
    );
  }
  if (dec.status === 'rejected') {
    return refuse('rejected_is_history', `${decisionId}: rejected; a rejected decision is history`);
  }
  dec.status = 'accepted';
  dec.accepted_by = by;
  const resolved: string[] = [];
  for (const q of doc.spec.clarifications ?? []) {
    const resolvesIt = q['resolved_by'] === decisionId || strList(dec['resolves']).includes(q.id);
    if (resolvesIt && q.status === 'open') {
      q.status = 'resolved';
      q.answer = `Accepted as ${decisionId} by ${by}`;
      resolved.push(q.id);
    }
  }
  doc.revision = (doc.revision ?? 1) + 1;
  return {
    ok: true,
    value: {
      decision: decisionId,
      status: 'accepted',
      accepted_by: by,
      resolved_questions: resolved.sort(),
    },
  };
}

export function rejectDecision(
  doc: PackDoc,
  decisionId: string,
  by: string,
  because: string,
): Admission<RejectResult> {
  if (doc.status === 'complete') return refuse('pack_is_frozen', frozenMessage());
  if (!by.startsWith('human:')) {
    return refuse('human_claim_required', 'rejection needs a human claim: pass --by human:<owner>');
  }
  const d = findDecision(doc, decisionId);
  if (!d.ok) return d;
  const dec = d.value;
  if (dec.status !== 'proposed') {
    return refuse('already_resolved_decision', `${decisionId}: already ${dec.status}`);
  }
  dec.status = 'rejected';
  dec['rejected_because'] = because;
  doc.revision = (doc.revision ?? 1) + 1;
  return {
    ok: true,
    value: { decision: decisionId, status: 'rejected', rejected_because: because },
  };
}

type DecisionLookup = Admission<Decision>;

function findDecision(doc: PackDoc, decisionId: string): DecisionLookup {
  const d = (doc.plan.decisions ?? []).find((x) => x.id === decisionId);
  return d ? { ok: true, value: d } : refuse('no_such_decision', `${decisionId}: no such decision`);
}

function strList(v: unknown): string[] {
  return Array.isArray(v) ? (v as unknown[]).map(String) : [];
}

function frozenMessage(): string {
  return 'pack is complete: the record is frozen; open a new initiative instead';
}
