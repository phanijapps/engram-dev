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
  if (doc.revision !== 15 || doc.status === 'complete' || doc.workflow?.pending_audit.length ||
      doc.tasks.some((task) => task.status !== 'done') || !plan.ok ||
      plan.value !== '4c108a984a111836932fafcb7502aed1d76b1f9fa16baf7537f9d2c7ec78c744' ||
      evidence !== '13194a519c70fe570c4f4187ef1ac8ead63b49e1e6e668c02a252db3f94d3fd1') {
    throw Error('Reviewed revision, plan, or task evidence changed');
  }
  const report = readFileSync(join(dir, 'review-pack.md'));
  const commands = JSON.parse(readFileSync(join(dir, 'checks/pack-review-2026-10-12/results.json'), 'utf8'));
  if (!report.toString().includes('PASS — nothing to fix') || commands.length !== 4 || commands.some((row) => row.exit !== 0)) {
    throw Error('Missing actual independent PASS evidence');
  }
  const native = JSON.parse(readFileSync(join(dir, 'checks/native-ci-attempt-3.json'), 'utf8'));
  const supplement = readFileSync(join(dir, 'review-delivery-2026-10-12.md'), 'utf8');
  const delivery = readFileSync(join(dir, 'delivery-status-2026-10-12.md'), 'utf8');
  const required = ['check (ubuntu-latest, 22)', 'check (ubuntu-latest, 24)',
    'check (macos-latest, 22)', 'check (macos-latest, 24)'];
  if (native.headSha !== '71b5a2008d47461d7ea638a0628aa6422d0a95d0' ||
      native.status !== 'completed' || native.conclusion !== 'failure' || native.jobs.length !== 6 ||
      required.some((name) => !native.jobs.some((job) => job.name === name && job.conclusion === 'success')) ||
      !native.jobs.some((job) => job.name === 'check (windows-latest, 22)' && job.conclusion === 'success') ||
      !native.jobs.some((job) => job.name === 'check (windows-latest, 24)' && job.conclusion === 'failure') ||
      !delivery.includes('ignore windows errors for nwo') ||
      !/^Verdict: \*\*QUALIFIED PASS\*\*$/m.test(supplement) ||
      !supplement.includes('ignore windows errors for nwo')) {
    throw Error('Missing native receipts, explicit Windows deferral, or independent qualified review');
  }
  const at = new Date().toISOString();
  doc.artifacts.review = { file: 'review-pack.md', type: 'text/markdown',
    sha256: createHash('sha256').update(report).digest('hex') };
  doc.review ??= { verdicts: [] };
  doc.review.verdicts ??= [];
  doc.review.verdicts.push({ on: 'PACK', verdict: 'PASS', by: 'agent:search_kb_plan_review', at,
    plan_digest: plan.value, evidence_digest: evidence,
    note: 'Recorded from actual independent read-only review of source 71b5a20/revision15: all four exact checks rerun exit0, compiled repairs verified, source/canonical/wiki hashes preserved. See review-pack.md and review-delivery-2026-10-12.md. Native CI run38265890294 attempt3 passes Ubuntu/macOS Node22/24 and Windows22; Windows24 remains failed. User explicitly instructed "ignore windows errors for nwo"; Windows remediation is deferred as disclosed in delivery-status-2026-10-12.md, not converted to success. Raw receipt checks/native-ci-attempt-3.json. Owner Finish remains separate and pending.' });
  doc.revision = 16;
  const saved = savePack(doc, path, { at });
  if (saved?.audit_pending || saved?.durability_error) throw Error(JSON.stringify(saved));
  return { revision: doc.revision, plan_digest: plan.value, evidence_digest: evidence, owner_finish: 'pending' };
});
if (!result.ok) throw Error(JSON.stringify(result));
console.log(JSON.stringify(result.value, null, 2));
