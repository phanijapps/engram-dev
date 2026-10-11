/** Plan 4 runtime acceptance. Full host release verification stays separate. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { loadPackWithMeta } from '../../treadle/packages/core/dist/src/index.js';

const dir = fileURLToPath(new URL('.', import.meta.url));
const read = (file) => JSON.parse(readFileSync(join(dir, file), 'utf8'));
const matrix = read('platform-evidence.json');
const provenance = read('native-runtime/run-38101187204/provenance.json');
const required = ['shared-instance', 'project-wiki-library', 'read-only-context',
  'stop-next-event-restart', 'persistent-enrollment', 'parent-exit-survival'];
assert.equal(matrix.runtimeFiles.length, 6);
const seen = new Set();
for (const file of matrix.runtimeFiles) {
  const bytes = readFileSync(join(dir, file));
  const result = JSON.parse(bytes);
  const original = provenance.witnesses.find((w) => w.file === file);
  assert(original, `Missing provenance: ${file}`);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), original.sha256);
  assert.equal(result.format, 'harness-smoke/1');
  assert.equal(result.exit, 0);
  assert(Array.isArray(result.commands) && result.commands.length > 0);
  assert(result.commands.every((c) => c.exit === 0));
  assert(Array.isArray(result.checks) && required.every((c) => result.checks.includes(c)));
  assert.equal(result.platform, original.platform);
  assert.equal(result.node, original.node);
  const key = `${result.platform}/${Number(result.node.match(/^v(\d+)\./)?.[1])}`;
  assert(!seen.has(key), `Duplicate native combination: ${key}`);
  seen.add(key);
}
for (const platform of ['linux', 'darwin', 'win32'])
  for (const node of [22, 24]) assert(seen.has(`${platform}/${node}`));
const loaded = loadPackWithMeta(join(dir, '../harness-host-acceptance'));
assert(loaded.ok, loaded.message);
const backlog = loaded.value.doc;
assert.equal(backlog.tasks.length, 4);
assert.equal(backlog.workflow.start_receipt, undefined, 'Backlog execution was not authorized');
const groups = [['claude'], ['codex-cli'], ['codex-desktop', 'codex-ide'], ['pi']];
assert.equal(matrix.pendingHostJourneys.length, groups.length);
const checks = ['clean install', 'human activation/trust', 'project selection', 'new spec',
  'continue spec', 'stop and next-event restart', 'session exit leaves server running',
  'upgrade and removal preserve foreign configuration', 'owner workflow'];
for (const [i, surfaces] of groups.entries()) {
  const task = backlog.tasks.find((t) => t.id === `T-${i + 1}`);
  assert(task && task.status === 'todo', `Missing pending backlog task T-${i + 1}`);
  assert.deepEqual(task.surfaces, surfaces);
  assert.deepEqual(task.platforms, ['linux', 'darwin', 'win32']);
  assert.deepEqual(task.checks, checks);
  assert.equal(task.verify.cmd, `node specs/harness-host-acceptance/verify-host-journey.mjs ${task.id}`);
}
assert.equal(read('release-verification.json').verdict, 'INCOMPLETE');
console.log(JSON.stringify({ verdict: 'PASS', scope: 'Native runtime and backlog transfer only',
  combinations: [...seen], deferred: backlog.name, fullHostAcceptance: 'INCOMPLETE' }, null, 2));
