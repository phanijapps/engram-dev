/** Verify the omitted machine handoff and installed skill convergence. */
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPackWithMeta } from '../../../treadle/packages/core/src/specpack/loader.ts';
import { alignment } from '../../../treadle/packages/core/src/specpack/alignment.ts';
import { where } from '../../../treadle/packages/cli/src/harness/where.ts';

const directory = dirname(fileURLToPath(import.meta.url));
const root = resolve(directory, '../../..');
const loaded = loadPackWithMeta(directory);
if (!loaded.ok) throw new Error(loaded.message);
const { doc } = loaded.value;
const checked = alignment(doc);
if (!checked.ok || checked.value.violations.length) throw new Error(JSON.stringify(checked));
if (doc.approved_by || doc.approved_at || doc.closed_by || doc.closed_at || doc.status === 'complete') {
  throw new Error('The backfill must not invent owner approval or closure');
}
if (doc.spec.requirements.length !== 7 || doc.tasks.length !== 5) throw new Error('Incomplete machine plan');
if (doc.plan.decisions.length !== 4 || doc.plan.decisions.some((decision) => decision.status !== 'proposed')) {
  throw new Error('Decision proposals were lost or accepted without the owner');
}
for (let i = 0; i < doc.tasks.length; i++) {
  const task = doc.tasks[i];
  const expected = i ? [`T-${i}`] : [];
  if (JSON.stringify(task.needs) !== JSON.stringify(expected)) throw new Error(`Wrong prerequisites: ${task.id}`);
  if (!task.verify?.cmd || !task.context?.touch?.length) throw new Error(`Missing frozen verification: ${task.id}`);
  if (i < 4 && (task.status !== 'done' || !task.evidence?.some((entry) => entry.exit === 0 && entry.by === 'agent:codex'))) {
    throw new Error(`Missing current re-verification evidence: ${task.id}`);
  }
}
const discovered = where(root).packs.find((pack) => pack.name === doc.name);
if (!discovered || discovered.stage !== doc.deliverable) throw new Error('Pack discovery/stage mismatch');
let compared = 0;
function compareTree(source, destination) {
  for (const entry of readdirSync(source, { withFileTypes: true })) {
    const from = join(source, entry.name), to = join(destination, entry.name);
    if (entry.isDirectory()) compareTree(from, to);
    else {
      if (!readFileSync(from).equals(readFileSync(to))) throw new Error(`Installed file differs: ${to}`);
      compared++;
    }
  }
}
for (const skill of ['analyze', 'plan', 'implement', 'review']) {
  for (const agent of ['pi', 'codex']) {
    compareTree(join(root, 'treadle/packages/cli/harness/skills/sdlc', skill), join(root, `.${agent}/skills`, skill));
  }
}
console.log(JSON.stringify({ result: 'PASS', pack: doc.name, revision: doc.revision,
  stage: doc.deliverable, alignment_violations: checked.value.violations,
  requirements: 7, tasks: 5, installed_files_compared: compared,
  owner_approval: 'unset', owner_closure: 'unset', observed_at: new Date().toISOString() }, null, 2));
