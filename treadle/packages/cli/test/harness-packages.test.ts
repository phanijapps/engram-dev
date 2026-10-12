import { it, expect } from 'vitest';
import { mkdtempSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { packageHarness } from '../src/harness/packages.js';
it('generates deterministic, local host packages and truthful capability metadata', () => {
  const root = mkdtempSync(join(tmpdir(), 'native harness ü '));
  try {
    for (const surface of ['claude', 'codex', 'pi'] as const) {
      const first = packageHarness(surface, join(root, surface)),
        second = packageHarness(surface, join(root, surface + '-2'));
      expect(readFileSync(join(first, '.harness-package.json'), 'utf8')).toBe(
        readFileSync(join(second, '.harness-package.json'), 'utf8'),
      );
      expect(
        existsSync(join(first, 'skills/analyze/SKILL.md')),
        readFileSync(join(first, '.harness-package.json'), 'utf8'),
      ).toBe(true);
      const pointer = JSON.parse(readFileSync(join(first, 'hooks/runtime.json'), 'utf8'));
      expect(pointer.protocol).toBe(1);
      expect(existsSync(pointer.entry)).toBe(true);
      if (surface === 'pi')
        expect(
          JSON.parse(readFileSync(join(first, 'package.json'), 'utf8')).pi.extensions,
        ).toContain('extensions/project-context.ts');
      else if (surface === 'codex')
        expect(
          JSON.parse(readFileSync(join(first, `.${surface}-plugin/plugin.json`), 'utf8')).hooks,
        ).toBe('./hooks/hooks.json');
      if (surface === 'claude') {
        const manifest = JSON.parse(
          readFileSync(join(first, '.claude-plugin/plugin.json'), 'utf8'),
        );
        expect(manifest.hooks).toBeUndefined();
        expect(manifest.agents).toBeUndefined();
        expect(existsSync(join(first, 'agents/red-forman.md'))).toBe(true);
      }
      expect(() => packageHarness(surface, first)).toThrow('already exists');
    }
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}, 20000); // Six complete filesystem artifacts, including native Windows under coverage.
