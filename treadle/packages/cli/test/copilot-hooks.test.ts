import { brand } from '@treadle/brand';
import { afterEach, expect, it, vi } from 'vitest';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { runHarnessInit } from '../src/commands/init.js';
const hook = fileURLToPath(new URL('../harness/hooks/copilot-context.js', import.meta.url));
const roots: string[] = [];

it('does not claim hook materialization when a custom manifest has no hooks', async () => {
  const f = fixture();
  const manifest = join(f.root, 'manifest.json');
  writeFileSync(manifest, JSON.stringify({ format: 'harness/0.1', components: [], hooks: [] }));
  const log = vi.spyOn(console, 'log').mockImplementation(() => {});
  const code = process.exitCode;
  try {
    await runHarnessInit({
      agent: 'copilot',
      scope: 'project',
      root: f.root,
      manifest,
      hooks: true,
      hooksOnly: true,
      agents: false,
    });
    expect(log.mock.calls.flat().join('\n')).not.toContain('runtime pointer are installed');
    expect(existsSync(join(f.root, '.harness/hooks'))).toBe(false);
    expect(process.exitCode).toBe(code);
  } finally {
    log.mockRestore();
    process.exitCode = code;
  }
});
afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});
function fixture(mode = 'ok') {
  const root = mkdtempSync(join(tmpdir(), 'copilot context ü '));
  roots.push(root);
  const runtime = join(root, 'runtime.mjs'),
    calls = join(root, 'calls.jsonl');
  writeFileSync(
    runtime,
    `import {appendFileSync} from 'node:fs';
const args=process.argv.slice(2);
appendFileSync(${JSON.stringify(calls)},JSON.stringify(args)+'\\n');
if(${JSON.stringify(mode)}==='hang'){setInterval(()=>{},1000);}
else if(${JSON.stringify(mode)}==='invalid'){console.log('not json');}
else if(${JSON.stringify(mode)}==='fail'){process.exit(1);}
else if(args[0]==='project'){console.log(JSON.stringify({service:{url:'http://127.0.0.1:9999/'},project:{id:'test'}}));}
else {console.log(JSON.stringify({format:'context/1',workspace:process.cwd(),wiki:{root:'wiki',available:true,freshness:'fresh',limit:'HEAD-only'},specs:{root:'specs',packs:[]},guidance:{newSpec:'New spec',continueSpec:'Continue spec'}}));}
`,
  );
  const run = (
    event = 'sessionStart',
    input = JSON.stringify({ cwd: root, prompt: 'PRIVATE_PROMPT', sessionId: 'PRIVATE_ID' }),
  ) =>
    spawnSync(process.execPath, [hook, '--event', event], {
      cwd: root,
      input,
      env: { ...process.env, HARNESS_RUNTIME_ENTRY: runtime },
      encoding: 'utf8',
      timeout: 28000,
    });
  return { root, runtime, calls, run };
}
it('returns session context in the Copilot envelope and reconnects on prompts', () => {
  const f = fixture(),
    start = f.run();
  expect(start.status, start.stderr).toBe(0);
  const out = JSON.parse(start.stdout);
  expect(Object.keys(out)).toEqual(['additionalContext']);
  expect(out.additionalContext).toContain(f.root);
  expect(out.additionalContext).toContain('Harness connected:');
  const prompt = f.run('userPromptSubmitted');
  expect(prompt.status, prompt.stderr).toBe(0);
  expect(JSON.parse(prompt.stdout)).toEqual({});
  const calls = readFileSync(f.calls, 'utf8');
  expect(calls.trim().split('\n')).toHaveLength(4);
  expect(calls).not.toMatch(/PRIVATE_PROMPT|PRIVATE_ID/);
  expect(start.stdout + prompt.stdout + start.stderr + prompt.stderr).not.toMatch(
    /PRIVATE_PROMPT|PRIVATE_ID/,
  );
});
it.each(['{', 'null', '[]', JSON.stringify({ prompt: 'PRIVATE_PROMPT' }), ' '.repeat(65537)])(
  'bounds invalid stdin and missing workspace (%#)',
  (input) => {
    const out = fixture().run('sessionStart', input);
    expect(out.status, out.stderr).toBe(0);
    expect(JSON.parse(out.stdout).additionalContext).toMatch(/invalid|workspace is missing/);
    expect(out.stdout + out.stderr).not.toContain('PRIVATE_PROMPT');
    expect(out.stdout.length + out.stderr.length).toBeLessThan(2500);
  },
);
it.each(['invalid', 'fail'])('reports runtime %s failures and recovers after repair', (mode) => {
  const f = fixture(mode),
    failed = f.run();
  expect(failed.status).toBe(0);
  expect(JSON.parse(failed.stdout).additionalContext).toContain('unavailable');
  expect(f.run('userPromptSubmitted').stdout.trim()).toBe('{}');
  const healthy = fixture();
  writeFileSync(f.runtime, readFileSync(healthy.runtime));
  expect(JSON.parse(f.run().stdout).additionalContext).toContain('Harness connected:');
});
it('rejects unsupported events before connecting', () => {
  const out = fixture().run('sessionEnd');
  expect(out.status).toBe(0);
  expect(JSON.parse(out.stdout)).toEqual({});
  expect(out.stderr).toContain('invalid');
});
it('reports unavailable runtime without exposing input', () => {
  const f = fixture();
  rmSync(f.runtime);
  const out = f.run();
  expect(out.status).toBe(0);
  expect(JSON.parse(out.stdout).additionalContext).toContain('unavailable');
  expect(out.stdout + out.stderr).not.toMatch(/PRIVATE_PROMPT|PRIVATE_ID/);
});
it('bounds a stalled runtime and returns recovery guidance', () => {
  const started = Date.now();
  const out = fixture('hang').run();
  expect(out.status, out.stderr).toBe(0);
  expect(JSON.parse(out.stdout).additionalContext).toContain('timed out');
  expect(Date.now() - started).toBeLessThan(27000);
}, 30000);

