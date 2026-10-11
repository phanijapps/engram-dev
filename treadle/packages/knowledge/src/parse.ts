/**
 * Concept parsing (OKF 0.2 §4.1), ported faithfully: permissive splitting —
 * never raises on malformed input; a present-but-invalid frontmatter block
 * records the error for the validator to report. Enumeration is symlink-safe.
 */
import { readdirSync, readFileSync, statSync, realpathSync } from 'node:fs';
import { join, relative, resolve, sep, isAbsolute } from 'node:path';
import { parse as parseYaml } from 'yaml';

/* PyYAML parity (YAML 1.1 dialect): duplicate keys take last-wins, scalars
 * like yes/on are booleans. Without these options the port flips conformance
 * verdicts against its own authority engine. */
const YAML_OPTS = { uniqueKeys: false, schema: 'yaml-1.1' } as const;

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
  // python splitlines(): \r\n, \r, and \n all end lines — reconstruct keepends
  const lines = text.match(/[^\r\n]*(?:\r\n|\r|\n|[^\r\n]$)/g) ?? [];
  if (!lines.length || rstripEol(lines[0]!) !== DELIMITER) {
    return { data: {}, body: text, present: false, error: null };
  }
  const closeIdx = lines.findIndex((l, i) => i > 0 && rstripEol(l) === DELIMITER);
  if (closeIdx < 1) return { data: {}, body: text, present: false, error: null };
  // YAML sees clean \n lines (python's splitlines already stripped CR)
  const fmText =
    lines
      .slice(1, closeIdx)
      .map((l) => rstripEol(l))
      .join('\n') + '\n';
  const bodyText = lines.slice(closeIdx + 1).join('');
  if (!fmText.trim()) return { data: {}, body: bodyText, present: true, error: null };
  try {
    const data = parseYaml(fmText, YAML_OPTS);
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

/** python rstrip("\r\n"): strip any run of CR/LF at the end, not one pair. */
function rstripEol(line: string): string {
  return line.replace(/[\r\n]+$/, '');
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
export function iterConceptFiles(
  root: string,
  excludedDirectories: readonly string[] = [],
): string[] {
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
      if (e.isDirectory()) {
        if (!excludedDirectories.includes(e.name)) walk(p);
      } else if (e.name.endsWith('.md')) {
        // Dirent.isFile() is lexical: a symlinked .md reads as a file here and
        // escapes below unless realpathed — the guard lives on the real path
        const st = statSync(p, { throwIfNoEntry: false });
        if (!st?.isFile()) continue;
        let real: string | null;
        try {
          real = realpathSync(p);
        } catch {
          continue;
        }
        const rel = relative(realpathSync(rootResolved), real);
        if (rel === '..' || rel.startsWith('..' + sep) || isAbsolute(rel)) continue; // escape: never read
        if (rel.split(sep).some((part) => excludedDirectories.includes(part))) continue;
        if (seen.has(real)) continue; // dupe: once
        seen.add(real);
        out.push(real);
      }
    }
  };
  walk(rootResolved);
  return out.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)); // code points (S17)
}
