/**
 * Load a pack from its directory, parsed once and normalized to the internal
 * model (R8: parse at the boundary). Mirrors the engine's loader exactly:
 * discovery, the section/format gates, the active-by-default lifecycle, and
 * the stage-mismatch checksum — a stored stage that is not the derived stage
 * is a hand-edited lie and refuses to load.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import { normalize } from './normalize.js';
import { deriveStage } from './derive.js';
import type { PackDoc } from './model.js';
import { refuse, type Admission } from '../refusals.js';
import { validateWorkflow } from './workflow.js';

const KNOWN_FORMATS = ['specpack/0.3', 'specpack/0.2'];

export function loadPack(dir: string): Admission<PackDoc> {
  if (existsSync(join(dir, 'sdd.json'))) {
    return refuse(
      'pack_refused_to_load',
      `${dir}: sdd.json present — legacy spine takes precedence; specpack support is for specpack initiatives`,
    );
  }
  const found = discover(dir);
  if (!found.ok) return found;
  const path = found.value;
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(path, 'utf8'));
  } catch (e) {
    return refuse('pack_refused_to_load', `${path}: invalid JSON: ${(e as Error).message}`);
  }
  const doc = normalize(raw as Record<string, unknown>);
  const d = doc as unknown as Record<string, unknown>;
  for (const section of ['spec', 'plan', 'tasks']) {
    const ok = section === 'tasks' ? Array.isArray(d[section]) : typeof d[section] === 'object';
    if (!ok) {
      return refuse('pack_refused_to_load', `${path}: not a spec: ${section} missing or malformed`);
    }
  }
  if (!('requirements' in (doc.spec as object))) {
    return refuse('pack_refused_to_load', `${path}: not a spec: spec.requirements missing`);
  }
  const format = (d['format'] as string | undefined) ?? '';
  if (!KNOWN_FORMATS.includes(format) && format !== 'specpack/0.4') {
    return refuse(
      'pack_refused_to_load',
      `${path}: unsupported format '${format}' (this loom speaks: ${KNOWN_FORMATS.join(', ')})`,
    );
  }
  const workflowProblems = validateWorkflow(doc);
  if (workflowProblems.length)
    return refuse('pack_refused_to_load', `${path}: ${workflowProblems.join('; ')}`);
  if (!('status' in d)) d['status'] = 'active'; // explicit from the first machine touch
  const stored = d['deliverable'];
  if (stored !== undefined && stored !== deriveStage(doc)) {
    return refuse(
      'pack_is_frozen', // closest code: the lie is about the frozen stage contract
      `${path}: deliverable stage mismatch — stored '${String(stored)}', derived '${deriveStage(doc)}' — never hand-set a stage; fix the source of truth (tasks/decisions/questions/review)`,
    );
  }
  return { ok: true, value: doc };
}

/** Discovery mirrors spec_path: <dirname>.json by convention, specpack.json
 *  second, and never a silent guess when several json files compete. */
function discover(dir: string): Admission<string> {
  const preferred = [join(dir, `${basename(dir)}.json`), join(dir, 'specpack.json')];
  for (const p of preferred) if (existsSync(p)) return { ok: true, value: p };
  let names: string[] = [];
  try {
    names = readdirSync(dir);
  } catch {
    return refuse(
      'pack_refused_to_load',
      `${dir}: no spec json found (looked for ${basename(dir)}.json)`,
    );
  }
  const found = names.filter((f) => f.endsWith('.json')).sort();
  if (found.length === 1) return { ok: true, value: join(dir, found[0]!) };
  if (found.length === 0) {
    return refuse(
      'pack_refused_to_load',
      `${dir}: no spec json found (looked for ${basename(dir)}.json)`,
    );
  }
  return refuse('pack_refused_to_load', `${dir}: several spec jsons compete — name it explicitly`);
}

/** Load with the discovered path: saves must land where the load read. */
export function loadPackWithMeta(dir: string): Admission<{ doc: PackDoc; path: string }> {
  const r = loadPack(dir);
  if (!r.ok) return r;
  const path = discoverPath(dir);
  return path
    ? { ok: true, value: { doc: r.value, path } }
    : refuse('pack_refused_to_load', 'path lost');
}

function discoverPath(dir: string): string | null {
  const preferred = [join(dir, `${basename(dir)}.json`), join(dir, 'specpack.json')];
  for (const p of preferred) if (existsSync(p)) return p;
  const found = readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort();
  return found.length === 1 ? join(dir, found[0]!) : null;
}
