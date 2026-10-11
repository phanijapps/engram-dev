#!/usr/bin/env node
/** Update public branding and the CLI bin; internal package/storage identities stay stable. */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2).filter((arg) => arg !== '--');
const values = {};
for (let i = 0; i < args.length; i += 2) {
  const key = args[i]?.replace(/^--/, '');
  if (
    !['name', 'bin', 'tagline', 'formerly'].includes(key) ||
    !args[i]?.startsWith('--') ||
    !args[i + 1] ||
    args[i + 1].startsWith('--') ||
    Object.hasOwn(values, key)
  ) {
    console.error('usage: set-brand --name Acme --bin acme [--tagline ...] [--formerly Old]');
    process.exit(1);
  }
  values[key] = args[i + 1];
}
if (!values.name?.trim() || /[\r\n\0]/.test(values.name)) {
  console.error('A nonempty, single-line product name is required');
  process.exit(1);
}
const bin = values.bin ?? values.name.toLowerCase();
if (!/^[a-z][a-z0-9-]*$/.test(bin)) {
  console.error(
    'CLI name must start with a lowercase letter and contain letters, digits or hyphens',
  );
  process.exit(1);
}
const brandPath = join(root, 'packages/brand/src/brand.ts');
const cliPath = join(root, 'packages/cli/package.json');
let source = readFileSync(brandPath, 'utf8');
const cli = JSON.parse(readFileSync(cliPath, 'utf8'));
const entries = Object.entries(cli.bin ?? {});
if (entries.length !== 1 || typeof entries[0][1] !== 'string')
  throw Error('Expected one managed CLI executable; no files changed');
const oldName = /\bname:\s*('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*")/.exec(source)?.[1];
if (!oldName) throw Error('Cannot read current product name; no files changed');
const previous = oldName.startsWith('"')
  ? JSON.parse(oldName)
  : oldName.slice(1, -1).replace(/\\'/g, "'").replace(/\\\\/g, '\\');
const updates = {
  name: values.name,
  binName: bin,
  ...(values.tagline !== undefined ? { tagline: values.tagline } : {}),
  formerly: values.formerly ?? previous,
};
for (const [key, value] of Object.entries(updates)) {
  if (/[\r\n\0]/.test(value)) throw Error('Brand values must be single-line; no files changed');
  const pattern = new RegExp(`(\\b${key}:\\s*)('(?:\\\\.|[^'\\\\])*'|"(?:\\\\.|[^"\\\\])*")`);
  if (!pattern.test(source)) throw Error(`Missing brand token ${key}; no files changed`);
  source = source.replace(pattern, (_match, prefix) => prefix + JSON.stringify(value));
}
cli.bin = { [bin]: entries[0][1] };
writeFileSync(brandPath, source);
writeFileSync(cliPath, JSON.stringify(cli, null, 2) + '\n');
console.log(`Rebranded to ${values.name} (${bin}). Internal packages and service state retained.`);
console.log(
  'Update current usage docs, then run pnpm build, pnpm brand:check and pnpm check; relink the CLI and regenerate installed host artifacts.',
);
