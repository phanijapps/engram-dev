import { expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { brand } from '@treadle/brand';

const workspaceDir = basename(resolve(import.meta.dirname, '../../..'));

// Execute the Bash installer with disposable dependency stubs. No global link,
// network clone or developer checkout is modified by these branch/failure checks.
function installFixture(existingRef?: string, failure?: string, selectedRef?: string) {
  const root = mkdtempSync(join(tmpdir(), 'installer contract '));
  const bin = join(root, 'bin');
  const source = join(root, 'source with spaces');
  const log = join(root, 'calls.jsonl');
  mkdirSync(bin);
  if (existingRef) mkdirSync(join(source, '.git'), { recursive: true });
  const stub = `#!${process.execPath}
const fs = require('node:fs');
const path = require('node:path');
const name = path.basename(process.argv[1]);
const args = process.argv.slice(2);
fs.appendFileSync(process.env.INSTALL_TEST_LOG, JSON.stringify({name,args,cwd:process.cwd()})+'\\n');
if (name === 'node' && args[0] === '-p') {
  if (process.env.INSTALL_TEST_FAILURE === 'node-version') process.exit(9);
  console.log(process.env.INSTALL_TEST_FAILURE === 'invalid-node-version' ? 'unknown'
    : process.env.INSTALL_TEST_FAILURE === 'old-node-version' ? '20' : '24');
}
if (name === 'git' && args.includes('symbolic-ref')) console.log(process.env.INSTALL_TEST_REF);
if (name === 'git' && args[0] === 'clone') fs.mkdirSync(path.join(args.at(-1),${JSON.stringify(workspaceDir)},'packages/cli'),{recursive:true});
if (name === 'corepack' && args.at(-1) === '--version') console.log(process.env.INSTALL_TEST_FAILURE === 'wrong-pnpm-version' ? '10.0.0' : '9.15.9');
if (name === 'node' && args[0]?.endsWith('setup.mjs') && process.env.INSTALL_TEST_FAILURE === 'build') process.exit(19);
if (name === 'corepack' && args.includes(process.env.INSTALL_TEST_FAILURE)) process.exit(19);
if (name === 'git' && args.includes('pull') && process.env.INSTALL_TEST_FAILURE === 'git-pull') process.exit(19);
if (name === 'node' && args[0]?.endsWith('dist/src/main.js') && process.env.INSTALL_TEST_FAILURE === 'verify') process.exit(19);
`;
  for (const name of ['git', 'node', 'pnpm', 'corepack', brand.binName])
    writeFileSync(join(bin, name), stub, { mode: 0o755 });
  if (existingRef) mkdirSync(join(source, workspaceDir, 'packages/cli'), { recursive: true });
  const result = spawnSync('bash', [resolve(import.meta.dirname, '../../../../install.sh')], {
    env: {
      ...process.env,
      PATH: bin + ':' + process.env.PATH,
      ENGRAM_SRC: source,
      HARNESS_REPO_URL: 'https://example.invalid/fixture.git',
      HARNESS_REF: selectedRef,
      INSTALL_TEST_LOG: log,
      INSTALL_TEST_REF: existingRef ?? '',
      INSTALL_TEST_FAILURE: failure ?? '',
    },
    encoding: 'utf8',
    timeout: 10000,
  });
  const calls = readFileSync(log, 'utf8')
    .trim()
    .split('\n')
    .map((line) => JSON.parse(line) as { name: string; args: string[]; cwd: string });
  rmSync(root, { recursive: true, force: true });
  return { result, calls, source };
}

it.skipIf(process.platform === 'win32')(
  'fresh install selects main and shared setup before it links and verifies the CLI',
  () => {
    const { result, calls, source } = installFixture();
    expect(result.status, result.stderr).toBe(0);
    expect(calls.find((c) => c.name === 'git')!.args).toEqual([
      'clone',
      '-q',
      '--branch',
      'main',
      '--single-branch',
      'https://example.invalid/fixture.git',
      source,
    ]);
    expect(calls.filter((c) => c.name === 'corepack').map((c) => c.args)).toEqual([
      ['pnpm@9.15.9', '--version'],
      ['pnpm@9.15.9', 'link', '--global'],
    ]);
    expect(calls.find((c) => c.name === 'node' && c.args[0].endsWith('setup.mjs'))!.args).toEqual([
      join(source, 'scripts/setup.mjs'),
    ]);
    expect(
      calls.find((c) => c.name === 'node' && c.args[0].endsWith('dist/src/main.js'))!.args,
    ).toEqual([join(source, workspaceDir, 'packages/cli/dist/src/main.js'), '--version']);
    expect(calls.at(-1)!.name).toBe(brand.binName);
  },
);

it.skipIf(process.platform === 'win32').each([
  ['node-version', 9],
  ['invalid-node-version', 1],
  ['old-node-version', 1],
] as const)('refuses %s before it clones or links', (failure, exit) => {
  const { result, calls } = installFixture(undefined, failure);
  expect(result.status).toBe(exit);
  expect(calls.every((c) => c.name === 'node')).toBe(true);
  expect(result.stdout).not.toContain('installed. try:');
});

it.skipIf(process.platform === 'win32')(
  'updates the selected existing branch without a branch switch',
  () => {
    const { result, calls, source } = installFixture(
      'release-fixture',
      undefined,
      'release-fixture',
    );
    expect(result.status, result.stderr).toBe(0);
    expect(calls.find((c) => c.name === 'git' && c.args.includes('pull'))!.args).toEqual([
      '-C',
      source,
      'pull',
      '--ff-only',
      'origin',
      'release-fixture',
    ]);
    expect(calls.some((c) => c.args.includes('checkout') || c.args.includes('clone'))).toBe(false);
  },
);

it.skipIf(process.platform === 'win32')(
  'refuses another branch before source updates or a global link',
  () => {
    const { result, calls } = installFixture('other-branch');
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('existing files were left unchanged');
    expect(calls.some((c) => c.args.includes('pull') || c.args.includes('link'))).toBe(false);
  },
);

it.skipIf(process.platform === 'win32')(
  'refuses a wrong package manager before Git mutates source',
  () => {
    const { result, calls } = installFixture(undefined, 'wrong-pnpm-version');
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('9.15.9');
    expect(calls.some((call) => call.name === 'git')).toBe(false);
  },
);
it.skipIf(process.platform === 'win32')('stops when a fast-forward update fails', () => {
  const { result, calls } = installFixture('main', 'git-pull');
  expect(result.status).toBe(19);
  expect(calls.some((call) => call.args[0]?.endsWith('setup.mjs'))).toBe(false);
});
it.skipIf(process.platform === 'win32').each(['link', 'verify'])(
  'propagates %s failure without reporting success',
  (failure) => {
    const { result } = installFixture(undefined, failure);
    expect(result.status).toBe(19);
    expect(result.stdout).not.toContain('installed. try:');
  },
);

it.skipIf(process.platform === 'win32')(
  'propagates a failed build and never links or reports installation success',
  () => {
    const { result, calls } = installFixture(undefined, 'build');
    expect(result.status).toBe(19);
    expect(calls.some((c) => c.args.includes('--global') || c.name === brand.binName)).toBe(false);
    expect(result.stdout).not.toContain('installed. try:');
  },
);
