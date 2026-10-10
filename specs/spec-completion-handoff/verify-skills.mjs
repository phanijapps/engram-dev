import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const workspace = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const source = join(workspace, 'treadle/packages/cli/harness/skills/sdlc');
const names = ['analyze', 'plan', 'implement', 'review'];
function files(dir, prefix = '') {
  return readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? files(join(dir, e.name), prefix + e.name + '/') : [prefix + e.name]).sort();
}
for (const name of names) {
  const origin = join(source, name);
  for (const agent of ['pi', 'codex', 'claude']) {
    const installed = join(workspace, '.' + agent, 'skills', name);
    assert.deepEqual(files(installed), files(origin), `${agent}/${name}: file inventory`);
    for (const file of files(origin)) assert.deepEqual(readFileSync(join(installed, file)), readFileSync(join(origin, file)), `${agent}/${name}/${file}: installed bytes`);
  }
  const evaluation = JSON.parse(readFileSync(join(origin, 'evals/cases.json'), 'utf8'));
  assert.equal(new Set(evaluation.cases.map(c => c.id)).size, evaluation.cases.length);
  for (const c of evaluation.cases) assert.ok(c.fixture_recipe && c.prompt && c.expectations.length, c.id);
}
// Exercise the admissions the skills rely on, rather than matching prose wording.
const result = spawnSync(join(workspace, 'treadle/node_modules/.bin/vitest'), ['run', 'packages/core/test/owner-workflow.test.ts', 'packages/cli/test/owner-workflow.test.ts'], { cwd: join(workspace, 'treadle'), encoding: 'utf8' });
process.stdout.write(result.stdout ?? ''); process.stderr.write(result.stderr ?? '');
assert.equal(result.status, 0, 'Owner gate scenarios must pass');
console.log('Four skill trees match Pi, Codex and Claude. Engine approval scenarios pass. Model behavior remains an independent review item.');
