import { afterEach, expect, it, vi } from 'vitest';
import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
  renameSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { defaultManifestPath } from '../src/harness/manifest.js';
import { compilePlan, planSummary } from '../src/harness/plan.js';
import { applyPlan, removeInstall, statePath } from '../src/harness/apply.js';
import { planProjectGuide } from '../src/harness/agents-guide.js';
import type { HarnessManifest, InstallChoices } from '../src/harness/types.js';

vi.mock('node:fs', async (original) => {
  const fs = await original<typeof import('node:fs')>();
  return { ...fs, renameSync: vi.fn(fs.renameSync), writeFileSync: vi.fn(fs.writeFileSync) };
});
const roots: string[] = [];
afterEach(() => {
  vi.mocked(renameSync).mockReset();
  vi.mocked(writeFileSync).mockReset();
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});
const template = join(dirname(defaultManifestPath()), 'templates/AGENTS.md');
const empty: HarnessManifest = { format: 'harness/0.1', components: [], hooks: [] };
function fixture(over: Partial<InstallChoices> = {}) {
  const root = mkdtempSync(join(tmpdir(), 'agents-guide-'));
  roots.push(root);
  const choices: InstallChoices = {
    root,
    agent: 'copilot',
    scope: 'project',
    skills: [],
    agents: false,
    hooks: false,
    force: false,
    dryRun: false,
    json: false,
    yes: false,
    remove: false,
    ...over,
  };
  const plan = () => compilePlan(empty, dirname(defaultManifestPath()), choices);
  const apply = () =>
    applyPlan(plan(), choices, dirname(defaultManifestPath()), new Date().toISOString());
  return {
    root,
    choices,
    plan,
    apply,
    guide: join(root, 'AGENTS.md'),
    backup: join(root, 'AGENTS.backup.md'),
  };
}
it('creates a guide without a synthetic backup; records it outside removable outputs', () => {
  const f = fixture();
  const p = f.plan();
  expect(p.guide?.mode).toBe('create');
  expect(readdirSync(f.root)).toEqual([]);
  expect(f.apply().wiringRefused).toEqual([]);
  expect(existsSync(f.guide)).toBe(true);
  expect(existsSync(f.backup)).toBe(false);
  const state = JSON.parse(readFileSync(statePath(f.choices), 'utf8'));
  expect(state.written).not.toContain(f.guide);
  expect(state.projectGuide.path).toBe(f.guide);
  expect(readFileSync(f.guide, 'utf8')).toContain('No wiki/ directory was observed');
});
it('backs up exact arbitrary bytes, preserves project rules and is unchanged across repeat/host installs', () => {
  const f = fixture();
  const prior = Buffer.from('# Rules\r\nMoney is cents.\r\n日本語\r\n');
  writeFileSync(f.guide, prior);
  expect(f.plan().guide?.backupRequired).toBe(true);
  expect(f.apply().wiringRefused).toEqual([]);
  expect(readFileSync(f.backup)).toEqual(prior);
  const generated = readFileSync(f.guide);
  expect(generated.toString()).toContain('Read `AGENTS.backup.md`');
  for (const agent of ['copilot', 'claude', 'codex', 'pi'] as const) {
    f.choices.agent = agent;
    const p = f.plan();
    expect(p.guide?.mode).toBe('same');
    expect(f.apply().wiringRefused).toEqual([]);
    expect(readFileSync(f.backup)).toEqual(prior);
    expect(readFileSync(f.guide)).toEqual(generated);
  }
});
it('leaves a new guide unchanged on repeat without creating a backup', () => {
  const f = fixture();
  f.apply();
  const bytes = readFileSync(f.guide);
  expect(f.plan().guide?.mode).toBe('same');
  f.apply();
  expect(readFileSync(f.guide)).toEqual(bytes);
  expect(existsSync(f.backup)).toBe(false);
});
it('reuses an identical prior backup for retry, but refuses a differing backup even under force', () => {
  const f = fixture();
  writeFileSync(f.guide, 'Original.\n');
  writeFileSync(f.backup, 'Original.\n');
  expect(f.plan().guide?.backupRequired).toBe(false);
  expect(f.apply().wiringRefused).toEqual([]);
  writeFileSync(f.guide, 'Edited.\n');
  f.choices.force = true;
  expect(f.plan().guide?.mode).toBe('refuse');
  expect(planSummary(f.plan()).refuse).toBe(1);
  expect(f.apply().written).toBe(0);
  expect(readFileSync(f.guide, 'utf8')).toBe('Edited.\n');
  expect(readFileSync(f.backup, 'utf8')).toBe('Original.\n');
});
it('refuses target/backup directories and symlinks including dangling symlinks', () => {
  for (const name of ['AGENTS.md', 'AGENTS.backup.md'])
    for (const kind of ['directory', 'link', 'dangling']) {
      const f = fixture({ force: true });
      const path = join(f.root, name);
      if (kind === 'directory') mkdirSync(path);
      else {
        const target = join(f.root, 'foreign');
        if (kind === 'link') mkdirSync(target);
        // Directory links use Windows junctions, which do not require Developer Mode.
        symlinkSync(target, path, process.platform === 'win32' ? 'junction' : 'dir');
      }
      expect(f.plan().guide?.mode).toBe('refuse');
      expect(f.apply().written).toBe(0);
      expect(f.apply().wiringRefused[0]).toMatch(/Unsafe guide path/);
    }
});
it('preflights guide, backup, manifest and directory drift before installing any components', () => {
  for (const mutation of ['guide', 'backup', 'manifest', 'directories']) {
    const f = fixture();
    writeFileSync(f.guide, 'Original.\n');
    writeFileSync(
      join(f.root, 'package.json'),
      '{"packageManager":"pnpm@9","scripts":{"check":"node check.js"}}',
    );
    const p = f.plan();
    if (mutation === 'guide') writeFileSync(f.guide, 'New edit.\n');
    if (mutation === 'backup') writeFileSync(f.backup, 'Foreign.\n');
    if (mutation === 'manifest') writeFileSync(join(f.root, 'package.json'), '{}');
    if (mutation === 'directories') mkdirSync(join(f.root, 'new-source'));
    const result = applyPlan(
      p,
      f.choices,
      dirname(defaultManifestPath()),
      new Date().toISOString(),
    );
    expect(result.written).toBe(0);
    expect(result.wiringRefused[0]).toContain('changed after planning');
    expect(existsSync(statePath(f.choices))).toBe(false);
  }
});
it('retains original and complete backup when atomic replacement fails; a fresh plan can retry', () => {
  const f = fixture();
  writeFileSync(f.guide, 'Original.\r\n');
  vi.mocked(renameSync).mockImplementationOnce(() => {
    throw Error('simulated publication failure');
  });
  const result = f.apply();
  expect(result.wiringRefused[0]).toContain('simulated publication failure');
  expect(readFileSync(f.guide)).toEqual(readFileSync(f.backup));
  expect(readdirSync(f.root).some((p) => p.endsWith('.tmp'))).toBe(false);
  expect(f.apply().wiringRefused).toEqual([]);
  expect(readFileSync(f.backup, 'utf8')).toBe('Original.\r\n');
});
it('preserves both root documents and user edits during remove', () => {
  const f = fixture();
  writeFileSync(f.guide, 'Original.\n');
  f.apply();
  writeFileSync(f.guide, 'User changed generated instructions.\n');
  const state = JSON.parse(readFileSync(statePath(f.choices), 'utf8'));
  state.written.push(f.guide, f.backup); // Older or edited ownership data must not arm root-document deletion.
  writeFileSync(statePath(f.choices), JSON.stringify(state));
  const result = removeInstall(f.choices);
  expect(result.removed).not.toContain(f.guide);
  expect(readFileSync(f.guide, 'utf8')).toBe('User changed generated instructions.\n');
  expect(readFileSync(f.backup, 'utf8')).toBe('Original.\n');
});
it('renders observed root/nested commands and wiki usage without executing scripts or guessing conventions', () => {
  const f = fixture();
  mkdirSync(join(f.root, 'workspace'));
  mkdirSync(join(f.root, 'wiki'));
  writeFileSync(join(f.root, 'wiki/index.md'), '# Knowledge\n');
  writeFileSync(
    join(f.root, 'workspace/package.json'),
    JSON.stringify({
      name: 'workspace',
      packageManager: 'pnpm@9.15.9',
      scripts: { check: 'touch PWNED', test: 'touch ALSO_PWNED' },
    }),
  );
  const p = f.plan();
  expect(p.guide?.content).toContain('From `workspace`');
  expect(p.guide?.content).toContain('pnpm run check');
  expect(p.guide?.content).toContain('know search wiki');
  expect(existsSync(join(f.root, 'PWNED'))).toBe(false);
  expect(p.guide?.content).not.toContain('touch PWNED');
  expect(p.guide?.content.split('\n').length).toBeLessThan(150);
  writeFileSync(join(f.root, 'package.json'), '{invalid');
  expect(f.plan().guide?.mode).toBe('create'); // Existing valid nested manifest remains useful.
});
it('does not create project instructions for global or opt-out installs', () => {
  for (const over of [
    { scope: 'global' as const, agent: 'codex' as const },
    { projectGuide: false },
  ]) {
    const f = fixture(over);
    expect(f.plan().guide).toBeUndefined();
    expect(existsSync(f.guide)).toBe(false);
  }
});
it('includes a truthful read-only CLI guide preview, and respects hooks-only/opt-out', () => {
  const f = fixture();
  writeFileSync(f.guide, 'Original.\n');
  const manifest = join(f.root, 'manifest.json');
  writeFileSync(manifest, JSON.stringify(empty));
  const cli = join(import.meta.dirname, '../dist/src/main.js');
  const base = [
    cli,
    'init',
    'harness',
    '--agent',
    'copilot',
    '--root',
    f.root,
    '--manifest',
    manifest,
    '--no-hooks',
  ];
  const preview = spawnSync(process.execPath, [...base, '--json'], { encoding: 'utf8' });
  expect(preview.status, preview.stderr).toBe(0);
  expect(JSON.parse(preview.stdout).guide.mode).toBe('replace');
  expect(existsSync(f.backup)).toBe(false);
  expect(readFileSync(f.guide, 'utf8')).toBe('Original.\n');
  for (const flag of ['--hooks-only', '--no-project-guide']) {
    const out = spawnSync(process.execPath, [...base, flag], { encoding: 'utf8' });
    expect(out.status, out.stderr).toBe(0);
    expect(readFileSync(f.guide, 'utf8')).toBe('Original.\n');
    expect(existsSync(f.backup)).toBe(false);
  }
  writeFileSync(f.backup, 'Existing backup.\n');
  const refused = spawnSync(process.execPath, [...base, '--force', '--dry-run'], {
    encoding: 'utf8',
  });
  expect(refused.status).toBe(3);
  expect(refused.stdout).toContain('already differs');
});
it('reports an unavailable template as a refusal without writing instructions', () => {
  const f = fixture();
  expect(planProjectGuide(f.root, join(f.root, 'absent-template')).mode).toBe('refuse');
  expect(readdirSync(f.root)).toEqual([]);
  expect(existsSync(template)).toBe(true);
});

