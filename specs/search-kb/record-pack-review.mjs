import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { withPackLock, loadPackWithMeta, savePack, planDigest, evidenceDigest } from '../../treadle/packages/core/dist/src/index.js';

const dir = dirname(fileURLToPath(import.meta.url));
const result = withPackLock(dir, () => {
  const loaded = loadPackWithMeta(dir);
  if (!loaded.ok) throw Error(JSON.stringify(loaded));
  const { doc, path } = loaded.value;
  const plan = planDigest(doc, path);
  const evidence = evidenceDigest(doc);
  if (doc.revision !== 19 || doc.status === 'complete' || doc.workflow?.pending_audit.length ||
      doc.tasks.some((task) => task.status !== 'done') || !plan.ok ||
      plan.value !== '297612805f8a47638dc1a3e3244a4e78cf1b764034e3470e412924e3897d3654' ||
      evidence !== '87cdccb53e8fd8dbb825800d65a4c801ab37de0068a52f8e3289ccb4554c1d0e') {
    throw Error('Reviewed revision, plan, or evidence changed');
  }
  const report = readFileSync(join(dir, 'review-pack.md'));
  const checks = JSON.parse(readFileSync(join(dir, 'checks/pack-review-2026-10-12/results.json'), 'utf8'));
  if (!report.toString().includes('PASS — nothing to fix') || checks.length !== 4 ||
      checks.some((check) => check.exit !== 0)) throw Error('Missing actual independent PASS evidence');
  const at = new Date().toISOString();
  doc.artifacts.review = { file: 'review-pack.md', type: 'text/markdown',
    sha256: createHash('sha256').update(report).digest('hex') };
  doc.review ??= { verdicts: [] };
  doc.review.verdicts ??= [];
  doc.review.verdicts.push({ on: 'PACK', verdict: 'PASS', by: 'agent:search_kb_plan_review', at,
    plan_digest: plan.value, evidence_digest: evidence,
    note: 'Actual independent read-only PACK review of source 4d15fbb and revision 19; all four exact checks rerun exit 0, fixture/source/wiki hashes preserved. See review-pack.md and checks/pack-review-2026-10-12/. Recorded by the root writer from the independent verdict; owner Finish remains pending.' });
  doc.revision = 20;
  const saved = savePack(doc, path, { at });
  if (saved?.audit_pending || saved?.durability_error) throw Error(JSON.stringify(saved));
  return { revision: doc.revision, plan_digest: plan.value, evidence_digest: evidence, owner_finish: 'pending' };
});
if (!result.ok) throw Error(JSON.stringify(result));
process.stdout.write(`${JSON.stringify(result.value, null, 2)}\n`);
