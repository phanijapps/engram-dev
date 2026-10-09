/** The conformance runner: executes the corpus against THIS implementation.
 *  Determinism (design §4): a fixed clock for admissions; the `updated` stamp
 *  is scrubbed on both sides — it is the one field the wall clock owns. */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  answerQuestion,
  approveSpec,
  closePack,
  deriveStage,
  emitBytes,
  loadPack,
  nextTask,
  alignment,
  record,
  type PackDoc,
} from '@treadle/core';
import type { Refusal } from '@treadle/core';

const FIXED_AT = '2026-10-10T12:00:00Z';
const SCRUB = [/^(\s*"updated":\s*")[^"]*(")/gm, /("exit":\s*\d+,\n\s*"at":\s*")[^"]*(")/gm];

export interface CaseResult {
  case: string;
  layer: string;
  ok: boolean;
  detail?: string;
}

interface Op {
  op: string;
  args: {
    q?: string | undefined;
    text?: string | undefined;
    option?: string | undefined;
    by?: string | undefined;
    task?: string | undefined;
    result?: string | undefined;
    commands?: { command: string; exit: number }[] | undefined;
    expected_revision?: number | undefined;
  };
}

interface Ev {
  kind: string;
  q?: string;
  by?: string;
}

function scrub(s: string): string {
  let out = s;
  for (const re of SCRUB) out = out.replace(re, '$1«now»$2');
  return out;
}

interface OpOutcome {
  refused?: Refusal;
  handout?: unknown;
}

function applyOp(doc: PackDoc, op: Op): OpOutcome {
  if (op.op === 'next') {
    const r = nextTask(doc);
    if (!r.ok) return { refused: r };
    return { handout: r.value };
  }
  const by = op.args.by ?? 'human:owner';
  if (op.op === 'choice') {
    // the seam carries option AND text (the room's page set the shape)
    const r = answerQuestion(doc, op.args.q ?? '', by, {
      text: op.args.text ?? op.args.option,
      at: FIXED_AT,
    });
    if (!r.ok) return { refused: r };
    return {};
  }
  if (op.op === 'answer' || op.op === 'unknown') {
    const r = answerQuestion(doc, op.args.q ?? '', by, {
      text: op.args.text,
      unknown: op.op === 'unknown',
      at: FIXED_AT,
    });
    if (!r.ok) return { refused: r };
    return {};
  }
  if (op.op === 'record') {
    const a = op.args as {
      task?: string;
      result?: string;
      commands?: { command: string; exit: number }[];
      expected_revision?: number;
      by?: string;
    };
    const r = record(
      doc,
      a.task ?? '',
      a.result ?? 'pass',
      a.commands ?? [],
      a.expected_revision ?? 1,
      a.by ?? 'agent:worker',
      { at: FIXED_AT },
    );
    if (!r.ok) return { refused: r };
    return {};
  }
  if (op.op === 'close') {
    const r = closePack(doc, by, { at: FIXED_AT });
    if (!r.ok) return { refused: r };
    return {};
  }
  if (op.op === 'approve') {
    const r = approveSpec(doc, by, { at: FIXED_AT });
    if (!r.ok) return { refused: r };
    return {};
  }
  throw new Error(`runner: op not implemented: ${op.op}`);
}

function saveLike(doc: PackDoc): string {
  // the save pipeline's observable semantics: derive + stamp + canonical emit
  doc.deliverable = deriveStage(doc);
  doc.updated = FIXED_AT;
  return emitBytes(doc);
}

function read(dir: string, file: string): string | null {
  const p = join(dir, file);
  return existsSync(p) ? readFileSync(p, 'utf8') : null;
}

export function runCorpus(root: string): CaseResult[] {
  const results: CaseResult[] = [];
  for (const layer of ['L1-canonical', 'L2-refusals', 'L3-events']) {
    const layerDir = join(root, layer);
    if (!existsSync(layerDir)) continue;
    for (const c of caseDirs(layerDir)) {
      const dir = join(layerDir, c);
      results.push(runCase(layer, c, dir));
    }
  }
  return results;
}

