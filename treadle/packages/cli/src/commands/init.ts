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
import { promptForMissing } from '../harness/skin.js';
import { connectWorkspace } from './project.js';
import { resolve } from 'node:path';

export interface Flags {
  agent?: string;
  scope?: string;
  skills?: string[];
  agents?: boolean;
  hooks?: boolean;
  hooksOnly?: boolean;
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
    .option('--hooks-only', 'install lifecycle hooks without copying skills or agents')
    .option('--root <dir>', 'project root (default: cwd)')
    .option('--manifest <path>', 'manifest override (default: the shipped harness.json)')
    .option('--dry-run', 'print the plan; write nothing')
    .option('--json', 'emit the machine plan')
    .option('--yes', 'confirm writes outside the repo (global scope)')
    .option('--force', 'overwrite differing destinations (also removes confirmed leftovers)')
    .option('--remove', 'delete exactly what the recorded install wrote')
    .action((f: Flags) => runHarnessInit(f));
}

export async function runHarnessInit(rawFlags: Flags): Promise<void> {
  let f = rawFlags;
  if (
    isTTY() &&
    (f.agent === undefined ||
      f.scope === undefined ||
      f.hooks === undefined ||
      f.agents === undefined)
  ) {
    const out = await promptForMissing(f, true);
    if (out === 'cancelled') {
      process.exitCode = 1;
      return;
    }
    f = out;
  }
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
    if (summary.refuse > 0) process.exitCode = 3; // R2 #15: scripted consumers see would-refuse
    return;
  }
  if (choices.dryRun) {
    printPlan(plan.rows, plan.wirings);
    if (summary.refuse > 0) process.exitCode = 3; // R2 #15
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
  if (result.refused.length || result.wiringRefused.length) {
    for (const reason of result.wiringRefused) console.error(`refused: ${reason}`);
    console.error(
      'Files may have been copied, but activation wiring failed; repair and retry. No project was enrolled.',
    );
    process.exitCode = 3;
    return;
  }
  if (choices.scope === 'project' && choices.hooks && choices.agent !== 'copilot') {
    try {
      const connection = await connectWorkspace(choices.root);
      console.log(
        `project enrolled; runtime running: ${(connection['service'] as { url: string }).url}`,
      );
      console.log(
        'Host activation is pending until you enable/reload the integration and, for Codex, review and trust its hook definition.',
      );
    } catch (e) {
      console.error(
        `Installed files; project enrollment failed: ${(e as Error).message}. Retry with project connect <workspace>.`,
      );
      process.exitCode = 1;
      return;
    }
  }
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
  if (agent === 'copilot' && scope === 'global') {
    throw new UsageError(
      'copilot has no global scope — project only (the honest no)',
      `${brand.binName} init harness --agent copilot --scope project`,
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
    skills: f.hooksOnly ? [] : f.skills && f.skills.length > 0 ? f.skills : 'all',
    agents: !f.hooksOnly && f.agents !== false,
    hooks: f.hooks !== false,
    root: resolve(f.root ?? process.cwd()), // R2 #9: resolved once — relative --root must not leak into user-level configs
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
