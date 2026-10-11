import type { Command } from 'commander';
import {
  ensureService,
  publicStatus,
  serviceStatus,
  stopService,
  runService,
  stateDirectory,
} from '../serve/runtime.js';
import { startProjects } from '@treadle/web';
import { listProjects, projectControl } from '../serve/projects.js';
export function registerServe(p: Command): void {
  p.command('start')
    .command('serve')
    .option('--port <port>', 'preferred browser port (0 chooses a free port)', Number, 8788)
    .option('--json', 'machine status')
    .action(async (opts: { port: number; json?: boolean }) => {
      if (!Number.isInteger(opts.port) || opts.port < 0 || opts.port > 65535)
        throw Error('Port must be 0 through 65535');
      const d = await ensureService({ port: opts.port });
      console.log(opts.json ? JSON.stringify(publicStatus(d)) : `Service running: ${d.url}`);
    });
  p.command('stop')
    .command('serve')
    .action(async () => {
      console.log(
        (await stopService())
          ? 'Service stopped; the next session event can restart it.'
          : 'Service already stopped.',
      );
    });
  p.command('status')
    .command('serve')
    .action(async () => {
      console.log(JSON.stringify(await serviceStatus()));
    });
  p.command('_serve', { hidden: true })
    .option('--port <port>', '', Number, 8788)
    .action(async (opts: { port: number }) => {
      const service = await runService({
        port: opts.port,
        controlHandler: projectControl(stateDirectory()),
        startUI: (port) => startProjects(() => listProjects(stateDirectory()), port),
      });
      for (const signal of ['SIGINT', 'SIGTERM'] as const)
        process.once(signal, () => {
          void service.close();
        });
    });
}
