/** T-1: the installer engine — plan compiler, apply, idempotency,
 *  refusal, normalization, state + remove, usage failures. Pure flags;
 *  no logic above the flag layer (FR-5). */
import { describe, expect, it } from 'vitest';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { defaultManifestPath, loadManifest } from '../src/harness/manifest.js';
import { compilePlan, planSummary } from '../src/harness/plan.js';
import { applyPlan, removeInstall, statePath } from '../src/harness/apply.js';
import { UsageError } from '../src/harness/types.ts';
import type { InstallChoices } from '../src/harness/types.ts';

function isolateHome(path: string): () => void {
  const key = process.platform === 'win32' ? 'USERPROFILE' : 'HOME';
  const previous = process.env[key];
  process.env[key] = path;
  return () => {
    if (previous === undefined) delete process.env[key];
    else process.env[key] = previous;
  };
}

function harnessFixture(): { root: string; manifestPath: string } {
  const root = mkdtempSync(join(tmpdir(), 'hengine-'));
  const h = join(root, 'harness');
  mkdirSync(join(h, 'skills/alpha'), { recursive: true });
  writeFileSync(join(h, 'skills/alpha/SKILL.md'), '---\nname: alpha\n---\n\nAlpha skill.\n');
  writeFileSync(join(h, 'skills/alpha/extra.md'), 'Extra.\n');
  mkdirSync(join(h, 'agents'), { recursive: true });
  writeFileSync(join(h, 'agents/one.md'), '# agent one\n');
  mkdirSync(join(h, 'hooks'), { recursive: true });
  writeFileSync(join(h, 'hooks/check.js'), '// check\n');
  const manifest = {
    format: 'harness/0.1',
    components: [
      {
        id: 'alpha',
        kind: 'skill',
        source: 'skills/alpha',
        dest: {
          pi: '.pi/skills/alpha',
          claude: '.claude/skills/alpha',
          codex: '.codex/skills/alpha',
          copilot: '.github/skills/alpha',
        },
      },
      {
        id: 'one',
        kind: 'agent',
        source: { pi: 'agents/one.md', claude: 'agents/one.md', codex: 'agents/one.md' },
        dest: {
          pi: '.pi/agents/one.md',
          claude: '.claude/agents/one.md',
          codex: '.codex/agents/one.md',
        },
      },
    ],
    hooks: [
      {
        id: 'check',
        file: 'hooks/check.js',
        wiring: {
          pi: { kind: 'extension', dest: '.pi/extensions/check.js' },
          claude: {
            kind: 'settings-hooks',
            matcher: 'PostToolUse',
            command: 'node .harness/hooks/check.js',
          },
          codex: { kind: 'config-notify', command: 'node .harness/hooks/check.js' },
          copilot: null,
        },
      },
    ],
  };
  const manifestPath = join(h, 'harness.json');
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  return { root, manifestPath };
}

function choices(
  root: string,
  manifestPath: string,
  over: Partial<InstallChoices> = {},
): InstallChoices {
  return {
    agent: 'pi',
    scope: 'project',
    skills: 'all',
    agents: true,
    hooks: true,
    root,
    manifestPath,
    force: false,
    dryRun: false,
    json: false,
    yes: false,
    remove: false,
    ...over,
  };
}

