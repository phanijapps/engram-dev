#!/usr/bin/env node
/** The root launcher: delegates to tsx with the CLI entry (alpha shape —
 *  the compiled bin lands with the first built release). */
import { spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const tsx = join(root, 'node_modules', '.bin', 'tsx');
const cli = join(root, 'packages', 'cli', 'src', 'main.ts');
const result = spawnSync(tsx, [cli, ...process.argv.slice(2)], { stdio: 'inherit' });
process.exit(result.status ?? 1);
