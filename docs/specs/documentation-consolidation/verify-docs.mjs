/** Read-only documentation audit. Run with tsx from the treadle workspace. */
import { readFileSync, existsSync, statSync } from 'node:fs';
import { dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { iterConceptFiles, parseConcept } from '../../../treadle/packages/knowledge/src/parse.ts';
import { validateBundle } from '../../../treadle/packages/knowledge/src/validate.ts';
import { extractLinkTargets } from '../../../treadle/packages/knowledge/src/links.ts';
import { listFindings } from '../../../treadle/packages/knowledge/src/findings.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const bundle = resolve(root, 'wiki');
const baseline = JSON.parse(readFileSync(resolve(root,
  'docs/specs/documentation-consolidation/baseline.json'), 'utf8'));
const hash = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');
const failures = [];
for (const group of ['protected_files', 'preserved_documentation']) {
  for (const [path, digest] of Object.entries(baseline[group])) {
    const absolute = resolve(root, path);
    if (!existsSync(absolute) || hash(absolute) !== digest) failures.push(`Changed ${group}: ${path}`);
  }
}
const paths = iterConceptFiles(bundle);
const pages = paths.map((path) => parseConcept(path, bundle));
const byPath = new Map(pages.map((page) => [resolve(page.path), page]));
const reached = new Set();
const pending = [resolve(bundle, 'index.md')];
while (pending.length) {
  const path = pending.pop();
  if (reached.has(path)) continue;
  reached.add(path);
  const page = byPath.get(path);
  if (!page) continue;
  for (const target of extractLinkTargets(page.body)) {
    const absolute = target.startsWith('/')
      ? resolve(bundle, target.slice(1)) : resolve(dirname(path), target);
    if (byPath.has(absolute)) pending.push(absolute);
  }
}
const sourceHashes = {};
let lineReferences = 0;
for (const page of pages) {
  if (page.reserved !== null) continue;
  if (!reached.has(resolve(page.path))) failures.push(`Unreachable concept: ${page.cid}`);
  const sources = page.frontmatter.sources;
  if (!Array.isArray(sources) || !sources.length) failures.push(`No evidence sources: ${page.cid}`);
  for (const source of sources ?? []) {
    const path = source.resource;
    const absolute = typeof path === 'string' ? resolve(root, path) : '';
    if (!absolute || !existsSync(absolute) || !statSync(absolute).isFile()) {
      failures.push(`Missing source: ${page.cid} → ${path}`);
    } else sourceHashes[path] = hash(absolute);
  }
  for (const match of page.body.matchAll(/`([^`\n]+):(\d+)`/g)) {
    const path = match[1];
    if (!/^(?:treadle\/|docs\/|wiki\/|\.github\/|AGENTS\.md$|SECURITY\.md$)/.test(path)) continue;
    const absolute = resolve(root, path);
    if (!existsSync(absolute)) failures.push(`Missing locator: ${page.cid} → ${path}`);
    else if (Number(match[2]) < 1 || Number(match[2]) > readFileSync(absolute, 'utf8').split('\n').length) {
      failures.push(`Invalid line: ${page.cid} → ${path}:${match[2]}`);
    }
    lineReferences++;
  }
}
const packSnapshots = [];
for (const path of Object.keys(baseline.protected_files)) {
  if (!/^docs\/specs\/([^/]+)\/\1\.json$/.test(path)) continue;
  const slug = path.split('/')[2];
  const pack = JSON.parse(readFileSync(resolve(root, path), 'utf8'));
  const digest = hash(resolve(root, path));
  for (const concept of [`initiatives/${slug}.md`, `retrospectives/2026-10-10-${slug}.md`]) {
    const absolute = resolve(bundle, concept);
    if (!existsSync(absolute)) failures.push(`Missing projection: ${concept}`);
    else if (!readFileSync(absolute, 'utf8').includes(digest)) failures.push(`Missing snapshot hash: ${concept}`);
  }
  packSnapshots.push({ path, revision: pack.revision, sha256: digest, status: pack.status });
}
const policy = listFindings({ bundle }).find((finding) =>
  finding.source === 'docs/specs/documentation-consolidation/feature.md' &&
  finding.destination === 'wiki/project/documentation-lifecycle.md' && finding.kind === 'policy');
if (!policy || policy.status !== 'pending') failures.push('Lifecycle finding is absent or not pending');
const report = validateBundle(bundle);
for (const issue of [...report.errors, ...report.warnings]) failures.push(`${issue.cid}: ${issue.code}`);
console.log(JSON.stringify({
  observed_at: new Date().toISOString(),
  repo_head: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
  working_tree: execFileSync('git', ['status', '--short'], { cwd: root, encoding: 'utf8' }).trim(),
  scope: 'Artifact immutability, preserved prose, wiki reachability, source presence, line bounds, pack coverage, pending proposal, OKF validation. Not semantic proof or engine freshness.',
  concepts: pages.filter((page) => page.reserved === null).length,
  reachable_concepts: pages.filter((page) => page.reserved === null && reached.has(resolve(page.path))).length,
  line_references: lineReferences,
  protected_files: Object.keys(baseline.protected_files).length,
  preserved_documents: Object.keys(baseline.preserved_documentation).length,
  inventory_entries: Object.keys(baseline.documentation_inventory).length,
  pack_snapshots: packSnapshots,
  lifecycle_finding: policy ?? null,
  source_hashes: sourceHashes,
  errors: report.errors.length,
  warnings: report.warnings.length,
  failures,
}, null, 2));
process.exitCode = failures.length ? 1 : 0;
