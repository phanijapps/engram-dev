/** `do wait`: block until an owner-authored change, then print one JSON line.
 *  Read-only and lock-free: it reads pack files, never the web service, and
 *  its output is a notification with no authority. */
import type { Command } from 'commander';
import { basename } from 'node:path';
import {
  loadPackWithMeta,
  ownerCursor,
  ownerChange,
  encodeCursor,
  decodeCursor,
  writeArmed,
  clearArmed,
  type OwnerCursor,
} from '@treadle/core';

export const WAIT_EXIT = { changed: 0, error: 1, timeout: 10, delivered: 11 } as const;
export const WAIT_DEFAULT_SECONDS = 300;
export const WAIT_MAX_SECONDS = 600;
const BEAT_MS = 5_000;
const MAX_LOAD_FAILURES = 5;

export interface WaitOptions {
  cursor?: string | undefined;
  timeout?: number | undefined;
  pollMs?: number | undefined;
  signal?: AbortSignal | undefined;
}
export interface WaitResult {
  code: number;
  event: Record<string, unknown>;
}

export async function waitForOwnerChange(
  packDir: string,
  o: WaitOptions = {},
): Promise<WaitResult> {
  const timeout = o.timeout ?? WAIT_DEFAULT_SECONDS;
  if (!Number.isFinite(timeout) || timeout < 1 || timeout > WAIT_MAX_SECONDS)
    return {
      code: WAIT_EXIT.error,
      event: { error: `timeout must be between 1 and ${WAIT_MAX_SECONDS} seconds` },
    };
  const first = loadPackWithMeta(packDir);
  if (!first.ok) return { code: WAIT_EXIT.error, event: { error: first.message } };
  const prev: OwnerCursor | null = o.cursor
    ? decodeCursor(o.cursor)
    : ownerCursor(first.value.doc, first.value.path);
  if (!prev) return { code: WAIT_EXIT.error, event: { error: 'cursor is not valid' } };
  const pack = basename(packDir);
  const deadline = Date.now() + timeout * 1000;
  let lastBeat = 0;
  let failures = 0;
  try {
    while (true) {
      const loaded = loadPackWithMeta(packDir);
      if (!loaded.ok) {
        if (++failures >= MAX_LOAD_FAILURES)
          return { code: WAIT_EXIT.error, event: { pack, error: loaded.message } };
      } else {
        failures = 0;
        const { doc, path } = loaded.value;
        const cur = ownerCursor(doc, path);
        const change = ownerChange(prev, cur, doc);
        const delivered = doc.status === 'complete' || cur.phase === 'delivered';
        if (change || delivered)
          return {
            code: delivered ? WAIT_EXIT.delivered : WAIT_EXIT.changed,
            event: { pack, ...(change ?? { phase: cur.phase }), cursor: encodeCursor(cur) },
          };
      }
      if (o.signal?.aborted)
        return {
          code: WAIT_EXIT.timeout,
          event: { pack, interrupted: true, cursor: encodeCursor(prev) },
        };
      if (Date.now() >= deadline)
        return {
          code: WAIT_EXIT.timeout,
          event: { pack, timeout: true, cursor: encodeCursor(prev) },
        };
      if (Date.now() - lastBeat >= BEAT_MS) {
        writeArmed(packDir, timeout);
        lastBeat = Date.now();
      }
      let onAbort: (() => void) | undefined;
      await new Promise<void>((r) => {
        const t = setTimeout(r, Math.min(o.pollMs ?? 1000, Math.max(deadline - Date.now(), 0)));
        onAbort = (): void => {
          clearTimeout(t);
          r();
        };
        o.signal?.addEventListener('abort', onAbort, { once: true });
      });
      if (onAbort) o.signal?.removeEventListener('abort', onAbort);
    }
  } finally {
    clearArmed(packDir);
  }
}

export function registerWait(parent: Command): void {
  parent
    .command('wait <packDir>')
    .description('block until the owner acts on the pack; print one JSON event (exit 0/10/11/1)')
    .option('--cursor <token>', 'resume from a cursor printed by an earlier wait')
    .option(
      '--timeout <seconds>',
      `bounded wait, 1–${WAIT_MAX_SECONDS} seconds`,
      Number,
      WAIT_DEFAULT_SECONDS,
    )
    .action(async (packDir: string, o: { cursor?: string; timeout: number }) => {
      const ac = new AbortController();
      const stop = (): void => ac.abort();
      process.once('SIGINT', stop);
      process.once('SIGTERM', stop);
      const result = await waitForOwnerChange(packDir, {
        cursor: o.cursor,
        timeout: o.timeout,
        signal: ac.signal,
      });
      console.log(JSON.stringify(result.event));
      process.exitCode = result.code;
    });
}
