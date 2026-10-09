/** The event journal (specweb-events/0.1), ported: append-only JSON Lines,
 *  header first, fsync on append; every event validated both ways. Events
 *  carry human claims — the seam's whole trust posture. */
import {
  appendFileSync,
  existsSync,
  readFileSync,
  openSync,
  closeSync,
  fsyncSync,
  mkdirSync,
} from 'node:fs';
import { join, dirname } from 'node:path';

import { EVENT_KINDS, type EventKind } from '../events.js';

export const EVENT_FORMAT = 'specweb-events/0.1';

const SCOPED = new Set<string>(['answer', 'unknown', 'choice']);

export interface JournalEvent {
  readonly kind: EventKind;
  readonly by: string;
  readonly at: string;
  readonly q?: string;
  readonly text?: string;
  readonly option?: string;
}

export function validateEvent(ev: unknown): JournalEvent {
  const e = ev as Record<string, unknown>;
  if (typeof e !== 'object' || e === null || !EVENT_KINDS.includes(e['kind'] as EventKind)) {
    throw new Error(`not an event: ${JSON.stringify(ev)}`);
  }
  if (!String(e['by'] ?? '').startsWith('human:')) {
    throw new Error(`events carry human claims: by=${JSON.stringify(e['by'])}`);
  }
  if (!('at' in e)) throw new Error('events are stamped: at is required');
  if (SCOPED.has(String(e['kind'])) && !e['q']) {
    throw new Error(`${String(e['kind'])} events name a question`);
  }
  if (!SCOPED.has(String(e['kind'])) && e['q'] !== undefined) {
    throw new Error(`${String(e['kind'])} events are pack-scoped`);
  }
  return e as unknown as JournalEvent;
}

export function eventsPath(packDir: string): string {
  return join(packDir, 'interview.jsonl');
}

export function writeEvent(path: string, ev: JournalEvent): void {
  validateEvent(ev);
  mkdirSync(dirname(path), { recursive: true });
  const isNew = !existsSync(path);
  const line =
    (isNew ? JSON.stringify({ format: EVENT_FORMAT }) + '\n' : '') + JSON.stringify(ev) + '\n';
  appendFileSync(path, line, 'utf8');
  const fd = openSync(path, 'r+');
  try {
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
}

export function readEvents(path: string): JournalEvent[] {
  if (!existsSync(path)) return [];
  const out: JournalEvent[] = [];
  const lines = readFileSync(path, 'utf8').split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!.trim();
    if (!line) continue;
    const obj = JSON.parse(line) as Record<string, unknown>;
    if (i === 0 || (out.length === 0 && obj['format'] !== undefined)) {
      if (obj['format'] !== EVENT_FORMAT) {
        throw new Error(`${path}: bad event format header: ${JSON.stringify(obj['format'])}`);
      }
      continue;
    }
    out.push(validateEvent(obj));
  }
  return out;
}
