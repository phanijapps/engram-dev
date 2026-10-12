import assert from 'node:assert/strict';
import { existsSync, readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { skill, cases, materializeCase, snapshot } from './eval-support.mjs';

const validator = join(process.env.CODEX_HOME || join(homedir(), '.codex'),
  'skills/.system/skill-creator/scripts/quick_validate.py');
assert.ok(existsSync(validator), 'Skill creator validator unavailable; do not invent a pass');
const validation = spawnSync('python3', [validator, skill], { encoding: 'utf8' });
process.stdout.write(validation.stdout + validation.stderr);
assert.equal(validation.status, 0, 'Skill frontmatter/unfinished-scaffold validation failed');
for (const path of ['resources/okf-consumption.md', 'evals/cases.json', 'evals/rubric.md']) {
  assert.ok(existsSync(join(skill, path)), `Missing routed resource ${path}`);
}
assert.equal(new Set(cases.map((c) => c.id)).size, cases.length, 'Duplicate case ID');
const root = mkdtempSync(join(tmpdir(), 'search-kb-structure-'));
try {
  for (const item of cases) {
    assert.ok(item.prompt && item.expectations.length, `${item.id}: incomplete recipe`);
    const fixture = materializeCase(item.id, join(root, item.id));
    assert.deepEqual(snapshot(fixture.root), fixture.before);
    for (const [path, bytes] of Object.entries(item.files)) {
      assert.equal(readFileSync(join(fixture.root, path), 'utf8'), bytes);
    }
    assert.ok(!('expectations' in fixture), 'Expected answers leaked to evaluator descriptor');
  }
} finally { rmSync(root, { recursive: true, force: true }); }
console.log(`${cases.length} isolated case recipes materialize exactly; routed resources present. Behavioral runs not claimed.`);
