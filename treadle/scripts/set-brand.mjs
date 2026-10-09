#!/usr/bin/env node
/** Rebrand in one command: rewrites brand.ts tokens, package names, bin fields.
 *  Usage: pnpm brand:set -- --name Acme --bin acme --tagline "..." [--formerly Old]
 *  After: pnpm brand:check && pnpm check must pass (REBRAND.md contract). */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const get = (k) => {
  const i = args.indexOf(`--${k}`);
  return i >= 0 ? args[i + 1] : undefined;
};

const name = get('name');
const bin = get('bin') ?? name;
if (!name) {
  console.error('usage: set-brand --name Acme [--bin acme] [--tagline ...] [--formerly Old]');
  process.exit(1);
}
const tagline = get('tagline') ?? 'The human drives; the machine moves.';
const formerly = get('formerly') ?? 'treadle';

const brandPath = 'packages/brand/src/brand.ts';
let s = readFileSync(brandPath, 'utf8');
s = s
  .replace(/name: '[^']+'/, `name: '${name}'`)
  .replace(/binName: '[^']+'/, `binName: '${bin}'`)
  .replace(/tagline: '[^']+'/, `tagline: '${tagline}'`)
  .replace(/formerly: '[^']+'/, `formerly: '${formerly}'`);
writeFileSync(brandPath, s);

function rewritePackage(dir) {
  const p = join(dir, 'package.json');
  const j = JSON.parse(readFileSync(p, 'utf8'));
  if (j.name?.includes('treadle')) j.name = j.name.replace(/treadle/g, name.toLowerCase());
  if (j.bin?.treadle) {
    j.bin[bin] = j.bin.treadle;
    delete j.bin.treadle;
  }
  if (j.dependencies)
    for (const d of Object.keys(j.dependencies)) {
      if (d.startsWith('@treadle/'))
        ((j.dependencies[d.replace(/treadle/g, name.toLowerCase())] = j.dependencies[d]),
          delete j.dependencies[d]);
    }
  writeFileSync(p, JSON.stringify(j, null, 2) + '\n');
}
rewritePackage('.');
for (const d of readdirSync('packages', { withFileTypes: true }))
  if (d.isDirectory()) rewritePackage(join('packages', d.name));
console.log(
  `rebranded → ${name} (bin: ${bin}). Run: pnpm install && pnpm brand:check && pnpm check`,
);
