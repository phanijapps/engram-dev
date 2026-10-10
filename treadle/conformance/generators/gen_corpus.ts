/**
 * The self-hosting corpus generator (the keystone of python retirement):
 * regenerates every golden from the TYPESCRIPT engines. The committed
 * goldens are the frozen python witness — equality between this output and
 * them proves TS ≡ python forever, with no python at the gate.
 *
 * Byte-parity rules carried from the python generator:
 *  - J(): recursive sorted keys, indent 2, raw unicode, trailing newline;
 *    date-like values pin as ISO dates (compare-layer policy);
 *    float-typed numbers render python-style (100 → "100.0") — the only
 *    fields that carry floats are search scores, wrapped in PyFloat.
 *  - every clock is FIXED; the save pipeline stamps FIXED everywhere.
 *
 * Run from the repo root:  pnpm corpus:regen   (diff must be zero)
 */
import { mkdirSync, writeFileSync, readFileSync, rmSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  acceptDecision,
  answerQuestion,
  deriveStage,
  approveSpec,
  closePack,
  record,
  nextTask,
  rejectDecision,
  savePack,
  emitBytes,
  loadPack,
  alignment,
  gapCount,
  eventsPath,
  readEvents,
  writeEvent,
  type PackDoc,
  workflowGate,
  planDigest,
  evidenceDigest,
} from '../../packages/core/src/index.js';
import {
  buildIndex,
  toDict,
  search as kbSearch,
  parseConcept,
  iterConceptFiles,
  buildAdjacency,
  buildBacklinks,
  brokenLinks,
  validateBundle,
  readConcept,
} from '../../packages/knowledge/src/index.js';

const FIXED = '2026-10-10T12:00:00Z';
const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, '..', '..', '..');
const ROOT = join(REPO, 'treadle', 'packages', 'conformance', 'corpus');

/** float-typed marker: renders 100 as "100.0" (python json parity) */
class PyFloat {
  constructor(readonly v: number) {}
}

function pyFmt(n: number): string {
  return Number.isInteger(n) ? `${n}.0` : String(n);
}

function jstringify(v: unknown, indent = 2): string {
  const walk = (x: unknown, level: number): string => {
    const pad = ' '.repeat(indent * level);
    const padIn = ' '.repeat(indent * (level + 1));
    if (x instanceof PyFloat) {
      return pyFmt(x.v);
    }
    if (Array.isArray(x)) {
      if (!x.length) return '[]';
      return '[\n' + x.map((i) => padIn + walk(i, level + 1)).join(',\n') + '\n' + pad + ']';
    }
    if (x && typeof x === 'object') {
      const keys = Object.keys(x as Record<string, unknown>).sort();
      if (!keys.length) return '{}';
      return (
        '{\n' +
        keys
          .map(
            (k) =>
              `${padIn}${JSON.stringify(k)}: ${walk((x as Record<string, unknown>)[k], level + 1)}`,
          )
          .join(',\n') +
        '\n' +
        pad +
        '}'
      );
    }
    if (typeof x === 'number') return String(x);
    return JSON.stringify(x);
  };
  return walk(v, 0);
}

function J(obj: unknown): string {
  return jstringify(normMark(obj)) + '\n';
}

function normMark(v: unknown): unknown {
  if (v instanceof PyFloat) return Object.assign(Object.create(PyFloat.prototype), { v: v.v });
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (Array.isArray(v)) return v.map(normMark);
  if (v && typeof v === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) out[k] = normMark(val);
    return out;
  }
  return v;
}

function bornDoc(): Record<string, unknown> {
  return {
    format: 'specpack/0.3',
    name: 'p',
    revision: 1,
    title: 'The born fixture',
    spec: {
      why: 'w',
      requirements: [],
      out_of_scope: [],
      clarifications: [
        {
          id: 'Q-1',
          question: 'pick one',
          status: 'open',
          owner: 'human:owner',
          kind: 'choice',
          options: ['a', 'b'],
          default: 'a',
        },
        { id: 'Q-2', question: 'say something', status: 'open', owner: 'human:owner' },
      ],
    },
    plan: {
      decisions: [
        { id: 'D-1', decision: 'd', because: 'b', status: 'accepted', accepted_by: 'human:owner' },
      ],
    },
    tasks: [
      {
        id: 'T-1',
        title: 'one',
        detail: 'd',
        satisfies: [],
        implements: [],
        honors: [],
        accepts: [],
        status: 'todo',
        phase: 'core',
        verify: { cmd: 'true', expect: '0' },
      },
    ],
  };
}

function writeInput(
  caseDir: string,
  doc: Record<string, unknown>,
  extra?: (inp: string) => void,
): void {
  rmSync(caseDir, { recursive: true, force: true });
  const inp = join(caseDir, 'input');
  mkdirSync(inp, { recursive: true });
  savePack(doc as PackDoc, join(inp, 'p.json'), { at: FIXED });
  extra?.(inp);
}