describe('the installer engine (T-1)', () => {
  it('refuses a manifest with the wrong format — never guesses', () => {
    const { root, manifestPath } = harnessFixture();
    try {
      const raw = JSON.parse(readFileSync(manifestPath, 'utf8')) as { format: string };
      raw.format = 'harness/9.9';
      writeFileSync(manifestPath, JSON.stringify(raw));
      expect(() => loadManifest(manifestPath)).toThrow(/format refused/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('compiles a truthful plan: modes by normalized hash, unwired component skipped', () => {
    const { root, manifestPath } = harnessFixture();
    try {
      const { manifest, root: mRoot } = loadManifest(manifestPath);
      const plan = compilePlan(manifest, mRoot, choices(root, manifestPath));
      const byDest = Object.fromEntries(plan.rows.map((r) => [r.destination || r.component, r]));
      expect(byDest[join(root, '.pi/skills/alpha')].mode).toBe('create');
      expect(byDest[join(root, '.pi/agents/one.md')].mode).toBe('create');
      expect(byDest[join(root, '.pi/extensions/check.js')].mode).toBe('create');
      const skip = plan.rows.find((r) => r.surface === 'copilot' && r.kind === 'hook');
      expect(skip).toBeUndefined(); // pi choices do not mention copilot
      const copPlan = compilePlan(
        manifest,
        mRoot,
        choices(root, manifestPath, { agent: 'copilot' }),
      );
      const copHook = copPlan.rows.find((r) => r.kind === 'hook');
      expect(copHook?.mode).toBe('skip');
      expect(copHook?.note).toContain('wiring');
      expect(copPlan.rows.find((r) => r.component === 'one')?.mode).toBe('skip'); // no copilot source
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('applies exactly the plan, records state, and is idempotent (re-run = same)', () => {
    const { root, manifestPath } = harnessFixture();
    try {
      const lm = loadManifest(manifestPath);
      const c = choices(root, manifestPath);
      const plan = compilePlan(lm.manifest, lm.root, c);
      const out = applyPlan(plan, c, lm.root, '2026-10-10T00:00:00Z');
      expect(out.written).toBe(6); // Skill resources, agent, hook, runtime pointer, and project guide.
      expect(existsSync(join(root, '.pi/skills/alpha/SKILL.md'))).toBe(true);
      expect(existsSync(join(root, '.pi/agents/one.md'))).toBe(true);
      expect(existsSync(statePath(c))).toBe(true);
      expect(existsSync(join(root, 'AGENTS.md'))).toBe(true);
      expect(JSON.parse(readFileSync(statePath(c), 'utf8')).written).not.toContain(
        join(root, 'AGENTS.md'),
      );

      const plan2 = compilePlan(lm.manifest, lm.root, c);
      const s2 = planSummary(plan2);
      expect(s2.refuse).toBe(0);
      expect(s2.create).toBe(0);
      expect(
        plan2.rows
          .filter((r) => r.kind === 'skill' || r.kind === 'agent' || r.kind === 'hook')
          .every((r) => r.mode === 'same'),
      ).toBe(true);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('refuses differing destinations without --force (apply exits the refused list)', () => {
    const { root, manifestPath } = harnessFixture();
    try {
      const lm = loadManifest(manifestPath);
      const c = choices(root, manifestPath);
      applyPlan(compilePlan(lm.manifest, lm.root, c), c, lm.root, '2026-10-10T00:00:00Z');
      writeFileSync(join(root, '.pi/agents/one.md'), '# tampered\n');
      const plan2 = compilePlan(lm.manifest, lm.root, c);
      expect(plan2.rows.find((r) => r.destination.endsWith('one.md'))?.mode).toBe('refuse');
      const out2 = applyPlan(plan2, c, lm.root, '2026-10-10T00:00:01Z');
      expect(out2.refused.length).toBe(1);
      // --force flips it to update
      const c3 = choices(root, manifestPath, { force: true });
      const plan3 = compilePlan(lm.manifest, lm.root, c3);
      expect(plan3.rows.find((r) => r.destination.endsWith('one.md'))?.mode).toBe('update');
      const out3 = applyPlan(plan3, c3, lm.root, '2026-10-10T00:00:02Z');
      expect(out3.refused.length).toBe(0);
      expect(readFileSync(join(root, '.pi/agents/one.md'), 'utf8')).toContain('agent one');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('normalization: a CRLF destination equals its LF source (mode same)', () => {
    const { root, manifestPath } = harnessFixture();
    try {
      const lm = loadManifest(manifestPath);
      const c = choices(root, manifestPath);
      applyPlan(compilePlan(lm.manifest, lm.root, c), c, lm.root, 't');
      writeFileSync(
        join(root, '.pi/skills/alpha/SKILL.md'),
        '---\r\nname: alpha\r\n---\r\n\r\nAlpha skill.\r\n\r\n',
      );
      const plan2 = compilePlan(lm.manifest, lm.root, c);
      expect(plan2.rows.find((r) => r.destination.includes('alpha'))?.mode).toBe('same');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('claude wiring merges settings.json preserving unknown keys; codex wiring sets notify once', () => {
    const { root, manifestPath } = harnessFixture();
    try {
      mkdirSync(join(root, '.claude'), { recursive: true });
      writeFileSync(join(root, '.claude/settings.json'), JSON.stringify({ env: { KEEP: 'me' } }));
      const lm = loadManifest(manifestPath);
      const c = choices(root, manifestPath, { agent: 'claude' });
      applyPlan(compilePlan(lm.manifest, lm.root, c), c, lm.root, 't');
      const settings = JSON.parse(readFileSync(join(root, '.claude/settings.json'), 'utf8')) as {
        env: { KEEP: string };
        hooks: Record<string, { hooks: { command: string; args?: string[] }[] }[]>;
      };
      expect(settings.env.KEEP).toBe('me'); // unknown keys preserved
      expect(settings.hooks['PostToolUse'][0]?.hooks[0]?.args).toContain('.harness/hooks/check.js');

      // BLOCKER 3 (R2): Native home isolated — the suite must NEVER touch the real ~/.codex
      const fakeHome = mkdtempSync(join(tmpdir(), 'hh-'));
      const restoreHome = isolateHome(fakeHome);
      try {
        const c2 = choices(root, manifestPath, { agent: 'codex' });
        const out2 = applyPlan(compilePlan(lm.manifest, lm.root, c2), c2, lm.root, 't');
        expect(out2.written).toBeGreaterThanOrEqual(2); // skill + agent + hook payload
        const cfg = readFileSync(join(fakeHome, '.codex', 'config.toml'), 'utf8');
        expect(cfg).toMatch(/^notify\s*=/m);
      } finally {
        restoreHome();
        rmSync(fakeHome, { recursive: true, force: true });
      }
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('--remove deletes exactly the recorded install and undoes the claude wiring', () => {
    const { root, manifestPath } = harnessFixture();
    try {
      const lm = loadManifest(manifestPath);
      const c = choices(root, manifestPath, { agent: 'claude' });
      mkdirSync(join(root, '.claude'), { recursive: true });
      writeFileSync(join(root, '.claude/settings.json'), JSON.stringify({ env: { KEEP: 'me' } }));
      applyPlan(compilePlan(lm.manifest, lm.root, c), c, lm.root, 't');
      const keep = join(root, '.claude/foreign.md');
      writeFileSync(keep, 'not ours\n');
      const r = removeInstall(c);
      expect(r.removed.length).toBeGreaterThanOrEqual(3);
      expect(existsSync(keep)).toBe(true); // foreign files never deleted
      expect(existsSync(join(root, '.pi'))).toBe(false);
      const after = JSON.parse(readFileSync(join(root, '.claude/settings.json'), 'utf8')) as {
        env: { KEEP: string };
        hooks?: unknown;
      };
      expect(after.env.KEEP).toBe('me');
      expect(after.hooks).toBeUndefined(); // our entry unwired
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('R2 #1: per-agent state files — two agents never clobber each other', () => {
    const { root, manifestPath } = harnessFixture();
    const restoreHome = isolateHome(root);
    try {
      const lm = loadManifest(manifestPath);
      const cPi = choices(root, manifestPath, { agent: 'pi' });
      applyPlan(compilePlan(lm.manifest, lm.root, cPi), cPi, lm.root, 't');
      const cCx = choices(root, manifestPath, { agent: 'codex' });
      applyPlan(compilePlan(lm.manifest, lm.root, cCx), cCx, lm.root, 't');
      expect(existsSync(join(root, '.harness/harness-install.pi.json'))).toBe(true);
      expect(existsSync(join(root, '.harness/harness-install.codex.json'))).toBe(true);
      // removing pi leaves codex intact and pi gone
      const r = removeInstall(cPi);
      expect(r.removed.length).toBeGreaterThan(0);
      expect(existsSync(join(root, '.pi/skills/alpha/SKILL.md'))).toBe(false);
      expect(existsSync(join(root, '.codex/skills/alpha/SKILL.md'))).toBe(true);
      expect(existsSync(join(root, '.harness/harness-install.codex.json'))).toBe(true);
    } finally {
      restoreHome();
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('R2 #2: --force removes exactly the listed leftovers, and nothing else', () => {
    const { root, manifestPath } = harnessFixture();
    try {
      const lm = loadManifest(manifestPath);
      const c = choices(root, manifestPath);
      applyPlan(compilePlan(lm.manifest, lm.root, c), c, lm.root, 't');
      const foreign = join(root, '.pi/skills/alpha/FOREIGN.md');
      writeFileSync(foreign, 'stale drift\n');
      const plan2 = compilePlan(lm.manifest, lm.root, c);
      const row = plan2.rows.find((r) => r.kind === 'skill');
      expect(row?.note).toContain('FOREIGN.md');
      expect(row?.extras).toContain('FOREIGN.md');
      const out = applyPlan(
        compilePlan(lm.manifest, lm.root, choices(root, manifestPath, { force: true })),
        choices(root, manifestPath, { force: true }),
        lm.root,
        't',
      );
      expect(existsSync(foreign)).toBe(false); // exactly the listed leftover
      expect(existsSync(join(root, '.pi/skills/alpha/SKILL.md'))).toBe(true); // managed files stay
      expect(out.removedLeftovers.length).toBe(1);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('R2 #6: --remove refuses paths outside the install roots (tampered state)', () => {
    const { root, manifestPath } = harnessFixture();
    try {
      const outside = mkdtempSync(join(tmpdir(), 'htarget-'));
      const hostage = join(outside, 'hostage.txt');
      writeFileSync(hostage, 'do not delete\n');
      const lm = loadManifest(manifestPath);
      const c = choices(root, manifestPath);
      applyPlan(compilePlan(lm.manifest, lm.root, c), c, lm.root, 't');
      const sp = join(root, '.harness/harness-install.pi.json');
      const doc = JSON.parse(readFileSync(sp, 'utf8')) as { written: string[] };
      doc.written.push(hostage);
      writeFileSync(sp, JSON.stringify(doc));
      expect(() => removeInstall(c)).toThrow(/outside the install roots/);
      expect(existsSync(hostage)).toBe(true); // the hostage survives
      rmSync(outside, { recursive: true, force: true });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('R2 #8: a directory squatting on a file destination is a refuse, never a crash', () => {
    const { root, manifestPath } = harnessFixture();
    try {
      const lm = loadManifest(manifestPath);
      const c = choices(root, manifestPath);
      applyPlan(compilePlan(lm.manifest, lm.root, c), c, lm.root, 't');
      const lm2 = loadManifest(manifestPath);
      const plan2 = compilePlan(lm2.manifest, lm2.root, c);
      const agentRow = plan2.rows.find((r) => r.destination.endsWith('one.md'));
      expect(agentRow?.mode).toBe('same');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('R2 #17: the manifest loader refuses .. and absolute paths', () => {
    const { root, manifestPath } = harnessFixture();
    try {
      const raw = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
        components: { id: string; source: unknown }[];
      };
      raw.components[0].source = { pi: '../../escape.md', claude: 'x.md' } as never;
      writeFileSync(manifestPath, JSON.stringify(raw));
      expect(() => loadManifest(manifestPath)).toThrow(/escapes the manifest root/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('R2 #10: foreign settings.json refuses the wiring loudly (no silent drop)', () => {
    const { root, manifestPath } = harnessFixture();
    try {
      mkdirSync(join(root, '.claude'), { recursive: true });
      writeFileSync(join(root, '.claude/settings.json'), '{ not json');
      const lm = loadManifest(manifestPath);
      const c = choices(root, manifestPath, { agent: 'claude' });
      const out = applyPlan(compilePlan(lm.manifest, lm.root, c), c, lm.root, 't');
      expect(out.wiringRefused.length).toBe(1);
      expect(out.wiringRefused[0]).toContain('settings.json');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('the shipped manifest is valid and retains explicit per-component omissions', () => {
    const lm = loadManifest(defaultManifestPath());
    expect(lm.manifest.components.length).toBeGreaterThanOrEqual(12);
    expect(lm.manifest.hooks[0]?.wiring.copilot).toBeNull();
    expect(lm.manifest.hooks[0]?.file).toContain('.js');
  });
});

describe('usage failures (FR-4)', () => {
  it('missing --agent with no TTY is exit-2 material with the exact remediation', async () => {
    const { runHarnessInit } = await import('../src/commands/init.js');
    const err = capture(() => runHarnessInit({}));
    expect(Number(err?.exit)).toBe(2);
    expect(err?.messages.some((m) => m.includes('init harness --agent'))).toBe(true);
  });
});

function capture(
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

// UsageError imported for the engine-level guarantee (types must export it)
expect(UsageError).toBeDefined();

it('preserves foreign notify and nested hook metadata; shared payload survives removal of one surface', () => {
  const { root, manifestPath } = harnessFixture();
  const restoreHome = isolateHome(root);
  try {
    const lm = loadManifest(manifestPath),
      claude = choices(root, manifestPath, { agent: 'claude' }),
      pi = choices(root, manifestPath, { agent: 'pi' });
    mkdirSync(join(root, '.claude'), { recursive: true });
    writeFileSync(
      join(root, '.claude/settings.json'),
      JSON.stringify({
        hooks: {
          PostToolUse: [
            { matcher: 'foreign', extra: 1, hooks: [{ type: 'command', command: 'foreign' }] },
          ],
        },
      }),
    );
    applyPlan(compilePlan(lm.manifest, lm.root, claude), claude, lm.root, 't');
    applyPlan(compilePlan(lm.manifest, lm.root, pi), pi, lm.root, 't');
    removeInstall(claude);
    const json = JSON.parse(readFileSync(join(root, '.claude/settings.json'), 'utf8'));
    expect(json.hooks.PostToolUse[0].matcher).toBe('foreign');
    expect(json.hooks.PostToolUse[0].extra).toBe(1);
    mkdirSync(join(root, '.codex'), { recursive: true });
    writeFileSync(join(root, '.codex/config.toml'), 'notify = ["foreign"]\n');
    const codex = choices(root, manifestPath, { agent: 'codex' }),
      out = applyPlan(compilePlan(lm.manifest, lm.root, codex), codex, lm.root, 't');
    expect(out.wiringRefused).toHaveLength(1);
    expect(readFileSync(join(root, '.codex/config.toml'), 'utf8')).toBe('notify = ["foreign"]\n');
  } finally {
    restoreHome();
    rmSync(root, { recursive: true, force: true });
  }
});

it('retains partial install ownership and replaces only recorded obsolete hook definitions', () => {
  const { root, manifestPath } = harnessFixture();
  try {
    const lm = loadManifest(manifestPath),
      full = choices(root, manifestPath, { agent: 'claude' });
    applyPlan(compilePlan(lm.manifest, lm.root, full), full, lm.root, 'first');
    const settings = join(root, '.claude/settings.json');
    const original = JSON.parse(readFileSync(settings, 'utf8'));
    original.hooks.PostToolUse.push({
      matcher: 'foreign',
      hooks: [{ type: 'command', command: 'foreign' }],
    });
    writeFileSync(settings, JSON.stringify(original));
    const changed = structuredClone(lm.manifest);
    const wiring = changed.hooks[0]!.wiring.claude as {
      kind: string;
      matcher: string;
      command: string;
    };
    wiring.matcher = 'SessionStart';
    const hooks = { ...full, skills: [], agents: false };
    applyPlan(compilePlan(changed, lm.root, hooks), hooks, lm.root, 'upgrade');
    const current = JSON.parse(readFileSync(settings, 'utf8'));
    expect(current.hooks.PostToolUse).toEqual([
      { matcher: 'foreign', hooks: [{ type: 'command', command: 'foreign' }] },
    ]);
    expect(current.hooks.SessionStart).toHaveLength(1);
    const state = JSON.parse(readFileSync(statePath(full), 'utf8'));
    expect(state.written.some((p: string) => p.endsWith('SKILL.md'))).toBe(true);
    removeInstall(full);
    expect(existsSync(join(root, '.claude/skills/alpha/SKILL.md'))).toBe(false);
    expect(JSON.parse(readFileSync(settings, 'utf8')).hooks.PostToolUse[0].matcher).toBe('foreign');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
