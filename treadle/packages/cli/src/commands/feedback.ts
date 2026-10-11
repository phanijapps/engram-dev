import type { Command } from 'commander';
import { readFileSync, realpathSync, statSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import {
  readFeedback,
  readFeedbackSnapshot,
  mutateFeedback,
  feedbackReadResult,
  feedbackContainedPath,
  FeedbackError,
  FEEDBACK_LIMITS,
  type FeedbackReceipt,
  type FeedbackMutation,
  type FeedbackSession,
  type FeedbackSnapshotInput,
  type FeedbackSelection,
} from '@treadle/core';
import { stateDirectory, serviceStatus } from '../serve/runtime.js';
import { listProjects, type ProjectView } from '../serve/projects.js';
import { buildFeedbackSnapshots, type SnapshotRequest } from '../harness/feedback-snapshot.js';

export function feedbackProject(packDir: string, registry = stateDirectory()): ProjectView {
  const path = realpathSync(packDir);
  const matches = listProjects(registry).filter(
    (p) => p.available && resolve(p.specs, basename(path)) === path,
  );
  if (matches.length !== 1)
    throw new FeedbackError(
      'unavailable',
      'Connect the explicit workspace first; feedback needs one enrolled project and canonical spec directory',
    );
  feedbackContainedPath(matches[0]!.workspace, path);
  return matches[0]!;
}
/** Replay from committed immutable bytes, not today's source or the latest round. */
export function publishFeedbackSnapshots(
  packDir: string,
  workspace: string,
  request: SnapshotRequest,
  envelope: Omit<FeedbackMutation, 'action'>,
  previous?: FeedbackSession,
): FeedbackReceipt {
  const state = readFeedback(packDir, workspace);
  const retry = state?.operations.find((o) => o.id === envelope.operation_id);
  if (retry) {
    const s = state!.sessions.find((s) => s.id === retry.result.session);
    const round = s?.rounds.find((r) => r.id === retry.result.round);
    if (!s || !round)
      throw new FeedbackError('conflict', 'This operation ID belongs to another feedback action');
    const snapshots: FeedbackSnapshotInput[] = round.targets.map((t) => ({
      key: t.key,
      path: t.path,
      ...(t.old_path ? { old_path: t.old_path } : {}),
      before: t.before
        ? readFeedbackSnapshot(packDir, workspace, s.id, round.id, t.id, 'before')
        : null,
      after: t.after
        ? readFeedbackSnapshot(packDir, workspace, s.id, round.id, t.id, 'after')
        : null,
    }));
    const selection: FeedbackSelection = {
      mode: request.mode,
      paths: request.paths ?? [],
      artifacts: request.artifacts ?? [],
      ...(request.base ? { base: s.selection.base!, base_ref: request.base } : {}),
      ...(request.head ? { head: s.selection.head!, head_ref: request.head } : {}),
    };
    if (previous) {
      if (
        JSON.stringify(request.paths ?? []) !== JSON.stringify(s.selection.paths) ||
        JSON.stringify(request.artifacts ?? []) !== JSON.stringify(s.selection.artifacts) ||
        request.mode !== s.selection.mode ||
        request.base !== s.selection.base ||
        request.head !== s.selection.head
      )
        throw new FeedbackError('conflict', 'Round retry changed its immutable selection');
    }
    return mutateFeedback(packDir, workspace, {
      ...envelope,
      action: previous
        ? { kind: 'round', session: previous.id, snapshots }
        : { kind: 'open', selection, snapshots },
    });
  }
  const built = buildFeedbackSnapshots(workspace, packDir, request, previous);
  return mutateFeedback(
    packDir,
    workspace,
    {
      ...envelope,
      action: previous
        ? { kind: 'round', session: previous.id, snapshots: built.snapshots }
        : { kind: 'open', selection: built.selection, snapshots: built.snapshots },
    },
    { verifySources: built.verify },
  );
}
export async function waitForFeedback(
  packDir: string,
  workspace: string,
  session: string,
  after: number,
  timeout: number,
  signal?: AbortSignal,
): Promise<Record<string, unknown>> {
  if (!Number.isFinite(timeout) || timeout < 1 || timeout > 60)
    throw new FeedbackError('invalid', 'Wait timeout must be between 1 and 60 seconds');
  const deadline = performance.now() + timeout * 1000;
  while (true) {
    const result = feedbackReadResult(packDir, workspace, session, after);
    if (result['status'] !== 'pending' || signal?.aborted || performance.now() >= deadline)
      return { ...result, ...(signal?.aborted ? { cancelled: true } : {}) };
    await new Promise<void>((resolveWait) => {
      const finish = () => {
        clearTimeout(timer);
        signal?.removeEventListener('abort', finish);
        resolveWait();
      };
      const timer = setTimeout(finish, Math.min(200, deadline - performance.now()));
      signal?.addEventListener('abort', finish, { once: true });
      if (signal?.aborted) finish();
    });
  }
}
interface Options {
  mode?: 'documents' | 'diff';
  file?: string[];
  artifact?: string[];
  base?: string;
  head?: string;
  expectedRevision?: number;
  operationId?: string;
  by?: string;
  session?: string;
  thread?: string;
  bodyFile?: string;
  after?: number;
  timeout?: number;
  json?: boolean;
}
function replyBody(path: string): string {
  if (!statSync(path).isFile() || statSync(path).size > FEEDBACK_LIMITS.body)
    throw new FeedbackError('bounds', 'Reply body must be a file of at most 8 KiB');
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(readFileSync(path));
  } catch {
    throw new FeedbackError('invalid', 'Reply body must be UTF-8 text');
  }
}
function envelope(o: Options): Omit<FeedbackMutation, 'action'> {
  return { operation_id: o.operationId!, expected_revision: o.expectedRevision!, by: o.by! };
}
function request(o: Options): SnapshotRequest {
  return {
    mode: o.mode!,
    paths: o.file ?? [],
    artifacts: o.artifact ?? [],
    ...(o.base ? { base: o.base } : {}),
    ...(o.head ? { head: o.head } : {}),
  };
}
function mutation(command: Command): Command {
  return command
    .requiredOption('--expected-revision <n>', 'held feedback revision', Number)
    .requiredOption('--operation-id <uuid>', 'stable retry operation ID')
    .requiredOption('--by <claim>', 'agent attribution');
}
function output(result: Record<string, unknown>, o: Options): void {
  console.log(o.json ? JSON.stringify(result) : JSON.stringify(result, null, 2));
}
function guarded(
  fn: (
    dir: string,
    project: ProjectView,
    o: Options,
  ) => Promise<Record<string, unknown>> | Record<string, unknown>,
) {
  return async (dir: string, o: Options): Promise<void> => {
    try {
      output(await fn(realpathSync(dir), feedbackProject(dir), o), o);
    } catch (error) {
      output(
        {
          format: 'feedback-result/1',
          status: 'unavailable',
          code: error instanceof FeedbackError ? error.code : 'unavailable',
          message: error instanceof Error ? error.message : String(error),
        },
        o,
      );
      process.exitCode = 1;
    }
  };
}
export function registerFeedback(parent: Command): void {
  const f = parent
    .command('feedback')
    .description('review selected artifacts and read submitted browser feedback');
  mutation(f.command('open <packDir>'))
    .requiredOption('--mode <mode>', 'documents or diff')
    .option('--file <path...>', 'explicit repository-relative files')
    .option('--artifact <key...>', 'registered Markdown artifacts')
    .option('--base <commit>', 'explicit Git baseline')
    .option('--head <commit>', 'optional committed after-side')
    .option('--json', 'machine result')
    .action(
      guarded(async (dir, project, o) => {
        const service = await serviceStatus();
        if (service.state !== 'running' || !service.service?.url)
          throw new FeedbackError(
            'unavailable',
            'Shared application is unavailable; start it before opening browser feedback',
          );
        const base = `${service.service.url}projects/${project.id}/library/`;
        const response = await fetch(`${base}feedback/${encodeURIComponent(basename(dir))}/state`, {
          signal: AbortSignal.timeout(3000),
        });
        const capability = response.ok ? ((await response.json()) as { format?: string }) : null;
        if (capability?.format !== 'feedback/1')
          throw new FeedbackError(
            'unavailable',
            'This application does not advertise feedback/1; update/restart the shared service',
          );
        const receipt = publishFeedbackSnapshots(dir, project.workspace, request(o), envelope(o));
        return {
          format: 'feedback-result/1',
          status: 'pending',
          project: project.id,
          ...receipt,
          cursor: 0,
          selection: readFeedback(dir, project.workspace)!.sessions.find(
            (s) => s.id === receipt.session,
          )!.selection,
          url: `${base}#/${encodeURIComponent(basename(dir))}/feedback?session=${receipt.session}`,
        };
      }),
    );
  for (const kind of ['read', 'wait'] as const) {
    const c = f
      .command(`${kind} <packDir>`)
      .requiredOption('--session <uuid>', 'session ID')
      .option('--after <cursor>', 'last seen batch cursor', Number, 0)
      .option('--json', 'machine result');
    if (kind === 'wait') c.option('--timeout <seconds>', 'bounded wait, 1–60 seconds', Number, 30);
    c.action(
      guarded(async (dir, project, o) => {
        if (kind === 'read')
          return {
            ...feedbackReadResult(dir, project.workspace, o.session!, o.after),
            project: project.id,
          };
        const controller = new AbortController();
        const cancel = () => controller.abort();
        process.once('SIGINT', cancel);
        try {
          return {
            ...(await waitForFeedback(
              dir,
              project.workspace,
              o.session!,
              o.after!,
              o.timeout!,
              controller.signal,
            )),
            project: project.id,
          };
        } finally {
          process.removeListener('SIGINT', cancel);
        }
      }),
    );
  }
  mutation(f.command('reply <packDir>'))
    .requiredOption('--session <uuid>', 'session ID')
    .requiredOption('--thread <uuid>', 'thread ID')
    .requiredOption('--body-file <path>', 'UTF-8 reply body')
    .option('--json', 'machine result')
    .action(
      guarded((dir, project, o) => {
        const receipt = mutateFeedback(dir, project.workspace, {
          ...envelope(o),
          action: {
            kind: 'reply',
            session: o.session!,
            thread: o.thread!,
            body: replyBody(o.bodyFile!),
          },
        });
        return { format: 'feedback-result/1', status: 'pending', project: project.id, ...receipt };
      }),
    );
  mutation(f.command('round <packDir>'))
    .requiredOption('--session <uuid>', 'session ID')
    .option('--json', 'machine result')
    .action(
      guarded((dir, project, o) => {
        const state = readFeedback(dir, project.workspace);
        const s = state?.sessions.find((s) => s.id === o.session);
        if (!s) throw new FeedbackError('missing', 'Unknown feedback session');
        const receipt = publishFeedbackSnapshots(
          dir,
          project.workspace,
          {
            mode: s.selection.mode,
            paths: s.selection.paths,
            artifacts: s.selection.artifacts,
            ...(s.selection.base ? { base: s.selection.base } : {}),
            ...(s.selection.head ? { head: s.selection.head } : {}),
          },
          envelope(o),
          s,
        );
        return { format: 'feedback-result/1', status: 'pending', project: project.id, ...receipt };
      }),
    );
}