it('refuses renderer input drift during component copying before any guide or backup publication', async () => {
  const f = fixture();
  f.choices.skills = ['alpha'];
  mkdirSync(join(f.root, 'payload'));
  writeFileSync(join(f.root, 'payload/SKILL.md'), 'Alpha.\n');
  const packagePath = join(f.root, 'package.json');
  writeFileSync(packagePath, '{"packageManager":"pnpm@9","scripts":{"check":"node check.js"}}');
  writeFileSync(f.guide, 'Original.\n');
  const manifest: HarnessManifest = {
    ...empty,
    components: [
      { id: 'alpha', kind: 'skill', source: 'payload', dest: { copilot: '.github/skills/alpha' } },
    ],
  };
  const plan = compilePlan(manifest, f.root, f.choices);
  const actual = await vi.importActual<typeof import('node:fs')>('node:fs');
  vi.mocked(writeFileSync).mockImplementation((path, data, options) => {
    actual.writeFileSync(path, data, options);
    if (path === join(f.root, '.github/skills/alpha/SKILL.md')) {
      actual.writeFileSync(
        packagePath,
        '{"packageManager":"npm@10","scripts":{"test":"node test.js"}}',
      );
    }
  });
  const result = applyPlan(plan, f.choices, f.root, new Date().toISOString());
  expect(result.wiringRefused[0]).toContain('changed after planning');
  expect(readFileSync(f.guide, 'utf8')).toBe('Original.\n');
  expect(existsSync(f.backup)).toBe(false);
});

