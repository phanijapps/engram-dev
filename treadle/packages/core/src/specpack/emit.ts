/** The canonical emission (spec-layout D-1): the FILE carries the contract.
 *  Byte-faithful port of the Python writer — key order is part of it. */
import type { PackDoc } from './model.js';

export const CANONICAL_ORDER = [
  'id',
  'name',
  'description',
  'date',
  'status',
  'metadata',
  'spec',
  'design',
  'tasks',
  'workflow',
  'review',
  'env',
  'format',
  'revision',
] as const;

type Raw = Record<string, unknown>;

function isObj(v: unknown): v is Raw {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export function emit(doc: PackDoc): Raw {
  const d = doc as unknown as Raw;
  const out: Raw = {};
  out['id'] = d['id'] ?? d['name'];
  out['name'] = d['name'];
  out['description'] = d['title'] ?? '';
  const date: Raw = {};
  if (d['created']) date['created'] = d['created'];
  if (d['updated']) date['updated'] = d['updated'];
  if (d['approved_at']) {
    const approved: Raw = { at: d['approved_at'] };
    if (d['approved_by']) approved['by'] = d['approved_by'];
    date['approved'] = approved;
  }
  if (d['closed_at']) {
    const closed: Raw = { at: d['closed_at'] };
    if (d['closed_by']) closed['by'] = d['closed_by'];
    date['closed'] = closed;
  }
  if (Object.keys(date).length) out['date'] = date;
  const st: Raw = {};
  if (d['status']) st['lifecycle'] = d['status'];
  if (d['deliverable']) st['deliverable'] = d['deliverable'];
  if (Object.keys(st).length) out['status'] = st;
  if (d['artifacts'] && isObj(d['artifacts'])) {
    const md: Raw = {};
    for (const [k, v] of Object.entries(d['artifacts'] as Raw)) {
      if (!isObj(v)) continue;
      const e: Raw = { ref: v['file'] ?? '' };
      if (v['type'] !== undefined && v['type'] !== null) e['type'] = v['type'];
      if (v['description'] !== undefined && v['description'] !== null)
        e['description'] = v['description'];
      if (v['sha256']) e['sha256'] = v['sha256'];
      md[k] = e;
    }
    out['metadata'] = md;
  }
  out['spec'] = d['spec'];
  out['design'] = d['plan'];
  out['tasks'] = d['tasks'];
  if (d['format'] === 'specpack/0.4') out['workflow'] = d['workflow'];
  if (d['review']) out['review'] = d['review'];
  if (d['env']) out['env'] = d['env'];
  out['format'] = d['format'];
  out['revision'] = d['revision'] ?? 1;
  const ordered: Raw = {};
  for (const k of CANONICAL_ORDER) if (k in out) ordered[k] = out[k];
  return ordered;
}

/** Serialize exactly as the Python writer does: two-space indent, raw unicode,
 *  trailing newline. Key order comes from emit(); JSON.stringify preserves it. */
export function emitBytes(doc: PackDoc): string {
  return JSON.stringify(emit(doc), null, 2) + '\n';
}
