#!/usr/bin/env node
/**
 * The CLI surface: two pedals, one loom. `know` is the knowledge plane,
 * `do` is the loop plane. The banner says brand tokens — the ONLY strings
 * here that name the product, imported from the brand package.
 */
import { Command } from 'commander';
import { realpathSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { brand } from '@treadle/brand';
import { registerDo } from './commands/do.js';
import { registerKnow } from './commands/know.js';
import { registerInit } from './commands/init.js';
import { registerServe } from './commands/serve.js';
import { registerPackage } from './commands/package.js';
import { registerContext } from './commands/context.js';
import { registerProject } from './commands/project.js';

export function buildProgram(): Command {
  const p = new Command();
  p.name(brand.binName)
    .description(`${brand.name} — ${brand.tagline} (formerly ${brand.formerly})`)
    .version('0.1.0');
  const doCmd = p
    .command('do')
    .description('the loop plane: init, add, next, record, answer, approve, close, check, status');
  registerDo(doCmd);
  const initCmd = p
    .command('init')
    .description('stand something up: harness — the interactive installer');
  registerInit(initCmd);
  const knowCmd = p
    .command('know')
    .description(
      'the knowledge plane: search, read, validate, links, findings, fingerprints, anchors, status',
    );
  registerKnow(knowCmd);
  registerServe(p);
  registerProject(p);
  registerContext(p);
  registerPackage(p);
  return p;
}

export function runCli(argv: string[]): void {
  buildProgram().parse(argv);
}

// direct execution (tsx / bin): parse the real argv once
if (
  process.argv[1] &&
  realpathSync(fileURLToPath(import.meta.url)) === realpathSync(resolve(process.argv[1]))
) {
  buildProgram()
    .parseAsync()
    .catch((error: Error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
