/** Machine-local "an agent is waiting" heartbeat. It lives outside the pack so
 *  arming never changes pack bytes, and holds no prompt, transcript or pack text. */
import { createHash } from 'node:crypto';
import {
  mkdirSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export const ARMED_FRESH_MS = 15_000;

const stateDir = (): string =>
  process.env['HARNESS_ARMED_STATE_DIR'] || join(tmpdir(), 'wukong-armed');
const fileFor = (packDir: string): string => {
  let key = packDir;
  try {
    key = realpathSync(packDir);
  } catch {
    // an unresolved path still hashes consistently for the writer and reader
  }
  return join(stateDir(), createHash('sha256').update(key).digest('hex').slice(0, 24) + '.json');
};

/** Best-effort: a heartbeat failure must never stop the wait it describes. */
export function writeArmed(packDir: string, timeoutSeconds: number): void {
  try {
    mkdirSync(stateDir(), { recursive: true });
    const f = fileFor(packDir);
    const tmp = `${f}.${process.pid}.tmp`;
    writeFileSync(
      tmp,
      JSON.stringify({ pid: process.pid, at: Date.now(), timeout: timeoutSeconds }),
    );
    renameSync(tmp, f);
  } catch {
    // an unwritable state dir only hides the "listening" indicator
  }
}
/** Removes the heartbeat only when this process wrote it. */
export function clearArmed(packDir: string): void {
  try {
    const f = fileFor(packDir);
    const beat = JSON.parse(readFileSync(f, 'utf8')) as { pid?: unknown };
    if (beat.pid === process.pid) rmSync(f, { force: true });
  } catch {
    // missing or unreadable: nothing of ours to clear
  }
}
/** True when a wait refreshed its heartbeat within `freshMs`. */
export function isArmed(packDir: string, freshMs = ARMED_FRESH_MS, nowMs = Date.now()): boolean {
  try {
    const f = fileFor(packDir);
    const beat = JSON.parse(readFileSync(f, 'utf8')) as { at?: unknown };
    return typeof beat.at === 'number' && nowMs - beat.at <= freshMs && statSync(f).isFile();
  } catch {
    return false;
  }
}
