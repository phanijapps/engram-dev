#!/usr/bin/env node
/** Source bootstrap: keep dependency resolution and build in the nested workspace. */
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const workspace = resolve(root, 'treadle');
const pinnedVersion = '9.15.9';

function command(program, args, cwd, capture = false) {
  const options = { cwd, ...(capture ? { encoding: 'utf8' } : { stdio: 'inherit' }) };
  if (process.platform !== 'win32') return spawnSync(program, args, options);
  // .cmd launchers need a shell; encoded literal arguments avoid path interpolation.
  const literal = (value) => "'" + value.replaceAll("'", "''") + "'";
  const script = `$ErrorActionPreference='Stop'; if (-not (Get-Command ${literal(program)} -ErrorAction SilentlyContinue)) { exit 127 }; & ${literal(program)} ${args.map(literal).join(' ')}; exit $LASTEXITCODE`;
  return spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-EncodedCommand',
    Buffer.from(script, 'utf16le').toString('base64')], options);
}

function manager() {
  if (Number(process.versions.node.split('.')[0]) < 22) {
    throw Error('Node 22 or newer is required for source setup.');
  }
  let program = 'corepack';
  let prefix = ['pnpm'];
  let probe = command(program, [...prefix, '--version'], root, true);
  if (probe.error?.code === 'ENOENT' || probe.status === 127) {
    program = 'pnpm';
    prefix = [];
    probe = command(program, ['--version'], root, true);
  }
  if (probe.error || probe.status !== 0) {
    const detail = probe.stderr?.trim() || probe.error?.message || `exit ${probe.status}`;
    throw Error(`Install Corepack or pnpm ${pinnedVersion}, then retry source setup. ${detail}`);
  }
  if (probe.stdout.trim() !== pinnedVersion) {
    throw Error(`Source setup requires pnpm ${pinnedVersion}; found ${probe.stdout.trim() || 'unknown'}. Enable the pinned Corepack version or install the matching pnpm.`);
  }
  return { program, prefix };
}

try {
  if (process.argv.slice(2).some((argument) => argument !== '--check')) {
    throw Error('Usage: node scripts/setup.mjs [--check]');
  }
  const selected = manager();
  if (!process.argv.includes('--check')) {
    for (const args of [['install', '--frozen-lockfile'], ['build']]) {
      const result = command(selected.program, [...selected.prefix, ...args], workspace);
      if (result.error || result.status !== 0) {
        console.error(`Source setup failed during ${args[0]}: ${result.error?.message ?? `exit ${result.status}`}`);
        process.exitCode = result.status && result.status > 0 ? result.status : 1;
        break;
      }
    }
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
