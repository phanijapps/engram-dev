import { it, expect } from 'vitest';
import { mkdtempSync, mkdirSync, cpSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { brand } from '../src/brand.js';

it('ignores generated CI diagnostics while rejecting product literals in source', () => {
  const root = mkdtempSync(join(tmpdir(), 'brand receipts '));
  try {
    for (const dir of ['scripts', 'packages/brand/src', 'packages/example/src', 'ci-evidence'])
      mkdirSync(join(root, dir), { recursive: true });
    cpSync(
      new URL('../../../scripts/brand-check.mjs', import.meta.url),
      join(root, 'scripts/brand-check.mjs'),
    );
    cpSync(new URL('../src/brand.ts', import.meta.url), join(root, 'packages/brand/src/brand.ts'));
    const diagnostic = JSON.stringify({ name: brand.name, path: brand.binName });
    writeFileSync(join(root, 'test-results.json'), diagnostic);
    writeFileSync(join(root, 'ci-evidence/results.json'), diagnostic);
    const run = () =>
      spawnSync(process.execPath, [join(root, 'scripts/brand-check.mjs')], { encoding: 'utf8' });
    expect(run().status).toBe(0);
    writeFileSync(
      join(root, 'packages/example/src/view.ts'),
      `export const title = ${JSON.stringify(brand.name)};`,
    );
    const failed = run();
    expect(failed.status).toBe(1);
    expect(failed.stderr).toContain('packages/example/src/view.ts');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
