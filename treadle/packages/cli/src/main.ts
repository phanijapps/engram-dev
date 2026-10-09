#!/usr/bin/env node
/**
 * The CLI surface: two pedals, one loom (naming doc). `know` is the knowledge
 * plane, `do` is the loop plane. The banner says the brand token — the ONLY
 * string in this package that names the product, imported from @treadle/brand.
 */
import { Command } from 'commander';
import { brand } from '@treadle/brand';

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

program
  .command('do')
  .description('the loop plane: init, next, record, interview, library')
  .action(() => {
    console.log(`${brand.name} do — the loop plane (scaffold)`);
  });

program.parse();
