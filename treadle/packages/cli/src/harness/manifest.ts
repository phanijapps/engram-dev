/** Manifest loading + validation. Failures refuse — never guess. */
import { existsSync, readFileSync, lstatSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { isAbsolute, join, resolve, dirname } from 'node:path';
import type { ComponentRow, HarnessManifest, HookRow, Surface } from './types.js';

export interface LoadedManifest {
  manifest: HarnessManifest;
  root: string;
}

export function loadManifest(path: string): LoadedManifest {
  const file = resolve(path);
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(file, 'utf8'));
  } catch (e) {
    throw new Error(`manifest unreadable (${file}): ${(e as Error).message}`, { cause: e });
  }
  const m = raw as HarnessManifest;
  if (m.format !== 'harness/0.1') {
    throw new Error(`manifest format refused: ${String(m.format)} (contract: harness/0.1)`);
  }
  if (!Array.isArray(m.components) || !Array.isArray(m.hooks)) {
    throw new Error('manifest shape refused: components[] and hooks[] are required');
  }
  for (const c of m.components) validateComponent(c);
  for (const h of m.hooks) validateHook(h);
  return { manifest: m, root: resolve(file, '..') };
}

function safePath(p: string): boolean {
  return (
    !p.startsWith('/') &&
    !p.startsWith('\\') &&
    !p.split('/').includes('..') &&
    !p.split('\\').includes('..')
  );
}

function validateComponent(c: ComponentRow): void {
  if (!c.id || !c.kind) throw new Error('component refused: id and kind are required');
  const sources = typeof c.source === 'string' ? [c.source] : Object.values(c.source);
  for (const s of sources)
    if (s !== undefined && !safePath(s))
      throw new Error(`${c.id}: source escapes the manifest root (${s}) — refused`);
  for (const d of Object.values(c.dest))
    if (d !== undefined && !safePath(d))
      throw new Error(`${c.id}: dest escapes the install root (${d}) — refused`);
  if (c.kind !== 'skill' && c.kind !== 'agent')
    throw new Error(`${c.id}: kind must be skill|agent`);
  if (c.kind === 'skill' && typeof c.source !== 'string') {
    throw new Error(`${c.id}: a skill source is a directory path`);
  }
  if (c.kind === 'agent' && (typeof c.source !== 'object' || c.source === null)) {
    throw new Error(`${c.id}: an agent source is a per-surface file map`);
  }
  if (!c.dest || typeof c.dest !== 'object') throw new Error(`${c.id}: dest map required`);
}

function validateHook(h: HookRow): void {
  if (!h.id || !h.file) throw new Error('hook refused: id and file are required');
  if (!safePath(h.file)) throw new Error(`${h.id}: hook file escapes the manifest root — refused`);
  for (const file of h.companions ?? [])
    if (!safePath(file)) throw Error(`${h.id}: support file escapes manifest root`);
  for (const [k, w] of Object.entries(h.wiring)) {
    const ws = Array.isArray(w) ? w : [w];
    for (const one of ws) {
      if (one !== null && one.dest !== undefined && !safePath(one.dest))
        throw new Error(`${h.id}: wiring dest for ${k} escapes — refused`);
    }
  }
  if (!h.wiring || typeof h.wiring !== 'object') throw new Error(`${h.id}: wiring map required`);
}

/** Default manifest shipped with the package: packages/cli/harness/harness.json.
 *  The path walks UP from this module until it finds it — the module
 *  lives at different depths in source (src/harness/), compiled
 *  (dist/src/harness/), and packed installs; a fixed hop count broke
 *  all three at once (found by the git-installed binary, T-2). */
export function defaultManifestPath(): string {
  let dir = fileURLToPath(new URL('.', import.meta.url));
  for (let i = 0; i < 5; i++) {
    const candidate = join(dir, 'harness', 'harness.json');
    if (existsSync(candidate)) return candidate;
    dir = join(dir, '..');
  }
  return join(fileURLToPath(new URL('.', import.meta.url)), '..', '..', 'harness', 'harness.json'); // the honest ENOENT when truly absent
}

export function sourceFile(c: ComponentRow, surface: Surface): string | undefined {
  if (typeof c.source === 'string') return c.source;
  return c.source[surface];
}

export function destPath(c: ComponentRow, surface: Surface): string | undefined {
  return c.dest[surface];
}

export function manifestRelative(root: string, p: string): string {
  return isAbsolute(p) ? p : join(root, p);
}

/** Strict preflight for the dedicated Copilot container; no foreign bytes are changed here. */
export function readCopilotHooks(
  target: string,
): { version: 1; hooks: Record<string, unknown[]>; [key: string]: unknown } | null {
  try {
    let current = target;
    for (let depth = 0; depth < 3; depth++) {
      try {
        if (lstatSync(current).isSymbolicLink()) return null;
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') return null;
      }
      const parent = dirname(current);
      if (parent === current) break;
      current = parent;
    }
    if (!existsSync(target)) return { version: 1, hooks: {} };
    const value = JSON.parse(readFileSync(target, 'utf8'));
    if (
      !value ||
      typeof value !== 'object' ||
      Array.isArray(value) ||
      value.version !== 1 ||
      !value.hooks ||
      typeof value.hooks !== 'object' ||
      Array.isArray(value.hooks) ||
      Object.values(value.hooks).some((entries) => !Array.isArray(entries))
    )
      return null;
    return value;
  } catch {
    return null;
  }
}
