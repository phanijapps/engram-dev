/** T-3: the surface adapters — four surfaces against temp projects and
 *  a temp HOME. Every install asserted end to end; the hook payload
 *  itself proven in both entries (script + extension shape). */
import { describe, expect, it } from 'vitest';
import { execFileSync, spawnSync } from 'node:child_process';
import {
  chmodSync,
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadManifest } from '../src/harness/manifest.js';
import { compilePlan } from '../src/harness/plan.js';
import { applyPlan } from '../src/harness/apply.js';
import type { InstallChoices, Surface } from '../src/harness/types.ts';

const REPO = join(import.meta.dirname, '..', '..', '..');
const REAL_MANIFEST = join(REPO, 'packages', 'cli', 'harness', 'harness.json');

interface TempWorld {
  home: string;
  project: string;
  restore(): void;
}

function tempWorld(): TempWorld {
  const home = mkdtempSync(join(tmpdir(), 'hhome-'));
  const project = mkdtempSync(join(tmpdir(), 'hproj-'));
  const origHome = process.env.HOME;
  const origUser = process.env.USERPROFILE;
  process.env.HOME = home;
  process.env.USERPROFILE = home;
  return {
    home,
    project,
    restore() {
      process.env.HOME = origHome;
      process.env.USERPROFILE = origUser;
    },
  };
}

function install(surface: Surface, project: string, over: Partial<InstallChoices> = {}): void {
  const { manifest, root } = loadManifest(REAL_MANIFEST);
  const choices: InstallChoices = {
    agent: surface,
    scope: 'project',
    skills: 'all',
    agents: true,
    hooks: true,
    root: project,
    manifestPath: REAL_MANIFEST,
    force: false,
    dryRun: false,
    json: false,
    yes: false,
    remove: false,
    ...over,
  };
  const plan = compilePlan(manifest, root, choices);
  const refused = plan.rows.filter((r) => r.mode === 'refuse');
  expect(refused, `refused rows: ${JSON.stringify(refused, null, 2)}`).toEqual([]);
  applyPlan(plan, choices, root, '2026-10-10T00:00:00Z');
}

