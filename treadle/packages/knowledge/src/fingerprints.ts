/**
 * Fingerprints (ported): per-file content hashes for anchor staleness.
 * `update` records sha256 of every scanned source into <bundle>/.okf/
 * fingerprints.json; `anchorReview` compares each concept's sources[].resource
 * against the stored hash — changed means the page's anchors were written
 * against older code → NEEDS_REVIEW. The engine reports; the gardener
 * re-verifies. Scope rules shared with the code plane's scan.
 */
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, relative, resolve, isAbsolute } from 'node:path';
import { parseConcept } from './parse.js';

const FILENAME = 'fingerprints.json';
const SKIP_DIRS = new Set(['.venv', 'node_modules', '__pycache__', '.git', '.okf', 'fixtures']);

function sha256(path: string): string | null {
  try {
    return createHash('sha256').update(readFileSync(path)).digest('hex');
  } catch {
    return null;
  }
}

function gitHead(repoRoot: string): string | null {
  try {
    return (
      execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repoRoot, encoding: 'utf8' }).trim() || null
    );
  } catch {
    return null;
  }
}

export function computeFingerprints(
  workspace: string,
  opts: { includeTests?: boolean } = {},
): Record<string, string> {
  const out: Record<string, string> = {};
  const walk = (dir: string): void => {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))) {
      // S17
      const p = join(dir, e.name);
      if (e.isDirectory()) {
        if (SKIP_DIRS.has(e.name)) continue;
        walk(p);
      } else if (e.isFile() && e.name.endsWith('.py')) {
        const rel = relative(workspace, p).split('\\').join('/');
        const parts = rel.split('/');
        if (!opts.includeTests && parts.some((x) => x === 'tests' || x === 'test')) continue;
        const digest = sha256(p);
        if (digest) out[rel] = digest;
      }
    }
  };
  walk(resolve(workspace));
  return out;
}

export interface Stamp {
  readonly generated_at: string;
  readonly workspace: string;
  readonly head: string | null;
  readonly fingerprints: Record<string, string>;
}

export function writeFingerprints(
  workspace: string,
  bundle: string,
  opts: { at?: string } = {},
): string {
  const stateDir = join(bundle, '.okf');
  mkdirSync(stateDir, { recursive: true });
  const stamp: Stamp = {
    generated_at: opts.at ?? new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
    workspace: resolve(workspace),
    head: gitHead(workspace),
    fingerprints: computeFingerprints(workspace),
  };
  const path = join(stateDir, FILENAME);
  writeFileSync(path, JSON.stringify(stamp, null, 2) + '\n', 'utf8');
  return path;
}

export function readFingerprints(bundle: string): Record<string, string> {
  const path = join(bundle, '.okf', FILENAME);
  if (!existsSync(path)) return {};
  try {
    const data = JSON.parse(readFileSync(path, 'utf8')) as {
      fingerprints?: Record<string, string>;
    };
    return data.fingerprints && typeof data.fingerprints === 'object' ? data.fingerprints : {};
  } catch {
    return {};
  }
}

export interface AnchorVerdict {
  readonly page: string;
  readonly resource: string;
  readonly verdict: 'current' | 'changed' | 'untracked' | 'missing-file' | 'wiki-internal';
  readonly stored: string | null;
  readonly current: string | null;
}

/** Verdict per concept-source anchor. Wiki-internal anchors defer to the
 *  bundle's own broken-link check — not code fingerprints. */
export function anchorReview(bundle: string, repoRoot: string): AnchorVerdict[] {
  const rootR = resolve(repoRoot);
  const bundleR = resolve(bundle);
  const fingerprints = readFingerprints(bundle);
  const review: AnchorVerdict[] = [];
  const walk = (dir: string): void => {
    for (const e of readdirSync(dir, { withFileTypes: true }).sort((a, b) =>
      a.name.localeCompare(b.name),
    )) {
      const p = join(dir, e.name);
      if (e.isDirectory()) {
        if (e.name === '.okf') continue;
        walk(p);
      } else if (e.isFile() && e.name.endsWith('.md')) {
        if (e.name === 'index.md' || e.name === 'log.md') continue;
        const c = parseConcept(p, bundleR);
        const sources = c.frontmatter['sources'];
        if (!Array.isArray(sources)) continue;
        const cid = relative(bundleR, p).split('\\').join('/').replace(/\.md$/, '');
        for (const entry of sources) {
          if (typeof entry !== 'object' || entry === null) continue;
          const resource = (entry as Record<string, unknown>)['resource'];
          if (typeof resource !== 'string' || !resource) continue;
          const target = resolve(rootR, resource);
          // component-aware: 'wiki.d/evil.py' is not inside 'wiki' (D7)
          const relToBundle = relative(bundleR, target);
          const insideBundle =
            relToBundle !== '' && !relToBundle.startsWith('..') && !isAbsolute(relToBundle);
          if (insideBundle) {
            review.push({
              page: cid,
              resource,
              verdict: 'wiki-internal',
              stored: null,
              current: null,
            });
            continue;
          }
          const current = sha256(target);
          const stored = fingerprints[resource] ?? null;
          const verdict =
            current === null
              ? 'missing-file'
              : stored === null
                ? 'untracked'
                : stored !== current
                  ? 'changed'
                  : 'current';
          review.push({ page: cid, resource, verdict, stored, current });
        }
      }
    }
  };
  walk(bundleR);
  return review;
}
