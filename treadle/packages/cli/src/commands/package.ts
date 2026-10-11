import type { Command } from 'commander';
import { packageHarness, type NativeSurface } from '../harness/packages.js';
export function registerPackage(program: Command): void {
  program
    .command('package')
    .command('harness')
    .requiredOption('--agent <host>', 'claude | codex | pi')
    .requiredOption('--out <path>', 'new local output directory')
    .option('--runtime <entry>', 'installed runtime Node entry')
    .action((opts: { agent: NativeSurface; out: string; runtime?: string }) => {
      console.log(packageHarness(opts.agent, opts.out, opts.runtime));
    });
}