import { existsSync, mkdirSync, renameSync, symlinkSync } from 'node:fs';
import { loadManifest, defaultManifestPath } from '../src/harness/manifest.js';
import { compilePlan } from '../src/harness/plan.js';
import { applyPlan, removeInstall, statePath } from '../src/harness/apply.js';
import type { InstallChoices } from '../src/harness/types.js';
function installer(root: string, force = false) {
  const loaded = loadManifest(defaultManifestPath());
  const choices: InstallChoices = {
    agent: 'copilot',
    scope: 'project',
    skills: [],
    agents: false,
    hooks: true,
    root,
    force,
    dryRun: false,
    json: false,
    yes: false,
    remove: false,
  };
  const plan = () => compilePlan(loaded.manifest, loaded.root, choices);
  const apply = () => applyPlan(plan(), choices, loaded.root, new Date().toISOString());
  return {
    ...loaded,
    choices,
    plan,
    apply,
    config: join(root, '.github/hooks', brand.binName + '.json'),
  };
}
it('installs exact hook JSON, repeats without duplicates, and removes an owned empty container', () => {
  const f = fixture(),
    i = installer(f.root);
  expect(i.plan().rows.some((r) => r.component === 'copilot-context' && r.mode === 'create')).toBe(
    true,
  );
  expect(existsSync(i.config)).toBe(false); // compilation and dry-run are read-only
  expect(i.apply().wiringRefused).toEqual([]);
  const doc = JSON.parse(readFileSync(i.config, 'utf8'));
  expect(doc.version).toBe(1);
  for (const event of ['sessionStart', 'userPromptSubmitted']) {
    expect(doc.hooks[event]).toHaveLength(1);
    expect(doc.hooks[event][0]).toMatchObject({ type: 'command', cwd: '.', timeoutSec: 60 });
    expect(doc.hooks[event][0].bash).toContain(event);
    expect(doc.hooks[event][0].powershell).toContain(event);
  }
  expect(i.apply().wiringRefused).toEqual([]);
  expect(JSON.parse(readFileSync(i.config, 'utf8')).hooks.sessionStart).toHaveLength(1);
  if (process.platform !== 'win32') {
    const out = spawnSync('bash', ['-c', doc.hooks.sessionStart[0].bash], {
      cwd: f.root,
      input: JSON.stringify({ cwd: f.root }),
      env: { ...process.env, HARNESS_RUNTIME_ENTRY: f.runtime },
      encoding: 'utf8',
    });
    expect(out.status, out.stderr).toBe(0);
    expect(JSON.parse(out.stdout).additionalContext).toContain(f.root);
  }
  removeInstall(i.choices);
  expect(existsSync(i.config)).toBe(false);
  expect(existsSync(statePath(i.choices))).toBe(false);
});
it.skipIf(process.platform === 'win32')(
  'explains recovery instead of crashing when committed wiring outlives its payload',
  () => {
    const f = fixture(),
      i = installer(f.root);
    expect(i.apply().wiringRefused).toEqual([]);
    const doc = JSON.parse(readFileSync(i.config, 'utf8'));
    rmSync(join(f.root, '.harness/hooks/copilot-context.js'));
    for (const event of ['sessionStart', 'userPromptSubmitted']) {
      const out = spawnSync('bash', ['-c', doc.hooks[event][0].bash], {
        cwd: f.root,
        input: JSON.stringify({ cwd: f.root }),
        env: { ...process.env, HARNESS_RUNTIME_ENTRY: f.runtime },
        encoding: 'utf8',
      });
      expect(out.status, out.stderr).toBe(0);
      expect(JSON.parse(out.stdout)).toEqual({});
      expect(out.stderr).toContain(
        `.harness/hooks/copilot-context.js is missing. Run: ${brand.binName} init harness --agent copilot --hooks-only`,
      );
      expect(out.stderr).not.toContain('at Module');
    }
  },
);
it('preserves foreign entries, metadata, sibling files and a pre-existing empty container', () => {
  const f = fixture(),
    i = installer(f.root);
  mkdirSync(join(f.root, '.github/hooks'), { recursive: true });
  const foreign = { type: 'command', bash: 'echo foreign' };
  writeFileSync(
    i.config,
    JSON.stringify({
      version: 1,
      owner: 'foreign',
      hooks: { sessionStart: [foreign], errorOccurred: [foreign] },
    }),
  );
  const sibling = join(f.root, '.github/hooks/foreign.json');
  writeFileSync(sibling, 'FOREIGN_BYTES');
  i.apply();
  i.apply();
  removeInstall(i.choices);
  expect(JSON.parse(readFileSync(i.config, 'utf8'))).toEqual({
    version: 1,
    owner: 'foreign',
    hooks: { sessionStart: [foreign], errorOccurred: [foreign] },
  });
  expect(readFileSync(sibling, 'utf8')).toBe('FOREIGN_BYTES');
  writeFileSync(i.config, JSON.stringify({ version: 1, hooks: {} }));
  i.apply();
  removeInstall(i.choices);
  expect(JSON.parse(readFileSync(i.config, 'utf8'))).toEqual({ version: 1, hooks: {} });
});
it('does not take ownership of identical foreign definitions', () => {
  const f = fixture(),
    i = installer(f.root);
  i.apply();
  const content = readFileSync(i.config, 'utf8');
  removeInstall(i.choices);
  mkdirSync(join(f.root, '.github/hooks'), { recursive: true });
  writeFileSync(i.config, content);
  i.apply();
  removeInstall(i.choices);
  expect(readFileSync(i.config, 'utf8')).toBe(content);
});
it('upgrades only recorded definitions and preserves edited foreign entries on removal', () => {
  const f = fixture(),
    i = installer(f.root);
  i.apply();
  const first = JSON.parse(readFileSync(i.config, 'utf8')).hooks.sessionStart[0];
  const row = i.manifest.hooks.find((h) => h.id === 'copilot-context')!;
  const wiring = row.wiring.copilot as { command: string }[];
  for (const w of wiring) w.command += ' --version 2';
  i.apply();
  const doc = JSON.parse(readFileSync(i.config, 'utf8'));
  expect(doc.hooks.sessionStart).toHaveLength(1);
  expect(doc.hooks.sessionStart[0]).not.toEqual(first);
  doc.hooks.sessionStart[0].env = { USER_ADDED: 'keep' };
  writeFileSync(i.config, JSON.stringify(doc));
  removeInstall(i.choices);
  expect(JSON.parse(readFileSync(i.config, 'utf8')).hooks.sessionStart[0].env).toEqual({
    USER_ADDED: 'keep',
  });
});
it.each([
  '{',
  'null',
  '[]',
  '{"version":2,"hooks":{}}',
  '{"version":1,"hooks":[]}',
  '{"version":1,"hooks":{"sessionStart":{}}}',
])('refuses malformed configuration before any payload writes even under force (%#)', (content) => {
  const f = fixture(),
    i = installer(f.root, true);
  mkdirSync(join(f.root, '.github/hooks'), { recursive: true });
  writeFileSync(i.config, content);
  expect(i.plan().rows.some((r) => r.mode === 'refuse')).toBe(true);
  expect(i.apply().written).toBe(0);
  expect(existsSync(join(f.root, '.harness'))).toBe(false);
  expect(readFileSync(i.config, 'utf8')).toBe(content);
});
it('preflights payload and runtime pointer conflicts before changing hook configuration', () => {
  const f = fixture(),
    i = installer(f.root);
  mkdirSync(join(f.root, '.harness/hooks'), { recursive: true });
  writeFileSync(join(f.root, '.harness/hooks/copilot-context.js'), 'foreign payload');
  expect(i.apply().written).toBe(0);
  expect(existsSync(i.config)).toBe(false);
  rmSync(join(f.root, '.harness/hooks/copilot-context.js'));
  writeFileSync(join(f.root, '.harness/hooks/runtime.json'), 'foreign pointer');
  expect(i.apply().wiringRefused).toContain(
    'Runtime pointer differs; inspect it before using --force',
  );
  expect(existsSync(i.config)).toBe(false);
});
it.skipIf(process.platform === 'win32')(
  'emitted commands survive checkout relocation and spaces',
  () => {
    const f = fixture(),
      i = installer(f.root);
    i.apply();
    const moved = f.root + ' relocated';
    renameSync(f.root, moved);
    roots.push(moved);
    const runtime = join(moved, 'runtime.mjs');
    writeFileSync(runtime, readFileSync(runtime, 'utf8').replaceAll(f.root, moved));
    const doc = JSON.parse(
      readFileSync(join(moved, '.github/hooks', brand.binName + '.json'), 'utf8'),
    );
    const out = spawnSync('bash', ['-c', doc.hooks.sessionStart[0].bash], {
      cwd: moved,
      input: JSON.stringify({ cwd: moved }),
      env: { ...process.env, HARNESS_RUNTIME_ENTRY: runtime },
      encoding: 'utf8',
    });
    expect(out.status, out.stderr).toBe(0);
    expect(JSON.parse(out.stdout).additionalContext).toContain(moved);
  },
);

