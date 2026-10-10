/**
 * The frozen handout (next_task + slice_for, ported faithfully): resume
 * doing-without-evidence first, then ready todo in id order. The handout
 * carries full node bodies across the task's closure — not one-liners.
 *
 * The handout is drift-gated when a pack path is given: touch digests pin
 * at first sighting and verify at every handout; drift refuses (needs_rebase
 * — no state change, no revision bump).
 */
import { createHash } from 'node:crypto';
import type { Admission } from '../refusals.js';
import { closureGaps } from './derive.js';
import { pinOrVerify, verifyRefs } from './pins.js';
import type { PackDoc, Task } from './model.js';
import { executionGate, taskEvidenced, workflowGate, type WorkflowGate } from './workflow.js';

type Raw = Record<string, unknown>;

export type Handout =
  | { readonly status: 'owner_gate'; readonly gate: WorkflowGate }
  | {
      readonly status: 'task';
      readonly task: string;
      readonly items: Raw[];
      readonly omitted_tasks: string[];
      readonly prelude: Raw;
      readonly slice_digest: string;
    }
  | { readonly status: 'COMPLETE'; readonly closed_by?: string }
  | { readonly status: 'BLOCKED'; readonly tasks: string[] }
  | {
      readonly status: 'needs_closure';
      readonly revision: number;
      readonly pending_decisions: string[];
      readonly open_questions: string[];
      readonly review_pass: boolean;
    }
  | { readonly status: 'DONE' }
  | { readonly status: 'WAITING'; readonly reason: string }
  | {
      readonly status: 'needs_rebase';
      readonly task: string;
      readonly revision: number;
      readonly drift: readonly { path: string; why: string; pinned?: string; current?: string }[];
    };

export function nextTask(
  doc: PackDoc,
  opts: { packPath?: string | undefined } = {},
): Admission<Handout> {
  if (doc.status === 'complete') {
    return {
      ok: true,
      value: doc.closed_by
        ? { status: 'COMPLETE', closed_by: doc.closed_by }
        : { status: 'COMPLETE' },
    };
  }
  if (doc.format === 'specpack/0.4') {
    const gate = executionGate(doc, opts.packPath);
    if (!gate.ok)
      return { ok: true, value: { status: 'owner_gate', gate: workflowGate(doc, opts.packPath) } };
  }
  const tasks = doc.tasks;
  const done = new Set(
    tasks
      .filter((t) => (doc.format === 'specpack/0.4' ? taskEvidenced(t) : t.status === 'done'))
      .map((t) => t.id),
  );
  const byId = [...tasks].sort((a, b) => a.id.localeCompare(b.id));
  let pick: Task | undefined = byId.find((t) => t.status === 'doing'); // resume the outstanding handout
  if (!pick) {
    pick = byId.find((t) => t.status === 'todo' && strList(t['needs']).every((n) => done.has(n)));
  }
  if (!pick) {
    const blocked = tasks
      .filter((t) => t.status === 'blocked')
      .map((t) => t.id)
      .sort();
    if (blocked.length) return { ok: true, value: { status: 'BLOCKED', tasks: blocked } };
    if (tasks.length && tasks.every((t) => t.status === 'done')) {
      if (doc.format === 'specpack/0.4')
        return {
          ok: true,
          value: { status: 'owner_gate', gate: workflowGate(doc, opts.packPath) },
        };
      const gaps = closureGaps(doc);
      if (gaps.pending_decisions.length || gaps.open_questions.length) {
        return {
          ok: true,
          value: { status: 'needs_closure', revision: doc.revision ?? 1, ...gaps },
        };
      }
      return { ok: true, value: { status: 'DONE' } };
    }
    return { ok: true, value: { status: 'WAITING', reason: 'no ready task' } };
  }
  if (opts.packPath !== undefined) {
    const drift = [
      ...pinOrVerify(doc, pick.id, opts.packPath),
      ...verifyRefs(doc, pick.id, opts.packPath),
    ];
    if (drift.length) {
      return {
        ok: true,
        value: {
          status: 'needs_rebase',
          task: pick.id,
          revision: doc.revision ?? 1,
          drift: [...drift].sort((a, b) => `${a.path}${a.why}`.localeCompare(`${b.path}${b.why}`)),
        },
      };
    }
  }
  pick.status = 'doing';
  doc.revision = (doc.revision ?? 1) + 1;
  const slice = sliceFor(doc, pick.id);
  return { ok: true, value: { status: 'task', task: pick.id, ...slice } };
}

export interface Slice {
  readonly items: Raw[];
  readonly omitted_tasks: string[];
  readonly prelude: Raw;
  readonly slice_digest: string;
}

/** The task's frozen context: full bodies across the closure. Designs expand
 *  one hop through `addresses` (targets gain a `via` marker). Every accepted
 *  decision rides along. A plan prelude leads. */