describe('the four surface adapters (T-3)', () => {
  it('pi: skills + agent + the hook as a real extension file', () => {
    const w = tempWorld();
    try {
      install('pi', w.project);
      expect(existsSync(join(w.project, '.pi/skills/analyze/SKILL.md'))).toBe(true);
      expect(existsSync(join(w.project, '.pi/skills/writer/references/rules.md'))).toBe(true);
      expect(existsSync(join(w.project, '.pi/agents/red-foreman.md'))).toBe(true);
      expect(existsSync(join(w.project, '.pi/extensions/post-tool-check.js'))).toBe(true);
    } finally {
      w.restore();
      rmSync(w.home, { recursive: true, force: true });
      rmSync(w.project, { recursive: true, force: true });
    }
  });

  it('claude: skills + agent + settings.json wiring that preserves unknown keys', () => {
    const w = tempWorld();
    try {
      mkdirSync(join(w.project, '.claude'), { recursive: true });
      writeFileSync(
        join(w.project, '.claude/settings.json'),
        JSON.stringify({ permissions: { allow: ['Read'] } }),
      );
      install('claude', w.project);
      expect(existsSync(join(w.project, '.claude/skills/build-kb/SKILL.md'))).toBe(true);
      expect(existsSync(join(w.project, '.claude/agents/red-foreman.md'))).toBe(true);
      expect(existsSync(join(w.project, '.harness/hooks/post-tool-check.js'))).toBe(true);
      const s = JSON.parse(readFileSync(join(w.project, '.claude/settings.json'), 'utf8')) as {
        permissions: { allow: string[] };
        hooks: Record<string, { hooks: { command: string; args?: string[] }[] }[]>;
      };
      expect(s.permissions.allow).toContain('Read'); // foreign keys preserved
      expect(s.hooks['PostToolUse']?.[0]?.hooks[0]?.args?.[0]).toContain(
        '.harness/hooks/post-tool-check.js',
      );
    } finally {
      w.restore();
      rmSync(w.home, { recursive: true, force: true });
      rmSync(w.project, { recursive: true, force: true });
    }
  });

  it('codex: project lifecycle hooks and skills preserve user notify', () => {
    const w = tempWorld();
    try {
      install('codex', w.project);
      expect(existsSync(join(w.project, '.codex/skills/analyze/SKILL.md'))).toBe(true);
      expect(existsSync(join(w.project, '.codex/agents/red-foreman.toml'))).toBe(true);
      expect(existsSync(join(w.project, '.harness/hooks/codex-context.js'))).toBe(true);
      const cfg = JSON.parse(readFileSync(join(w.project, '.codex/hooks.json'), 'utf8'));
      expect(cfg.hooks.SessionStart).toHaveLength(1);
      expect(existsSync(join(w.home, '.codex/config.toml'))).toBe(false);
    } finally {
      w.restore();
      rmSync(w.home, { recursive: true, force: true });
      rmSync(w.project, { recursive: true, force: true });
    }
  });

  it('copilot: instructions + agents + native SKILL.md skills; hooks honestly skipped', () => {
    const w = tempWorld();
    try {
      install('copilot', w.project);
      expect(existsSync(join(w.project, '.github/skills/analyze/SKILL.md'))).toBe(true);
      expect(existsSync(join(w.project, '.github/agents/red-foreman.md'))).toBe(true);
      const { manifest, root } = loadManifest(REAL_MANIFEST);
      const plan = compilePlan(manifest, root, {
        agent: 'copilot',
        scope: 'project',
        skills: 'all',
        agents: true,
        hooks: true,
        root: w.project,
        force: false,
        dryRun: true,
        json: false,
        yes: false,
        remove: false,
      });
      const hookRow = plan.rows.find((r) => r.kind === 'hook');
      expect(hookRow?.mode).toBe('skip');
      expect(hookRow?.note).toContain('honest');
    } finally {
      w.restore();
      rmSync(w.home, { recursive: true, force: true });
      rmSync(w.project, { recursive: true, force: true });
    }
  });

  it('R2 #7: copilot + global is an exit-2 usage refusal, never a crash', async () => {
    const { runHarnessInit } = await import('../src/commands/init.js');
    const err = captureExit(() =>
      runHarnessInit({ agent: 'copilot', scope: 'global', remove: false }),
    );
    expect(Number(err?.exit)).toBe(2);
    expect(err?.messages.some((m) => m.includes('copilot has no global scope'))).toBe(true);
  });

  it('the hook payload: script mode exits 0 on free paths, 3 on machine-managed, 1 on garbage', () => {
    const hook = join(REPO, 'packages', 'cli', 'harness', 'hooks', 'post-tool-check.js');
    const run = (arg: string) => execFileSync('node', [hook, arg], { encoding: 'utf8' });
    expect(run('{"tool_path": "/x/src/a.ts"}')).toContain('"ok":true');
    const managed = JSON.stringify({ tool_path: '/x/wiki/code/foo.md' });
    let refused = false;
    try {
      execFileSync('node', [hook, managed]);
    } catch (e) {
      refused = (e as { status: number }).status === 3;
    }
    expect(refused).toBe(true);
    const stdout = (e: unknown): string => String((e as { stdout?: string }).stdout ?? '');
    let managedOut = '';
    try {
      execFileSync('node', [hook, JSON.stringify({ tool_path: '/y/corpus/c1/golden/out.json' })]);
    } catch (e) {
      managedOut = stdout(e);
    }
    expect(managedOut).toContain('"ok":false');
    let errored = false;
    try {
      execFileSync('node', [hook, 'not json']);
    } catch (e) {
      errored = (e as { status: number }).status === 1;
    }
    expect(errored).toBe(true);
    // a second managed path (wiki/code again, noisier payload) also refuses with ok:false
    let wikiOut = '';
    try {
      execFileSync('node', [
        hook,
        JSON.stringify({ tool_path: '/x/wiki/code/a.md', env_note: 'skip' }),
      ]);
    } catch (e) {
      wikiOut = String((e as { stdout?: string }).stdout ?? '');
    }
    expect(wikiOut).toContain('"ok":false');
  });

  it('the hook payload: extension mode exports the pi factory and guards tool_call', async () => {
    const mod = await import(
      join(REPO, 'packages', 'cli', 'harness', 'hooks', 'post-tool-check.js')
    );
    expect(typeof mod.default).toBe('function');
    const blocks: { reason: string }[] = [];
    const handlers: { eventName: string; fn: (event: unknown) => unknown }[] = [];
    const pi = {
      on: (eventName: string, fn: (event: unknown) => unknown) => handlers.push({ eventName, fn }),
    };
    mod.default(pi);
    expect(handlers.some((h) => h.eventName === 'tool_call')).toBe(true);
    const guard = handlers.find((h) => h.eventName === 'tool_call')!;
    const blocked = (await guard.fn({
      toolName: 'Write',
      input: { file_path: '/repo/wiki/code/x.md' },
    })) as { block: boolean; reason: string } | undefined;
    expect(blocked?.block).toBe(true);
    expect(blocked?.reason).toContain('machine-managed');
    const free = await guard.fn({ toolName: 'Write', input: { file_path: '/repo/src/x.ts' } });
    expect(free).toBeUndefined(); // no block for free paths
    const readManaged = await guard.fn({
      toolName: 'Read',
      input: { file_path: '/repo/wiki/code/x.md' },
    });
    expect(readManaged).toBeUndefined(); // R2 #20: reads of managed trees stay free
  });
});

