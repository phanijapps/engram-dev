/**
 * Concept parsing (OKF 0.2 §4.1), ported faithfully: permissive splitting —
 * never raises on malformed input; a present-but-invalid frontmatter block
 * records the error for the validator to report. Enumeration is symlink-safe.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { parse as parseYaml } from 'yaml';

const DELIMITER = '---';
const RESERVED: Record<string, string> = { 'index.md': 'index', 'log.md': 'log' };
const MAX_CONCEPT_BYTES = 8 * 1024 * 1024; // belt-and-suspenders, same as the engine

export interface Concept {
  readonly cid: string;
  readonly path: string;
  readonly frontmatter: Record<string, unknown>;
  readonly body: string;
  readonly reserved: string | null;
  readonly frontmatter_error: string | null;
  readonly frontmatter_present: boolean;
}

export function splitFrontmatter(text: string): {
  data: Record<string, unknown>;
  body: string;
  present: boolean;
  error: string | null;
} {
  if (text.startsWith('﻿')) return { data: {}, body: text, present: false, error: null };
  const lines = text.split('\n').map((l, i, a) => (i === a.length - 1 ? l : l + '\n'));
  if (!lines.length || lines[0]!.replace(/\r?\n$/, '') !== DELIMITER) {
    return { data: {}, body: text, present: false, error: null };
  }
  const closeIdx = lines.findIndex((l, i) => i > 0 && l.replace(/\r?\n$/, '') === DELIMITER);
  if (closeIdx < 1) return { data: {}, body: text, present: false, error: null };
  const fmText = lines.slice(1, closeIdx).join('');
  const bodyText = lines.slice(closeIdx + 1).join('');
  if (!fmText.trim()) return { data: {}, body: bodyText, present: true, error: null };
  try {
    const data = parseYaml(fmText);
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
      return {
        data: {},
        body: bodyText,
        present: true,
        error: `frontmatter must be a YAML mapping, got ${pyTypeName(data)}`,
      };
    }
    return { data: data as Record<string, unknown>, body: bodyText, present: true, error: null };
  } catch (e) {
    return {
      data: {},
      body: bodyText,
      present: true,
      error: `frontmatter YAML parse error: ${(e as Error).message}`,
    };
  }
}

export function parseConcept(absPath: string, root: string): Concept {
  const rel = relative(root, absPath).split('\\').join('/');
  const cid = rel.endsWith('.md') ? rel.slice(0, -3) : rel;
  const reserved = RESERVED[rel.split('/').pop() ?? ''] ?? null;
  let size = 0;
  try {
    size = statSync(absPath).size;
  } catch (e) {
    return errConcept(cid, reserved, `cannot stat file: ${(e as Error).message}`);
  }
  if (size > MAX_CONCEPT_BYTES) {
    return errConcept(cid, reserved, `file too large: ${size} bytes (limit ${MAX_CONCEPT_BYTES})`);
  }
  const r = splitFrontmatter(readFileSync(absPath, 'utf8'));
  return {
    cid,
    path: absPath,
    frontmatter: r.data,
    body: r.body,
    reserved,
    frontmatter_error: r.error,
    frontmatter_present: r.present,
  };
}

/** python-parity type names in the error vocabulary (list, not Array). */
function pyTypeName(v: unknown): string {
  if (Array.isArray(v)) return 'list';
  if (v === null) return 'NoneType';
  if (typeof v === 'number') return Number.isInteger(v) ? 'int' : 'float';
  if (typeof v === 'boolean') return 'bool';
  return typeof v;
}

function errConcept(cid: string, reserved: string | null, error: string): Concept {
  return {
    cid,
    path: '',
    frontmatter: {},
    body: '',
    reserved,
    frontmatter_error: error,
    frontmatter_present: false,
  };
}

/** Yield resolved, in-bundle .md paths — symlink escapes and dupes skipped
 *  (the safe enumeration every reader shares). */
export function iterConceptFiles(root: string): string[] {
  const rootResolved = resolve(root);
  const seen = new Set<string>();
  const out: string[] = [];
  const walk = (dir: string): void => {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.isFile() && e.name.endsWith('.md')) {
        let real: string;
        try {
          real = resolve(p);
        } catch {
          continue;
        }
        if (!real.startsWith(rootResolved)) continue; // symlink escape: never read
        if (seen.has(real)) continue; // dupe: once
        seen.add(real);
        out.push(real);
      }
    }
  };
  walk(rootResolved);
  return out.sort();
}