export function sliceFor(doc: PackDoc, taskId: string): Slice {
  const d = doc as unknown as Raw;
  const t = doc.tasks.find((x) => x.id === taskId)!;
  const keep = new Set<string>([taskId]);
  const stack = [
    ...strList(t['needs']),
    ...strList(t['satisfies']),
    ...strList(t['implements']),
    ...strList(t['accepts']),
    ...strList(t['honors']),
  ];
  while (stack.length) {
    const x = stack.pop()!;
    if (keep.has(x)) continue;
    keep.add(x);
    const pt = doc.tasks.find((tt) => tt.id === x);
    if (pt) {
      // prerequisite tasks contribute their own flow AND trace links
      stack.push(
        ...strList(pt['needs']),
        ...strList(pt['satisfies']),
        ...strList(pt['implements']),
        ...strList(pt['honors']),
      );
    }
  }
  const via: Record<string, string> = {};
  const designs = [...list((d['plan'] as Raw | undefined)?.['designs'])].sort((a, b) =>
    String((a as Raw)['id']).localeCompare(String((b as Raw)['id'])),
  ) as Raw[];
  for (const des of designs) {
    if (!keep.has(String(des['id']))) continue;
    for (const a of list(des['addresses']).map(String)) {
      keep.add(a);
      via[a] ??= String(des['id']);
    }
  }
  for (const r of list((d['spec'] as Raw | undefined)?.['requirements']) as Raw[]) {
    if (keep.has(String(r['id']))) {
      for (const us of strList(r['serves'])) keep.add(us); // the story being served
    }
  }
  for (const dec of list((d['plan'] as Raw | undefined)?.['decisions']) as Raw[]) {
    if (dec['status'] === 'accepted') keep.add(String(dec['id']));
  }
  const items: Raw[] = [];
  for (const k of [...keep].sort()) {
    const tt = doc.tasks.find((x) => x.id === k);
    if (tt) {
      items.push({ family: 'TASK', ...taskBody(tt) });
      continue;
    }
    const b = nodeBody(doc, k, via);
    items.push(b ?? { id: k, family: 'REF' });
  }
  const prelude: Raw = {};
  for (const key of ['approach', 'stack'] as const) {
    const v = (d['plan'] as Raw | undefined)?.[key];
    if (v) prelude[key] = v;
  }
  if (d['env']) prelude['env'] = d['env'];
  const omitted = doc.tasks
    .filter((x) => !keep.has(x.id))
    .map((x) => x.id)
    .sort();
  const body = { task: taskId, items, omitted_tasks: omitted, prelude };
  return { items, omitted_tasks: omitted, prelude, slice_digest: digest(body) };
}

function taskBody(t: Task): Raw {
  const fields = [
    'id',
    'title',
    'detail',
    'phase',
    'needs',
    'produces',
    'verify',
    'status',
    'evidence',
    'assignee',
    'parallel',
    'context',
  ];
  const out: Raw = {};
  for (const k of fields) if (k in t) out[k] = (t as unknown as Raw)[k];
  return out;
}

function nodeBody(doc: PackDoc, id: string, via: Record<string, string>): Raw | null {
  const d = doc as unknown as Raw;
  const spec = d['spec'] as Raw | undefined;
  const plan = d['plan'] as Raw | undefined;
  for (const s of list(spec?.['stories']) as Raw[]) {
    if (s['id'] === id) return { family: 'US', ...s };
    for (const a of list(s['acceptance']) as Raw[]) {
      if (a['id'] === id) return { family: 'AC', ...a };
    }
  }
  for (const r of list(spec?.['requirements']) as Raw[]) {
    if (r['id'] === id) {
      const extra = id in via ? { via: via[id] } : {};
      return { family: 'FR', ...extra, ...r };
    }
    for (const s of list(r['scenarios']) as Raw[]) {
      if (s['id'] === id) return { family: 'AC', ...s };
    }
  }
  for (const c of list(spec?.['constraints']) as Raw[]) {
    if (c['id'] === id) {
      const extra = id in via ? { via: via[id] } : {};
      return { family: 'CON', ...extra, ...c };
    }
  }
  for (const q of list(spec?.['clarifications']) as Raw[]) {
    if (q['id'] === id) return { family: 'Q', ...q };
  }
  for (const dec of list(plan?.['decisions']) as Raw[]) {
    if (dec['id'] === id) return { family: 'D', ...dec };
  }
  for (const des of list(plan?.['designs']) as Raw[]) {
    if (des['id'] === id) return { family: 'DES', ...des };
  }
  return null;
}

function list(v: unknown): Raw[] {
  return Array.isArray(v) ? (v as Raw[]) : [];
}

function strList(v: unknown): string[] {
  return Array.isArray(v) ? (v as unknown[]).map(String) : [];
}

/** sha256 over canonical JSON (sorted keys, compact separators) — python parity. */
function digest(obj: unknown): string {
  return createHash('sha256').update(canonical(obj)).digest('hex');
}

function canonical(obj: unknown): string {
  if (Array.isArray(obj)) return '[' + obj.map(canonical).join(',') + ']';
  if (obj && typeof obj === 'object') {
    const keys = Object.keys(obj as Raw).sort();
    return (
      '{' + keys.map((k) => JSON.stringify(k) + ':' + canonical((obj as Raw)[k])).join(',') + '}'
    );
  }
  return JSON.stringify(obj);
}
