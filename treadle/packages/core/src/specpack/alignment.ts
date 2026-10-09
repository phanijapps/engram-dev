/**
 * Alignment (A1–A7 violations + coverage report), ported faithfully from the
 * engine's checker: ids unique, references resolve, needs acyclic, accepted
 * decisions carry human claims, every task reaches a requirement. Coverage is
 * reported — never guessed, never blocking.
 */
import type { PackDoc } from './model.js';
import type { Admission } from '../refusals.js';

type Raw = Record<string, unknown>;

export interface Alignment {
  readonly violations: string[];
  readonly coverage: {
    readonly FR: Record<string, string[]>;
    readonly AC: Record<string, string[]>;
    readonly DES: Record<string, string[]>;
    readonly US: Record<string, string[]>;
    readonly story_drift: {
      readonly requirements_without_stories: string[];
      readonly stories_unserved: string[];
    };
    readonly context: {
      readonly missing_detail: string[];
      readonly missing_touch: string[];
      readonly long_notes: string[];
      readonly env_absent: boolean;
      readonly open_questions: string[];
    };
  };
}

export function alignment(doc: PackDoc): Admission<Alignment> {
  const d = doc as unknown as Raw;
  const spec = d['spec'] as Raw;
  const plan = d['plan'] as Raw;
  const errs: string[] = [];
  const fams = families(doc);

  // A1 ids unique across families (raw declarations counted, not just sets)
  const raw: string[] = [];
  for (const key of ['stories', 'requirements', 'constraints', 'clarifications']) {
    raw.push(...ids(spec[key]));
  }
  for (const r of list(spec['requirements']) as Raw[]) {
    raw.push(...ids(r['scenarios']));
  }
  for (const st of list(spec['stories']) as Raw[]) {
    raw.push(...ids(st['acceptance']));
  }
  raw.push(...ids(plan['decisions']), ...ids(plan['designs']), ...ids(plan['diagrams']));
  raw.push(...doc.tasks.map((t) => t.id));
  if (new Set(raw).size !== raw.length) {
    const dupes = [...new Set(raw.filter((x, i) => raw.indexOf(x) !== i))].sort();
    errs.push(`A1 duplicate ids: ${dupes.join(', ')}`);
  }

  // A2 references resolve
  const desAddr = new Map<string, string[]>(
    list(plan['designs']).map((x) => [String((x as Raw)['id']), strList((x as Raw)['addresses'])]),
  );
  for (const t of doc.tasks) {
    const tr = t as unknown as Raw;
    for (const n of strList(tr['needs']))
      if (!fams.T.has(n)) errs.push(`A2 ${t.id}.needs dangling: ${n}`);
    for (const x of strList(tr['implements']))
      if (!fams.DES.has(x)) errs.push(`A2 ${t.id}.implements dangling: ${x}`);
    for (const x of strList(tr['satisfies']))
      if (!fams.FR.has(x)) errs.push(`A2 ${t.id}.satisfies dangling: ${x}`);
    for (const x of strList(tr['accepts']))
      if (!fams.AC.has(x)) errs.push(`A2 ${t.id}.accepts dangling: ${x}`);
    for (const x of strList(tr['honors']))
      if (!fams.CON.has(x)) errs.push(`A2 ${t.id}.honors dangling: ${x}`);
  }
  for (const de of list(plan['designs']) as Raw[]) {
    for (const a of strList(de['addresses'])) {
      if (!fams.FR.has(a) && !fams.CON.has(a))
        errs.push(`A2 ${String(de['id'])}.addresses dangling: ${a}`);
    }
  }
  for (const q of list(spec['clarifications']) as Raw[]) {
    const rb = q['resolved_by'];
    if (typeof rb === 'string' && rb && !fams.D.has(rb))
      errs.push(`A2 ${String(q['id'])}.resolved_by dangling: ${rb}`);
  }
  for (const dd of list(plan['decisions']) as Raw[]) {
    for (const q of strList(dd['resolves'])) {
      if (!fams.Q.has(q)) errs.push(`A2 ${String(dd['id'])}.resolves dangling: ${q}`);
    }
  }

  // A3 needs acyclic
  const deps = new Map<string, string[]>(
    doc.tasks.map((t) => [t.id, strList((t as unknown as Raw)['needs'])]),
  );
  const state = new Map<string, number>();
  const dfs = (u: string): void => {
    state.set(u, 1);
    for (const v of deps.get(u) ?? []) {
      if (state.get(v) === 1) errs.push(`A3 needs cycle: ${u} -> ${v}`);
      else if ((state.get(v) ?? 0) === 0) dfs(v);
    }
    state.set(u, 2);
  };
  for (const u of [...deps.keys()].sort()) if ((state.get(u) ?? 0) === 0) dfs(u);

  // A7 accepted decisions need a human in their history
  for (const de of list(plan['decisions']) as Raw[]) {
    if (de['status'] === 'accepted' && !String(de['accepted_by'] ?? '').startsWith('human:')) {
      errs.push(
        `A7 ${String(de['id'])} accepted without human acceptance (accepted_by missing or not human:)`,
      );
    }
  }

  // A4 every task reaches >=1 FR
  for (const t of doc.tasks) {
    const tr = t as unknown as Raw;
    const via = strList(tr['implements']).some((x) =>
      (desAddr.get(x) ?? []).some((f) => fams.FR.has(f)),
    );
    if (!strList(tr['satisfies']).length && !via) {
      errs.push(`A4 ${t.id} does not align to any requirement`);
    }
  }
  const violations = [...errs].sort();

  // A5 coverage (reported, never blocking)
  const reachedFr = new Map<string, Set<string>>();
  for (const t of doc.tasks) {
    const tr = t as unknown as Raw;
    for (const f of strList(tr['satisfies'])) {
      (reachedFr.get(f) ?? reachedFr.set(f, new Set()).get(f)!).add(t.id);
    }
    for (const de of strList(tr['implements'])) {
      for (const f of desAddr.get(de) ?? []) {
        (reachedFr.get(f) ?? reachedFr.set(f, new Set()).get(f)!).add(`${t.id} (via ${de})`);
      }
    }
  }
  const storyAcs = new Set<string>();
  for (const st of list(spec['stories']) as Raw[]) {
    for (const a of ids(st['acceptance'])) storyAcs.add(a);
  }
  const coverage = {
    FR: Object.fromEntries(
      [...fams.FR].sort().map((f) => [f, [...(reachedFr.get(f) ?? new Set())].sort()]),
    ),
    AC: Object.fromEntries(
      [...fams.AC]
        .sort()
        .filter((a) => !storyAcs.has(a))
        .map((a) => [
          a,
          doc.tasks
            .filter((t) => strList((t as unknown as Raw)['accepts']).includes(a))
            .map((t) => t.id)
            .sort(),
        ]),
    ),
    DES: Object.fromEntries(
      [...fams.DES].sort().map((x) => [
        x,
        doc.tasks
          .filter((t) => strList((t as unknown as Raw)['implements']).includes(x))
          .map((t) => t.id)
          .sort(),
      ]),
    ),
    US: Object.fromEntries(
      list(spec['stories']).flatMap((st) =>
        ids((st as Raw)['acceptance']).map((a) => [
          a,
          doc.tasks
            .filter((t) => strList((t as unknown as Raw)['accepts']).includes(a))
            .map((t) => t.id)
            .sort(),
        ]),
      ),
    ),
    story_drift: {
      requirements_without_stories: list(spec['requirements'])
        .filter((r) => strList((r as Raw)['serves']).length === 0)
        .map((r) => String((r as Raw)['id']))
        .sort(),
      stories_unserved: [...fams.US]
        .filter((s) => {
          const served = new Set<string>();
          for (const r of list(spec['requirements']) as Raw[])
            for (const us of strList(r['serves'])) served.add(us);
          return !served.has(s);
        })
        .sort(),
    },
    context: contextReport(doc),
  };
  return { ok: true, value: { violations, coverage } };
}

