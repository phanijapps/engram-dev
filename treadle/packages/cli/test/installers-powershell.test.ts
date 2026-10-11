import { expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { brand } from '@treadle/brand';

const workspaceDir = basename(resolve(import.meta.dirname, '../../..'));
type Call = { name: string; args: string[]; cwd: string };

// Real native command exit codes, disposable command stubs: no network or global link.
function fixture(existingRef = '', failure = '') {
  const root = mkdtempSync(join(tmpdir(), 'powershell installer '));
  const bin = join(root, 'bin');
  const source = join(root, 'source with spaces');
  const log = join(root, 'calls.jsonl');
  const stub = join(root, 'command.cjs');
  mkdirSync(bin);
  if (existingRef) {
    mkdirSync(join(source, '.git'), { recursive: true });
    mkdirSync(join(source, workspaceDir, 'packages/cli'), { recursive: true });
  }
  writeFileSync(
    stub,
    `
const fs = require('node:fs');
const path = require('node:path');
const [name, ...args] = process.argv.slice(2);
fs.appendFileSync(process.env.INSTALL_TEST_LOG, JSON.stringify({name,args,cwd:process.cwd()})+'\\n');
if (name === 'node' && args[0] === '-p') {
  if (process.env.INSTALL_TEST_FAILURE === 'node-version') process.exit(9);
  console.log(process.env.INSTALL_TEST_FAILURE === 'invalid-node-version' ? 'unknown'
    : process.env.INSTALL_TEST_FAILURE === 'old-node-version' ? '20' : '24');
}
if (name === 'git' && args.includes('symbolic-ref')) console.log(process.env.INSTALL_TEST_REF);
if (name === 'git' && args[0] === 'clone') fs.mkdirSync(path.join(args.at(-1), ${JSON.stringify(workspaceDir)}, 'packages/cli'), {recursive:true});
if (name+':'+args[0] === process.env.INSTALL_TEST_FAILURE) process.exit(19);
`,
  );
  for (const name of ['node', 'git', 'pnpm', brand.binName]) {
    writeFileSync(
      join(bin, name + '.cmd'),
      `@"${process.execPath}" "${stub}" ${name} %*\r\n@exit /b %errorlevel%\r\n`,
    );
  }
  try {
    const result = spawnSync(
      'pwsh',
      [
        '-NoProfile',
        '-NonInteractive',
        '-File',
        resolve(import.meta.dirname, '../../../../install.ps1'),
        '-Source',
        source,
        '-Repository',
        'https://example.invalid/fixture.git',
        '-Ref',
        'release-fixture',
      ],
      {
        env: {
          ...process.env,
          PATH: bin + ';' + process.env.PATH,
          INSTALL_TEST_LOG: log,
          INSTALL_TEST_REF: existingRef,
          INSTALL_TEST_FAILURE: failure,
        },
        encoding: 'utf8',
        timeout: 20000,
      },
    );
    const calls = readFileSync(log, 'utf8')
      .trim()
      .split('\n')
      .map((line) => JSON.parse(line) as Call);
    return { result, calls, source };
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

it.skipIf(process.platform !== 'win32')(
  'PowerShell selects source and verifies the linked command',
  () => {
    const { result, calls, source } = fixture();
    expect(result.status, result.stderr).toBe(0);
    expect(calls.find((c) => c.name === 'git')?.args).toEqual([
      'clone',
      '--branch',
      'release-fixture',
      '--single-branch',
      'https://example.invalid/fixture.git',
      source,
    ]);
    expect(calls.filter((c) => c.name === 'pnpm').map((c) => c.args)).toEqual([
      ['install', '--frozen-lockfile'],
      ['build'],
      ['link', '--global'],
    ]);
    expect(calls.find((c) => c.name === 'node' && c.args[0] !== '-p')?.args).toEqual([
      join(source, workspaceDir, 'packages/cli/dist/src/main.js'),
      '--version',
    ]);
    expect(calls.at(-1)?.name).toBe(brand.binName);
  },
);

it
  .skipIf(process.platform !== 'win32')
  .each(['node-version', 'invalid-node-version', 'old-node-version'])(
  'PowerShell refuses %s before cloning',
  (failure) => {
    const { result, calls } = fixture('', failure);
    expect(result.status, result.stderr).toBe(1);
    expect(calls.every((c) => c.name === 'node')).toBe(true);
    expect(result.stdout).not.toContain('Installed.');
  },
);

it.skipIf(process.platform !== 'win32')(
  'PowerShell updates only the selected existing branch',
  () => {
    const { result, calls, source } = fixture('release-fixture');
    expect(result.status, result.stderr).toBe(0);
    expect(calls.find((c) => c.args.includes('pull'))?.args).toEqual([
      '-C',
      source,
      'pull',
      '--ff-only',
      'origin',
      'release-fixture',
    ]);
    expect(calls.some((c) => c.args.includes('clone') || c.args.includes('checkout'))).toBe(false);
  },
);

it.skipIf(process.platform !== 'win32')(
  'PowerShell preserves a checkout on a different branch',
  () => {
    const { result, calls } = fixture('main');
    expect(result.status, result.stderr).toBe(1);
    expect(result.stderr).toContain('existing files were left unchanged');
    expect(calls.some((c) => c.args.includes('pull') || c.name === 'pnpm')).toBe(false);
  },
);

it.skipIf(process.platform !== 'win32').each([
  ['pnpm:install', 'Dependency installation failed'],
  ['pnpm:build', 'Build failed'],
  ['pnpm:link', 'Global link failed'],
] as const)('PowerShell stops after %s fails', (failure, message) => {
  const { result, calls } = fixture('', failure);
  expect(result.status, result.stderr).toBe(1);
  expect(result.stderr).toContain(message);
  expect(calls.at(-1)?.name + ':' + calls.at(-1)?.args[0]).toBe(failure);
  expect(result.stdout).not.toContain('Installed.');
});
