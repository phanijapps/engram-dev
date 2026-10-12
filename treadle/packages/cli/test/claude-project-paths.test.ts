import { expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadManifest } from '../src/harness/manifest.js';
import { compilePlan } from '../src/harness/plan.js';
import { applyPlan, removeInstall } from '../src/harness/apply.js';
import type { InstallChoices } from '../src/harness/types.js';

const manifestPath = join(import.meta.dirname, '../harness/harness.json');
const { manifest, root: manifestRoot } = loadManifest(manifestPath);
const choicesFor = (root: string, scope: 'project' | 'global' = 'project'): InstallChoices => ({
  agent: 'claude',
  scope,
  root,
  skills: [],
  agents: false,
  hooks: true,
  force: true,
  dryRun: false,
  json: false,
  yes: false,
  remove: false,
});
const apply = (choices: InstallChoices) => {
  const result = applyPlan(
    compilePlan(manifest, manifestRoot, choices),
    choices,
    manifestRoot,
    'fixture',
  );
  expect(result.refused).toEqual([]);
  expect(result.wiringRefused).toEqual([]);
};
const config = (file: string) => JSON.parse(readFileSync(file, 'utf8'));
const execute = (
  hook: { command: string; args: string[] },
  options: Parameters<typeof spawnSync>[2],
) => spawnSync(hook.command, hook.args, options);

function stubRuntime(file: string): void {
  writeFileSync(
    file,
    `const args=process.argv.slice(2);
const cwd=args[args.indexOf('--workspace')+1]??args[2];
console.log(JSON.stringify(args[0]==='project'
?{service:{url:'http://127.0.0.1:1/'},project:{id:'fixture'}}
:{format:'context/1',workspace:cwd,wiki:{root:cwd+'/wiki',available:false,limit:'fixture'},specs:{root:cwd+'/specs',packs:[],selectionRequired:false},guidance:{newSpec:'fixture',continueSpec:'fixture'}}));\n`,
  );
}

