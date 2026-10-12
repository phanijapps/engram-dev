import { it, expect } from 'vitest';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { defaultManifestPath, loadManifest } from '../src/harness/manifest.js';
import { compilePlan } from '../src/harness/plan.js';
import { applyPlan } from '../src/harness/apply.js';
import type { InstallChoices, Surface } from '../src/harness/types.js';

for (const surface of ['pi', 'claude', 'codex', 'copilot'] as const) {
  it(`installs full search-kb resources for ${surface}, preserves them on repeat, and refuses foreign edits`, () => {
    const root = mkdtempSync(join(tmpdir(), 'search-kb-install-'));
    const { manifest, root: source } = loadManifest(defaultManifestPath());
    const choices: InstallChoices = {
      agent: surface as Surface,
      scope: 'project',
      root,
      skills: ['search-kb'],
      agents: false,
      hooks: false,
      force: false,
      dryRun: false,
      json: false,
      yes: false,
      remove: false,
    };
    const destination = join(
      root,
      surface === 'copilot' ? '.github' : `.${surface}`,
      'skills/search-kb',
    );
    const paths = [
      'SKILL.md',
      'resources/okf-consumption.md',
      'evals/cases.json',
      'evals/rubric.md',
    ];
    try {
      const first = compilePlan(manifest, source, choices);
      expect(first.rows.filter((r) => r.mode === 'refuse')).toEqual([]);
      expect(existsSync(destination)).toBe(false); // Planning is read-only.
      expect(applyPlan(first, choices, source, new Date().toISOString()).refused).toEqual([]);
      for (const file of paths)
        expect(readFileSync(join(destination, file))).toEqual(
          readFileSync(join(source, 'skills/sdlc/search-kb', file)),
        );
      const second = compilePlan(manifest, source, choices);
      expect(second.rows.find((r) => r.component === 'search-kb')?.mode).toBe('same');
      applyPlan(second, choices, source, new Date().toISOString());
      for (const file of paths)
        expect(readFileSync(join(destination, file))).toEqual(
          readFileSync(join(source, 'skills/sdlc/search-kb', file)),
        );
      writeFileSync(join(destination, 'SKILL.md'), 'User customization.\n');
      const conflict = compilePlan(manifest, source, choices);
      expect(conflict.rows.find((r) => r.component === 'search-kb')?.mode).toBe('refuse');
      expect(applyPlan(conflict, choices, source, new Date().toISOString()).refused).toHaveLength(
        1,
      );
      expect(readFileSync(join(destination, 'SKILL.md'), 'utf8')).toBe('User customization.\n');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
}
