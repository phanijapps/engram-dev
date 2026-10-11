import type { Command } from 'commander';
import { context, contextBlock } from '../harness/context.js';
export function registerContext(program: Command): void {
  program
    .command('context')
    .requiredOption('--workspace <root>', 'explicit event workspace')
    .option('--json', 'machine context')
    .action(async (opts: { workspace: string; json?: boolean }) => {
      const report = await context(opts.workspace);
      console.log(opts.json ? JSON.stringify(report) : contextBlock(report));
    });
}
