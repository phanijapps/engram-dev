import { it, expect } from 'vitest';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, cpSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

it('rebrands repeatedly without changing internal identities and refuses invalid bins before writing', () => {
  const root = mkdtempSync(join(tmpdir(), 'rebrand-'));
  const workspace = join(root, 'workspace');
  try {
    mkdirSync(join(workspace, 'scripts'), { recursive: true });
    mkdirSync(join(workspace, 'packages/brand/src'), { recursive: true });
    mkdirSync(join(workspace, 'packages/cli'), { recursive: true });
    cpSync(
      new URL('../../../scripts/set-brand.mjs', import.meta.url),
      join(workspace, 'scripts/set-brand.mjs'),
    );
    const brandPath = join(workspace, 'packages/brand/src/brand.ts');
    cpSync(new URL('../src/brand.ts', import.meta.url), brandPath);
    const cliPath = join(workspace, 'packages/cli/package.json');
    const wrapperPath = join(root, 'package.json');
    const wrapper = { name: 'internal-root', bin: { old: './bin/entry.js' }, private: true };
    writeFileSync(wrapperPath, JSON.stringify(wrapper));
    const cli = {
      name: '@internal/cli',
      bin: { old: './main.js' },
      dependencies: { '@internal/core': 'workspace:*' },
    };
    writeFileSync(cliPath, JSON.stringify(cli));
    const run = (...args: string[]) =>
      spawnSync(process.execPath, [join(workspace, 'scripts/set-brand.mjs'), ...args], {
        encoding: 'utf8',
      });
    const initial = readFileSync(brandPath, 'utf8');
    expect(run('--name', 'Bad', '--bin', '../bad').status).toBe(1);
    expect(readFileSync(brandPath, 'utf8')).toBe(initial);
    expect(JSON.parse(readFileSync(cliPath, 'utf8'))).toEqual(cli);
    expect(JSON.parse(readFileSync(wrapperPath, 'utf8'))).toEqual(wrapper);
    const display = `Monkey's "$friend"`;
    expect(run('--name', display, '--bin', 'monkey', '--tagline', `It's your "work"`).status).toBe(
      0,
    );
    expect(readFileSync(brandPath, 'utf8')).toContain(`name: ${JSON.stringify(display)}`);
    expect(run('--name', 'Acme', '--bin', 'acme').status).toBe(0);
    const renamed = JSON.parse(readFileSync(cliPath, 'utf8'));
    expect(renamed).toEqual({ ...cli, bin: { acme: './main.js' } });
    expect(JSON.parse(readFileSync(wrapperPath, 'utf8'))).toEqual({
      ...wrapper,
      bin: { acme: './bin/entry.js' },
    });
    const final = readFileSync(brandPath, 'utf8');
    expect(final).toContain(`formerly: ${JSON.stringify(display)}`);
    expect(final.match(/stateDirectory:.*$/m)?.[0]).toBe(initial.match(/stateDirectory:.*$/m)?.[0]);
    expect(final).toContain('specpack/0.3');
    const beforeInvalid = [brandPath, cliPath].map((path) => readFileSync(path, 'utf8'));
    writeFileSync(wrapperPath, JSON.stringify({ ...wrapper, bin: { a: 'one', b: 'two' } }));
    expect(run('--name', 'Refused', '--bin', 'refused').status).toBe(1);
    expect([brandPath, cliPath].map((path) => readFileSync(path, 'utf8'))).toEqual(beforeInvalid);
    rmSync(wrapperPath);
    expect(run('--name', 'Standalone', '--bin', 'standalone').status).toBe(0);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
