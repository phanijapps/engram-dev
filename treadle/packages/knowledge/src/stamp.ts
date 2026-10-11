/**
 * The freshness stamp (ported): written after each index run; consumers
 * compare repo_head against the current git HEAD — equal means fresh,
 * anything else means stale and the index should be refreshed before its
 * facts are trusted.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const DIR = '.okf';
const FILE = 'last-index.json';

export interface FreshnessStamp {
  readonly repo_root: string;
  readonly repo_head: string;
  readonly indexed_at: string;
  readonly written: number;
  readonly updated: number;
  readonly skipped: number;
}

function gitHead(repoRoot: string): string {
  try {
    return (
      execFileSync('git', ['rev-parse', 'HEAD'], {
        cwd: repoRoot,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      }).trim() || 'unknown'
    );
  } catch {
    return 'unknown';
  }
}

export function writeFreshnessStamp(
  bundle: string,
  repoRoot: string,
  counts: { written: number; updated: number; skipped: number },
  opts: { at?: string } = {},
): string {
  const stamp: FreshnessStamp = {
    repo_root: resolve(repoRoot),
    repo_head: gitHead(repoRoot),
    indexed_at: opts.at ?? new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
    written: counts.written,
    updated: counts.updated,
    skipped: counts.skipped,
  };
  const stateDir = join(bundle, DIR);
  mkdirSync(stateDir, { recursive: true });
  const path = join(stateDir, FILE);
  writeFileSync(
    path,
    JSON.stringify(sortedKeys(stamp as unknown as Record<string, unknown>), null, 2) + '\n',
    'utf8',
  ); // python sort_keys parity (D11)
  return path;
}

export type Freshness = 'fresh' | 'stale' | 'unknown' | 'absent' | 'no-stamp';

/** python sorts stamp keys — byte parity across engines. */
function sortedKeys<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(obj).sort()) out[k] = obj[k];
  return out;
}

export function readFreshness(bundle: string, repoRoot: string): Freshness {
  if (!existsSync(bundle)) return 'absent'; // bundle itself missing (python parity)
  const path = join(bundle, DIR, FILE);
  if (!existsSync(path)) return 'no-stamp';
  try {
    const stamp = JSON.parse(readFileSync(path, 'utf8')) as { repo_head?: string };
    const head = gitHead(repoRoot);
    if (head === 'unknown') return 'unknown'; // no git / no HEAD: its own state (D12)
    if (!stamp.repo_head) return 'unknown';
    return stamp.repo_head === head ? 'fresh' : 'stale';
  } catch {
    return 'stale';
  }
}
