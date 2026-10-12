// Disposable resolution probe. Does not edit repository implementation files.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
const pack = dirname(fileURLToPath(import.meta.url));
const root = resolve(pack, '../..');
const checks = join(pack, 'checks');
mkdirSync(checks, { recursive: true });
const started = new Date().toISOString();
const temp = mkdtempSync(join(tmpdir(), 'install-bootstrap-probe-'));
const rows = [];
function run(label, cmd, args, cwd, expected) {
  const before = new Date().toISOString();
  const result = spawnSync(cmd, args, { cwd, encoding: 'utf8', timeout: 15000 });
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;
  writeFileSync(join(checks, `${label}.log`), output);
  rows.push({ label, cmd, args, cwd, expected, exit: result.status,
    error: result.error?.message, started: before, completed: new Date().toISOString() });
  if (result.status !== expected) throw Error(`${label}: unexpected exit ${result.status}`);
  return output;
}
try {
  const archive = join(temp, 'source.tar');
  const git = spawnSync('git', ['archive', '--output', archive, 'HEAD'], { cwd: root });
  if (git.status !== 0) throw Error('Archive failed');
  const source = join(temp, 'source with spaces');
  mkdirSync(source);
  run('extract', 'tar', ['-xf', archive, '-C', source], root, 0);
  run('pnpm-version', 'corepack', ['pnpm', '--version'], source, 0);
  run('root-frozen-before', 'corepack', ['pnpm', 'install', '--frozen-lockfile', '--lockfile-only', '--ignore-scripts'], source, 1);
  run('root-unfrozen-before', 'corepack', ['pnpm', 'install', '--no-frozen-lockfile', '--lockfile-only', '--ignore-scripts'], source, 1);
  run('nested-frozen-before', 'corepack', ['pnpm', 'install', '--frozen-lockfile', '--lockfile-only', '--ignore-scripts'], join(source, 'treadle'), 0);
  const manifest = JSON.parse(readFileSync(join(source, 'package.json'), 'utf8'));
  delete manifest.dependencies;
  delete manifest.bundleDependencies;
  delete manifest.scripts;
  writeFileSync(join(source, 'package.json'), JSON.stringify(manifest, null, 2) + '\n');
  writeFileSync(join(source, 'pnpm-lock.yaml'), "lockfileVersion: '9.0'\n\nsettings:\n  autoInstallPeers: true\n  excludeLinksFromLockfile: false\n\nimporters:\n  .: {}\n");
  run('candidate-root-frozen-resolution', 'corepack', ['pnpm', 'install', '--frozen-lockfile', '--lockfile-only', '--ignore-scripts'], source, 0);
} finally {
  const files = ['package.json', 'treadle/package.json', 'treadle/pnpm-lock.yaml',
    'treadle/pnpm-workspace.yaml', 'install.sh', 'install.ps1', '.gitignore'];
  const hashes = Object.fromEntries(files.map((file) => [file,
    createHash('sha256').update(readFileSync(join(root, file))).digest('hex')]));
  writeFileSync(join(checks, 'probe-results.json'), JSON.stringify({ started,
    completed: new Date().toISOString(), platform: process.platform, node: process.version,
    source_hashes: hashes, commands: rows,
    limit: 'Resolution only, scripts disabled. Candidate setup helper, real build and native host activation untested.' }, null, 2) + '\n');
  rmSync(temp, { recursive: true, force: true });
}
console.log('Confirmed root failures, nested frozen resolution, and candidate root boundary. No implementation files changed.');
