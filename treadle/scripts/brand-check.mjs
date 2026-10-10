#!/usr/bin/env node
/** White-label gate: the brand name appears ONLY in brand.ts (tokens),
 *  package names/bin fields, and the rebrand docs. Source code says tokens. */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const BRAND = 'treadle';
const ALLOW = [
  'packages/brand/src/brand.ts',
  'packages/brand/REBRAND.md',
  'packages/brand/test/brand.test.ts',
  'scripts/brand-check.mjs',
];
const ALLOW_CONTAINS = [
  /package\.json$/,
  /pnpm-lock\.yaml$/,
  /\.github\/.*\.yml$/,
  /README\.md$/,
  /scripts\/set-brand\.mjs$/,
  /corpus\//, // golden data: repo-relative fixture paths, not source
  /^coverage\//, // generated tooling output, not source
  /scripts\/corpus-check\.mjs$/, // speaks the repo-root workspace path
  /conformance\/generators\/gen_corpus\.ts$/, // repo-relative fixture paths, not brand
];

function walk(dir, files = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', 'dist', '.git'].includes(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, files);
    else if (/\.(ts|tsx|md|json|yaml|yml|mjs)$/.test(e.name)) files.push(p);
  }
  return files;
}

const violations = [];
for (const f of walk('.')) {
  const rel = f.replace(/^\.\//, '');
  if (ALLOW.includes(rel)) continue;
  if (ALLOW_CONTAINS.some((re) => re.test(rel))) continue;
  // import specifiers carry package names (fenced via package.json) — strip them
  const src = readFileSync(f, 'utf8').replace(/@treadle\//g, '@brand/');
  if (src.toLowerCase().includes(BRAND)) violations.push(rel);
}

if (violations.length) {
  console.error(`brand-check: "${BRAND}" leaked outside its fence:\n  ` + violations.join('\n  '));
  process.exit(1);
}
console.log(`brand-check: clean — "${BRAND}" lives only in its fence`);
