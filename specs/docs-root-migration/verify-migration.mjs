/** Current migration checks; historical verification commands retain their old paths. */
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { iterConceptFiles, parseConcept } from '../../treadle/packages/knowledge/src/parse.ts';
import { validateBundle } from '../../treadle/packages/knowledge/src/validate.ts';
import { extractLinkTargets } from '../../treadle/packages/knowledge/src/links.ts';
import { loadPackWithMeta } from '../../treadle/packages/core/src/specpack/loader.ts';
import { alignment } from '../../treadle/packages/core/src/specpack/alignment.ts';
import { where } from '../../treadle/packages/cli/src/harness/where.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const bundle = join(root, 'wiki');
const read = (path) => readFileSync(join(root, path), 'utf8');
const hash = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');
const manifest = JSON.parse(read('specs/docs-root-migration/relocations.json'));
assert.equal(existsSync(join(root, 'docs')), false, 'docs must not exist, including as a symlink');
for (const [old, entry] of Object.entries(manifest.files)) {
  const destination = join(root, entry.destination);
  assert.ok(existsSync(destination), `Missing relocation: ${old}`);
  assert.equal(hash(destination), entry.sha256, `Changed historical bytes: ${old}`);
}
for (const entry of Object.values(manifest.research_concepts)) {
  const original = read(entry.source);
  const concept = read(entry.concept);
  assert.ok(concept.includes('# Complete historical research source'));
  assert.ok(concept.endsWith(original), `Research omitted: ${entry.concept}`);
}

const pages = iterConceptFiles(bundle).map((path) => parseConcept(path, bundle));
const byPath = new Map(pages.map((page) => [resolve(page.path), page]));
const reached = new Set();
const pending = [join(bundle, 'index.md')];
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
let sources = 0;
for (const page of pages) {
  if (page.reserved !== null) continue;
  assert.ok(reached.has(resolve(page.path)), `Unreachable concept: ${page.cid}`);
  assert.ok(page.frontmatter.sources?.length, `No sources: ${page.cid}`);
  for (const source of page.frontmatter.sources) {
    const path = join(root, source.resource);
    assert.ok(existsSync(path) && statSync(path).isFile(), `Missing source: ${page.cid} → ${source.resource}`);
    sources++;
  }
  // Complete historical source text preserves its dated locators; current prose is checked separately.
  const current = page.body.split('# Complete historical research source')[0];
  for (const match of current.matchAll(/`((?:treadle\/|specs\/|wiki\/|\.github\/|AGENTS\.md|SECURITY\.md)[^`\n]*):(\d+)`/g)) {
    const path = join(root, match[1]);
    assert.ok(existsSync(path), `Missing locator: ${page.cid} → ${match[1]}`);
    assert.ok(Number(match[2]) > 0 && Number(match[2]) <= readFileSync(path, 'utf8').split('\n').length,
      `Out-of-bounds locator: ${page.cid} → ${match[0]}`);
  }
}
const validation = validateBundle(bundle);
assert.deepEqual(validation.errors, []);
assert.deepEqual(validation.warnings, []);
const report = where(root);
assert.ok(report.packs.some((pack) => pack.name === 'docs-root-migration'));
assert.ok(report.packs.some((pack) => pack.name === 'install-paths' && pack.stage === 'delivered'));
assert.ok(report.packs.every((pack) => pack.path.startsWith(join(root, 'specs') + '/')));
assert.ok(report.packs.every((pack) => pack.stage !== 'refused'));
assert.ok(!report.packs.some((pack) => pack.path.includes('/archive/')));
const loaded = loadPackWithMeta(join(root, 'specs/docs-root-migration'));
assert.equal(loaded.ok, true);
const checked = alignment(loaded.value.doc);
assert.equal(checked.ok, true);
assert.deepEqual(checked.value.violations, []);
for (const slug of ['fresh-harness', 'guided-loop', 'install-paths', 'stitch-ui']) {
  const notice = read(`wiki/retrospectives/2026-10-10-${slug}.md`);
  assert.match(notice, /earlier interpretation is withdrawn/);
  assert.match(notice, /type: Record/);
}

let installed = 0;
if (process.argv.includes('--handoff')) {
  const skills = ['analyze', 'plan', 'implement', 'review', 'nodejs-craft', 'nodejs-architecture', 'boy-scout'];
  const files = (path, prefix = '') => readdirSync(path, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? files(join(path, entry.name), prefix + entry.name + '/') : [prefix + entry.name]);
  for (const skill of skills) {
    const group = skill.startsWith('nodejs-') || skill === 'boy-scout' ? 'node' : 'sdlc';
    const source = join(root, 'treadle/packages/cli/harness/skills', group, skill);
    for (const file of files(source)) {
      const text = readFileSync(join(source, file), 'utf8');
      assert.ok(!text.includes('docs/specs/'), `Stale work root in shipped ${skill}/${file}`);
      assert.ok(!text.includes('docs/research/'), `Stale research source in shipped ${skill}/${file}`);
      for (const agent of ['pi', 'codex', 'claude']) {
        assert.equal(readFileSync(join(root, '.' + agent, 'skills', skill, file), 'utf8'), text,
          `Installed skill differs: ${agent}/${skill}/${file}`);
        installed++;
      }
    }
  }
  const response = await fetch('http://127.0.0.1:8788/specs');
  assert.equal(response.status, 200);
  const listed = await response.json();
  assert.ok(listed.specs.some((pack) => pack.name === 'docs-root-migration'));
  assert.deepEqual(listed.specs.map((pack) => pack.name).sort(), report.packs.map((pack) => pack.name).sort());
  const spec = await fetch('http://127.0.0.1:8788/spec/docs-root-migration');
  assert.equal(spec.status, 200);
  assert.equal((await spec.json()).name, 'docs-root-migration');
}
console.log(JSON.stringify({
  result: 'PASS', observed_at: new Date().toISOString(), mode: process.argv.includes('--handoff') ? 'handoff' : 'files',
  moved_files_preserved: Object.keys(manifest.files).length,
  full_research_pages: Object.keys(manifest.research_concepts).length,
  concepts: pages.filter((page) => page.reserved === null).length,
  source_resources_checked: sources, packs: report.packs.map((pack) => pack.name),
  installed_files_compared: installed, errors: validation.errors.length, warnings: validation.warnings.length,
  owner_approval: loaded.value.doc.approved_at ?? 'unset', closure: loaded.value.doc.closed_at ?? 'unset',
}, null, 2));
