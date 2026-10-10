/**
 * The loop plane's real commands: admission through the core, saved with the
 * house discipline (answer/approve bump the revision themselves; record and
 * close bump inside the op). Refusals print the exact message and exit 1 —
 * the vocabulary is the API.
 */
import type { Command } from 'commander';
import { where, recallBlock } from '../harness/where.js';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname as packDirFrom } from 'node:path';
import {
  alignment,
  withPackLock,
  recoverPackLock,
  ownerAction,
  workflowGate,
  planDigest,
  humanClaim,
  answerQuestion,
  approveSpec,
  acceptDecision,
  closePack,
  gapCount,
  loadPackWithMeta,
  eventsPath,
  readEvents,
  rejectDecision,
  nextTask,
  record,
  savePack,
  deriveStage,
  type PackDoc,
  type OwnerAct,
} from '@treadle/core';

const now = () => new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');

interface Loaded {
  doc: PackDoc;
  path: string;
}

function load(packDir: string): Loaded | { refused: string } {
  const r = loadPackWithMeta(packDir);
  return r.ok ? { doc: r.value.doc, path: r.value.path } : { refused: r.message };
}

type Cmd = (packDir: string, opts: Record<string, string | number | boolean | undefined>) => void;

function lockedAction<T extends unknown[]>(fn: (packDir: string, ...opts: T) => void) {
  return (packDir: string, ...opts: T): void => {
    const result = withPackLock(packDir, () => fn(packDir, ...opts));
    if (!result.ok) fail(result.message);
  };
}
function guarded(fn: (l: Loaded, opts: Record<string, never>) => void, mutation = true): Cmd {
  const run: Cmd = (packDir, opts) => {
    const l = load(packDir);
    if ('refused' in l) return fail(l.refused);
    const expected = opts['expectedRevision'];
    if (
      mutation &&
      ((expected !== undefined &&
        (!Number.isSafeInteger(expected) || expected !== l.doc.revision)) ||
        (l.doc.format === 'specpack/0.4' && expected === undefined))
    )
      return fail(
        `stale writer: file is at revision ${l.doc.revision ?? 1}; pass the held --expected-revision`,
      );
    fn(l, opts as Record<string, never>);
  };
  return mutation ? lockedAction(run) : run;
}
function workflowOwner(
  l: Loaded,
  kind: OwnerAct['kind'],
  opts: { by: string; expectedRevision: number; at?: string; decision?: string; because?: string },
): boolean {
  if (l.doc.format !== 'specpack/0.4') return false;
  const action: Parameters<typeof ownerAction>[1] = {
    kind,
    by: opts.by,
    at: opts.at ?? now(),
    expected_revision: opts.expectedRevision,
  };
  if (opts.decision) action.decision = opts.decision;
  if (opts.because) action.because = opts.because;
  const out = ownerAction(l.doc, action, l.path);
  if (!out.ok) {
    fail(out.message);
    return true;
  }
  savePack(l.doc, l.path, { at: action.at });
  console.log(`recorded ${kind} by ${opts.by}; audit pending`);
  return true;
}

