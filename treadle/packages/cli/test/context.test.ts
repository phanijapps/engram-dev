import { it, expect } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { savePack } from '@treadle/core';
import { context, contextBlock } from '../src/harness/context.js';
it('reports current gates and doing tasks without admission, writes or cross-worktree scanning', async () => {
  const root = mkdtempSync(join(tmpdir(), 'context-')),
    state = join(root, 'state');
  mkdirSync(state);
  try {
    for (const name of ['one', 'two']) {
      const dir = join(root, 'specs', name);
      mkdirSync(dir, { recursive: true });
      savePack(
        {
          format: 'specpack/0.4',
          name,
          revision: 1,
          status: 'active',
          spec: { requirements: [], clarifications: [] },
          plan: { decisions: [] },
          workflow: {
            policy: 'owner-gated/1',
            plan: 1,
            phase_questions: { spec: [] },
            acts: [],
            pending_audit: [],
          },
          tasks: [
            {
              id: 'T-1',
              title: 'work',
              status: 'doing',
              verify: { cmd: 'true', expect: 'exit 0' },
              context: { touch: [] },
            },
          ],
        },
        join(dir, name + '.json'),
        { at: new Date().toISOString() },
      );
    }
    const f = join(root, 'specs/one/one.json'),
      before = readFileSync(f, 'utf8');
    const report = await context(root, state);
    expect(report.specs.selectionRequired).toBe(true);
    expect(report.specs.packs[0]!.doing).toEqual(['T-1']);
    expect((report.specs.packs[0]!.workflow as { phase: string }).phase).toBe('plan');
    expect(readFileSync(f, 'utf8')).toBe(before);
    expect(contextBlock(report)).toContain('never guess');
    expect(report.service.state).toBe('stopped');
    expect(report.wiki.available).toBe(false);
    mkdirSync(join(root, 'docs/specs/legacy'), { recursive: true });
    rmSync(join(root, 'specs'), { recursive: true });
    mkdirSync(join(root, 'specs'));
    expect((await context(root, state)).specs.packs).toEqual([]);
    mkdirSync(join(root, 'specs/bad'));
    writeFileSync(join(root, 'specs/bad/bad.json'), '{');
    expect((await context(root, state)).specs.packs[0]!.stage).toBe('refused');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
