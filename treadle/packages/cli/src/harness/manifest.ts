/** Manifest loading + validation. Failures refuse — never guess. */
import { readFileSync } from 'node:fs';
import { isAbsolute, join, resolve } from 'node:path';
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
    throw new Error(`manifest unreadable (${file}): ${(e as Error).message}`);
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

function validateComponent(c: ComponentRow): void {
  if (!c.id || !c.kind) throw new Error('component refused: id and kind are required');
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
  if (!h.wiring || typeof h.wiring !== 'object') throw new Error(`${h.id}: wiring map required`);
}

/** Default manifest shipped with the package: <repo>/harness/harness.json. */
export function defaultManifestPath(): string {
  // from packages/cli/src/harness/ → packages/cli/src → packages/cli → packages → repo root
  const here = new URL('.', import.meta.url).pathname;
  return join(here, '..', '..', '..', '..', 'harness', 'harness.json');
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
