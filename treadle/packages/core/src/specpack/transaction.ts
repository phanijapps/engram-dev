/** One lock across CLI and web. Time alone never makes a live lock disposable. */
import { mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { hostname } from 'node:os';
import { refuse, type Admission } from '../refusals.js';
import { humanClaim } from './workflow.js';

export function withPackLock<T>(dir: string, fn: () => T): Admission<T> {
  const lock = join(dir, '.specpack-lock');
  try {
    mkdirSync(lock);
  } catch {
    return refuse(
      'stale_writer',
      'Another writer holds this spec. Retry after it finishes; recover a dead lock explicitly.',
    );
  }
  const token = randomUUID();
  try {
    writeFileSync(
      join(lock, 'owner.json'),
      JSON.stringify({ token, pid: process.pid, host: hostname(), at: new Date().toISOString() }),
    );
    return { ok: true, value: fn() };
  } finally {
    rmSync(lock, { recursive: true });
  }
}

export function recoverPackLock(dir: string, token: string, by: string): Admission<true> {
  if (!humanClaim(by)) return refuse('human_claim_required', 'Lock recovery needs the owner');
  const lock = join(dir, '.specpack-lock');
  let owner: { token?: string; pid?: number; host?: string };
  try {
    owner = JSON.parse(readFileSync(join(lock, 'owner.json'), 'utf8')) as typeof owner;
  } catch {
    return refuse('stale_writer', 'Cannot verify this lock owner. Leave the lock in place.');
  }
  if (
    owner.token !== token ||
    owner.host !== hostname() ||
    !Number.isSafeInteger(owner.pid) ||
    Number(owner.pid) <= 0
  )
    return refuse('stale_writer', 'Lock owner does not match the verified local process');
  try {
    process.kill(owner.pid!, 0);
    return refuse('stale_writer', 'The lock owner is still alive');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ESRCH')
      return refuse('stale_writer', 'Cannot prove that the lock owner stopped');
  }
  rmSync(lock, { recursive: true });
  return { ok: true, value: true };
}