export function registerDo(doCmd: Command): void {
  doCmd
    .command('answer <packDir>')
    .requiredOption('--q <id>', 'the question id')
    .option('--text <text>', 'the answer text')
    .option('--unknown', 'the honest unknown', false)
    .requiredOption('--by <claim>', 'human claim (human:<owner>)')
    .requiredOption('--expected-revision <n>', 'the revision you hold', parseInt)
    .option('--at <iso>', 'stamp (defaults to now)')
    .action(
      guarded((l, o) => {
        const opts = o as unknown as {
          q: string;
          text?: string;
          unknown: boolean;
          by: string;
          at?: string;
        };
        const out = answerQuestion(l.doc, opts.q, opts.by, {
          text: opts.text,
          unknown: opts.unknown,
          at: opts.at ?? now(),
        });
        if (!out.ok) return fail(out.message);
        l.doc.revision = (l.doc.revision ?? 1) + 1; // admission bumps, then saves
        savePack(l.doc, l.path, { at: opts.at ?? now() });
        console.log(`answered ${opts.q} by ${opts.by}`);
      }),
    );

  doCmd
    .command('approve <packDir>')
    .requiredOption('--by <claim>', 'human claim (human:<owner>)')
    .requiredOption('--expected-revision <n>', 'the revision you hold', parseInt)
    .option('--at <iso>', 'stamp (defaults to now)')
    .action(
      guarded((l, o) => {
        const opts = o as unknown as { by: string; at?: string; expectedRevision: number };
        if (workflowOwner(l, 'approve', opts)) return;
        const out = approveSpec(l.doc, opts.by, { at: opts.at ?? now() });
        if (!out.ok) return fail(out.message);
        l.doc.revision = (l.doc.revision ?? 1) + 1;
        savePack(l.doc, l.path, { at: opts.at ?? now() });
        console.log(`approved by ${opts.by} at ${out.value.approved_at}`);
      }),
    );

  doCmd
    .command('where <workspace>')
    .description(
      'recall: where does work dangle? live specs roots + git worktrees (the archive is never listed)',
    )
    .option('--json', 'machine form (for hooks)')
    .action((workspace: string, opts: { json?: boolean }) => {
      const report = where(workspace);
      if (opts.json) {
        console.log(JSON.stringify(report, null, 2));
        return;
      }
      console.log(recallBlock(report));
    });
  doCmd
    .command('next <packDir>')
    .option('--expected-revision <n>', 'the held revision', Number)
    .action(
      guarded((l) => {
        const out = nextTask(l.doc, { packPath: l.path });
        if (!out.ok) return fail(out.message);
        const h = out.value;
        if (h.status === 'task') {
          console.log(
            `task ${h.task} — ${h.items.length} items in the frozen slice (digest ${h.slice_digest.slice(0, 12)}…)`,
          );
          for (const it of h.items) {
            const fam = String((it as Record<string, unknown>)['family'] ?? '?');
            const id = String((it as Record<string, unknown>)['id'] ?? '?');
            const title = String((it as Record<string, unknown>)['title'] ?? '');
            console.log(`  ${fam.padEnd(4)} ${id}${title ? ' — ' + title : ''}`);
          }
        } else if (h.status === 'owner_gate') {
          console.log(`${h.gate.phase}: ${h.gate.reasons.join('; ')}`);
          process.exitCode = 1;
          return;
        } else if (h.status === 'needs_closure') {
          console.log(
            `closure needed: ${h.pending_decisions.length} decisions proposed, ${h.open_questions.length} questions open`,
          );
          process.exitCode = 1;
        } else {
          console.log(h.status);
        }
        savePack(l.doc, l.path, { at: now() }); // handout bumped the revision
      }),
    );

  doCmd
    .command('record <packDir>')
    .requiredOption('--task <id>', 'the task id')
    .requiredOption('--result <r>', 'pass | fail | unblock')
    .requiredOption('--cmd <command>', 'the executed command')
    .requiredOption('--exit <n>', 'its exit code', parseInt)
    .requiredOption('--expected-revision <n>', 'the revision you hold', parseInt)
    .requiredOption('--by <claim>', 'who ran it (agent:<name> or human:<owner>)')
    .option('--notes <notes>', 'optional notes')
    .option('--at <iso>', 'stamp (defaults to now)')
    .action(
      guarded((l, o) => {
        const opts = o as unknown as {
          task: string;
          result: string;
          cmd: string;
          exit: number;
          expectedRevision: number;
          by: string;
          notes?: string;
          at?: string;
        };
        const out = record(
          l.doc,
          opts.task,
          opts.result,
          [{ command: opts.cmd, exit: opts.exit }],
          opts.expectedRevision,
          opts.by,
          { at: opts.at ?? now(), notes: opts.notes, packPath: l.path },
        );
        if (!out.ok) return fail(out.message);
        savePack(l.doc, l.path, { at: opts.at ?? now() }); // record bumped inside
        console.log(JSON.stringify(out.value));
      }),
    );

  doCmd
    .command('close <packDir>')
    .option('--expected-revision <n>', 'the held revision', Number)
    .requiredOption('--by <claim>', 'human claim (human:<owner>)')
    .option('--at <iso>', 'stamp (defaults to now)')
    .action(
      guarded((l, o) => {
        const opts = o as unknown as { by: string; at?: string; expectedRevision: number };
        if (workflowOwner(l, 'close', opts)) return;
        const out = closePack(l.doc, opts.by, { at: opts.at ?? now() });
        if (!out.ok) return fail(out.message);
        savePack(l.doc, l.path, { at: opts.at ?? now() }); // close bumped inside
        console.log(`closed by ${opts.by}: the record is frozen`);
      }),
    );

  doCmd.command('check <packDir>').action(
    guarded((l) => {
      const a = alignment(l.doc);
      if (!a.ok) return fail(a.message);
      for (const v of a.value.violations) console.log(`VIOLATION: ${v}`);
      console.log(
        `alignment: ${a.value.violations.length} violation(s), ${gapCount(a.value)} gap(s) — gaps are reported, never guessed`,
      );
      if (a.value.violations.length) process.exitCode = 1;
    }, false),
  );

  doCmd.command('events <packDir>').action(
    guarded((l) => {
      const evs = readEvents(eventsPath(l.path.slice(0, l.path.lastIndexOf('/'))));
      if (!evs.length) return console.log('no events recorded');
      for (const e of evs) {
        const q = 'q' in e ? String(e.q).padEnd(5) + ' ' : '';
        console.log(`${e.kind.padEnd(8)} ${q}${e.by} ${e.at}`);
      }
    }),
  );

  doCmd
    .command('interview <packDir>')
    .description('the room: serve the born-spec ceremony, block until approved (Ctrl-C escapes)')
    .option('--port <n>', 'port (default 8765)', (v) => parseInt(v), 8765)
    .option('--no-open', 'do not open the browser')
    .action(async (packDir: string, opts: { port: number; open: boolean }) => {
      const { startRoom } = await import('@treadle/web');
      const room = await startRoom(packDir, opts.port);
      console.log(`room: ${room.url}  (localhost only, no auth — v1 disclosure)`);
      console.log(`room: serving ${packDir} — Ctrl-C stops`);
      if (opts.open) await openBrowser(room.url);
      // the interrupt completes when the approval act lands — then we stop
      await new Promise<never>((_, reject) => {
        const timer = setInterval(() => {
          const loaded = loadPackWithMeta(packDir);
          if (loaded.ok && loaded.value.doc.approved_at) {
            clearInterval(timer);
            console.log('interview complete: the approval act is recorded; the loop resumes');
            room.close().finally(() => process.exit(0));
          }
        }, 1000);
        process.on('SIGINT', () => {
          clearInterval(timer);
          console.log('\nroom: stopped; every admission is already saved');
          room.close().finally(() => process.exit(0));
          void reject;
        });
      });
    });

  doCmd
    .command('library <specsRoot>')
    .description('the standing surface: every pack, readable and actionable')
    .option('--port <n>', 'port (default 8788)', (v) => parseInt(v), 8788)
    .option('--no-open', 'do not open the browser')
    .action(async (specsRoot: string, opts: { port: number; open: boolean }) => {
      const { startLibrary } = await import('@treadle/web');
      const lib = await startLibrary(specsRoot, opts.port);
      console.log(`library: ${lib.url}  (localhost only, no auth — v1 disclosure)`);
      console.log(`library: serving ${specsRoot} — Ctrl-C stops`);
      if (opts.open) await openBrowser(lib.url);
      await new Promise<never>(() => void 0); // standing surface
    });

  doCmd
    .command('init <packDir>')
    .description('birth a pack: the born shape, saved through the machine writer')
    .requiredOption('--title <t>', 'the pack title')
    .requiredOption('--why <w>', 'why this work exists')
    .option('--owner-gated', 'use the new owner approval workflow', false)
    .action((packDir: string, opts: { title: string; why: string; ownerGated: boolean }) => {
      const name = packDir
        .replace(/[\\/]+$/, '')
        .split(/[\\/]/)
        .pop()!;
      const pjson = join(packDir, `${name}.json`);
      if (existsSync(pjson)) return fail(`${pjson} already exists`);
      mkdirSync(packDir, { recursive: true });
      const doc: PackDoc = {
        format: opts.ownerGated ? 'specpack/0.4' : 'specpack/0.3',
        name,
        revision: 1,
        title: opts.title,
        spec: { why: opts.why, requirements: [], clarifications: [], out_of_scope: [] },
        plan: { decisions: [], designs: [] },
        tasks: [],
      };
      if (opts.ownerGated)
        doc.workflow = {
          policy: 'owner-gated/1',
          plan: 1,
          phase_questions: { spec: [] },
          acts: [],
          pending_audit: [],
        };
      const born = withPackLock(packDir, () => {
        if (existsSync(pjson)) return fail(`${pjson} already exists`);
        savePack(doc, pjson, { at: now() });
      });
      if (!born.ok) return fail(born.message);
      console.log(`born: ${pjson} (revision 1, stage ${deriveStage(doc)})`);
    });

  doCmd
    .command('start <packDir>')
    .requiredOption('--by <claim>', 'the owner claim')
    .requiredOption('--expected-revision <n>', 'the held revision', Number)
    .option('--at <iso>', 'owner act date')
    .action(
      guarded((l, o) => {
        if (!l.doc.workflow) return fail('Adopt the owner workflow before start approval');
        workflowOwner(
          l,
          'start',
          o as unknown as { by: string; expectedRevision: number; at?: string },
        );
      }),
    );

  doCmd
    .command('adopt <packDir>')
    .description('explicitly adopt the owner workflow; preserve the legacy record')
    .requiredOption('--by <claim>', 'the owner claim')
    .requiredOption('--expected-revision <n>', 'the held revision', Number)
    .option('--bootstrap <file>', 'preserve an actual reviewed bootstrap start receipt')
    .action(
      guarded((l, o) => {
        const opts = o as unknown as { by: string; expectedRevision: number; bootstrap?: string };
        if (!humanClaim(opts.by)) return fail('Adoption needs an owner claim');
        if (l.doc.status === 'complete') return fail('A complete spec cannot be adopted');
        if (l.doc.format === 'specpack/0.4')
          return fail('This spec already uses the owner workflow');
        const original = readFileSync(l.path, 'utf8');
        l.doc.format = 'specpack/0.4';
        l.doc.workflow = {
          policy: 'owner-gated/1',
          plan: 1,
          phase_questions: { spec: [] },
          acts: [],
          pending_audit: [],
        };
        if (opts.bootstrap) {
          let receipt: {
            format: string;
            plan: number;
            plan_digest: string;
            start: { question: string; by: string; at: string; answer: string };
          };
          try {
            receipt = JSON.parse(readFileSync(opts.bootstrap, 'utf8')) as typeof receipt;
          } catch {
            return fail('Cannot read the bootstrap receipt');
          }
          const q = l.doc.spec.clarifications?.find((q) => q.id === receipt.start?.question);
          const scope = planDigest(l.doc, l.path);
          if (
            receipt.format !== 'owner-bootstrap/0.1' ||
            receipt.plan !== 1 ||
            !scope.ok ||
            scope.value !== receipt.plan_digest ||
            !q ||
            q.status !== 'resolved' ||
            q.answered_by !== opts.by ||
            q.answered_by !== receipt.start.by ||
            q.answered_at !== receipt.start.at ||
            q.answer !== receipt.start.answer ||
            q.answer !== 'Yes, start Plan 1' ||
            !String(q['notes'] ?? '').includes(receipt.plan_digest) ||
            !Number.isFinite(Date.parse(receipt.start.at))
          )
            return fail('Bootstrap receipt does not match actual owner consent and reviewed scope');
          l.doc.workflow.start_receipt = {
            by: receipt.start.by,
            at: receipt.start.at,
            plan_digest: scope.value,
          };
          const start: OwnerAct = {
            id: `bootstrap-start-${l.doc.revision}`,
            kind: 'start',
            by: receipt.start.by,
            at: receipt.start.at,
            revision: l.doc.revision! + 1,
            plan_digest: scope.value,
          };
          l.doc.workflow.acts.push(start);
          l.doc.workflow.pending_audit.push(start);
        }
        const snapshot = `legacy-revision-${l.doc.revision}.json`;
        if (existsSync(join(packDirFrom(l.path), snapshot)))
          return fail('Legacy snapshot already exists; do not overwrite it');
        writeFileSync(join(packDirFrom(l.path), snapshot), original, { flag: 'wx' });
        l.doc.artifacts ??= {};
        l.doc.artifacts['legacy-snapshot'] = { file: snapshot, type: 'application/json' };
        l.doc.revision = (l.doc.revision ?? 1) + 1;
        const act: OwnerAct = {
          id: `adopt-${l.doc.revision}`,
          kind: 'adopt',
          by: opts.by,
          at: now(),
          revision: l.doc.revision,
        };
        l.doc.workflow.acts.push(act);
        l.doc.workflow.pending_audit.push(act);
        savePack(l.doc, l.path, { at: act.at });
        console.log(`adopted owner workflow by ${opts.by}; legacy bytes preserved; audit pending`);
      }),
    );

  doCmd
    .command('recover-lock <packDir>')
    .requiredOption('--by <claim>', 'the owner claim')
    .requiredOption('--owner-token <token>', 'the verified token from .specpack-lock/owner.json')
    .action((packDir: string, opts: { by: string; ownerToken: string }) => {
      const r = recoverPackLock(packDir, opts.ownerToken, opts.by);
      if (!r.ok) return fail(r.message);
      console.log('Recovered the verified dead lock');
    });

  const add = doCmd.command('add');
  add
    .command('question <packDir>')
    .option('--phase <phase>', 'spec or design question', 'spec')
    .option('--expected-revision <n>', 'the held revision', Number)
    .requiredOption('--id <id>', 'e.g. Q-1')
    .requiredOption('--question <q>', 'what the owner must answer')
    .option('--kind <k>', 'open | choice')
    .option('--options <opts...>', 'choice options')
    .option('--default <d>', 'the recommended option')
    .action(
      lockedAction(
        (
          packDir: string,
          opts: {
            id: string;
            question: string;
            kind?: string;
            options?: string[];
            default?: string;
            phase: string;
          },
        ) => {
          const l = load(packDir);
          if ('refused' in l) return fail(l.refused);
          const held = (opts as unknown as { expectedRevision?: number }).expectedRevision;
          if (
            (held !== undefined && held !== l.doc.revision) ||
            (l.doc.format === 'specpack/0.4' && held === undefined)
          )
            return fail('Pass the current --expected-revision');
          if (l.doc.status === 'complete') return fail('The spec is complete');
          const qs = l.doc.spec.clarifications ?? (l.doc.spec.clarifications = []);
          if (!['spec', 'design'].includes(opts.phase))
            return fail('Question phase must be spec or design');
          if (qs.some((q) => q.id === opts.id)) return fail(`${opts.id}: already asked`);
          const q: Record<string, unknown> = {
            id: opts.id,
            question: opts.question,
            status: 'open',
            owner: 'human:owner',
          };
          if (opts.kind) q['kind'] = opts.kind;
          if (opts.options) q['options'] = opts.options;
          if (opts.default) q['default'] = opts.default;
          qs.push(q as never);
          if (l.doc.workflow && opts.phase === 'spec')
            l.doc.workflow.phase_questions.spec.push(opts.id);
          l.doc.revision = (l.doc.revision ?? 1) + 1;
          savePack(l.doc, l.path, { at: now() });
          console.log(`asked ${opts.id} (revision ${l.doc.revision})`);
        },
      ),
    );
  add
    .command('decision <packDir>')
    .option('--expected-revision <n>', 'the held revision', Number)
    .requiredOption('--id <id>', 'e.g. D-1')
    .requiredOption('--decision <d>', 'the proposal')
    .requiredOption('--because <b>', 'the reasoning')
    .action(
      lockedAction((packDir: string, opts: { id: string; decision: string; because: string }) => {
        const l = load(packDir);
        if ('refused' in l) return fail(l.refused);
        const held = (opts as unknown as { expectedRevision?: number }).expectedRevision;
        if (
          (held !== undefined && held !== l.doc.revision) ||
          (l.doc.format === 'specpack/0.4' && held === undefined)
        )
          return fail('Pass the current --expected-revision');
        if (l.doc.status === 'complete') return fail('The spec is complete');
        const ds = l.doc.plan.decisions ?? (l.doc.plan.decisions = []);
        if (ds.some((d) => d.id === opts.id)) return fail(`${opts.id}: already proposed`);
        ds.push({
          id: opts.id,
          decision: opts.decision,
          because: opts.because,
          status: 'proposed',
        });
        l.doc.revision = (l.doc.revision ?? 1) + 1;
        savePack(l.doc, l.path, { at: now() });
        console.log(`proposed ${opts.id} (revision ${l.doc.revision}) — acceptance needs a human`);
      }),
    );
  add
    .command('task <packDir>')
    .option('--expected-revision <n>', 'the held revision', Number)
    .requiredOption('--id <id>', 'e.g. T-1')
    .requiredOption('--title <t>', 'one line')
    .requiredOption('--verify-cmd <c>', 'the observable verification command')
    .requiredOption('--verify-expect <e>', 'what success looks like')
    .option('--satisfies <frs...>', 'requirement ids')
    .action(
      lockedAction(
        (
          packDir: string,
          opts: {
            id: string;
            title: string;
            verifyCmd: string;
            verifyExpect: string;
            satisfies?: string[];
          },
        ) => {
          const l = load(packDir);
          if ('refused' in l) return fail(l.refused);
          const held = (opts as unknown as { expectedRevision?: number }).expectedRevision;
          if (
            (held !== undefined && held !== l.doc.revision) ||
            (l.doc.format === 'specpack/0.4' && held === undefined)
          )
            return fail('Pass the current --expected-revision');
          if (l.doc.status === 'complete') return fail('The spec is complete');
          if (l.doc.tasks.some((t) => t.id === opts.id)) return fail(`${opts.id}: already exists`);
          l.doc.tasks.push({
            id: opts.id,
            title: opts.title,
            detail: '',
            status: 'todo',
            phase: 'core',
            satisfies: opts.satisfies ?? [],
            implements: [],
            honors: [],
            accepts: [],
            verify: { cmd: opts.verifyCmd, expect: opts.verifyExpect },
          } as never);
          l.doc.revision = (l.doc.revision ?? 1) + 1;
          savePack(l.doc, l.path, { at: now() });
          console.log(`staged ${opts.id} (revision ${l.doc.revision})`);
        },
      ),
    );

  doCmd
    .command('accept <packDir>')
    .option('--expected-revision <n>', 'the held revision', Number)
    .requiredOption('--decision <id>', 'the decision id')
    .requiredOption('--by <claim>', 'human claim (human:<owner>)')
    .action(
      guarded((l, o) => {
        const opts = o as unknown as { decision: string; by: string; expectedRevision: number };
        if (workflowOwner(l, 'accept', opts)) return;
        const out = acceptDecision(l.doc, opts.decision, opts.by);
        if (!out.ok) return fail(out.message);
        savePack(l.doc, l.path, { at: now() }); // accept bumped the revision
        const qs = out.value.resolved_questions;
        console.log(
          `accepted ${opts.decision} by ${opts.by}${qs.length ? ` — resolved ${qs.join(', ')}` : ''}`,
        );
      }),
    );

  doCmd
    .command('reject <packDir>')
    .option('--expected-revision <n>', 'the held revision', Number)
    .requiredOption('--decision <id>', 'the decision id')
    .requiredOption('--by <claim>', 'human claim (human:<owner>)')
    .requiredOption('--because <text>', 'why')
    .action(
      guarded((l, o) => {
        const opts = o as unknown as {
          decision: string;
          by: string;
          because: string;
          expectedRevision: number;
        };
        if (workflowOwner(l, 'reject', opts)) return;
        const out = rejectDecision(l.doc, opts.decision, opts.by, opts.because);
        if (!out.ok) return fail(out.message);
        savePack(l.doc, l.path, { at: now() }); // reject bumped the revision
        console.log(`rejected ${opts.decision}: ${opts.because} — the questions stay open`);
      }),
    );

  doCmd.command('status <packDir>').action(
    guarded((l) => {
      const d = l.doc;
      if (d.workflow) {
        const gate = workflowGate(d, l.path);
        console.log(
          `workflow: ${gate.phase} — ${gate.reasons.join('; ') || 'approved work may continue'}`,
        );
      }
      const open = (d.spec.clarifications ?? []).filter((q) => q.status === 'open').length;
      console.log(
        `deliverable: ${d.deliverable ?? '«underived»'} · ${d.tasks.length} tasks · revision ${d.revision ?? 1} · ${open} open · ${d.approved_at ? 'approved' : 'not approved'}`,
      );
    }, false),
  );
}

function fail(message: string): void {
  console.error(`REFUSED: ${message}`);
  process.exitCode = 1;
}

/** best-effort browser open: the platform owns the how; failure is quiet */
async function openBrowser(url: string): Promise<void> {
  const { exec } = await import('node:child_process');
  const cmd = process.platform === 'darwin' ? 'open' : 'xdg-open';
  exec(`${cmd} ${JSON.stringify(url)}`, () => void 0);
}
