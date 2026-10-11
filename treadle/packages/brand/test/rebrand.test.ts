import { it, expect } from 'vitest';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, cpSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

it('rebrands repeatedly without changing internal identities and refuses invalid bins before writing', () => {
  const root = mkdtempSync(join(tmpdir(), 'rebrand-'));
  try {
    mkdirSync(join(root, 'scripts'));
    mkdirSync(join(root, 'packages/brand/src'), { recursive: true });
    mkdirSync(join(root, 'packages/cli'), { recursive: true });
    cpSync(
      new URL('../../../scripts/set-brand.mjs', import.meta.url),
      join(root, 'scripts/set-brand.mjs'),
    );
    const brandPath = join(root, 'packages/brand/src/brand.ts');
    cpSync(new URL('../src/brand.ts', import.meta.url), brandPath);
    const cliPath = join(root, 'packages/cli/package.json');
    const cli = {
      name: '@internal/cli',
      bin: { old: './main.js' },
      dependencies: { '@internal/core': 'workspace:*' },
    };
    writeFileSync(cliPath, JSON.stringify(cli));
    const run = (...args: string[]) =>
      spawnSync(process.execPath, [join(root, 'scripts/set-brand.mjs'), ...args], {
        encoding: 'utf8',
      });
    const initial = readFileSync(brandPath, 'utf8');
    expect(run('--name', 'Bad', '--bin', '../bad').status).toBe(1);
    expect(readFileSync(brandPath, 'utf8')).toBe(initial);
    expect(JSON.parse(readFileSync(cliPath, 'utf8'))).toEqual(cli);
    const display = `Monkey's "$friend"`;
    expect(run('--name', display, '--bin', 'monkey', '--tagline', `It's your "work"`).status).toBe(
      0,
    );
    expect(readFileSync(brandPath, 'utf8')).toContain(`name: ${JSON.stringify(display)}`);
    expect(run('--name', 'Acme', '--bin', 'acme').status).toBe(0);
    const renamed = JSON.parse(readFileSync(cliPath, 'utf8'));
    expect(renamed).toEqual({ ...cli, bin: { acme: './main.js' } });
    const final = readFileSync(brandPath, 'utf8');
    expect(final).toContain(`formerly: ${JSON.stringify(display)}`);
    expect(final.match(/stateDirectory:.*$/m)?.[0]).toBe(initial.match(/stateDirectory:.*$/m)?.[0]);
    expect(final).toContain('specpack/0.3');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
