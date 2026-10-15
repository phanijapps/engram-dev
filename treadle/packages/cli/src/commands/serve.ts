import type { Command } from 'commander';
import {
  ensureService,
  publicStatus,
  serviceStatus,
  stopService,
  runService,
  IDLE_GRACE_MS,
  stateDirectory,
} from '../serve/runtime.js';
import { writeLease, removeLease, agentOwnerPid } from '@treadle/core';
import { startProjects } from '@treadle/web';
import { listProjects, projectControl } from '../serve/projects.js';
export function registerServe(p: Command): void {
  p.command('start')
    .command('serve')
    .option('--port <port>', 'preferred browser port (0 chooses a free port)', Number, 8788)
    .option('--stop-when-idle', 'stop the service after no session lease is live')
    .option('--json', 'machine status')
    .action(async (opts: { port: number; json?: boolean; stopWhenIdle?: boolean }) => {
      if (!Number.isInteger(opts.port) || opts.port < 0 || opts.port > 65535)
        throw Error('Port must be 0 through 65535');
      const d = await ensureService({
        port: opts.port,
        autostop: !!opts.stopWhenIdle,
        keep: !opts.stopWhenIdle,
      });
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
  p.command('_lease', { hidden: true })
    .argument('<action>', 'start or end')
    .option('--session <id>', 'session id from the host payload')
    .option('--pid <pid>', 'agent process id from the host payload', Number)
    .option('--from <pid>', 'walk up from this process to find the agent', Number)
    .option('--cwd <dir>', 'fallback key when the host sends no session id')
    .action(
      (action: string, o: { session?: string; pid?: number; from?: number; cwd?: string }) => {
        if (action !== 'start' && action !== 'end') throw Error('action must be start or end');
        const pid = o.pid && o.pid > 1 ? o.pid : agentOwnerPid(o.from ?? process.ppid);
        // Without a session id the agent pid is the one key both events can compute.
        const key = o.session ?? `agent:${pid ?? 'unknown'}:${o.cwd ?? ''}`;
        if (action === 'end') return removeLease(key);
        writeLease(key, { pid });
      },
    );
  p.command('_serve', { hidden: true })
    .option('--port <port>', '', Number, 8788)
    .option('--stop-when-idle', '')
    .action(async (opts: { port: number; stopWhenIdle?: boolean }) => {
      const service = await runService({
        port: opts.port,
        ...(opts.stopWhenIdle
          ? {
              idleStop: {
                graceMs: Number(process.env['HARNESS_IDLE_GRACE_MS']) || IDLE_GRACE_MS,
                pollMs: 5000,
              },
            }
          : {}),
        controlHandler: projectControl(stateDirectory()),
        startUI: (port) => startProjects(() => listProjects(stateDirectory()), port),
      });
      for (const signal of ['SIGINT', 'SIGTERM'] as const)
        process.once(signal, () => {
          void service.close();
        });
    });
}
