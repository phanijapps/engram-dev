import { mkdirSync, mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
const pack = dirname(fileURLToPath(import.meta.url));
const repo = resolve(pack, '../..');
const workspace = join(repo, 'treadle');
const dir = join(pack, 'checks', `delivery-${new Date().toISOString().replace(/[:.]/g, '-')}`);
mkdirSync(dir, { recursive: true });
const results = [];
function run(name, command, args, cwd = workspace) {
  const options = { cwd, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, timeout: 600000 };
  let result;
  if (process.platform === 'win32' && command === 'pnpm') {
    const literal = (value) => "'" + value.replaceAll("'", "''") + "'";
    const script = "$ErrorActionPreference='Stop'; & pnpm " + args.map(literal).join(' ') + '; exit $LASTEXITCODE';
    result = spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-EncodedCommand',
      Buffer.from(script, 'utf16le').toString('base64')], options);
  } else result = spawnSync(command, args, options);
  writeFileSync(join(dir, name + '.log'), (result.stdout ?? '') + (result.stderr ?? '') + (result.error ? '\n' + result.error.message : ''));
  const row = { name, command, args, cwd, exit: result.status ?? 1 };
  results.push(row);
  writeFileSync(join(dir, 'results.json'), JSON.stringify(results, null, 2) + '\n');
  console.log(`${name}: exit ${row.exit}`);
  return row;
}
run('real-root-lifecycle', 'pnpm', ['exec', 'vitest', 'run', 'packages/cli/test/source-setup.test.ts']);
const deployed = mkdtempSync(join(tmpdir(), 'bootstrap runtime smoke '));
try {
  const target = join(deployed, 'runtime');
  const packaged = run('runtime-package', process.execPath, ['scripts/package-runtime.mjs', target]);
  if (packaged.exit === 0) {
    run('runtime-help', process.execPath, [join(target, 'dist/src/main.js'), '--help'], deployed);
    run('runtime-copilot-preview', process.execPath, [join(target, 'dist/src/main.js'), 'init', 'harness',
      '--agent', 'copilot', '--scope', 'project', '--hooks-only', '--no-agents', '--root',
      join(deployed, 'target project'), '--dry-run'], deployed);
  }
} finally { rmSync(deployed, { recursive: true, force: true }); }
for (const gate of ['check', 'coverage', 'corpus:check', 'brand:check', 'audit:prod', 'links']) {
  run(gate.replace(':', '-'), 'pnpm', [gate]);
}
const head = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' });
let current = false;
try { current = head.status === 0 && JSON.parse(readFileSync(join(repo, 'wiki/.okf/last-index.json'), 'utf8')).repo_head === head.stdout.trim(); }
catch { /* Authorized maintenance follows successful source checks. */ }
const cli = ['exec', 'tsx', 'packages/cli/src/main.ts'];
if (results.every((row) => row.exit === 0) && !current) {
  run('wiki-fingerprints', 'pnpm', [...cli, 'know', 'fingerprints', '..', '../wiki']);
  run('wiki-stamp', 'pnpm', [...cli, 'know', 'stamp', '../wiki', '--workspace', '..']);
} else {
  writeFileSync(join(dir, 'wiki-maintenance-note.txt'), current
    ? 'Current HEAD stamp retained. Python-only fingerprints do not attest dirty TypeScript/Markdown sources.\n'
    : 'Failed gates: baseline not refreshed to hide stale metadata.\n');
}
run('wiki-anchors', 'pnpm', [...cli, 'know', 'anchors', '../wiki', '--workspace', '..']);
run('wiki-validate', 'pnpm', [...cli, 'know', 'validate', '../wiki']);
run('wiki-status', 'pnpm', [...cli, 'know', 'status', '../wiki', '--workspace', '..']);
if (!readFileSync(join(dir, 'wiki-validate.log'), 'utf8').includes('0 error(s), 0 warning(s)') ||
    !readFileSync(join(dir, 'wiki-anchors.log'), 'utf8').includes('0 need review') ||
    !readFileSync(join(dir, 'wiki-status.log'), 'utf8').includes('freshness: fresh') ||
    results.some((row) => row.exit !== 0)) throw Error('Delivery failed; actual results retained at ' + dir);
console.log('Delivery PASS: real root lifecycle, portable runtime, six gates and wiki checks. Evidence ' + dir);
