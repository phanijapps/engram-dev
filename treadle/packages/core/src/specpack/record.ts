/** Evidence admission (FR: the loop's only path to 'done'). Refusals return
 *  with the exact published vocabulary; revision bumps are part of the op. */
import { refuse, type Admission } from '../refusals.js';
import type { PackDoc, Task } from './model.js';

const STALL_LIMIT = 2;

export interface ExecutedCommand {
  readonly command: string;
  readonly exit: number;
}

export interface RecordResult {
  readonly task: string;
  readonly status: string;
  readonly fail_streak?: number;
}

export function record(
  doc: PackDoc,
  taskId: string,
  result: string,
  commands: readonly ExecutedCommand[],
  expectedRevision: number,
  by: string,
  opts: { at: string; notes?: string | undefined },
): Admission<RecordResult> {
  if (doc.status === 'complete') return refuse('pack_is_frozen', frozenMessage());
  if ((doc.revision ?? 1) !== expectedRevision) {
    return refuse(
      'stale_writer',
      `stale writer: file is at revision ${doc.revision ?? 1}, caller expected ${expectedRevision}`,
    );
  }
  const t = findTask(doc, taskId);
  if (!t.ok) return t;
  const task = t.value;
  if (result === 'unblock') {
    if (task.status !== 'blocked') {
      return refuse(
        'unblock_requires_blocked',
        `${taskId}: unblock requires blocked, found ${task.status}`,
      );
    }
    task.status = 'todo';
    doc.revision = (doc.revision ?? 1) + 1;
    return { ok: true, value: { task: taskId, status: 'todo' } };
  }
  if (result === 'cancel') {
    return refuse(
      'cancel_forbidden',
      'specpack tasks are not cancelled; mark out of scope in the spec or remove the task',
    );
  }
  if (result !== 'pass' && result !== 'fail') {
    return refuse('unknown_result', `unknown result '${result}'`);
  }
  if (task.status !== 'doing' && task.status !== 'todo') {
    if (task.status === 'done') return refuse('already_done', `${taskId}: already done`);
    return refuse('cannot_record_from', `${taskId}: cannot record from ${task.status}`);
  }
  if (result === 'pass' && (commands.length === 0 || commands.some((c) => c.exit !== 0))) {
    return refuse(
      'pass_needs_zero_exits',
      'M_run = M: a pass needs at least one executed command and every command must exit 0 — a failed step makes the attempt a fail',
    );
  }
  const row: Record<string, unknown> =
    commands.length > 1
      ? {
          cmd: commands.map((c) => `${c.command} [exit ${c.exit}]`).join(' && '),
          exit: Math.max(...commands.map((c) => c.exit)),
        }
      : { cmd: commands[0]?.command ?? '', exit: commands[0]?.exit ?? 1 };
  row['at'] = opts.at;
  row['by'] = by;
  if (opts.notes) row['notes'] = opts.notes;
  (task['evidence'] as unknown[] | undefined) = (task['evidence'] as unknown[] | undefined) ?? [];
  (task['evidence'] as unknown[]).push(row);
  if (result === 'pass') {
    task.status = 'done';
  } else {
    task.status = failStreak(task) >= STALL_LIMIT ? 'blocked' : 'todo';
  }
  doc.revision = (doc.revision ?? 1) + 1;
  return { ok: true, value: { task: taskId, status: task.status, fail_streak: failStreak(task) } };
}

export function failStreak(task: Task): number {
  let streak = 0;
  for (const e of [...((task['evidence'] as { exit?: number }[] | undefined) ?? [])].reverse()) {
    if (e.exit === 0) break;
    streak += 1;
  }
  return streak;
}

type TaskLookup = Admission<Task>;

function findTask(doc: PackDoc, taskId: string): TaskLookup {
  const t = doc.tasks.find((x) => x.id === taskId);
  return t ? { ok: true, value: t } : refuse('no_such_task', `no task ${taskId}`);
}

function frozenMessage(): string {
  return 'pack is complete: the record is frozen; open a new initiative instead';
}