export function gapCount(a: Alignment): number {
  let gaps = 0;
  for (const fam of ['FR', 'AC', 'DES', 'US'] as const) {
    for (const who of Object.values(a.coverage[fam])) if (!who.length) gaps += 1;
  }
  return gaps;
}

function contextReport(doc: PackDoc): Alignment['coverage']['context'] {
  const d = doc as unknown as Raw;
  const active = doc.tasks.filter((t) => t.status === 'todo' || t.status === 'doing');
  const touch = (t: (typeof active)[number]) =>
    strList(((t as unknown as Raw)['context'] as Raw | undefined)?.['touch']);
  const notes = (t: (typeof active)[number]) =>
    strList(((t as unknown as Raw)['context'] as Raw | undefined)?.['notes']);
  return {
    missing_detail: active
      .filter((t) => !(t as unknown as Raw)['detail'])
      .map((t) => t.id)
      .sort(),
    missing_touch: active
      .filter((t) => touch(t).length === 0)
      .map((t) => t.id)
      .sort(),
    long_notes: active
      .filter((t) => notes(t).some((n) => n.length > 280))
      .map((t) => t.id)
      .sort(),
    env_absent: !d['env'],
    open_questions: active.length
      ? (d['spec'] as Raw)['clarifications'] !== undefined
        ? list((d['spec'] as Raw)['clarifications'])
            .filter((q) => (q as Raw)['status'] === 'open')
            .map((q) => String((q as Raw)['id']))
            .sort()
        : []
      : [],
  };
}

interface Families {
  US: Set<string>;
  FR: Set<string>;
  CON: Set<string>;
  Q: Set<string>;
  AC: Set<string>;
  D: Set<string>;
  DES: Set<string>;
  DG: Set<string>;
  T: Set<string>;
}

function families(doc: PackDoc): Families {
  const spec = (doc as unknown as Raw)['spec'] as Raw;
  const plan = (doc as unknown as Raw)['plan'] as Raw;
  const ac = new Set<string>();
  for (const r of list(spec['requirements']) as Raw[])
    for (const s of ids(r['scenarios'])) ac.add(s);
  for (const st of list(spec['stories']) as Raw[]) for (const a of ids(st['acceptance'])) ac.add(a);
  return {
    US: new Set(ids(spec['stories'])),
    FR: new Set(ids(spec['requirements'])),
    CON: new Set(ids(spec['constraints'])),
    Q: new Set(ids(spec['clarifications'])),
    AC: ac,
    D: new Set(ids(plan['decisions'])),
    DES: new Set(ids(plan['designs'])),
    DG: new Set(ids(plan['diagrams'])),
    T: new Set(doc.tasks.map((t) => t.id)),
  };
}

function ids(v: unknown): string[] {
  return Array.isArray(v) ? (v as Raw[]).map((x) => String(x['id'])) : [];
}

function strList(v: unknown): string[] {
  return Array.isArray(v) ? (v as unknown[]).map(String) : [];
}

function list(v: unknown): Raw[] {
  return Array.isArray(v) ? (v as Raw[]) : [];
}
