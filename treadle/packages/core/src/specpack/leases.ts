/** Machine-local session leases. A lease says "an agent session is alive"; it lives
 *  outside every pack and holds no prompt, transcript or pack text. */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export const LEASE_TTL_MS = 8 * 60 * 60 * 1000;

export interface Lease {
  session: string;
  pid?: number;
  at: number;
  ttl: number;
}

const leaseDir = (): string => process.env['HARNESS_LEASE_DIR'] || join(tmpdir(), 'wukong-leases');
const fileFor = (session: string): string =>
  join(leaseDir(), createHash('sha256').update(session).digest('hex').slice(0, 24) + '.json');

export const pidAlive = (pid: number): boolean => {
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return (e as NodeJS.ErrnoException).code === 'EPERM';
  }
};

/** Best-effort: a lease failure must never break the session that writes it. */
export function writeLease(
  session: string,
  o: { pid?: number | undefined; ttlMs?: number; nowMs?: number } = {},
): void {
  try {
    mkdirSync(leaseDir(), { recursive: true, mode: 0o700 });
    const f = fileFor(session);
    const tmp = `${f}.${process.pid}.tmp`;
    const lease: Lease = {
      session,
      at: o.nowMs ?? Date.now(),
      ttl: o.ttlMs ?? LEASE_TTL_MS,
      ...(o.pid ? { pid: o.pid } : {}),
    };
    writeFileSync(tmp, JSON.stringify(lease), { mode: 0o600 });
    renameSync(tmp, f);
  } catch {
    // an unwritable lease directory only weakens cleanup
  }
}
export function removeLease(session: string): void {
  try {
    rmSync(fileFor(session), { force: true });
  } catch {
    // the TTL or a dead pid retires it
  }
}

/** Live leases: the pid is alive and the TTL has not passed; a lease without a pid lives by TTL alone. */
export function liveLeases(nowMs = Date.now()): Lease[] {
  let names: string[];
  try {
    names = readdirSync(leaseDir()).filter((n) => n.endsWith('.json'));
  } catch {
    return [];
  }
  const live: Lease[] = [];
  for (const n of names) {
    try {
      const l = JSON.parse(readFileSync(join(leaseDir(), n), 'utf8')) as Lease;
      if (typeof l.session !== 'string' || typeof l.at !== 'number' || typeof l.ttl !== 'number')
        continue;
      // A lease with a pid lives as long as the process; the TTL only retires pid-less leases.
      const expired = l.pid === undefined && nowMs - l.at > Math.min(l.ttl, LEASE_TTL_MS);
      const badPid = l.pid !== undefined && !(Number.isSafeInteger(l.pid) && l.pid > 1);
      if (expired || badPid || (l.pid !== undefined && !pidAlive(l.pid))) {
        rmSync(join(leaseDir(), n), { force: true });
        continue;
      }
      live.push(l);
    } catch {
      // an unreadable lease is not live
    }
  }
  return live;
}

const SHELL = /^-?(sh|bash|zsh|fish|dash|ksh|tcsh|csh)$/;
/** The agent process that owns this hook or command: the nearest non-shell ancestor.
 *  Undefined when it cannot be found (Windows, no `ps`); callers then fall back to a TTL. */
export function agentOwnerPid(startPid = process.ppid): number | undefined {
  if (process.platform === 'win32') return undefined;
  let pid = startPid;
  for (let i = 0; i < 6 && pid > 1; i++) {
    try {
      const out = execFileSync('ps', ['-o', 'ppid=,comm=', '-p', String(pid)], {
        encoding: 'utf8',
        timeout: 2000,
      }).trim();
      const m = /^(\d+)\s+(.*)$/.exec(out);
      if (!m) return undefined;
      const name = (m[2] ?? '').split('/').pop() ?? '';
      if (!SHELL.test(name)) return pid;
      pid = Number(m[1]);
    } catch {
      return undefined;
    }
  }
  return undefined;
}

/** The live lease that belongs to an agent process, if its hook recorded that pid. */
export function leaseForPid(pid: number): string | undefined {
  return liveLeases()
    .filter((l) => l.pid === pid)
    .sort((a, b) => b.at - a.at)[0]?.session;
}
/** True while the named session still has a live lease. */
export const leaseLive = (session: string): boolean =>
  liveLeases().some((l) => l.session === session);
