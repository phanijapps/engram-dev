/** Verify the owner-directed withdrawal without reconstructing past sessions. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPackWithMeta } from '../../../treadle/packages/core/src/specpack/loader.ts';
import { alignment } from '../../../treadle/packages/core/src/specpack/alignment.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');
const loaded = loadPackWithMeta(resolve(root, 'docs/specs/documentation-consolidation'));
assert.equal(loaded.ok, true);
const { doc } = loaded.value;
const decisions = new Map(doc.plan.decisions.map((decision) => [decision.id, decision]));
assert.equal(decisions.get('D-1').status, 'proposed');
assert.equal(decisions.get('D-2').status, 'rejected');
assert.equal(decisions.get('D-3').status, 'rejected');
assert.equal(decisions.get('D-4').status, 'accepted');
assert.equal(decisions.get('D-4').accepted_by, 'human:owner');
assert.ok(doc.approved_at);
assert.equal(doc.closed_by, undefined);
assert.notEqual(doc.status, 'complete');
const checked = alignment(doc);
assert.equal(checked.ok, true);
assert.deepEqual(checked.value.violations, []);

const slugs = ['fresh-harness', 'guided-loop', 'install-paths', 'stitch-ui'];
const preserved = JSON.parse(read('docs/specs/documentation-consolidation/withdrawn-retrospective-hashes.json'));
assert.equal(Object.keys(preserved).length, slugs.length);
for (const slug of slugs) {
  const name = `2026-10-10-${slug}.md`;
  const former = `wiki/retrospectives/${name}`;
  const archive = `docs/archive/documentation/2026-10-10/withdrawn-retrospectives/${name}`;
  const before = execFileSync('git', ['show', `e225fba:${former}`], { cwd: root });
  assert.equal(digest(readFileSync(resolve(root, archive))), digest(before));
  assert.equal(preserved[archive], digest(before));
  const notice = read(former);
  assert.match(notice, /type: Record/);
  assert.match(notice, /status: deprecated/);
  assert.match(notice, /Retrospective unavailable/);
  assert.match(notice, /earlier interpretation is withdrawn/);
  assert.doesNotMatch(notice, /# (?:Intended result|Recorded result|Causes and lesson candidates|Trade-offs|Proposed follow-ups)/);
  assert.doesNotMatch(read('wiki/retrospectives/index.md'), new RegExp(name.replaceAll('.', '\\.')));
  assert.match(read(`wiki/initiatives/${slug}.md`), /retrospective is \[unavailable\]/);
}
assert.match(read('wiki/project/documentation-map.md'), /Research consolidation still needs a replacement design/);
assert.match(read('wiki/project/documentation-lifecycle.md'), /retrospective needs observations from the actual/);
assert.doesNotMatch(read('wiki/project/documentation-lifecycle.md'), /retrospective from its record/);
assert.match(read('wiki/project/open-work.md'), /\| G11 \|/);
assert.match(read('wiki/project/open-work.md'), /\| G12 \|/);

const audit = spawnSync(resolve(root, 'treadle/node_modules/.bin/tsx'),
  [resolve(root, 'docs/specs/documentation-consolidation/verify-docs.mjs')],
  { cwd: root, encoding: 'utf8' });
assert.equal(audit.status, 0, audit.stderr || audit.stdout);
const report = JSON.parse(audit.stdout);
assert.deepEqual(report.failures, []);
console.log(JSON.stringify({
  result: 'PASS', observed_at: new Date().toISOString(), revision: doc.revision,
  dispositions: Object.fromEntries([...decisions].map(([id, decision]) => [id, decision.status])),
  withdrawn_artifacts_preserved: slugs.length,
  historical_session_retrospectives_available: 0,
  research_consolidation: 'replacement design still open',
  protected_files: report.protected_files,
  concepts: report.concepts, reachable_concepts: report.reachable_concepts,
  errors: report.errors, warnings: report.warnings,
}, null, 2));
