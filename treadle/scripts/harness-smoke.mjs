/** Actual portable runtime journey; no host LLM calls and no owner actions. */
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const root = mkdtempSync(join(tmpdir(), 'harness journey ü '));
const workspace = join(root, 'project with spaces');
mkdirSync(join(workspace, 'specs'), { recursive: true });
mkdirSync(join(workspace, 'wiki'));
writeFileSync(
  join(workspace, 'wiki/guide.md'),
  '---\ntitle: Guide\ntype: Project\ndescription: Fixture guidance.\n---\n\n# Guide\nA local fixture.\n',
);
const entry = fileURLToPath(new URL('../packages/cli/dist/src/main.js', import.meta.url));
const env = { ...process.env, HARNESS_STATE_DIR: join(root, 'private state') };
const commands = [];
function run(args, json = false) {
  const r = spawnSync(process.execPath, [entry, ...args], {
    cwd: workspace,
    env,
    encoding: 'utf8',
    timeout: 30000,
  });
  commands.push({ command: ['node', '<built-cli>', ...args], exit: r.status ?? 1 });
  assert.equal(r.status, 0, r.stderr || String(r.error));
  return json ? JSON.parse(r.stdout) : r.stdout;
}
let error;
const checks = [];
try {
  const first = run(['start', 'serve', '--port', '0', '--json'], true);
  const second = run(['start', 'serve', '--json'], true);
  assert.equal(first.instance, second.instance);
  checks.push('shared-instance');
  const connected = run(['project', 'connect', workspace, '--json'], true);
  assert.equal(connected.service.instance, first.instance);
  const projects = await globalThis.fetch(first.url + 'projects').then((r) => r.json());
  assert.equal(projects.length, 1);
  assert.equal(projects[0].available, true);
  const base = first.url + `projects/${connected.project.id}/`;
  for (const path of ['', 'library/', 'wiki', 'wiki/search?q=Guide']) {
    const response = await globalThis.fetch(path ? base + path : first.url);
    assert.equal(response.status, 200, path);
  }
  checks.push('project-wiki-library');
  const before = readFileSync(join(env.HARNESS_STATE_DIR, 'projects.json'), 'utf8');
  const context = run(['context', '--workspace', workspace, '--json'], true);
  assert.equal(context.specs.packs.length, 0);
  assert.equal(context.wiki.available, true);
  assert.equal(readFileSync(join(env.HARNESS_STATE_DIR, 'projects.json'), 'utf8'), before);
  checks.push('read-only-context');
  run(['stop', 'serve']);
  assert.equal(run(['status', 'serve'], true).state, 'stopped');
  const restarted = run(['project', 'connect', workspace, '--json'], true);
  assert.notEqual(restarted.service.instance, first.instance);
  assert.equal(restarted.project.id, connected.project.id);
  checks.push('stop-next-event-restart', 'persistent-enrollment');
  assert.equal(run(['status', 'serve'], true).state, 'running');
  checks.push('parent-exit-survival');
} catch (e) {
  error = e.stack;
  process.exitCode = 1;
} finally {
  try {
    run(['stop', 'serve']);
  } catch (e) {
    error ??= e.stack;
    process.exitCode = 1;
  }
  const result = {
    format: 'harness-smoke/1',
    platform: process.platform,
    node: process.version,
    at: new Date().toISOString(),
    exit: process.exitCode ?? 0,
    commands,
    checks,
    error: error ?? null,
    scope:
      'Runtime fixture on actual OS; host trust/activation and actual host prompts are separate witnesses.',
  };
  const output =
    process.env.HARNESS_SMOKE_OUTPUT ??
    join(process.env.RUNNER_TEMP ?? tmpdir(), 'harness-smoke.json');
  writeFileSync(output, JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result));
  rmSync(root, { recursive: true, force: true });
}