it.each([false, true])(
  'repairs a cold clone with committed config and no local state (hooksOnly=%s)',
  (hooksOnly) => {
    const f = fixture();
    const i = installer(f.root);
    i.choices.projectGuide = false;
    const packageFile = join(f.root, 'package.json');
    const lockFile = join(f.root, 'pnpm-lock.yaml');
    const guideFile = join(f.root, 'AGENTS.md');
    writeFileSync(
      packageFile,
      JSON.stringify({
        name: 'application',
        packageManager: 'pnpm@9.15.9',
        scripts: { postinstall: 'node application-install-trap.mjs' },
      }),
    );
    writeFileSync(lockFile, 'application lock bytes\r\n');
    writeFileSync(guideFile, 'Original owner rules\r\n');
    writeFileSync(
      join(f.root, 'application-install-trap.mjs'),
      "throw Error('Application scripts must not run during init');",
    );
    expect(i.apply().wiringRefused).toEqual([]);
    const config = JSON.parse(readFileSync(i.config, 'utf8'));
    config.ownerMetadata = 'retain';
    config.hooks.errorOccurred = [{ type: 'command', bash: 'echo foreign' }];
    writeFileSync(i.config, JSON.stringify(config, null, 2) + '\n');
    const sibling = join(f.root, '.github/hooks/foreign.json');
    writeFileSync(sibling, 'foreign sibling bytes');
    rmSync(join(f.root, '.harness'), { recursive: true, force: true });
    expect(existsSync(statePath(i.choices))).toBe(false);
    const before = [packageFile, lockFile, guideFile, i.config, sibling].map((path) =>
      readFileSync(path),
    );
    i.choices.skills = hooksOnly ? [] : 'all';
    i.choices.agents = !hooksOnly;
    i.choices.projectGuide = !hooksOnly;
    i.plan(); // A preview must not silently restore local payloads or alter target bytes.
    expect(existsSync(join(f.root, '.harness'))).toBe(false);
    expect(
      [packageFile, lockFile, guideFile, i.config, sibling].map((path) => readFileSync(path)),
    ).toEqual(before);
    const applied = i.apply();
    expect(applied.refused).toEqual([]);
    expect(applied.wiringRefused).toEqual([]);
    for (const file of ['copilot-context.js', 'codex-context.js', 'runtime.json']) {
      expect(existsSync(join(f.root, '.harness/hooks', file))).toBe(true);
    }
    const afterConfig = JSON.parse(readFileSync(i.config, 'utf8'));
    expect(afterConfig.ownerMetadata).toBe('retain');
    expect(afterConfig.hooks.errorOccurred).toEqual(config.hooks.errorOccurred);
    expect(readFileSync(sibling)).toEqual(before[4]);
    expect([packageFile, lockFile].map((path) => readFileSync(path))).toEqual(before.slice(0, 2));
    if (hooksOnly) {
      expect(readFileSync(guideFile)).toEqual(before[2]);
      expect(existsSync(join(f.root, 'AGENTS.backup.md'))).toBe(false);
      expect(existsSync(join(f.root, '.github/skills'))).toBe(false);
    } else {
      expect(readFileSync(join(f.root, 'AGENTS.backup.md'))).toEqual(before[2]);
      expect(readFileSync(guideFile, 'utf8')).toContain('AGENTS.backup.md');
      expect(existsSync(join(f.root, '.github/skills/search-kb/SKILL.md'))).toBe(true);
      expect(existsSync(join(f.root, '.github/agents/red-forman.md'))).toBe(true);
    }
    // Execute the copied adapter against the controlled runtime on every native OS.
    const callback = spawnSync(
      process.execPath,
      [join(f.root, '.harness/hooks/copilot-context.js'), '--event', 'sessionStart'],
      {
        cwd: f.root,
        input: JSON.stringify({ cwd: f.root }),
        env: { ...process.env, HARNESS_RUNTIME_ENTRY: f.runtime },
        encoding: 'utf8',
        timeout: 28000,
      },
    );
    expect(callback.status, callback.stderr).toBe(0);
    expect(JSON.parse(callback.stdout).additionalContext).toContain(f.root);
    expect(readFileSync(f.calls, 'utf8')).not.toContain('postinstall');
  },
);

