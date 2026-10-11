/** Preserve actual step outcomes, including stages that never ran. */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const steps = JSON.parse(process.env.CI_STEP_RESULTS ?? '{}');
const smokeFile = join(process.env.RUNNER_TEMP, 'harness-smoke.json');
const smokeRan = steps.smoke && !['skipped', 'cancelled'].includes(steps.smoke.outcome);
const result = {
  format: 'ci-evidence/1',
  commit: process.env.GITHUB_SHA,
  platform: process.platform,
  node: process.version,
  image: process.env.ImageVersion,
  steps,
  smoke: existsSync(smokeFile) ? JSON.parse(readFileSync(smokeFile, 'utf8')) : null,
};
mkdirSync('ci-evidence', { recursive: true });
writeFileSync('ci-evidence/results.json', JSON.stringify(result, null, 2) + '\n');
if (smokeRan && result.smoke === null)
  throw Error('Executed smoke step omitted its required report');
