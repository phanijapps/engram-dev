/** Dual-read (spec-layout D-2): the canonical file layout normalizes to the
 *  internal model. Pure: returns a fresh doc, never mutates the parsed file. */
import type { PackDoc } from './model.js';

type Raw = Record<string, unknown>;

function str(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined;
}

function isObj(v: unknown): v is Raw {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export function normalize(raw: Raw): PackDoc {
  const doc: Raw = structuredClone(raw);
  if (!('design' in doc)) return doc as unknown as PackDoc; // old root already internal
  doc['plan'] = doc['design'];
  delete doc['design'];
  doc['title'] = str(doc['description']) ?? doc['title'] ?? '';
  delete doc['description'];
  const md = doc['metadata'];
  delete doc['metadata'];
  if (isObj(md)) {
    const arts: Raw = {};
    for (const [k, v] of Object.entries(md)) {
      if (!isObj(v)) continue;
      const e: Raw = { file: str(v['ref']) ?? '' };
      if (v['type'] !== undefined && v['type'] !== null) e['type'] = v['type'];
      if (v['description'] !== undefined && v['description'] !== null)
        e['description'] = v['description'];
      if (v['sha256']) e['sha256'] = v['sha256'];
      arts[k] = e;
    }
    doc['artifacts'] = arts;
  }
  const date = doc['date'];
  delete doc['date'];
  if (isObj(date)) {
    if (date['created']) doc['created'] = date['created'];
    if (date['updated']) doc['updated'] = date['updated'];
    const approved = date['approved'];
    if (isObj(approved)) {
      if (approved['at']) doc['approved_at'] = approved['at'];
      if (approved['by']) doc['approved_by'] = approved['by'];
    }
    const closed = date['closed'];
    if (isObj(closed)) {
      if (closed['at']) doc['closed_at'] = closed['at'];
      if (closed['by']) doc['closed_by'] = closed['by'];
    }
  }
  const st = doc['status'];
  delete doc['status'];
  if (isObj(st)) {
    if (st['lifecycle']) doc['status'] = st['lifecycle'];
    if (st['deliverable'] !== undefined && st['deliverable'] !== null)
      doc['deliverable'] = st['deliverable'];
  }
  return doc as unknown as PackDoc;
}