it('refuses removal when hook configuration became malformed, preserving installed payloads', () => {
  const f = fixture(),
    i = installer(f.root);
  i.apply();
  writeFileSync(i.config, '{');
  expect(() => removeInstall(i.choices)).toThrow(/repair it before removal/);
  expect(readFileSync(i.config, 'utf8')).toBe('{');
  expect(existsSync(join(f.root, '.harness/hooks/copilot-context.js'))).toBe(true);
  expect(existsSync(statePath(i.choices))).toBe(true);
});
it.skipIf(process.platform === 'win32')(
  'refuses symlinked configuration without changing its target',
  () => {
    const f = fixture(),
      i = installer(f.root, true);
    mkdirSync(join(f.root, '.github/hooks'), { recursive: true });
    const target = join(f.root, 'foreign.json');
    writeFileSync(target, '{"version":1,"hooks":{}}');
    symlinkSync(target, i.config);
    expect(i.apply().written).toBe(0);
    expect(readFileSync(target, 'utf8')).toBe('{"version":1,"hooks":{}}');
  },
);

it('reports pointer conflicts in dry-run with matching force semantics', () => {
  const f = fixture(),
    i = installer(f.root);
  i.apply();
  const pointer = join(f.root, '.harness/hooks/runtime.json');
  writeFileSync(pointer, 'FOREIGN_POINTER');
  const row = i.plan().rows.find((r) => r.component === 'copilot-runtime-pointer');
  expect(row?.mode).toBe('refuse');
  expect(row?.note).toContain('differs');
  expect(i.apply().written).toBe(0);
  expect(readFileSync(pointer, 'utf8')).toBe('FOREIGN_POINTER');
  const forced = installer(f.root, true);
  expect(forced.plan().rows.some((r) => r.mode === 'refuse')).toBe(false);
  expect(forced.apply().wiringRefused).toEqual([]);
  expect(JSON.parse(readFileSync(pointer, 'utf8')).format).toBe('runtime-pointer/1');
});
it.skipIf(process.platform === 'win32')(
  'refuses dangling configuration and pointer links during preflight and removal',
  () => {
    const f = fixture(),
      i = installer(f.root, true);
    i.apply();
    rmSync(i.config);
    symlinkSync(join(f.root, 'missing-target'), i.config);
    expect(() => removeInstall(i.choices)).toThrow(/repair it before removal/);
    expect(existsSync(statePath(i.choices))).toBe(true);
    expect(existsSync(join(f.root, '.harness/hooks/copilot-context.js'))).toBe(true);
    rmSync(i.config);
    const pointer = join(f.root, '.harness/hooks/runtime.json');
    rmSync(pointer);
    symlinkSync(join(f.root, 'missing-pointer'), pointer);
    expect(
      i.plan().rows.some((r) => r.component === 'copilot-runtime-pointer' && r.mode === 'refuse'),
    ).toBe(true);
    expect(i.apply().written).toBe(0);
  },
);
