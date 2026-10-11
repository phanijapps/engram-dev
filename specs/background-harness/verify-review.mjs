/** Verify an independently supplied PACK receipt; never manufacture a verdict. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { loadPackWithMeta, planDigest, evidenceDigest, currentReview, taskEvidenced,
  alignment, resolvePath } from '../../treadle/packages/core/dist/src/index.js';

const dir = fileURLToPath(new URL('.', import.meta.url));
const loaded = loadPackWithMeta(dir);
assert(loaded.ok, loaded.message);
const { doc, path } = loaded.value;
const digest = planDigest(doc, path);
assert(digest.ok, digest.message);
assert.equal(doc.workflow.start_receipt?.plan_digest, digest.value);
assert(doc.tasks.filter((t) => t.phase !== 'review').every(taskEvidenced),
  'All implementation tasks need passing declared checks');
const aligned = alignment(doc);
assert(aligned.ok && aligned.value.violations.length === 0, 'Pack alignment failed');
assert(currentReview(doc, digest.value), 'Missing, stale, failing or self-authored PACK review');
const receipt = doc.review.verdicts.filter((v) => v.on === 'PACK').at(-1);
assert(Number.isFinite(Date.parse(receipt.at)), 'PACK review needs actual review time');
const report = readFileSync(join(dir, 'pack-review.md'), 'utf8');
for (const expected of [receipt.by, digest.value, evidenceDigest(doc), 'PASS'])
  assert(report.includes(expected), `Review report does not identify ${expected}`);
for (const artifact of Object.values(doc.artifacts ?? {})) {
  if (!artifact.sha256) continue;
  const file = resolvePath(dir, artifact.file);
  assert(file, `Invalid artifact path: ${artifact.file}`);
  assert.equal(createHash('sha256').update(readFileSync(file)).digest('hex'), artifact.sha256,
    `Artifact changed: ${artifact.file}`);
}
console.log(JSON.stringify({ verdict: 'PASS', reviewer: receipt.by,
  plan_digest: digest.value, evidence_digest: evidenceDigest(doc) }, null, 2));
