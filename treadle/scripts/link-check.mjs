#!/usr/bin/env node
/** The links gate (FR-12): every markdown link in LIVE surfaces must
 *  resolve. The archive is excluded by design — history is evidence,
 *  and old links there are period-correct.
 *
 *  Live surfaces: README.md, AGENTS.md, CONTRIBUTING.md, SECURITY.md,
 *  DEBT.md (repo root), the workspace README (treadle/README.md), docs/product,
 *  wiki, and the shipped harness markdown. Scope honesty: fenced links,
 *  HTML anchors, and reference-style definitions are NOT checked —
 *  markdown-shaped inline links only. That is the whole scope.
 *  Node modules, dist, coverage, and the archive never walk. */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';

const ROOT = join(import.meta.dirname, '..', '..');
const WORKSPACE = 'treadle'; // path segment, not a brand string — the fence stays clean
const LIVE_FILES = [
  'README.md',
  'AGENTS.md',
  'CONTRIBUTING.md',
  'SECURITY.md',
  'DEBT.md',
  join(WORKSPACE, 'README.md'),
].map((f) => join(ROOT, f));
const LIVE_DIRS = [
  join(ROOT, 'docs', 'product'),
  join(ROOT, 'wiki'),
  join(ROOT, WORKSPACE, 'packages', 'cli', 'harness'),
];
// the vendored OKF format spec carries ILLUSTRATIVE example links (tables/customers.md
// etc.) — they document the link grammar, they are not repo links. Excluded on purpose.
const EXCLUDED = [join(ROOT, 'docs', 'product', 'OKF_SPEC_v0.2.md')];
const SKIP_DIRS = ['node_modules', 'dist', 'coverage', 'archive', '.git', '.pi', '.harness'];

function walkMd(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (SKIP_DIRS.includes(e.name)) continue;
      walkMd(join(dir, e.name), out);
    } else if (e.name.endsWith('.md')) out.push(join(dir, e.name));
  }
  return out;
}

const files = [
  ...LIVE_FILES.filter((f) => existsSync(f)),
  ...LIVE_DIRS.filter((d) => existsSync(d)).flatMap((d) => walkMd(d)),
].filter((f) => !EXCLUDED.includes(f));

const broken = [];
for (const file of files) {
  const text = readFileSync(file, 'utf8');
  for (const m of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const target = m[1];
    if (/^(https?:|mailto:|#|<)/.test(target)) continue; // external anchors and fragments stay out
    const path = target.split('#')[0];
    if (path === '') continue;
    // wiki pages speak bundle-root links (/systems/x.md) — resolve against wiki/
    const baseRoot = file.startsWith(join(ROOT, 'wiki')) ? join(ROOT, 'wiki') : ROOT;
    const abs = path.startsWith('/') ? join(baseRoot, path.slice(1)) : join(dirname(file), path);
    if (!existsSync(abs)) broken.push(`${relative(ROOT, file)} → ${target}`);
  }
}

if (broken.length) {
  console.error(`links gate: ${broken.length} unresolved link(s) in live surfaces:`);
  for (const b of broken) console.error(`  ${b}`);
  process.exit(1);
}
console.log(`links gate: ${files.length} live file(s), every markdown link resolves`);