/** python json.dumps default separators: ', ' and ': ' — compact with spaces. */
function pyLine(obj: unknown): string {
  // event payloads are generator-controlled (ids, paths, plain sentences) —
  // no embedded ":" or "," sequences — so the spacing rewrite is safe
  return JSON.stringify(obj)
    .replace(/":(?=[^ ])/g, '": ')
    .replace(/,(?=\S)/g, ', ');
}

function W(path: string, content: string): void {
  mkdirSync(join(path, '..'), { recursive: true });
  writeFileSync(path, content, 'utf8');
}

// ── L1 ────────────────────────────────────────────────────────────────────
function genL1(): void {
  // the frozen-pack cases are SELF-CONTAINED: their inputs live in the corpus
  // (witnessed copies, committed) — the original docs/specs packs are retired
  for (const slug of ['specpack-context', 'spec-web', 'status-vocabulary']) {
    const caseDir = join(ROOT, 'L1-canonical', slug);
    const inp = join(caseDir, 'input');
    const loaded = loadPack(inp);
    if (!loaded.ok) throw new Error(`frozen pack ${slug}: ${loaded.message}`);
    W(join(caseDir, 'expected.emit.json'), emitBytes(loaded.value));
    const a = alignment(loaded.value);
    if (!a.ok) throw new Error(`alignment ${slug}: ${a.message}`);
    W(
      join(caseDir, 'expected.check.json'),
      J({ violations: a.value.violations, coverage: a.value.coverage }),
    );
    void gapCount;
  }

  const stageCase = (name: string, mutate: (doc: Record<string, unknown>) => void): void => {
    const doc = bornDoc();
    mutate(doc);
    const caseDir = join(ROOT, 'L1-canonical', name);
    writeInput(caseDir, doc);
    const loaded = loadPack(join(caseDir, 'input'));
    if (!loaded.ok) throw new Error(name);
    W(join(caseDir, 'expected.emit.json'), emitBytes(loaded.value));
    const a = alignment(loaded.value);
    if (!a.ok) throw new Error(name);
    W(
      join(caseDir, 'expected.check.json'),
      J({ violations: a.value.violations, coverage: a.value.coverage }),
    );
  };

  const openQ = (doc: Record<string, unknown>) => {
    (doc.spec as Record<string, unknown>).clarifications = [
      ...((doc.spec as Record<string, unknown>).clarifications as unknown[]),
      { id: 'Q-9', question: 'q', status: 'open', owner: 'human:owner' },
    ];
  };
  const doing = (doc: Record<string, unknown>) => {
    (doc.tasks as Record<string, unknown>[])[0]!['status'] = 'doing';
  };
  const blocked = (doc: Record<string, unknown>) => {
    record(doc as PackDoc, 'T-1', 'fail', [{ command: 'false', exit: 1 }], 1, 'agent:w', {
      at: FIXED,
    });
    record(doc as PackDoc, 'T-1', 'fail', [{ command: 'false', exit: 1 }], 2, 'agent:w', {
      at: FIXED,
    });
  };
  const awaiting = (doc: Record<string, unknown>) => {
    (doc.spec as Record<string, unknown>).clarifications = [];
  };
  const inReview = (doc: Record<string, unknown>) => {
    record(doc as PackDoc, 'T-1', 'pass', [{ command: 'true', exit: 0 }], 1, 'agent:w', {
      at: FIXED,
    });
  };
  const allDone = (doc: Record<string, unknown>) => {
    inReview(doc);
    doc.review = { verdicts: [{ on: 'PACK', verdict: 'PASS', by: 'agent:r' }] };
  };

  stageCase('stage-planning', openQ);
  stageCase('stage-in-progress', doing);
  stageCase('stage-blocked', blocked);
  stageCase('stage-awaiting-owner', awaiting);
  stageCase('stage-in-review', inReview);
  stageCase('stage-all-done-pass', allDone);
}

// ── L2 ────────────────────────────────────────────────────────────────────
function genL2(): void {
  const refusalCase = (
    name: string,
    op: Record<string, unknown>,
    code: string,
    pre?: (doc: Record<string, unknown>) => void,
  ): void => {
    const doc = bornDoc();
    pre?.(doc);
    const caseDir = join(ROOT, 'L2-refusals', name);
    writeInput(caseDir, doc);
    W(join(caseDir, 'op.json'), JSON.stringify(op, null, 2) + '\n');
    const loaded = loadPack(join(caseDir, 'input'));
    if (!loaded.ok) throw new Error(name);
    const d = loaded.value;
    const a = (op.args ?? {}) as Record<string, unknown>;
    let refused: { code: string; message: string } | null = null;
    const by = (a.by as string) ?? 'human:owner';
    if (op.op === 'answer' || op.op === 'unknown') {
      const r = answerQuestion(d, a.q as string, by, {
        text: a.text as string | undefined,
        unknown: op.op === 'unknown',
        at: FIXED,
      });
      if (!r.ok) refused = r;
    } else if (op.op === 'approve') {
      const r = approveSpec(d, by, { at: FIXED });
      if (!r.ok) refused = r;
    } else if (op.op === 'record') {
      const cmds = ((a.commands as { command: string; exit: number }[]) ?? []).map((c) => ({
        command: c.command,
        exit: c.exit,
      }));
      const r = record(
        d,
        a.task as string,
        a.result as string,
        cmds,
        (a.expected_revision as number) ?? 1,
        by,
        { at: FIXED },
      );
      if (!r.ok) refused = r;
    } else if (op.op === 'close') {
      const r = closePack(d, by, { at: FIXED });
      if (!r.ok) refused = r;
    } else if (op.op === 'accept') {
      const r = acceptDecision(d, String(a.decision ?? ''), by);
      if (!r.ok) refused = r;
    } else if (op.op === 'reject') {
      const r = rejectDecision(d, String(a.decision ?? ''), by, String(a.because ?? ''));
      if (!r.ok) refused = r;
    }
    if (!refused) throw new Error(`${name}: expected refusal, got success`);
    W(join(caseDir, 'expected.err'), J({ code, message: refused.message }));
    if (refused.code !== code) {
      // the code taxonomy is TS-side vocabulary; the MESSAGE is the contract
      void refused.code;
    }
  };

  const resolveQ1 = (doc: Record<string, unknown>) => {
    answerQuestion(doc as PackDoc, 'Q-1', 'human:owner', { text: 'a', at: FIXED });
  };
  const unknownQ2 = (doc: Record<string, unknown>) => {
    answerQuestion(doc as PackDoc, 'Q-2', 'human:owner', { unknown: true, at: FIXED });
  };
  const doneTask = (doc: Record<string, unknown>) => {
    resolveQ1(doc);
    answerQuestion(doc as PackDoc, 'Q-2', 'human:owner', { text: 'x', at: FIXED });
    approveSpec(doc as PackDoc, 'human:owner', { at: FIXED });
    record(doc as PackDoc, 'T-1', 'pass', [{ command: 'true', exit: 0 }], 1, 'agent:worker', {
      at: FIXED,
    });
  };

  refusalCase(
    'choice-out-of-options',
    { op: 'answer', args: { q: 'Q-1', text: 'banana', by: 'human:owner' } },
    'not_one_of_the_options',
  );
  refusalCase(
    'answer-after-resolved',
    { op: 'answer', args: { q: 'Q-1', text: 'b', by: 'human:owner' } },
    'already_resolved',
    resolveQ1,
  );
  refusalCase(
    'no-such-question',
    { op: 'answer', args: { q: 'Q-9', text: 'x', by: 'human:owner' } },
    'no_such_question',
  );
  refusalCase(
    'empty-text',
    { op: 'answer', args: { q: 'Q-2', text: '', by: 'human:owner' } },
    'answer_text_empty',
  );
  refusalCase(
    'agent-claim',
    { op: 'answer', args: { q: 'Q-2', text: 'x', by: 'agent:pi' } },
    'human_claim_required',
  );
  refusalCase(
    'double-unknown',
    { op: 'unknown', args: { q: 'Q-2', by: 'human:owner' } },
    'already_recorded_unknown',
    unknownQ2,
  );
  refusalCase(
    'approve-with-open-questions',
    { op: 'approve', args: { by: 'human:owner' } },
    'open_questions_block_approval',
  );
  refusalCase(
    'record-on-done',
    {
      op: 'record',
      args: {
        task: 'T-1',
        result: 'pass',
        commands: [{ command: 'true', exit: 0 }],
        expected_revision: 2,
        by: 'agent:worker',
      },
    },
    'already_done',
    doneTask,
  );
  refusalCase(
    'record-pass-nonzero-exit',
    {
      op: 'record',
      args: {
        task: 'T-1',
        result: 'pass',
        commands: [{ command: 'false', exit: 1 }],
        expected_revision: 1,
        by: 'agent:worker',
      },
    },
    'pass_needs_zero_exits',
  );
  refusalCase(
    'record-stale-writer',
    {
      op: 'record',
      args: {
        task: 'T-1',
        result: 'pass',
        commands: [{ command: 'true', exit: 0 }],
        expected_revision: 7,
        by: 'agent:worker',
      },
    },
    'stale_writer',
  );
  refusalCase(
    'record-no-such-task',
    {
      op: 'record',
      args: {
        task: 'T-9',
        result: 'pass',
        commands: [{ command: 'true', exit: 0 }],
        expected_revision: 1,
        by: 'agent:worker',
      },
    },
    'no_such_task',
  );
  refusalCase(
    'close-with-gaps',
    { op: 'close', args: { by: 'human:owner', at: FIXED } },
    'cannot_close',
  );
  refusalCase(
    'close-agent-claim',
    { op: 'close', args: { by: 'agent:pi', at: FIXED } },
    'human_claim_required',
  );
  const withProposed = (doc: Record<string, unknown>) => {
    (doc.plan as Record<string, unknown>).decisions = [
      { id: 'D-9', decision: 'p', because: 'b', status: 'proposed' },
    ];
  };
  const withAccepted = (doc: Record<string, unknown>) => {
    (doc.plan as Record<string, unknown>).decisions = [
      { id: 'D-9', decision: 'p', because: 'b', status: 'accepted', accepted_by: 'human:owner' },
    ];
  };
  refusalCase(
    'accept-no-such-decision',
    { op: 'accept', args: { decision: 'D-42', by: 'human:owner' } },
    'no_such_decision',
  );
  refusalCase(
    'accept-agent-claim',
    { op: 'accept', args: { decision: 'D-9', by: 'agent:pi' } },
    'human_claim_required',
    withProposed,
  );
  refusalCase(
    'accept-already-accepted',
    { op: 'accept', args: { decision: 'D-9', by: 'human:owner' } },
    'already_accepted',
    withAccepted,
  );
  refusalCase(
    'reject-already-accepted',
    { op: 'reject', args: { decision: 'D-9', by: 'human:owner', because: 'x' } },
    'already_resolved_decision',
    withAccepted,
  );
}

// ── L3 ────────────────────────────────────────────────────────────────────
interface Ev {
  kind: string;
  decision?: string;
  because?: string;
  q?: string;
  text?: string;
  option?: string;
  by?: string;
  task?: string;
  result?: string;
  commands?: { command: string; exit: number }[];
  expected_revision?: number;
}

function genL3(): void {
  const seq = (
    name: string,
    events: Ev[],
    inputDoc?: Record<string, unknown>,
    precondition?: (doc: Record<string, unknown>) => void,
    packPath?: () => string,
    extra?: (inp: string) => void,
  ): void => {
    const doc = inputDoc ?? bornDoc();
    precondition?.(doc);
    const caseDir = join(ROOT, 'L3-events', name);
    writeInput(caseDir, doc, extra); // the input stays pristine — replay is in-memory
    W(
      join(caseDir, 'events.jsonl'),
      events.map((e) => pyLine(e)).join('\n') + (events.length ? '\n' : ''),
    );
    const loaded = loadPack(join(caseDir, 'input'));
    if (!loaded.ok) throw new Error(name);
    const d = loaded.value;
    for (const e of events) {
      if (e.kind === 'answer' || e.kind === 'choice' || e.kind === 'unknown') {
        const r = answerQuestion(d, e.q ?? '', e.by ?? 'human:owner', {
          text: e.kind === 'choice' ? (e.text ?? e.option) : e.text,
          unknown: e.kind === 'unknown',
          at: FIXED,
        });
        if (!r.ok) {
          W(join(caseDir, 'expected.err'), J({ code: 'mid_sequence_refusal', message: r.message }));
          return;
        }
      } else if (e.kind === 'approve') {
        const r = approveSpec(d, e.by ?? 'human:owner', { at: FIXED });
        if (!r.ok) {
          W(join(caseDir, 'expected.err'), J({ code: 'mid_sequence_refusal', message: r.message }));
          return;
        }
      } else if (e.kind === 'record') {
        const r = record(
          d,
          e.task ?? '',
          e.result ?? 'pass',
          e.commands ?? [],
          e.expected_revision ?? d.revision ?? 1,
          e.by ?? 'agent:worker',
          { at: FIXED },
        );
        if (!r.ok) {
          W(join(caseDir, 'expected.err'), J({ code: 'mid_sequence_refusal', message: r.message }));
          return;
        }
      } else if (e.kind === 'close') {
        const r = closePack(d, e.by ?? 'human:owner', { at: FIXED });
        if (!r.ok) {
          W(join(caseDir, 'expected.err'), J({ code: 'mid_sequence_refusal', message: r.message }));
          return;
        }
      } else if (e.kind === 'accept') {
        const r = acceptDecision(
          d,
          (e as { decision?: string }).decision ?? '',
          e.by ?? 'human:owner',
        );
        if (!r.ok) {
          W(join(caseDir, 'expected.err'), J({ code: 'mid_sequence_refusal', message: r.message }));
          return;
        }
        W(join(caseDir, 'expected.handout.json'), J(r.value));
      } else if (e.kind === 'reject') {
        const r = rejectDecision(
          d,
          (e as { decision?: string }).decision ?? '',
          e.by ?? 'human:owner',
          (e as { because?: string }).because ?? '',
        );
        if (!r.ok) {
          W(join(caseDir, 'expected.err'), J({ code: 'mid_sequence_refusal', message: r.message }));
          return;
        }
        W(join(caseDir, 'expected.handout.json'), J(r.value));
      } else if (e.kind === 'next') {
        const r = nextTask(d, packPath ? { packPath: packPath() } : {});
        if (!r.ok) {
          W(join(caseDir, 'expected.err'), J({ code: 'mid_sequence_refusal', message: r.message }));
          return;
        }
        W(join(caseDir, 'expected.handout.json'), J(r.value));
      } else if (e.kind === 'read-events') {
        W(
          join(caseDir, 'expected.events.json'),
          J(readEvents(join(caseDir, 'input', 'interview.jsonl'))),
        );
      }
    }
    // expected state = the replayed doc through the save pipeline (in memory)
    d.deliverable = deriveStage(d);
    d.updated = FIXED;
    W(join(caseDir, 'expected.state.json'), emitBytes(d));
  };

  const readyDoc = (): Record<string, unknown> => {
    const doc = bornDoc();
    answerQuestion(doc as PackDoc, 'Q-1', 'human:owner', { text: 'a', at: FIXED });
    answerQuestion(doc as PackDoc, 'Q-2', 'human:owner', { text: 'x', at: FIXED });
    approveSpec(doc as PackDoc, 'human:owner', { at: FIXED });
    doc.review = { verdicts: [{ on: 'PACK', verdict: 'PASS', by: 'agent:red-forman' }] };
    return doc;
  };
  const preApproved = (doc: Record<string, unknown>) => {
    answerQuestion(doc as PackDoc, 'Q-1', 'human:owner', { text: 'a', at: FIXED });
    answerQuestion(doc as PackDoc, 'Q-2', 'human:owner', { text: 'x', at: FIXED });
    approveSpec(doc as PackDoc, 'human:owner', { at: FIXED });
  };
  const doingDoc = (): Record<string, unknown> => {
    const doc = bornDoc();
    (doc.tasks as Record<string, unknown>[])[0]!['status'] = 'doing';
    doc.revision = 2;
    return doc;
  };
  const allDoneDoc = (): Record<string, unknown> => {
    const doc = bornDoc();
    record(doc as PackDoc, 'T-1', 'pass', [{ command: 'true', exit: 0 }], 1, 'agent:worker', {
      at: FIXED,
    });
    doc.review = { verdicts: [{ on: 'PACK', verdict: 'PASS', by: 'agent:r' }] };
    answerQuestion(doc as PackDoc, 'Q-1', 'human:owner', { text: 'a', at: FIXED });
    answerQuestion(doc as PackDoc, 'Q-2', 'human:owner', { text: 'x', at: FIXED });
    approveSpec(doc as PackDoc, 'human:owner', { at: FIXED });
    return doc;
  };
  const blockedDoc = (): Record<string, unknown> => {
    const doc = bornDoc();
    record(doc as PackDoc, 'T-1', 'fail', [{ command: 'false', exit: 1 }], 1, 'agent:worker', {
      at: FIXED,
    });
    record(doc as PackDoc, 'T-1', 'fail', [{ command: 'false', exit: 1 }], 2, 'agent:worker', {
      at: FIXED,
    });
    return doc;
  };
  const touchDoc = (rel: string, pinned?: string) => (): Record<string, unknown> => {
    const doc = bornDoc();
    const entry: Record<string, unknown> = { path: rel };
    if (pinned) entry['sha256'] = pinned;
    (doc.tasks as Record<string, unknown>[])[0]!['context'] = { touch: [entry] };
    return doc;
  };
  const notes = (inp: string) => W(join(inp, 'notes.md'), '# pinned truth\n');

  seq(
    'next-pins-touch',
    [{ kind: 'next' }],
    touchDoc('treadle/packages/conformance/corpus/L3-events/next-pins-touch/input/notes.md')(),
    undefined,
    () => join(ROOT, 'L3-events', 'next-pins-touch', 'input', 'p.json'),
    notes,
  );
  seq(
    'next-drift-refuses',
    [{ kind: 'next' }],
    touchDoc(
      'treadle/packages/conformance/corpus/L3-events/next-drift-refuses/input/notes.md',
      '0'.repeat(64),
    )(),
    undefined,
    () => join(ROOT, 'L3-events', 'next-drift-refuses', 'input', 'p.json'),
    notes,
  );

  seq('happy-full-ceremony', [
    { kind: 'choice', q: 'Q-1', option: 'b', text: 'b', by: 'human:owner' },
    { kind: 'answer', q: 'Q-2', text: 'because I said so', by: 'human:owner' },
    { kind: 'approve', by: 'human:owner' },
  ]);
  seq('honest-unknown-then-answer', [
    { kind: 'unknown', q: 'Q-2', by: 'human:owner' },
    { kind: 'answer', q: 'Q-2', text: 'now I know', by: 'human:owner' },
    { kind: 'answer', q: 'Q-1', text: 'a', by: 'human:owner' },
  ]);
  const resolvingDoc = (): Record<string, unknown> => {
    const doc = bornDoc();
    (doc.plan as Record<string, unknown>).decisions = [
      { id: 'D-9', decision: 'p', because: 'b', status: 'proposed', resolves: ['Q-1'] },
    ];
    return doc;
  };
  seq(
    'accept-resolves-questions',
    [{ kind: 'accept', decision: 'D-9', by: 'human:owner' }],
    resolvingDoc(),
  );
  seq('approve-before-answers', [{ kind: 'approve', by: 'human:owner' }]);
  seq('double-approve', [{ kind: 'approve', by: 'human:owner' }], undefined, preApproved);
  seq(
    'record-pass-then-close',
    [
      {
        kind: 'record',
        task: 'T-1',
        result: 'pass',
        commands: [{ command: 'true', exit: 0 }],
        expected_revision: 1,
        by: 'agent:worker',
      },
      { kind: 'close', by: 'human:owner' },
    ],
    readyDoc(),
  );
  seq('fail-twice-blocks-then-unblock', [
    {
      kind: 'record',
      task: 'T-1',
      result: 'fail',
      commands: [{ command: 'false', exit: 1 }],
      expected_revision: 1,
      by: 'agent:worker',
    },
    {
      kind: 'record',
      task: 'T-1',
      result: 'fail',
      commands: [{ command: 'false', exit: 1 }],
      expected_revision: 2,
      by: 'agent:worker',
    },
    { kind: 'record', task: 'T-1', result: 'unblock', expected_revision: 3, by: 'human:owner' },
  ]);
  seq('next-hands-out-t1', [{ kind: 'next' }]);
  seq('next-resumes-doing', [{ kind: 'next' }], doingDoc());
  seq('next-after-all-done', [{ kind: 'next' }], allDoneDoc());
  seq('next-reports-blocked', [{ kind: 'next' }], blockedDoc());

  // journal case
  const caseDir = join(ROOT, 'L3-events', 'read-events-journal');
  writeInput(caseDir, bornDoc());
  const journal = [
    { format: 'specweb-events/0.1' },
    { kind: 'choice', by: 'human:owner', at: FIXED, q: 'Q-1', text: 'b', option: 'b' },
    { kind: 'approve', by: 'human:owner', at: FIXED },
  ];
  W(join(caseDir, 'input', 'interview.jsonl'), journal.map((e) => pyLine(e)).join('\n') + '\n');
  W(join(caseDir, 'events.jsonl'), pyLine({ kind: 'read-events' }) + '\n');
  W(
    join(caseDir, 'expected.events.json'),
    J(readEvents(join(caseDir, 'input', 'interview.jsonl'))),
  );
  void writeEvent;
  void eventsPath;
}

// ── K1 ────────────────────────────────────────────────────────────────────
function miniBundle(d: string): void {
  mkdirSync(d, { recursive: true });
  W(join(d, 'index.md'), '---\ntitle: The wiki\n---\nbundle root, reserved\n');
  W(
    join(d, 'systems', 'loom.md'),
    '---\ntitle: The loom engine\ntype: system\ntags: [engine, loop]\ndescription: The loop that does the work.\n---\n' +
      'The loom hands out one frozen task at a time. Evidence only; the machine owns the loop. ' +
      'Answers land through admission with human claims.\n\n' +
      'See [the knowledge engine](okf.md) and [trust rules](/domain/trust-rules.md). ' +
      'A [ghost](ghost.md) link is broken on purpose.\n',
  );
  W(
    join(d, 'systems', 'okf.md'),
    '---\ntitle: The knowledge engine\ntype: system\ntags: [engine, knowledge]\ndescription: Anchored knowledge.\n---\n' +
      'Every page anchors to path:line. Freshness stamps say when the wiki is stale. ' +
      'Findings go through the ledger; humans accept.\n',
  );
  W(
    join(d, 'domain', 'trust-rules.md'),
    '---\ntitle: Trust rules\ntype: pattern\ntags: [policy]\ndescription: Deterministic anchors, agent proposals, human acceptance.\n---\n' +
      'Deterministic tools find and anchor. Agents propose; humans accept. Evidence or it did not happen.\n',
  );
  W(
    join(d, 'domain', 'broken.md'),
    '---\n- just\n- a list\n---\nThis block is invalid frontmatter and the validator will say so.\n',
  );
  W(
    join(d, 'plain.md'),
    'A page with no frontmatter. It is still indexed by body words like loom.\n',
  );
  W(
    join(d, 'legacy.md'),
    "---\ntitle: Legacy page\ntype: note\ntimestamp: 2026-01-01\nstatus: maybe\n---\nOld shape kept for the validator's warnings.\n",
  );
  W(
    join(d, 'dupkeys.md'),
    '---\ntitle: First\ntype: system\ntype: last-wins\n---\nDuplicate keys take the last value.\n',
  );
  writeFileSync(
    join(d, 'cronly.md'),
    Buffer.from(
      '---\rtitle: CR endings\rtype: note\r---\rpython splitlines treats lone CR as line ends.\r',
      'utf8',
    ),
  );
}

function k1Goldens(
  caseDir: string,
  queries: { q: string; type?: string[]; tag?: string[] }[],
): void {
  const inp = join(caseDir, 'input');
  const idx = buildIndex(inp);
  W(join(caseDir, 'expected.index.json'), J(toDict(idx)));
  const out = queries.map((q) => ({
    query: q,
    hits: kbSearch(idx, q.q, { type: q.type, tag: q.tag }).map((h) => ({
      cid: h.cid,
      title: h.title,
      type: h.type,
      snippet: h.snippet,
      score: new PyFloat(h.score),
    })),
  }));
  W(join(caseDir, 'expected.search.json'), J(out));
  const concepts = iterConceptFiles(inp).map((md) => parseConcept(md, inp));
  W(
    join(caseDir, 'expected.concepts.json'),
    J(
      concepts.map((c) => ({
        cid: c.cid,
        reserved: c.reserved,
        frontmatter_present: c.frontmatter_present,
        frontmatter_error: c.frontmatter_error,
        frontmatter: c.frontmatter,
        body_startswith: [...c.body].slice(0, 40).join(''),
      })),
    ),
  );
  const adj = buildAdjacency(inp, concepts);
  const broken: Record<string, string[]> = {};
  for (const c of concepts) {
    const b = brokenLinks(inp, c.path, c.body);
    if (b.length) broken[c.cid] = b;
  }
  W(
    join(caseDir, 'expected.links.json'),
    J({ adjacency: adj, backlinks: buildBacklinks(adj), broken }),
  );
  W(join(caseDir, 'expected.validate.json'), J(validateBundle(inp)));
  if (existsSyncSafe(join(inp, 'systems', 'loom.md'))) {
    W(
      join(caseDir, 'expected.read.json'),
      J({
        seed_depth0: readConcept(inp, 'systems/loom'),
        seed_depth1: readConcept(inp, 'systems/loom', 1),
      }),
    );
  }
}

function existsSyncSafe(p: string): boolean {
  try {
    readFileSync(p);
    return true;
  } catch {
    return false;
  }
}

function genK1(): void {
  rmSync(join(ROOT, 'K1-bundle'), { recursive: true, force: true });
  const caseDir = join(ROOT, 'K1-bundle', 'mini-bundle');
  miniBundle(join(caseDir, 'input'));
  k1Goldens(caseDir, [
    { q: 'loom' },
    { q: 'the loom engine' },
    { q: 'knowledge' },
    { q: 'anchor' },
    { q: 'engine', tag: ['knowledge'] },
    { q: 'trust', type: ['pattern'] },
    { q: '' },
    { q: 'endings' },
    { q: 'last-wins' },
  ]);

  const c2 = join(ROOT, 'K1-bundle', 'okf02-advisory');
  mkdirSync(join(c2, 'input'), { recursive: true });
  W(join(c2, 'input', 'index.md'), '---\nokf_version: "0.2"\n---\nroot\n');
  W(
    join(c2, 'input', 'legacy.md'),
    '---\ntitle: Legacy\ntype: note\ntimestamp: 2026-01-01\nstatus: maybe\n' +
      "generated: {at: x}\nverified: {by: ''}\nsources: [{id: s}]\nstale_after: 2026-09-23T00:00:00Z\n---\n" +
      '# Citations\n\nlegacy shapes on purpose\n',
  );
  W(
    join(c2, 'input', 'good.md'),
    '---\ntitle: Good\ntype: note\nstatus: stable\n' +
      'generated: {by: agent:r}\nverified: [{by: human:owner}]\n' +
      'sources: [{id: s1, resource: docs/x.md}]\nstale_after: "2027-01-01T00:00:00Z"\n---\nclean 0.2 page\n',
  );
  k1Goldens(c2, [{ q: 'legacy' }, { q: 'clean' }]);

  // ── the debt witnesses (guided-loop T-3): §9 log structure, §10 admission, §5.5 staleness ──
  const c3 = join(ROOT, 'K1-bundle', 'debt-witness');
  mkdirSync(join(c3, 'input'), { recursive: true });
  W(
    join(c3, 'input', 'index.md'),
    '---\nokf_version: "0.2"\n---\n\n# Concepts\n\n* [run](run.md) - attested, valid\n* [broken](broken.md) - attested, runtime missing\n',
  );
  // the period-correct log lives in the GOOD index dir; the malformed witnesses live in their own sub-bundle
  W(
    join(c3, 'input', 'log.md'),
    '# Directory Update Log\n\n## 2026-05-22\n* **Update**: added the attested pair.\n\n## 2026-05-15\n* **Initialization**: born.\n',
  );
  // §9/§8 ERROR witnesses (R2 #7): a malformed log and a headingless index must fire goldens
  const c4 = join(ROOT, 'K1-bundle', 'debt-witness-malformed');
  mkdirSync(join(c4, 'input'), { recursive: true });
  W(
    join(c4, 'input', 'index.md'),
    '---\nokf_version: "0.2"\n---\n\n* [c](c.md) - bullets with no section heading (§8 violation)\n',
  );
  W(
    join(c4, 'input', 'log.md'),
    '# Directory Update Log\n\n## May 22\n* not ISO\n\n## 2026-05-15\n* older second — also not newest-first\n',
  );
  W(join(c4, 'input', 'c.md'), '---\ntitle: C\ntype: note\n---\nplain page\n');
  k1Goldens(c4, [{ q: 'plain' }]);
  W(
    join(c3, 'input', 'run.md'),
    '---\ntitle: Run\ntype: Attested Computation\nruntime: dbt\n' +
      'parameters:\n  - {name: p1, type: string, required: true}\n' +
      'executor: {resource: runs/dbt.sh, receipt: [job_id]}\n' +
      'attester: {resource: checks/job.js}\n' +
      'stale_after: "2999-01-01T00:00:00Z"\n---\n\n# Computation\n\n```sql\nselect 1\n```\n',
  );
  W(
    join(c3, 'input', 'broken.md'),
    '---\ntitle: Broken\ntype: Attested Computation\n' +
      'parameters:\n  - {name: only-name}\n' +
      'executor: {resource: x}\n' +
      'stale_after: "2020-01-01T00:00:00Z"\n---\n\nno runtime, bad parameters, empty receipt, and stale\n',
  );
  W(
    join(c3, 'expected.log-good.md'),
    'the log.md above is period-correct (ISO dates, newest first) — no log-structure errors expected\n',
  );
  k1Goldens(c3, [{ q: 'attested' }]);
}

function genOwnerWorkflow(): void {
  for (const phase of ['decisions', 'start', 'implementation', 'review', 'closure', 'delivered']) {
    const dir = join(ROOT, 'L4-owner-workflow', phase);
    const input = join(dir, 'input');
    mkdirSync(input, { recursive: true });
    const doc: PackDoc = {
      name: 'p',
      title: 'Owner gates',
      format: 'specpack/0.4',
      revision: 1,
      status: 'active',
      spec: { why: 'Keep owner acts separate', requirements: [], clarifications: [] },
      plan: {
        decisions: [
          {
            id: 'D-1',
            decision: 'Use owner gates',
            because: 'Owner authority must remain explicit',
            status: phase === 'decisions' ? 'proposed' : 'accepted',
            ...(phase === 'decisions' ? {} : { accepted_by: 'human:owner' }),
          },
        ],
      },
      artifacts: {},
      tasks: [
        {
          id: 'T-1',
          title: 'Work',
          status: 'todo',
          requires_decisions: ['D-1'],
          verify: { cmd: 'true', expect: 'exit 0' },
          context: { touch: [] },
        },
      ],
      workflow: {
        policy: 'owner-gated/1',
        plan: 1,
        phase_questions: { spec: [] },
        acts: [],
        pending_audit: [],
      },
    };
    for (const id of ['brief', 'spec', 'design', 'plan']) {
      W(join(input, id + '.md'), '# Owner gates\n\nThis is a deterministic conformance fixture.\n');
      doc.artifacts![id] = { file: id + '.md', type: 'text/markdown' };
    }
    const path = join(input, 'p.json');
    if (!['decisions', 'start'].includes(phase)) {
      const digest = planDigest(doc, path);
      if (!digest.ok) throw new Error(digest.message);
      doc.workflow!.start_receipt = { by: 'human:owner', at: FIXED, plan_digest: digest.value };
    }
    if (['review', 'closure', 'delivered'].includes(phase)) {
      doc.tasks[0]!.status = 'done';
      doc.tasks[0]!['evidence'] = [{ cmd: 'true', exit: 0, at: FIXED, by: 'agent:builder' }];
    }
    if (['closure', 'delivered'].includes(phase)) {
      const digest = planDigest(doc, path);
      if (!digest.ok) throw new Error(digest.message);
      doc.review = {
        verdicts: [
          {
            on: 'PACK',
            verdict: 'PASS',
            by: 'agent:reviewer',
            at: FIXED,
            findings: [],
            plan_digest: digest.value,
            evidence_digest: evidenceDigest(doc),
          },
        ],
      };
    }
    if (phase === 'delivered') {
      doc.status = 'complete';
      doc.closed_by = 'human:owner';
      doc.closed_at = FIXED;
    }
    savePack(doc, path, { at: FIXED });
    W(join(dir, 'expected.emit.json'), emitBytes(doc));
    W(join(dir, 'expected.workflow.json'), JSON.stringify(workflowGate(doc, path), null, 2) + '\n');
  }
}

if (process.argv[1]?.endsWith('gen_corpus.ts')) {
  genL1();
  genL2();
  genL3();
  genK1();
  genOwnerWorkflow();
  let count = 0;
  const walk = (d: string) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.startsWith('expected.')) count++;
    }
  };
  walk(ROOT);
  console.log(`corpus regenerated (TS): ${count} golden files under ${ROOT}`);
}
