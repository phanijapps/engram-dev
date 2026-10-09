/**
 * Pin-or-verify digests (DES-3/DES-4, ported): touch files pin at first
 * handout sighting and verify at every handout; drift refuses the handout
 * (needs_rebase — no state change, no revision bump). Artifacts verify
 * against the pack directory; local links against the git root.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { isAbsolute, join, dirname, sep, resolve } from 'node:path';
import type { PackDoc } from './model.js';

type Raw = Record<string, unknown>;

export interface Drift {
  readonly path: string;
  readonly why: string;
  readonly pinned?: string;
  readonly current?: string;
}

export function pinOrVerify(doc: PackDoc, taskId: string, packPath: string): Drift[] {
  const t = doc.tasks.find((x) => x.id === taskId);
  if (!t) return [];
  const touch = strList(((t as Raw)['context'] as Raw | undefined)?.['touch']);
  if (!touch.length) return [];
  const root = gitRoot(packPath);
  const drift: Drift[] = [];
  for (const e of touch) {
    const entry = e as Raw;
    const f = resolvePath(root, String(entry['path'] ?? ''));
    if (f === null) {
      drift.push({ path: String(entry['path']), why: 'invalid-path' });
      continue;
    }
    const pinned = typeof entry['sha256'] === 'string' ? entry['sha256'] : undefined;
    if (!isFile(f)) {
      if (pinned) drift.push({ path: String(entry['path']), why: 'missing', pinned });
      continue; // absent at first sighting stays unpinned (resume-safe)
    }
    const current = sha256(f);
    if (!pinned) {
      entry['sha256'] = current; // pin at first sighting — the only mutation
    } else if (pinned !== current) {
      drift.push({ path: String(entry['path']), why: 'changed', pinned, current });
    }
  }
  return drift;
}

export function verifyRefs(doc: PackDoc, taskId: string, packPath: string): Drift[] {
  const d = doc as unknown as Raw;
  const drift: Drift[] = [];
  for (const a of Object.values((d['artifacts'] as Record<string, Raw>) ?? {})) {
    const pin = typeof a['sha256'] === 'string' ? a['sha256'] : undefined;
    if (!pin) continue;
    const f = join(dirname(packPath), String(a['file'] ?? ''));
    if (!isFile(f)) continue; // incomplete pack, not drift: refuses on mismatch only
    const cur = sha256(f);
    if (cur !== pin)
      drift.push({ path: String(a['file']), why: 'artifact-digest', pinned: pin, current: cur });
  }
  const t = doc.tasks.find((x) => x.id === taskId);
  const links = t ? strList2(((t as Raw)['context'] as Raw | undefined)?.['links']) : [];
  for (const e of links) {
    const entry = e as Raw;
    const pin = typeof entry['sha256'] === 'string' ? entry['sha256'] : undefined;
    const url = String(entry['url'] ?? '');
    if (!pin || url.includes('://')) continue;
    const f = resolvePath(gitRoot(packPath), url);
    if (f === null) {
      drift.push({ path: url, why: 'invalid-path' });
      continue;
    }
    if (!isFile(f)) continue; // missing reference is not a mismatch; coverage reports it
    const cur = sha256(f);
    if (cur !== pin) drift.push({ path: url, why: 'link-digest', pinned: pin, current: cur });
  }
  return drift;
}

/** The repository root containing the pack; the pack parent when outside git. */
export function gitRoot(start: string): string {
  let p = resolve(start);
  if (isFileLike(p)) p = dirname(p);
  for (const cand of [p, ...parentsOf(p)]) {
    if (existsSync(join(cand, '.git'))) return cand;
  }
  return isFileLike(p) ? dirname(p) : p;
}

function isFileLike(p: string): boolean {
  try {
    return statSync(p).isFile();
  } catch {
    return p.includes(sep) && !p.endsWith(sep) && /(?:\.[a-z]+)$/i.test(p);
  }
}

function parentsOf(p: string): string[] {
  const out: string[] = [];
  let cur = p;
  while (true) {
    const up = dirname(cur);
    if (up === cur) break;
    cur = up;
    out.push(cur);
  }
  return out;
}

/** Join a context path onto its root; null when the path escapes the root. */
export function resolvePath(root: string, rel: string): string | null {
  if (isAbsolute(rel) || rel.split(/[\\/]+/).includes('..')) return null;
  return join(root, rel);
}

function isFile(f: string): boolean {
  try {
    return statSync(f).isFile();
  } catch {
    return false;
  }
}

function sha256(f: string): string {
  return createHash('sha256').update(readFileSync(f)).digest('hex');
}

function strList(v: unknown): Raw[] {
  return Array.isArray(v) ? (v as Raw[]) : [];
}

function strList2(v: unknown): Raw[] {
  return Array.isArray(v) ? (v as Raw[]) : [];
}