it('keeps actual removal --dry-run and --json previews read-only, including the install record', () => {
  const f = fixture();
  writeFileSync(f.guide, 'Original.\n');
  const source = join(f.root, 'payload');
  mkdirSync(source);
  writeFileSync(join(source, 'SKILL.md'), 'Alpha.\n');
  const manifest = join(f.root, 'manifest.json');
  writeFileSync(
    manifest,
    JSON.stringify({
      ...empty,
      components: [
        {
          id: 'alpha',
          kind: 'skill',
          source: 'payload',
          dest: { copilot: '.github/skills/alpha' },
        },
      ],
    }),
  );
  const cli = join(import.meta.dirname, '../dist/src/main.js');
  const base = [
    cli,
    'init',
    'harness',
    '--agent',
    'copilot',
    '--root',
    f.root,
    '--manifest',
    manifest,
    '--no-hooks',
  ];
  const installed = spawnSync(process.execPath, base, { encoding: 'utf8' });
  expect(installed.status, installed.stderr).toBe(0);
  const paths = [
    f.guide,
    f.backup,
    statePath(f.choices),
    join(f.root, '.github/skills/alpha/SKILL.md'),
  ];
  const before = paths.map((path) => readFileSync(path));
  for (const mode of ['--dry-run', '--json']) {
    const preview = spawnSync(process.execPath, [...base, '--remove', mode], { encoding: 'utf8' });
    expect(preview.status, preview.stderr).toBe(0);
    if (mode === '--json') expect(JSON.parse(preview.stdout).removal.files).toContain(paths[3]);
    else expect(preview.stdout).toContain('would remove');
    expect(paths.map((path) => readFileSync(path))).toEqual(before);
  }
});
