/** Execute delivery gates and retain actual results; never fabricate witnesses. */
import { spawnSync } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const home = dirname(fileURLToPath(import.meta.url));
const root = resolve(home, '../..');
const workspace = resolve(root, 'treadle');
const run = resolve(home, 'checks', `delivery-${randomUUID()}`);
mkdirSync(run);
const hash = (file) => createHash('sha256').update(readFileSync(file)).digest('hex');
const evidence = { observed_at: new Date().toISOString(), cwd: workspace, commands: [] };
function command(name, argv) {
  console.log(`Checking ${name}: ${argv.join(' ')}`);
  const result = spawnSync(argv[0], argv.slice(1), {
    cwd: workspace, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024,
  });
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}${result.error ? result.error.message : ''}`;
  const log = resolve(run, `${name}.log`);
  writeFileSync(log, output);
  const exit = result.status ?? 1;
  evidence.commands.push({ name, argv, exit, signal: result.signal, log, sha256: hash(log) });
  writeFileSync(resolve(run, 'results.json'), `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(`${name}: exit ${exit}; ${log}`);
  if (exit !== 0) throw Error(`${name} failed; inspect retained log`);
  return output;
}
function requireValue(value, message) { if (!value) throw Error(message); }
try {
  evidence.repo_head = command('head', ['git', 'rev-parse', 'HEAD']).trim();
  for (const gate of ['check', 'coverage', 'corpus:check', 'brand:check', 'audit:prod', 'links']) {
    command(gate.replace(':', '-'), ['pnpm', gate]);
  }
  const coverage = JSON.parse(readFileSync(resolve(workspace, 'coverage/coverage-summary.json'), 'utf8')).total;
  evidence.coverage = Object.fromEntries(['statements', 'lines', 'functions', 'branches'].map((key) => [key, coverage[key].pct]));
  for (const [key, floor] of Object.entries({ statements: 75, lines: 75, functions: 75, branches: 65 })) {
    requireValue(Number.isFinite(evidence.coverage[key]) && evidence.coverage[key] >= floor, `${key} coverage below ${floor}`);
  }
  // Require the qualified actual native witness, independently of synthetic tests.
  evidence.native = command('native', ['node', resolve(home, 'verify-hosts.mjs')]).trim();
  const know = ['pnpm', 'exec', 'tsx', 'packages/cli/src/main.ts', 'know'];
  command('fingerprints', [...know, 'fingerprints', '..', '../wiki']);
  command('stamp', [...know, 'stamp', '../wiki', '--workspace', '..']);
  const anchors = command('anchors', [...know, 'anchors', '../wiki', '--workspace', '..']);
  const validation = command('validate', [...know, 'validate', '../wiki']);
  const status = command('status', [...know, 'status', '../wiki', '--workspace', '..']);
  requireValue(/anchors: \d+ checked, 0 need review(?:\n|$)/.test(anchors), 'Wiki anchors need review');
  requireValue(/conformant: 0 error\(s\), 0 warning\(s\)/.test(validation), 'Wiki errors or warnings');
  requireValue(/^freshness: fresh$/m.test(status) && /^conformance: 0 error\(s\), 0 warning\(s\)$/m.test(status), 'Wiki status is not fresh and clean');
  const stamp = JSON.parse(readFileSync(resolve(root, 'wiki/.okf/last-index.json'), 'utf8'));
  requireValue(stamp.repo_head === evidence.repo_head, 'Wiki stamp does not match checked HEAD');
  evidence.source_hashes = Object.fromEntries([
    'wiki/systems/sdd-harness-architecture.md', 'wiki/systems/owner-workflow.md',
    'wiki/initiatives/browser-agent-feedback.md', 'wiki/initiatives/index.md',
    'treadle/packages/cli/harness/hooks/README.md',
    'treadle/packages/core/src/feedback/model.ts', 'treadle/packages/core/src/feedback/store.ts',
    'treadle/packages/cli/src/commands/feedback.ts', 'treadle/packages/cli/src/harness/feedback-snapshot.ts',
    'treadle/packages/cli/src/harness/context.ts', 'treadle/packages/web/src/project-server.ts',
    'specs/browser-agent-feedback/verify-delivery.mjs',
  ].map((file) => [file, hash(resolve(root, file))]));
  evidence.limits = 'Python-only fingerprints and Git HEAD stamp do not establish dirty TypeScript/Markdown freshness. Native Resolve exception remains waived/unverified.';
  evidence.result = 'pass';
  console.log(`Delivery checks pass; coverage ${JSON.stringify(evidence.coverage)}; wiki 0 errors/warnings/review anchors, fresh. ${evidence.limits}`);
} catch (error) {
  evidence.result = 'fail';
  evidence.error = error.message;
  console.error(error.message);
  process.exitCode = 1;
} finally {
  writeFileSync(resolve(run, 'results.json'), `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(`Delivery evidence: ${run}/results.json`);
}