function captureExit(
  fn: () => void,
): { exit: number | string | undefined; messages: string[] } | undefined {
  const messages: string[] = [];
  const origErr = console.error;
  console.error = (...a: unknown[]) => messages.push(a.map(String).join(' '));
  process.exitCode = undefined;
  try {
    fn();
    return { exit: process.exitCode, messages };
  } catch {
    return undefined;
  } finally {
    console.error = origErr;
    process.exitCode = 0;
  }
}

describe('session-recall payload + wirings (T-1)', () => {
  it('pi installs its lifecycle extension and support module', () => {
    const w = tempWorld();
    try {
      install('pi', w.project);
      expect(existsSync(join(w.project, '.pi/extensions/session-recall.js'))).toBe(true);
      expect(existsSync(join(w.project, '.pi/extensions/codex-context.js'))).toBe(true);
    } finally {
      w.restore();
      rmSync(w.home, { recursive: true, force: true });
      rmSync(w.project, { recursive: true, force: true });
    }
  });

  it('claude: SessionStart AND UserPromptSubmit both wired (array wirings merge)', () => {
    const w = tempWorld();
    try {
      install('claude', w.project);
      const s = JSON.parse(readFileSync(join(w.project, '.claude/settings.json'), 'utf8')) as {
        hooks: Record<string, { hooks: { command: string; args?: string[] }[] }[]>;
      };
      expect(s.hooks['SessionStart']?.[0]?.hooks[0]?.args).toContain('SessionStart');
      expect(s.hooks['UserPromptSubmit']?.[0]?.hooks[0]?.args).toContain('UserPromptSubmit');
      expect(s.hooks['PostToolUse']?.[0]?.hooks[0]?.args?.[0]).toContain('post-tool-check');
    } finally {
      w.restore();
      rmSync(w.home, { recursive: true, force: true });
      rmSync(w.project, { recursive: true, force: true });
    }
  });

  it('codex: the recall prompt-file lands (the honest subset)', () => {
    const w = tempWorld();
    try {
      install('codex', w.project);
      expect(existsSync(join(w.project, '.codex/prompts/recall.md'))).toBe(true);
    } finally {
      w.restore();
      rmSync(w.home, { recursive: true, force: true });
      rmSync(w.project, { recursive: true, force: true });
    }
  });

  it('script mode: the block prints and exits 0 (unpiped contract)', () => {
    const hook = join(REPO, 'packages', 'cli', 'harness', 'hooks', 'session-recall.js');
    const out = execFileSync('node', [hook, REPO + '/..'], { encoding: 'utf8' });
    expect(out).toMatch(/(work in flight|nothing in flight)/);
  });

  it('claude-gate allows specific requests and gates ambiguous continuation from isolated counts', () => {
    const hook = join(REPO, 'packages', 'cli', 'harness', 'hooks', 'session-recall.js');
    const project = mkdtempSync(join(tmpdir(), 'claude-gate-'));
    const stub = join(project, 'cli-stub.mjs');
    const report = (count: number) => {
      const packs = Array.from({ length: count }, (_, index) => ({
        name: `pack-${index}`,
        stage: 'in_progress',
        openQuestions: 0,
        nextTask: null,
        revision: 1,
        lastEvidenceAt: null,
      }));
      writeFileSync(
        stub,
        '#!/usr/bin/env node\nconsole.log(' +
          JSON.stringify(JSON.stringify({ root: project, packs, worktrees: [] })) +
          ');\n',
      );
      chmodSync(stub, 0o755);
    };
    const run = (prompt: string) =>
      spawnSync('node', [hook, '--claude-gate'], {
        input: JSON.stringify({ prompt, cwd: project }),
        encoding: 'utf8',
        env: { ...process.env, HARNESS_CLI: stub },
      });
    try {
      for (const count of [0, 1]) {
        report(count);
        const allowed = run('continue');
        expect(allowed.status).toBe(0);
        expect(allowed.stdout).toBe('');
        expect(allowed.stderr).toBe('');
      }
      report(2);
      const specific = run('write a poem');
      expect(specific.status).toBe(0);
      expect(specific.stderr).toBe('');
      const ambiguous = run('continue');
      expect(ambiguous.status).toBe(2);
      expect(ambiguous.stderr).toContain('the hard gate');
      expect(ambiguous.stderr).toContain('pack-0');
      expect(ambiguous.stderr).toContain('pack-1');
    } finally {
      rmSync(project, { recursive: true, force: true });
    }
  });
});
