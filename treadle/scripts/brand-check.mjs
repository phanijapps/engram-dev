#!/usr/bin/env node
/** White-label gate: the brand name appears ONLY in brand.ts (tokens),
 *  package names/bin fields, and the rebrand docs. Source code says tokens. */
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));

const tokens = readFileSync(new URL('../packages/brand/src/brand.ts', import.meta.url), 'utf8');
const productTokens = ['name', 'binName', 'formerly'].map((key) => {
  const literal = new RegExp(`\\b${key}:\\s*('(?:\\\\.|[^'\\\\])*'|"(?:\\\\.|[^"\\\\])*")`).exec(
    tokens,
  )?.[1];
  if (!literal) throw Error(`Missing brand token: ${key}`);
  return literal.startsWith('"') ? JSON.parse(literal) : literal.slice(1, -1);
});
const BRANDS = [...new Set(productTokens.map((value) => value.toLowerCase()))];
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
  /^DEBT\.md$/, // governance: records the future repo name by owner decision
  /scripts\/set-brand\.mjs$/,
  /corpus\//, // golden data: repo-relative fixture paths, not source
  /^coverage\//, // generated tooling output, not source
  /^test-results\.json$/, // generated test paths and diagnostics, not product copy
  /^ci-evidence\//, // generated gate receipts, not product copy
  /scripts\/corpus-check\.mjs$/, // speaks the repo-root workspace path
  /scripts\/link-check\.mjs$/, // walks the workspace dir by path — same rationale as corpus-check
  /conformance\/generators\/gen_corpus\.ts$/, // repo-relative fixture paths, not brand
];

function walk(dir, files = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', 'dist', '.git'].includes(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, files);
    else if (/\.(ts|tsx|md|json|yaml|yml|mjs|js|html)$/.test(e.name)) files.push(p);
  }
  return files;
}

const violations = [];
for (const f of walk(root)) {
  const rel = relative(root, f).replaceAll('\\', '/');
  if (ALLOW.includes(rel)) continue;
  if (ALLOW_CONTAINS.some((re) => re.test(rel))) continue;
  // import specifiers carry package names (fenced via package.json) — strip them
  const src = readFileSync(f, 'utf8').replace(/@treadle\//g, '@brand/');
  if (BRANDS.some((name) => src.toLowerCase().includes(name))) violations.push(rel);
}

if (violations.length) {
  console.error(
    `brand-check: "${BRANDS.join(', ')}" leaked outside its fence:\n  ` + violations.join('\n  '),
  );
  process.exit(1);
}
console.log(`brand-check: clean — "${BRANDS.join(', ')}" lives only in its fence`);