it('project hook commands survive relocation and nested cwd while preserving event stdin', () => {
  const base = mkdtempSync(join(tmpdir(), 'claude relative ü '));
  const initial = join(base, 'original');
  const moved = join(base, "moved $ project's path");
  const stub = join(base, 'runtime.cjs');
  mkdirSync(initial);
  stubRuntime(stub);
  try {
    apply(choicesFor(initial));
    const file = join(initial, '.claude/settings.json');
    const original = readFileSync(file, 'utf8');
    expect(original).not.toContain(initial);
    expect(original).not.toContain(process.execPath);
    renameSync(initial, moved);
    const nested = join(moved, 'packages/subdir');
    mkdirSync(nested, { recursive: true });
    for (const cwd of [moved, nested]) {
      for (const event of ['SessionStart', 'UserPromptSubmit']) {
        const hook = config(join(moved, '.claude/settings.json')).hooks[event][0].hooks[0];
        const result = execute(hook, {
          cwd,
          input: JSON.stringify({ cwd, hook_event_name: event, prompt: 'input must survive' }),
          env: { ...process.env, HARNESS_RUNTIME_ENTRY: stub },
          encoding: 'utf8',
          timeout: 10000,
        });
        expect(result.status, result.stderr).toBe(0);
        const output = JSON.parse(result.stdout).hookSpecificOutput;
        expect(output.hookEventName).toBe(event);
        expect(output.additionalContext).toContain(`Workspace: ${cwd}`);
      }
    }
    const guard = config(join(moved, '.claude/settings.json')).hooks.PostToolUse[0].hooks[0];
    for (const cwd of [moved, nested]) {
      const read = execute(guard, {
        cwd,
        input: JSON.stringify({
          hook_event_name: 'PostToolUse',
          tool_name: 'Read',
          tool_input: { file_path: '/repo/wiki/code/x.md' },
        }),
        encoding: 'utf8',
      });
      expect(read.status, read.stderr).toBe(0);
      expect(JSON.parse(read.stdout)).toEqual({});
      const write = execute(guard, {
        cwd,
        input: JSON.stringify({
          hook_event_name: 'PostToolUse',
          tool_name: 'Write',
          tool_input: { file_path: '/repo/wiki/code/x.md' },
        }),
        encoding: 'utf8',
      });
      expect(write.status, write.stderr).toBe(0);
      expect(JSON.parse(write.stdout).systemMessage).toContain('machine-managed');
    }
    // A nearer config is a separate project boundary. Do not fall back to the parent payload.
    mkdirSync(join(nested, '.claude'));
    writeFileSync(join(nested, '.claude/settings.json'), '{}');
    const hook = config(join(moved, '.claude/settings.json')).hooks.SessionStart[0].hooks[0];
    const missing = execute(hook, {
      cwd: nested,
      input: '{}',
      encoding: 'utf8',
    });
    expect(missing.status).not.toBe(0);
    expect(missing.stderr).toContain('claude-context.js');
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
  // About 13 sequential hook runs; under full-suite load they exceed the 5 s default.
}, 30000);

it('upgrades recorded absolute wiring once and preserves foreign hooks on reinstall and removal', () => {
  const project = mkdtempSync(join(tmpdir(), 'claude wiring '));
  const choices = choicesFor(project);
  try {
    const prior = compilePlan(manifest, manifestRoot, choices);
    for (const wiring of prior.wirings) {
      const [event] = wiring.detail.split(' → ');
      wiring.detail = `${event} → ${JSON.stringify({ type: 'command', command: `node ${join(project, '.harness/hooks/claude-context.js')} --event ${event}` })}`;
    }
    applyPlan(prior, choices, manifestRoot, 'fixture');
    const file = join(project, '.claude/settings.json');
    const doc = config(file);
    doc.foreignSetting = 'keep';
    doc.hooks.SessionStart.push({ hooks: [{ type: 'command', command: 'foreign-command' }] });
    writeFileSync(file, JSON.stringify(doc));
    apply(choices);
    apply(choices);
    const updated = config(file);
    expect(updated.foreignSetting).toBe('keep');
    expect(updated.hooks.SessionStart).toHaveLength(2);
    expect(updated.hooks.UserPromptSubmit).toHaveLength(1);
    expect(readFileSync(file, 'utf8')).not.toContain(project);
    removeInstall(choices);
    expect(config(file)).toEqual({
      foreignSetting: 'keep',
      hooks: { SessionStart: [{ hooks: [{ type: 'command', command: 'foreign-command' }] }] },
    });
  } finally {
    rmSync(project, { recursive: true, force: true });
  }
});

it('global hooks retain absolute payload paths and execute from an unrelated cwd', () => {
  const base = mkdtempSync(join(tmpdir(), 'claude global '));
  const home = join(base, 'home');
  const cwd = join(base, 'unrelated');
  const stub = join(base, 'runtime.cjs');
  const oldHome = process.env.HOME;
  const oldProfile = process.env.USERPROFILE;
  mkdirSync(home);
  mkdirSync(cwd);
  stubRuntime(stub);
  process.env.HOME = home;
  process.env.USERPROFILE = home;
  try {
    apply(choicesFor(cwd, 'global'));
    const hook = config(join(home, '.claude/settings.json')).hooks.SessionStart[0].hooks[0];
    expect(hook.args).toContain(join(home, '.harness/hooks/claude-context.js'));
    const result = execute(hook, {
      cwd,
      input: JSON.stringify({ cwd, hook_event_name: 'SessionStart' }),
      env: { ...process.env, HARNESS_RUNTIME_ENTRY: stub },
      encoding: 'utf8',
      timeout: 10000,
    });
    expect(result.status, result.stderr).toBe(0);
    expect(JSON.parse(result.stdout).hookSpecificOutput.additionalContext).toContain(cwd);
  } finally {
    if (oldHome === undefined) delete process.env.HOME;
    else process.env.HOME = oldHome;
    if (oldProfile === undefined) delete process.env.USERPROFILE;
    else process.env.USERPROFILE = oldProfile;
    rmSync(base, { recursive: true, force: true });
  }
});
