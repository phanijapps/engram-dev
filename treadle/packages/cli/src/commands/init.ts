/** `init harness` — the installer command. Flags are the engine (D-3);
 *  the interactive skin (T-2) only produces flags and re-enters here.
 *  Exit codes: 0 ok · 2 usage (with the remediation command) · 3 refuse. */
import type { Command } from 'commander';
import { brand } from '@treadle/brand';
import { defaultManifestPath, loadManifest } from '../harness/manifest.js';
import { compilePlan, planSummary } from '../harness/plan.js';
import { applyPlan, removeInstall } from '../harness/apply.js';
import {
  SURFACES,
  type InstallChoices,
  type Scope,
  type Surface,
  UsageError,
} from '../harness/types.js';

interface Flags {
  agent?: string;
  scope?: string;
  skills?: string[];
  agents?: boolean;
  hooks?: boolean;
  root?: string;
  manifest?: string;
  dryRun?: boolean;
  json?: boolean;
  yes?: boolean;
  force?: boolean;
  remove?: boolean;
}

export function registerInit(initCmd: Command): void {
  initCmd
    .command('harness')
    .description('install the harness (skills, agents, hooks) for your coding agent')
    .option('--agent <a>', 'pi | claude | codex | copilot')
    .option('--scope <s>', 'project | global', 'project')
    .option('--skills <ids...>', 'skill ids to install (default: all)')
    .option('--no-agents', 'skip agent components')
    .option('--no-hooks', 'skip hooks')
    .option('--root <dir>', 'project root (default: cwd)')
    .option('--manifest <path>', 'manifest override (default: the shipped harness.json)')
    .option('--dry-run', 'print the plan; write nothing')
    .option('--json', 'emit the machine plan')
    .option('--yes', 'confirm writes outside the repo (global scope)')
    .option('--force', 'overwrite differing destinations (also removes confirmed leftovers)')
    .option('--remove', 'delete exactly what the recorded install wrote')
    .action((f: Flags) => runHarnessInit(f));
}

export function runHarnessInit(f: Flags): void {
  let choices: InstallChoices;
  try {
    choices = choicesFromFlags(f);
  } catch (e) {
    if (e instanceof UsageError) {
      console.error(`error: ${e.message}`);
      console.error(`fix:   ${e.remediation}`);
      process.exitCode = 2;
      return;
    }
    throw e;
  }

  if (choices.remove) {
    try {
      const r = removeInstall(choices);
      console.log(
        `removed ${r.removed.length} file(s); unwired ${r.unwired.length} wiring(s) — exactly the recorded install`,
      );
    } catch (e) {
      console.error(`error: ${(e as Error).message}`);
      process.exitCode = 1;
    }
    return;
  }

  const { manifest, root: manifestRoot } = (() => {
    try {
      return loadManifest(choices.manifestPath ?? defaultManifestPath());
    } catch (e) {
      console.error(`error: ${(e as Error).message}`);
      process.exitCode = 1;
      return process.exit(1);
    }
  })();

  const plan = compilePlan(manifest, manifestRoot, choices);
  const summary = planSummary(plan);

  if (choices.json) {
    console.log(JSON.stringify({ plan: plan.rows, wirings: plan.wirings, summary }, null, 2));
    return;
  }
  if (choices.dryRun) {
    printPlan(plan.rows, plan.wirings);
    return;
  }
  if (summary.refuse > 0) {
    printPlan(
      plan.rows.filter((r) => r.mode === 'refuse'),
      [],
    );
    console.error(
      `\nrefused: ${summary.refuse} row(s) differ and --force is not set — nothing was written`,
    );
    process.exitCode = 3;
    return;
  }
  const at = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  const result = applyPlan(plan, choices, manifestRoot, at);
  for (const note of result.wiringNotes) console.log(note);
  console.log(
    `installed: ${result.written} file(s) written, ${summary.same} same, ${summary.skip} skipped — plan recorded`,
  );
}

function choicesFromFlags(f: Flags): InstallChoices {
  const missing: string[] = [];
  if (!f.agent) missing.push('--agent <pi|claude|codex|copilot>');
  const agent = f.agent as Surface | undefined;
  if (agent && !SURFACES.includes(agent)) {
    throw new UsageError(
      `unknown agent "${agent}"`,
      `${brand.binName} init harness --agent <pi|claude|codex|copilot>`,
    );
  }
  const scope = (f.scope ?? 'project') as Scope;
  if (scope !== 'project' && scope !== 'global') {
    throw new UsageError(
      `unknown scope "${scope}"`,
      `${brand.binName} init harness --scope <project|global>`,
    );
  }
  if (missing.length > 0) {
    const remediation = `${brand.binName} init harness --agent pi --scope project`;
    throw new UsageError(
      `${missing.join(', ')} missing${isTTY() ? ' (interactive flow: pick with arrow keys — the TUI)' : ' and no TTY'}`,
      remediation,
    );
  }
  if (scope === 'global' && !f.yes && !f.dryRun && !f.json) {
    throw new UsageError(
      'global scope writes outside the repo — print the plan first (--dry-run), then confirm with --yes',
      `${brand.binName} init harness --agent pi --scope global --dry-run   # see absolute paths\n  ${brand.binName} init harness --agent pi --scope global --yes        # write them`,
    );
  }
  return {
    agent: agent!,
    scope,
    skills: f.skills && f.skills.length > 0 ? f.skills : 'all',
    agents: f.agents !== false,
    hooks: f.hooks !== false,
    root: f.root ?? process.cwd(),
    manifestPath: f.manifest ?? undefined,
    force: f.force === true,
    dryRun: f.dryRun === true,
    json: f.json === true,
    yes: f.yes === true,
    remove: f.remove === true,
  };
}

function isTTY(): boolean {
  return Boolean(process.stdin.isTTY && process.stdout.isTTY);
}

function printPlan(
  rows: {
    component: string;
    kind: string;
    surface: string;
    destination: string;
    mode: string;
    note?: string;
  }[],
  wirings: { target: string; detail: string }[],
): void {
  if (rows.length === 0) console.log('(no rows)');
  for (const r of rows) {
    const note = r.note ? `  — ${r.note}` : '';
    console.log(
      `${r.mode.padEnd(7)} ${r.kind.padEnd(6)} ${r.component.padEnd(18)} ${r.destination || '(none)'}${note}`,
    );
  }
  for (const w of wirings) console.log(`wire    ${w.target}  — ${w.detail}`);
}
