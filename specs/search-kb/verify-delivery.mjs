import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { repo, cases, verifyEvaluation } from './eval-support.mjs';

const evaluations = join(repo, 'specs/search-kb/evaluations');
for (const item of cases) verifyEvaluation(evaluations, item.id);
if (process.argv.includes('--evidence-only')) {
  console.log(`${cases.length} actual evaluation records pass identity, side-effect, and independent rubric gates.`);
  process.exit(0);
}
const dir = join(repo, 'specs/search-kb/checks', `delivery-${new Date().toISOString().replace(/[:.]/g, '-')}`);
mkdirSync(dir, { recursive: true });
const results = [];
function run(name, argv) {
  const r = spawnSync(argv[0], argv.slice(1), { cwd: join(repo, 'treadle'), encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  writeFileSync(join(dir, name + '.log'), (r.stdout ?? '') + (r.stderr ?? '') + (r.error ? '\n' + r.error.message : ''));
  const result = { name, command: argv, exit: r.status ?? 1 };
  results.push(result);
  writeFileSync(join(dir, 'results.json'), JSON.stringify(results, null, 2) + '\n');
  console.log(`${name}: exit ${result.exit}`);
  return result;
}
for (const gate of ['check', 'coverage', 'corpus:check', 'brand:check', 'audit:prod', 'links']) run(gate.replace(':', '-'), ['pnpm', gate]);
const cli = ['pnpm', 'exec', 'tsx', 'packages/cli/src/main.ts'];
run('wiki-fingerprints', [...cli, 'know', 'fingerprints', '..', '../wiki']);
run('wiki-stamp', [...cli, 'know', 'stamp', '../wiki', '--workspace', '..']);
run('wiki-anchors', [...cli, 'know', 'anchors', '../wiki', '--workspace', '..']);
run('wiki-validate', [...cli, 'know', 'validate', '../wiki']);
run('wiki-status', [...cli, 'know', 'status', '../wiki', '--workspace', '..']);
const validation = readFileSync(join(dir, 'wiki-validate.log'), 'utf8');
const anchors = readFileSync(join(dir, 'wiki-anchors.log'), 'utf8');
const status = readFileSync(join(dir, 'wiki-status.log'), 'utf8');
if (!validation.includes('0 error(s), 0 warning(s)') || !anchors.includes('0 need review') || !status.includes('freshness: fresh')) {
  throw Error('Wiki counts/freshness failed; exit 0 alone is insufficient');
}
if (results.some((r) => r.exit !== 0)) throw Error('Delivery checks failed; actual failures retained in ' + dir);
console.log(`Delivery PASS: ${cases.length} actual evaluated cases, six repository gates and wiki checks. Evidence ${dir}`);
