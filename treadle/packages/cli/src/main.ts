#!/usr/bin/env node
/**
 * The CLI surface: two pedals, one loom. `know` is the knowledge plane,
 * `do` is the loop plane. The banner says brand tokens — the ONLY strings
 * here that name the product, imported from the brand package.
 */
import { Command } from 'commander';
import { brand } from '@treadle/brand';
import { registerDo } from './commands/do.js';
import { registerKnow } from './commands/know.js';
import { registerInit } from './commands/init.js';

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
  return p;
}

export function runCli(argv: string[]): void {
  buildProgram().parse(argv);
}

// direct execution (tsx / bin): parse the real argv once
if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop()!)) {
  buildProgram().parse();
}
