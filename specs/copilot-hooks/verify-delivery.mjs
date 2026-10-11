import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const cwd = join(root, 'treadle');
const logs = join(root, 'specs/copilot-hooks/checks', 'delivery-' + randomUUID());
mkdirSync(logs, { recursive: true });
const results = [];
function run(name, argv, options = {}) {
  const result = spawnSync(argv[0], argv.slice(1), { cwd, encoding: 'utf8', timeout: 180000, ...options });
  writeFileSync(join(logs, name + '.log'), (result.stdout ?? '') + (result.stderr ?? ''));
  const exit = result.status ?? 1;
  results.push({ name, argv, exit, signal: result.signal ?? null, error: result.error?.message ?? null });
  console.log(name + ': exit ' + exit);
  if (exit) throw Error(name + ' failed; see ' + logs);
  return result;
}
const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const cli = join(cwd, 'packages/cli/dist/src/main.js');
let temporary;
let env;
try {
  run('build', [pnpm, 'build']);
  temporary = mkdtempSync(join(tmpdir(), 'copilot-delivery ü '));
  const project = join(temporary, 'project');
  mkdirSync(project);
  env = { ...process.env, HARNESS_STATE_DIR: join(temporary, 'state') };
  delete env.HARNESS_RUNTIME_ENTRY;
  const flags = ['init', 'harness', '--agent', 'copilot', '--scope', 'project', '--root', project, '--hooks-only', '--yes'];
  run('installer-dry-run', [process.execPath, cli, ...flags, '--dry-run'], { env });
  if (existsSync(join(project, '.harness'))) throw Error('Dry-run changed project files');
  const installed = run('installer-apply', [process.execPath, cli, ...flags], { env });
  if (!installed.stdout.includes('project enrolled; runtime running:')) throw Error('Copilot project bootstrap was skipped');
  const config = JSON.parse(readFileSync(join(project, '.github/hooks/wukong.json'), 'utf8'));
  if (config.version !== 1 || config.hooks.sessionStart.length !== 1 || config.hooks.userPromptSubmitted.length !== 1) throw Error('Unexpected installed hook configuration');
  run('installer-repeat', [process.execPath, cli, ...flags], { env });
  const output = run('installed-wrapper', [process.execPath, join(project, '.harness/hooks/copilot-context.js'), '--event', 'sessionStart'], { cwd: project, input: JSON.stringify({ cwd: project, prompt: 'PRIVATE_DELIVERY_PROMPT' }), env });
  const context = JSON.parse(output.stdout);
  if (!context.additionalContext?.includes(project) || context.additionalContext.includes('PRIVATE_DELIVERY_PROMPT')) throw Error('Installed wrapper context mismatch');
  run('installer-remove', [process.execPath, cli, ...flags, '--remove'], { env });
  if (existsSync(join(project, '.github/hooks/wukong.json')) || existsSync(join(project, '.harness/harness-install.copilot.json'))) throw Error('Installer removal left managed wiring');
  for (const [name, script] of [['check', 'check'], ['coverage', 'coverage'], ['corpus', 'corpus:check'], ['brand', 'brand:check'], ['audit', 'audit:prod'], ['links', 'links']]) run(name, [pnpm, script]);
  // Refresh once after inspecting the final documentation and cited source claims.
  for (const [name, args] of [
    ['fingerprints', ['know', 'fingerprints', '..', '../wiki']],
    ['stamp', ['know', 'stamp', '../wiki', '--workspace', '..']],
    ['anchors', ['know', 'anchors', '../wiki', '--workspace', '..']],
    ['validate', ['know', 'validate', '../wiki']],
    ['status', ['know', 'status', '../wiki', '--workspace', '..']],
  ]) {
    const output = run(name, [pnpm, 'exec', 'tsx', 'packages/cli/src/main.ts', ...args]);
    if (name === 'validate' && !output.stdout.includes('0 error(s), 0 warning(s)')) throw Error('Wiki validation not clean');
    if (name === 'anchors' && !/anchors: \d+ checked, 0 need review/.test(output.stdout)) throw Error('Wiki anchors need review');
    if (name === 'status' && !output.stdout.includes('freshness: fresh')) throw Error('Wiki stamp is not fresh');
  }
  console.log('COPILOT DELIVERY PASS; local installer and callback witness only');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  if (env && existsSync(cli)) {
    try { run('stop-isolated-service', [process.execPath, cli, 'stop', 'serve'], { env }); }
    catch (error) { console.error(error.message); process.exitCode = 1; }
  }
  if (temporary) rmSync(temporary, { recursive: true, force: true });
  writeFileSync(join(logs, 'results.json'), JSON.stringify({ at: new Date().toISOString(), results, nativeHostVerified: false, cloudJobVerified: false }, null, 2) + '\n');
  console.log('Evidence: ' + logs);
}
