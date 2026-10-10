/** Separate owner journal; the pack's pending queue survives any append failure. */
import {
  appendFileSync,
  existsSync,
  readFileSync,
  openSync,
  closeSync,
  fsyncSync,
  truncateSync,
} from 'node:fs';
import { join, dirname } from 'node:path';
import type { PackDoc } from './model.js';
import { humanClaim, canonical, type OwnerAct } from './workflow.js';

export const OWNER_EVENT_FORMAT = 'owner-workflow-events/0.1';
export const ownerEventsPath = (dir: string): string => join(dir, 'workflow.jsonl');
function validAct(value: unknown): value is OwnerAct {
  if (!value || typeof value !== 'object') return false;
  const a = value as Record<string, unknown>;
  return (
    typeof a['id'] === 'string' &&
    !!a['id'] &&
    typeof a['by'] === 'string' &&
    humanClaim(a['by']) &&
    typeof a['at'] === 'string' &&
    Number.isFinite(Date.parse(a['at'])) &&
    Number.isSafeInteger(a['revision']) &&
    ['accept', 'reject', 'approve', 'start', 'close', 'adopt'].includes(String(a['kind']))
  );
}
export function readOwnerEvents(path: string): OwnerAct[] {
  if (!existsSync(path)) return [];
  const bytes = readFileSync(path, 'utf8');
  if (!bytes.endsWith('\n'))
    throw Error('Owner audit has an interrupted tail; recover from pending receipts');
  const lines = bytes.trimEnd().split('\n');
  const header = JSON.parse(lines.shift() ?? '{}') as Record<string, unknown>;
  if (header['format'] !== OWNER_EVENT_FORMAT) throw Error('Unexpected owner audit format');
  const seen = new Map<string, OwnerAct>();
  for (const line of lines) {
    const row: unknown = JSON.parse(line);
    if (!validAct(row)) throw Error('Malformed owner audit receipt');
    if (seen.has(row.id)) throw Error('Duplicate owner audit receipt');
    seen.set(row.id, row);
  }
  return [...seen.values()];
}

export function appendPendingAudit(path: string, pending: readonly OwnerAct[]): void {
  const header = JSON.stringify({ format: OWNER_EVENT_FORMAT }) + '\n';
  if (existsSync(path)) {
    const bytes = readFileSync(path, 'utf8');
    if (!bytes.endsWith('\n')) {
      const end = bytes.lastIndexOf('\n') + 1;
      const tail = bytes.slice(end);
      const knownPrefix =
        end === 0
          ? header.startsWith(tail)
          : pending.some((a) => (JSON.stringify(a) + '\n').startsWith(tail));
      if (!knownPrefix) throw Error('Interrupted audit tail does not match a pending receipt');
      // An unterminated fragment is not a committed event. Preserve every complete line.
      truncateSync(path, Buffer.byteLength(bytes.slice(0, end)));
    }
  }
  if (!existsSync(path) || readFileSync(path, 'utf8').length === 0) appendFileSync(path, header);
  const seen = new Map(readOwnerEvents(path).map((a) => [a.id, a]));
  for (const a of pending) {
    const prior = seen.get(a.id);
    if (prior && canonical(prior) !== canonical(a))
      throw Error('Owner audit id conflicts with its receipt');
    if (!prior) {
      appendFileSync(path, JSON.stringify(a) + '\n');
      seen.set(a.id, a);
    }
  }
  const fd = openSync(path, 'r+');
  try {
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
  const directory = openSync(dirname(path), 'r');
  try {
    fsyncSync(directory);
  } finally {
    closeSync(directory);
  }
}

/** The caller holds the pack lock. No receipt is removed until the journal is durable. */
export function flushOwnerAudit(
  doc: PackDoc,
  path: string,
  persist: () => void,
  append = appendPendingAudit,
): boolean {
  const pending = doc.workflow?.pending_audit;
  if (!pending?.length) return true;
  try {
    append(path, pending);
  } catch {
    return false;
  }
  doc.workflow!.pending_audit = [];
  try {
    persist();
    return true;
  } catch {
    doc.workflow!.pending_audit = pending;
    return false;
  }
}
