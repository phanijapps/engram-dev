import { listProjects } from '../serve/projects.js';
import type { Command } from 'commander';
import {
  ensureService,
  control,
  publicStatus,
  serviceStatus,
  readDescriptor,
} from '../serve/runtime.js';
export async function connectWorkspace(workspace: string): Promise<Record<string, unknown>> {
  const d = await ensureService();
  const r = await control(d, '/projects/connect', { workspace });
  return { service: publicStatus(d), project: r['result'] };
}
export function registerProject(p: Command): void {
  const project = p.command('project').description('connect explicit trusted local workspaces');
  project
    .command('connect <workspace>')
    .option('--json', 'machine status')
    .action(async (workspace: string, opts: { json?: boolean }) => {
      const r = await connectWorkspace(workspace);
      const d = r['service'] as { url: string },
        pr = r['project'] as { id: string; label: string };
      console.log(
        opts.json ? JSON.stringify(r) : `Connected ${pr.label}: ${d.url}projects/${pr.id}/library/`,
      );
    });
  project.command('disconnect <id>').action(async (id: string) => {
    const d = readDescriptor();
    if (!d) throw Error('Service stopped; start it before disconnecting a project');
    console.log(JSON.stringify((await control(d, '/projects/disconnect', { id }))['result']));
  });
  project.command('status').action(async () => {
    const status = await serviceStatus();
    console.log(
      JSON.stringify({
        ...status,
        projects: listProjects((await import('../serve/runtime.js')).stateDirectory()),
      }),
    );
  });
}
