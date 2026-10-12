import { expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';

const workspace = resolve(import.meta.dirname, '../../..');
const source = resolve(workspace, '..');
const workspaceName = basename(workspace);
const roots: string[] = [];
function temporary() {
  const root = mkdtempSync(join(tmpdir(), 'source setup with spaces '));
  roots.push(root);
  return root;
}
import { afterEach } from 'vitest';
afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

type Call = { name: string; args: string[]; cwd: string };
function mockSetup(mode = '') {
  const root = temporary();
  const bin = join(root, 'tools');
  const log = join(root, 'calls.jsonl');
  mkdirSync(bin);
  mkdirSync(join(root, 'scripts'));
  mkdirSync(join(root, workspaceName));
  cpSync(join(source, 'scripts/setup.mjs'), join(root, 'scripts/setup.mjs'));
  const stub = join(root, 'tool.cjs');
  writeFileSync(
    stub,
    `
const fs = require('node:fs');
const [name, ...args] = process.argv.slice(2);
fs.appendFileSync(process.env.SOURCE_SETUP_LOG, JSON.stringify({name,args,cwd:process.cwd()})+'\\n');
if (name === 'corepack' && process.env.SOURCE_SETUP_MODE === 'fallback') process.exit(127);
if (args.at(-1) === '--version') {
  if (process.env.SOURCE_SETUP_MODE === 'unavailable') process.exit(9);
  console.log(process.env.SOURCE_SETUP_MODE === 'wrong-version' ? '10.0.0' : '9.15.9');
}
if (args.includes(process.env.SOURCE_SETUP_MODE) && ['install','build'].includes(process.env.SOURCE_SETUP_MODE)) process.exit(19);
`,
  );
  for (const name of ['corepack', 'pnpm']) {
    if (process.platform === 'win32') {
      writeFileSync(
        join(bin, name + '.cmd'),
        `@"${process.execPath}" "${stub}" ${name} %*\r\n@exit /b %errorlevel%\r\n`,
      );
    } else {
      // The Unix executable needs the same explicit tool identity as the Windows shim.
      writeFileSync(
        join(bin, name),
        `#!${process.execPath}\nprocess.argv.splice(2,0,${JSON.stringify(name)});require(${JSON.stringify(stub)});\n`,
        { mode: 0o755 },
      );
    }
  }
  const result = spawnSync(process.execPath, [join(root, 'scripts/setup.mjs')], {
    cwd: tmpdir(),
    encoding: 'utf8',
    timeout: 30000,
    env: {
      ...process.env,
      PATH: bin + (process.platform === 'win32' ? ';' : ':') + process.env.PATH,
      SOURCE_SETUP_LOG: log,
      SOURCE_SETUP_MODE: mode,
    },
  });
  const calls = readFileSync(log, 'utf8')
    .trim()
    .split('\n')
    .map((line) => JSON.parse(line) as Call);
  return { root, result, calls };
}

it('runs pinned install then build in the source workspace, independently of caller cwd', () => {
  const f = mockSetup();
  expect(f.result.status, f.result.stderr).toBe(0);
  expect(f.calls.map((call) => call.args)).toEqual([
    ['pnpm', '--version'],
    ['pnpm', 'install', '--frozen-lockfile'],
    ['pnpm', 'build'],
  ]);
  expect(f.calls.slice(1).every((call) => call.cwd === join(f.root, workspaceName))).toBe(true);
});
it('uses only the pinned pnpm fallback when Corepack is absent', () => {
  const f = mockSetup('fallback');
  expect(f.result.status, f.result.stderr).toBe(0);
  expect(f.calls.map((call) => [call.name, ...call.args])).toEqual([
    ['corepack', 'pnpm', '--version'],
    ['pnpm', '--version'],
    ['pnpm', 'install', '--frozen-lockfile'],
    ['pnpm', 'build'],
  ]);
});
it.each(['unavailable', 'wrong-version'])('refuses %s tools before installation', (mode) => {
  const f = mockSetup(mode);
  expect(f.result.status).toBe(1);
  expect(f.result.stderr).toContain('9.15.9');
  expect(f.calls).toHaveLength(1);
});
it.each(['install', 'build'])('propagates %s failure and stops', (mode) => {
  const f = mockSetup(mode);
  expect(f.result.status).toBe(19);
  expect(f.result.stderr).toContain(`during ${mode}`);
  expect(f.calls.at(-1)?.args).toContain(mode);
  expect(f.calls.some((call) => call.args.includes('--global'))).toBe(false);
});
it('reports source setup guidance when the root compiled entry is absent', () => {
  const root = temporary();
  mkdirSync(join(root, 'bin'));
  cpSync(join(source, 'bin/engram.js'), join(root, 'bin/engram.js'));
  writeFileSync(join(root, 'package.json'), '{"type":"module"}');
  const result = spawnSync(process.execPath, [join(root, 'bin/engram.js'), '--help'], {
    encoding: 'utf8',
  });
  expect(result.status).toBe(1);
  expect(result.stderr).toContain('corepack pnpm run setup');
});

function realCommand(args: string[], cwd: string) {
  const options = { cwd, encoding: 'utf8' as const, timeout: 180000 };
  if (process.platform !== 'win32') return spawnSync('pnpm', args, options);
  const literal = (value: string) => "'" + value.replaceAll("'", "''") + "'";
  const script =
    "$ErrorActionPreference='Stop'; & pnpm " + args.map(literal).join(' ') + '; exit $LASTEXITCODE';
  return spawnSync(
    'powershell.exe',
    [
      '-NoProfile',
      '-NonInteractive',
      '-EncodedCommand',
      Buffer.from(script, 'utf16le').toString('base64'),
    ],
    options,
  );
}

it('real native root frozen lifecycle builds the CLI without changing either lockfile', () => {
  const root = temporary();
  for (const file of ['package.json', 'pnpm-lock.yaml', 'scripts/setup.mjs', 'bin/engram.js']) {
    mkdirSync(resolve(join(root, file), '..'), { recursive: true });
    cpSync(join(source, file), join(root, file));
  }
  const excluded = new Set(['node_modules', 'dist', 'coverage', '.git', 'test-results.json']);
  cpSync(workspace, join(root, workspaceName), {
    recursive: true,
    filter: (path) => !excluded.has(basename(path)) && !path.endsWith('.tsbuildinfo'),
  });
  const locks = ['pnpm-lock.yaml', join(workspaceName, 'pnpm-lock.yaml')];
  const digest = (file: string) =>
    createHash('sha256')
      .update(readFileSync(join(root, file)))
      .digest('hex');
  const before = locks.map(digest);
  const result = realCommand(['install', '--frozen-lockfile'], root);
  expect(result.status, result.stdout + result.stderr).toBe(0);
  expect(locks.map(digest)).toEqual(before);
  const entry = join(root, workspaceName, 'packages/cli/dist/src/main.js');
  const smoke = spawnSync(process.execPath, [entry, '--help'], {
    encoding: 'utf8',
    timeout: 30000,
  });
  expect(smoke.status, smoke.stderr).toBe(0);
  expect(smoke.stdout).toContain('init');
  const wrapper = spawnSync(process.execPath, [join(root, 'bin/engram.js'), '--help'], {
    encoding: 'utf8',
    timeout: 30000,
  });
  expect(wrapper.status, wrapper.stderr).toBe(0);
  expect(wrapper.stdout).toBe(smoke.stdout);
  console.log(
    JSON.stringify({
      nativeRootLifecycle: process.platform,
      node: process.version,
      install: result.status,
      compiledCli: smoke.status,
      rootWrapper: wrapper.status,
      locks: Object.fromEntries(locks.map((file, index) => [file, before[index]])),
    }),
  );
}, 240000);