function caseDirs(layerDir: string): string[] {
  return readdirSync(layerDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
}

function runCase(layer: string, name: string, dir: string): CaseResult {
  const tag = `${layer}/${name}`;
  const input = join(dir, 'input');
  const loaded = loadPack(input);
  if (!loaded.ok) return { case: tag, layer, ok: false, detail: loaded.message };

  if (layer === 'L1-canonical') {
    const expected = read(dir, 'expected.emit.json');
    if (!expected) return { case: tag, layer, ok: false, detail: 'missing expected.emit.json' };
    const actual = emitBytes(loaded.value); // emit-only: no stamp, byte-faithful
    if (actual !== expected) {
      return { case: tag, layer, ok: false, detail: firstDiff(actual, expected) };
    }
    const expectedCheck = read(dir, 'expected.check.json');
    if (expectedCheck !== null) {
      const a = alignment(loaded.value);
      if (!a.ok) return { case: tag, layer, ok: false, detail: a.message };
      const b = JSON.parse(expectedCheck);
      const av = canon({ violations: a.value.violations, coverage: a.value.coverage });
      const bv = canon(b);
      return av === bv
        ? { case: tag, layer, ok: true }
        : {
            case: tag,
            layer,
            ok: false,
            detail: 'check mismatch:\n  ' + av.slice(0, 500) + '\nvs\n  ' + bv.slice(0, 500),
          };
    }
    return { case: tag, layer, ok: true };
  }

  if (layer === 'L2-refusals') {
    const op = JSON.parse(read(dir, 'op.json') ?? '{}') as Op;
    const expected = JSON.parse(read(dir, 'expected.err') ?? '{}') as {
      code: string;
      message: string;
    };
    const doc = loaded.value;
    const { refused } = applyOp(doc, op);
    if (!refused) return { case: tag, layer, ok: false, detail: 'expected a refusal, got success' };
    const ok = refused.code === expected.code && refused.message === expected.message;
    return ok
      ? { case: tag, layer, ok: true }
      : {
          case: tag,
          layer,
          ok: false,
          detail: `refusal mismatch:\n  code: ${refused.code} vs ${expected.code}\n  msg:  ${refused.message} vs ${expected.message}`,
        };
  }

  // L3: replay events; expect either a final state or a refusal mid-sequence
  const events = (read(dir, 'events.jsonl') ?? '')
    .split('\n')
    .filter((l) => l.trim())
    .map((l) => JSON.parse(l) as Ev);
  const doc = loaded.value;
  let handout: unknown;
  for (const e of events) {
    const ev = e as {
      text?: string;
      option?: string;
      task?: string;
      result?: string;
      commands?: { command: string; exit: number }[];
      expected_revision?: number;
    };
    const op: Op = {
      op: e.kind,
      args: {
        q: e.q,
        by: e.by,
        text: ev.text,
        option: ev.option,
        task: ev.task,
        result: ev.result,
        commands: ev.commands,
        expected_revision: ev.expected_revision,
      },
    };
    const out = applyOp(doc, op);
    if (out.handout !== undefined) handout = out.handout;
    const { refused } = out;
    if (refused) {
      const expected = JSON.parse(read(dir, 'expected.err') ?? '{}') as { message: string };
      return expected.message && refused.message === expected.message
        ? { case: tag, layer, ok: true }
        : {
            case: tag,
            layer,
            ok: false,
            detail: `mid-sequence refusal mismatch: ${refused.message} vs ${expected.message}`,
          };
    }
  }
  const expectedState = read(dir, 'expected.state.json');
  if (!expectedState)
    return { case: tag, layer, ok: false, detail: 'sequence succeeded but expected.err present' };
  const actual = scrub(saveLike(doc));
  const expected = scrub(expectedState);
  if (actual !== expected) {
    return { case: tag, layer, ok: false, detail: firstDiff(actual, expected) };
  }
  const expectedHandout = read(dir, 'expected.handout.json');
  if (expectedHandout !== null && handout === undefined) {
    return { case: tag, layer, ok: false, detail: 'expected a handout, none produced' };
  }
  if (expectedHandout !== null) {
    const a = JSON.parse(JSON.stringify(handout));
    const b = JSON.parse(expectedHandout);
    return canon(a) === canon(b)
      ? { case: tag, layer, ok: true }
      : {
          case: tag,
          layer,
          ok: false,
          detail:
            'handout mismatch:\n  ' + canon(a).slice(0, 400) + '\nvs\n  ' + canon(b).slice(0, 400),
        };
  }
  return { case: tag, layer, ok: true };
}

/** canonical JSON (sorted keys, compact) — value equality, python parity */
function canon(x: unknown): string {
  if (Array.isArray(x)) return '[' + x.map(canon).join(',') + ']';
  if (x && typeof x === 'object') {
    const o = x as Record<string, unknown>;
    return (
      '{' +
      Object.keys(o)
        .sort()
        .map((k) => JSON.stringify(k) + ':' + canon(o[k]))
        .join(',') +
      '}'
    );
  }
  return JSON.stringify(x);
}

function firstDiff(a: string, b: string): string {
  const lim = Math.min(a.length, b.length);
  for (let i = 0; i < lim; i++) {
    if (a[i] !== b[i]) {
      const ctx = (s: string) => s.slice(Math.max(0, i - 40), i + 40).replace(/\n/g, '⏎');
      return `first byte diff at ${i}:\n  actual:   …${ctx(a)}…\n  expected: …${ctx(b)}…`;
    }
  }
  return a.length === b.length ? 'equal' : `length differs: ${a.length} vs ${b.length}`;
}
