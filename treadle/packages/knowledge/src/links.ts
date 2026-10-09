/**
 * Link extraction, resolution, and the containment guard (SPEC §5), ported:
 * relative AND bundle-absolute .md links are edges; external (://) are not;
 * broken and out-of-bundle targets drop silently; reserved files are not
 * nodes. Defense in depth: lexical segment rules + resolved-path containment.
 */
import { resolve, relative, dirname, isAbsolute } from 'node:path';
import { statSync } from 'node:fs';
import type { Concept } from './parse.js';

const LINK_RE = /\]\(([^)\s]+\.md)(?:#[A-Za-z0-9_-]*)?\)/g;
const SEGMENT_RE = /^[A-Za-z0-9_][A-Za-z0-9_.-]*$/;
const RESERVED = new Set(['index.md', 'log.md']);

export function isExternalTarget(t: string): boolean {
  return t.includes('://');
}

export function cidSegmentsValid(cid: string): boolean {
  if (!cid) return false;
  return cid.split('/').every((seg) => SEGMENT_RE.test(seg));
}

function isWithin(path: string, root: string): boolean {
  const rel = relative(root, path);
  return rel !== '' && !rel.startsWith('..') && !isAbsolute(rel);
}

export function resolveCidPath(root: string, cid: string): string | null {
  const rootR = resolve(root);
  if (!cidSegmentsValid(cid)) return null;
  const candidate = resolve(rootR, `${cid}.md`);
  if (!isWithin(candidate, rootR)) return null;
  try {
    if (!statSync(candidate).isFile()) return null;
  } catch {
    return null;
  }
  return candidate;
}

export function extractLinkTargets(body: string): string[] {
  const targets: string[] = [];
  for (const m of body.matchAll(LINK_RE)) {
    const t = m[1]!;
    if (isExternalTarget(t)) continue;
    targets.push(t);
  }
  return targets;
}

function resolveTarget(target: string, srcDir: string, root: string): string {
  if (target.startsWith('/')) return resolve(root, target.replace(/^\/+/, ''));
  return resolve(srcDir, target);
}

/** cid -> existing, non-reserved outgoing ids, deduped + sorted. */
export function conceptOutgoing(root: string, absPath: string, body: string): string[] {
  const rootR = resolve(root);
  const srcDir = dirname(resolve(absPath));
  const seen = new Set<string>();
  for (const target of extractLinkTargets(body)) {
    const r = resolveTarget(target, srcDir, rootR);
    if (!isWithin(r, rootR)) continue;
    try {
      if (!statSync(r).isFile()) continue;
    } catch {
      continue;
    }
    if (RESERVED.has(r.split('/').pop()!)) continue;
    const rel = relative(rootR, r).split('\\').join('/');
    const cid = rel.endsWith('.md') ? rel.slice(0, -3) : rel;
    seen.add(cid);
  }
  return [...seen].sort();
}

/** Raw relative targets that don't resolve — tolerated, the validator warns. */
export function brokenLinks(root: string, absPath: string, body: string): string[] {
  const rootR = resolve(root);
  const srcDir = dirname(resolve(absPath));
  const seen = new Set<string>();
  const broken: string[] = [];
  for (const target of extractLinkTargets(body)) {
    if (seen.has(target)) continue;
    const r = resolveTarget(target, srcDir, rootR);
    let exists = false;
    try {
      exists = statSync(r).isFile();
    } catch {
      exists = false;
    }
    if (!isWithin(r, rootR) || !exists) {
      seen.add(target);
      broken.push(target);
    }
  }
  return broken;
}

export function buildAdjacency(
  root: string,
  concepts: readonly { cid: string; path: string; body: string; reserved: string | null }[],
): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const c of concepts) {
    if (c.reserved !== null) continue;
    out[c.cid] = conceptOutgoing(root, c.path, c.body);
  }
  return out;
}

export function buildBacklinks(adjacency: Record<string, string[]>): Record<string, string[]> {
  const back: Record<string, string[]> = {};
  for (const cid of Object.keys(adjacency)) back[cid] = [];
  for (const [src, targets] of Object.entries(adjacency)) {
    for (const t of targets) {
      if (t in back) back[t]!.push(src);
    }
  }
  for (const cid of Object.keys(back)) back[cid]!.sort();
  return back;
}

export type { Concept };
