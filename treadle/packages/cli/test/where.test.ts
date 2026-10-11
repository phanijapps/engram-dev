/** T-0: do where — the recall core. Two-pack fixture (one in a temp
 *  worktree), no-git degradation, --json shape, archive exclusion. */
import { describe, expect, it } from 'vitest';
import { execSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, renameSync, rmSync, writeFileSync, realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { recallBlock, where, isOpen } from '../src/harness/where.js';

const REPO = join(import.meta.dirname, '..', '..', '..'); // the workspace dir — referenced by path only (WORKSPACE constant, not brand)

function fixturePack(
  root: string,
  name: string,
  stage: string,
  over: Record<string, unknown> = {},
): void {
  const dir = join(root, 'specs', name);
  mkdirSync(dir, { recursive: true });
  const doc = {
    id: name,
    name,
    description: 'fixture',
    format: 'specpack/0.3',
    revision: 3,
    date: { created: '2026-10-10T00:00:00Z' },
    status: { lifecycle: 'active', deliverable: stage },
    spec: {
      why: 'fixture',
      clarifications: [],
      requirements: [{ id: 'FR-1', text: 'fixture requirement' }],
      stories: [],
    },
    plan: { decisions: [], designs: [] },
    tasks: [
      {
        id: 'T-1',
        title: 'done one',
        status: 'done',
        phase: 'core',
        satisfies: [],
        implements: [],
        honors: [],
        accepts: [],
        verify: { cmd: 'x', expect: 'y' },
        evidence: [{ at: '2026-10-10T01:00:00Z', by: 'agent:pi', cmd: 'x', exit: 0 }],
      },
      {
        id: 'T-2',
        title: 'ready two',
        status: 'todo',
        phase: 'core',
        satisfies: [],
        implements: [],
        honors: [],
        accepts: [],
        verify: { cmd: 'x', expect: 'y' },
        needs: ['T-1'],
      },
    ],
    review: { verdicts: [] },
    ...over,
  };
  writeFileSync(join(dir, `${name}.json`), JSON.stringify(doc, null, 2));
}

describe('do where (T-0)', () => {
  it('lists open packs with stage/questions/next/rev; archive excluded; delivered not open', () => {
    const root = mkdtempSync(join(tmpdir(), 'where1-'));
    try {
      fixturePack(root, 'alpha', 'in_progress', {
        spec: {
          why: 'x',
          clarifications: [{ id: 'Q-1', question: 'q', status: 'open', owner: 'human:owner' }],
          requirements: [],
          stories: [],
        },
      });
      fixturePack(root, 'beta', 'delivered');
      fixturePack(root, 'gamma', 'awaiting_owner');
      // the archive is frozen history — a pack inside it must never be listed
      const arch = join(root, 'specs', 'archive', 'old-one');
      mkdirSync(arch, { recursive: true });
      writeFileSync(
        join(arch, 'old-one.json'),
        JSON.stringify({
          id: 'old-one',
          name: 'old-one',
          format: 'specpack/0.3',
          status: { lifecycle: 'active', deliverable: 'in_progress' },
          spec: { requirements: [{ id: 'FR-1', text: 'x' }] },
          plan: {},
          tasks: [],
          review: { verdicts: [] },
        }),
      );
      const r = where(root);
      expect(r.packs.map((p) => p.name)).toEqual(['alpha', 'beta', 'gamma']);
      const alpha = r.packs[0];
      expect(alpha.stage).toBe('in_progress');
      expect(alpha.openQuestions).toBe(1);
      expect(alpha.nextTask).toBe('T-2');
      expect(alpha.revision).toBe(3);
      expect(alpha.lastEvidenceAt).toBe('2026-10-10T01:00:00Z');
      expect(isOpen(alpha)).toBe(true);
      expect(isOpen(r.packs[1])).toBe(false); // delivered
      const block = recallBlock(r);
      expect(block).toContain('work in flight (2)');
      expect(block).toContain('alpha');
      expect(block).toContain('gamma');
      expect(block).not.toContain('beta');
      expect(block).not.toContain('old-one');
      expect(block).toContain('ASK which one continues');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('one open pack: the block resolves, no ask', () => {
    const root = mkdtempSync(join(tmpdir(), 'where2-'));
    try {
      fixturePack(root, 'solo', 'in_progress');
      const block = recallBlock(where(root));
      expect(block).toContain('work in flight (1)');
      expect(block).not.toContain('ASK');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('a worktree carries its own row, labeled with its tree', () => {
    const root = mkdtempSync(join(tmpdir(), 'where3-'));
    try {
      execSync('git init -q .', { cwd: root });
      execSync('git config user.email t@t && git config user.name t', { cwd: root });
      execSync('git commit -qm init --allow-empty', { cwd: root });
      const wt = join(root, '..', 'wt-branch');
      execSync(`git worktree add -q "${wt}" -b side`, { cwd: root });
      // each side writes ONLY its own pack (both untracked in their trees)
      fixturePack(root, 'main-pack', 'in_progress');
      fixturePack(wt, 'side-pack', 'in_review');
      mkdirSync(join(wt, 'docs'));
      renameSync(join(wt, 'specs'), join(wt, 'docs', 'specs'));
      const r = where(root);
      expect(r.packs.map((p) => p.name)).toEqual(['main-pack']);
      expect(r.worktrees).toHaveLength(1);
      expect(r.worktrees[0]?.packs.map((p: { name: string }) => p.name)).toEqual(['side-pack']);
      const block = recallBlock(r);
      expect(block).toContain('side-pack');
      expect(block).toContain(realpathSync(wt)); // the canonical tree label
      expect(block).toContain('ASK which one continues'); // two open across trees
      execSync(`git worktree remove --force "${wt}"`, { cwd: root });
    } finally {
      try {
        execSync(`git worktree prune`, { cwd: root });
      } catch {
        /* best effort */
      }
      rmSync(root, { recursive: true, force: true });
      rmSync(join(root, '..', 'wt-branch'), { recursive: true, force: true });
    }
  });

  it('no git: worktrees report unavailable, exit stays a report (never throws)', () => {
    const root = mkdtempSync(join(tmpdir(), 'where4-'));
    try {
      fixturePack(root, 'plain', 'in_progress');
      const r = where(root);
      expect(r.worktrees).toEqual([]);
      expect(r.worktreesUnavailable).toContain('no git');
      expect(recallBlock(r)).toContain('plain');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('prefers canonical work without merging duplicate legacy packs', () => {
    const root = mkdtempSync(join(tmpdir(), 'where-canonical-'));
    try {
      fixturePack(root, 'legacy', 'in_progress');
      mkdirSync(join(root, 'docs'));
      renameSync(join(root, 'specs'), join(root, 'docs', 'specs'));
      fixturePack(root, 'current', 'planning');
      expect(where(root).packs.map((pack) => pack.name)).toEqual(['current']);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('reads legacy-only projects but respects an intentionally empty canonical root', () => {
    const root = mkdtempSync(join(tmpdir(), 'where-legacy-'));
    try {
      fixturePack(root, 'legacy', 'in_progress');
      mkdirSync(join(root, 'docs'));
      renameSync(join(root, 'specs'), join(root, 'docs', 'specs'));
      expect(where(root).packs.map((pack) => pack.name)).toEqual(['legacy']);
      mkdirSync(join(root, 'specs'));
      expect(where(root).packs).toEqual([]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('discovers the immutable closed install-paths witness independently of an open wave', () => {
    const WORKSPACE = join(REPO, '..');
    const r = where(WORKSPACE);
    const witness = r.packs.find((pack) => pack.name === 'install-paths');
    expect(witness).toBeDefined();
    expect(witness?.stage).toBe('delivered');
  });
});
