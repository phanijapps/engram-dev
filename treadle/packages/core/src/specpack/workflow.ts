/** Owner-gated 0.4 policy. Legacy packs keep their original contract. */
import { createHash, randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import type { Admission } from '../refusals.js';
import { refuse } from '../refusals.js';
import type { PackDoc, Task } from './model.js';
import { resolvePath } from './pins.js';
import { acceptDecision, rejectDecision } from './decisions.js';
import { approveSpec } from './admission.js';
import { closePack } from './close.js';

export interface OwnerAct {
  id: string;
  kind: 'accept' | 'reject' | 'approve' | 'start' | 'close' | 'adopt';
  by: string;
  at: string;
  revision: number;
  decision?: string;
  because?: string;
  plan_digest?: string;
}
export interface Workflow {
  policy: 'owner-gated/1';
  plan: number;
  phase_questions: { spec: string[] };
  start_receipt?: { by: string; at: string; plan_digest: string };
  acts: OwnerAct[];
  pending_audit: OwnerAct[];
}
export interface WorkflowGate {
  phase:
    'plan' | 'spec' | 'decisions' | 'start' | 'implementation' | 'review' | 'closure' | 'delivered';
  reasons: string[];
  plan_digest?: string;
}
export const humanClaim = (by: string): boolean => /^human:\S+$/.test(by);
const hash = (value: string | Buffer): string => createHash('sha256').update(value).digest('hex');
export function canonical(value: unknown): string {
  return JSON.stringify(value, (_key, item: unknown) =>
    item && typeof item === 'object' && !Array.isArray(item)
      ? Object.fromEntries(
          Object.keys(item)
            .sort()
            .map((key) => [key, (item as Record<string, unknown>)[key]]),
        )
      : item,
  );
}
const omit = (value: Record<string, unknown>, keys: string[]): Record<string, unknown> =>
  Object.fromEntries(Object.entries(value).filter(([key]) => !keys.includes(key)));
const obj = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === 'object' && !Array.isArray(v);
const ids = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((x) => typeof x === 'string');
const stamp = (v: unknown): boolean => typeof v === 'string' && Number.isFinite(Date.parse(v));
const sha = (v: unknown): boolean => typeof v === 'string' && /^[a-f0-9]{64}$/.test(v);

export function validateWorkflow(doc: PackDoc): string[] {
  if (doc.format !== 'specpack/0.4') return [];
  const w: unknown = doc.workflow;
  if (
    !obj(w) ||
    w['policy'] !== 'owner-gated/1' ||
    !Number.isSafeInteger(w['plan']) ||
    Number(w['plan']) < 1
  )
    return ['workflow policy and positive plan version are required'];
  const q = w['phase_questions'];
  const problems: string[] = [];
  if (
    !obj(q) ||
    !ids(q['spec']) ||
    q['spec'].some((id) => !doc.spec.clarifications?.some((x) => x.id === id))
  )
    problems.push('workflow.phase_questions.spec must reference real questions');
  const receipt = w['start_receipt'];
  if (
    receipt !== undefined &&
    (!obj(receipt) ||
      typeof receipt['by'] !== 'string' ||
      !humanClaim(receipt['by']) ||
      !stamp(receipt['at']) ||
      !sha(receipt['plan_digest']))
  )
    problems.push('malformed owner start receipt');
  for (const key of ['acts', 'pending_audit']) {
    const rows = w[key];
    if (
      !Array.isArray(rows) ||
      rows.some(
        (a) =>
          !obj(a) ||
          typeof a['id'] !== 'string' ||
          !a['id'] ||
          !['accept', 'reject', 'approve', 'start', 'close', 'adopt'].includes(String(a['kind'])) ||
          typeof a['by'] !== 'string' ||
          !humanClaim(a['by']) ||
          !stamp(a['at']) ||
          !Number.isSafeInteger(a['revision']),
      )
    )
      problems.push(`workflow.${key} must contain owner receipts`);
  }
  for (const t of doc.tasks) {
    const required = t['requires_decisions'];
    if (
      required !== undefined &&
      (!ids(required) || required.some((id) => !doc.plan.decisions?.some((d) => d.id === id)))
    )
      problems.push(`${t.id}: invalid requires_decisions`);
  }
  for (const d of doc.plan.decisions ?? [])
    if (d.status === 'accepted' && !humanClaim(d.accepted_by ?? ''))
      problems.push(`${d.id}: acceptance needs an owner`);
  return problems;
}

/** Approval binds definitions and immutable documents, never evidence or actor stamps. */
export function planDigest(doc: PackDoc, packPath?: string): Admission<string> {
  const files: { file: string; sha256: string }[] = [];
  for (const id of ['owner-flow', 'brief', 'spec', 'design', 'plan']) {
    const a = doc.artifacts?.[id];
    if (id === 'owner-flow' && !a) continue;
    if (!a?.file) return refuse('pack_refused_to_load', `Plan needs the ${id} document`);
    const path = resolvePath(packPath ? dirname(packPath) : '.', a.file);
    if (!path) return refuse('pack_refused_to_load', `Invalid plan document path: ${a.file}`);
    let digest = a.sha256;
    if (packPath) {
      try {
        digest = hash(readFileSync(path));
      } catch {
        return refuse('pack_refused_to_load', `Plan document is missing: ${a.file}`);
      }
    }
    if (!sha(digest))
      return refuse('pack_refused_to_load', `Plan document needs an observed hash: ${a.file}`);
    files.push({ file: a.file, sha256: digest! });
  }
  const scope = {
    plan: doc.workflow?.plan,
    files,
    spec: {
      why: doc.spec.why,
      requirements: doc.spec['requirements'],
      stories: doc.spec['stories'],
      out_of_scope: doc.spec['out_of_scope'],
      constraints: doc.spec['constraints'],
    },
    design: {
      approach: doc.plan['approach'],
      designs: doc.plan['designs'],
      decisions: (doc.plan.decisions ?? []).map((d) => omit(d, ['status', 'accepted_by'])),
    },
    tasks: doc.tasks.map((task) => {
      const c = obj(task['context']) ? task['context'] : {};
      return {
        ...omit(task, ['status', 'evidence', 'context']),
        context: {
          ...c,
          touch: Array.isArray(c['touch'])
            ? c['touch'].map((e) => (obj(e) ? { path: e['path'] } : e))
            : undefined,
        },
      };
    }),
  };
  return { ok: true, value: hash(canonical(scope)) };
}

export function taskEvidenced(task: Task): boolean {
  const rows = task['evidence'];
  const last = Array.isArray(rows)
    ? (rows.at(-1) as Record<string, unknown> | undefined)
    : undefined;
  const verify = task['verify'];
  return (
    task.status === 'done' &&
    !!last &&
    last['exit'] === 0 &&
    obj(verify) &&
    last['cmd'] === verify['cmd']
  );
}
export function evidenceDigest(doc: PackDoc): string {
  return hash(
    canonical(
      doc.tasks
        .filter((t) => t['phase'] !== 'review')
        .map((t) => ({ id: t.id, evidence: t['evidence'] })),
    ),
  );
}
export function currentReview(doc: PackDoc, digest: string): boolean {
  const latest = doc.review?.verdicts?.filter((v) => v.on === 'PACK').at(-1);
  if (
    !latest ||
    latest.verdict !== 'PASS' ||
    latest.plan_digest !== digest ||
    latest.evidence_digest !== evidenceDigest(doc) ||
    !latest.by
  )
    return false;
  return !doc.tasks
    .filter((t) => t['phase'] !== 'review')
    .some(
      (t) =>
        Array.isArray(t['evidence']) &&
        t['evidence'].some((e: Record<string, unknown>) => e['by'] === latest.by),
    );
}
export function workflowGate(doc: PackDoc, packPath?: string): WorkflowGate {
  if (doc.status === 'complete') return { phase: 'delivered', reasons: [] };
  const malformed = validateWorkflow(doc);
  if (malformed.length) return { phase: 'plan', reasons: malformed };
  const w = doc.workflow!;
  const unanswered = w.phase_questions.spec.filter((id) => {
    const q = doc.spec.clarifications?.find((q) => q.id === id);
    return (
      !q || q.status !== 'resolved' || !q.answer || q.unknown || !humanClaim(q.answered_by ?? '')
    );
  });
  if (unanswered.length || (w.phase_questions.spec.length && !doc.approved_at))
    return {
      phase: 'spec',
      reasons: unanswered.length ? unanswered : ['Approve the answered spec questions'],
    };
  const decisions = (doc.plan.decisions ?? [])
    .filter((d) => d.status === 'proposed')
    .map((d) => d.id);
  for (const t of doc.tasks.filter((t) => t.status !== 'done'))
    for (const id of (t['requires_decisions'] as string[] | undefined) ?? [])
      if (!doc.plan.decisions?.some((d) => d.id === id && d.status === 'accepted'))
        decisions.push(`${t.id} needs ${id}`);
  if (decisions.length) return { phase: 'decisions', reasons: decisions };
  const digest = planDigest(doc, packPath);
  if (!digest.ok) return { phase: 'plan', reasons: [digest.message] };
  const common = { plan_digest: digest.value };
  if (!w.start_receipt || w.start_receipt.plan_digest !== digest.value)
    return {
      phase: 'start',
      reasons: [
        w.start_receipt
          ? 'The plan changed; approve its start again'
          : 'Give permission to start this plan',
      ],
      ...common,
    };
  if (!doc.tasks.length || !doc.tasks.every(taskEvidenced))
    return { phase: 'implementation', reasons: [], ...common };
  if (!currentReview(doc, digest.value))
    return {
      phase: 'review',
      reasons: ['Independent review must pass for the current plan and evidence'],
      ...common,
    };
  return { phase: 'closure', reasons: ['Finish spec'], ...common };
}

export function executionGate(doc: PackDoc, packPath?: string): Admission<true> {
  if (doc.format !== 'specpack/0.4') return { ok: true, value: true };
  const gate = workflowGate(doc, packPath);
  return ['implementation', 'review', 'closure'].includes(gate.phase)
    ? { ok: true, value: true }
    : refuse('cannot_record_from', `${gate.phase}: ${gate.reasons.join('; ')}`);
}

/** Pure admission; adapters atomically save the receipt and pending audit together. */
export function ownerAction(
  doc: PackDoc,
  action: {
    kind: OwnerAct['kind'];
    by: string;
    at: string;
    expected_revision: number;
    decision?: string;
    because?: string;
  },
  packPath?: string,
): Admission<OwnerAct> {
  if (doc.format !== 'specpack/0.4')
    return refuse('pack_refused_to_load', 'Adopt the owner workflow before this action');
  if (doc.status === 'complete') return refuse('pack_is_frozen', 'The spec is complete');
  if (!humanClaim(action.by))
    return refuse('human_claim_required', 'This action needs an owner claim');
  if (doc.revision !== action.expected_revision)
    return refuse('stale_writer', 'The spec changed; reload before this action');
  if (!stamp(action.at))
    return refuse('pack_refused_to_load', 'The owner action needs a valid date');
  const invalid = validateWorkflow(doc);
  if (invalid.length) return refuse('pack_refused_to_load', invalid.join('; '));
  const before = doc.revision!;
  let out: Admission<unknown>;
  let digest: string | undefined;
  switch (action.kind) {
    case 'accept':
      out = acceptDecision(doc, action.decision ?? '', action.by);
      break;
    case 'reject':
      if (!action.because?.trim())
        return refuse('answer_text_empty', 'Explain why this choice must change');
      out = rejectDecision(doc, action.decision ?? '', action.by, action.because);
      break;
    case 'approve':
      out = approveSpec(doc, action.by, { at: action.at });
      break;
    case 'start': {
      const gate = workflowGate(doc, packPath);
      if (gate.phase !== 'start' || !gate.plan_digest)
        return refuse(
          'cannot_record_from',
          `${gate.phase}: ${gate.reasons.join('; ') || 'Start is already approved'}`,
        );
      digest = gate.plan_digest;
      doc.workflow!.start_receipt = { by: action.by, at: action.at, plan_digest: digest };
      out = { ok: true, value: true };
      break;
    }
    case 'close':
      out = closePack(doc, action.by, { at: action.at, packPath });
      break;
    case 'adopt':
      return refuse('pack_refused_to_load', 'Use explicit legacy adoption');
  }
  if (!out.ok) return out;
  if (doc.revision === before) doc.revision = before + 1;
  const receipt: OwnerAct = {
    id: randomUUID(),
    kind: action.kind,
    by: action.by,
    at: action.at,
    revision: doc.revision!,
  };
  if (action.decision) receipt.decision = action.decision;
  if (action.because) receipt.because = action.because;
  if (digest) receipt.plan_digest = digest;
  doc.workflow!.acts.push(receipt);
  doc.workflow!.pending_audit.push(receipt);
  return { ok: true, value: receipt };
}
