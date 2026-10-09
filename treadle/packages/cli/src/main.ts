#!/usr/bin/env node
/**
 * The CLI surface: two pedals, one loom (naming doc). `know` is the knowledge
 * plane, `do` is the loop plane. The banner says the brand token — the ONLY
 * string in this package that names the product, imported from @treadle/brand.
 */
import { Command } from 'commander';
import { brand } from '@treadle/brand';
import { registerDo } from './commands/do.js';

const program = new Command();

program
  .name(brand.binName)
  .description(`${brand.name} — ${brand.tagline} (formerly ${brand.formerly})`)
  .version('0.1.0');

program
  .command('know')
  .description('the knowledge plane: index, search, read, findings, anchors')
  .action(() => {
    console.log(`${brand.name} know — the knowledge plane (scaffold)`);
  });

const doCmd = program
  .command('do')
  .description('the loop plane: answer, approve, record, close, status');
registerDo(doCmd);

export function runCli(argv: string[]): void {
  program.parse(argv);
}

// direct execution (tsx / bin): only when run as a script
if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop()! + '')) {
  program.parse();
}
