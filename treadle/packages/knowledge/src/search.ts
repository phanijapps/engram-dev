/** Full-text search over a bundle (REQ-SRCH), ported faithfully: lightweight
 *  weighted ranking (exact title > title > tag/type/frontmatter > description
 *  > body), type/tag filters, deterministic order (score desc, then cid asc). */
import { parseConcept, iterConceptFiles } from './parse.js';

const TOKEN_RE = /[a-z0-9]+/g;
const WEIGHTS = { title: 5, tag: 4, frontmatter: 3, type: 3, description: 2, body: 1 } as const;
const EXACT_TITLE_BOOST = 100.0;

export interface Hit {
  readonly cid: string;
  readonly title: string;
  readonly type: string;
  readonly snippet: string;
  readonly score: number;
}

export interface Index {
  readonly docs: readonly DocMeta[];
}

interface DocMeta {
  readonly cid: string;
  readonly title: string;
  readonly type: string;
  readonly tags: readonly string[];
  readonly description: string;
  readonly body: string;
  readonly titleTerms: ReadonlyMap<string, number>;
  readonly tagTerms: ReadonlyMap<string, number>;
  readonly typeTerms: ReadonlyMap<string, number>;
  readonly descTerms: ReadonlyMap<string, number>;
  readonly fmTerms: ReadonlyMap<string, number>;
  readonly bodyTerms: ReadonlyMap<string, number>;
}

export function tokenize(text: string): string[] {
  return text.toLowerCase().match(TOKEN_RE) ?? [];
}

function counter(text: string): Map<string, number> {
  const m = new Map<string, number>();
  for (const t of tokenize(text)) m.set(t, (m.get(t) ?? 0) + 1);
  return m;
}

function fmStr(fm: Record<string, unknown>, key: string): string {
  const v = fm[key];
  return typeof v === 'string' ? v : '';
}

function fmStrList(fm: Record<string, unknown>, key: string): string[] {
  const v = fm[key];
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
}

function fmText(fm: Record<string, unknown>): string {
  const values: string[] = [];
  for (const v of Object.values(fm)) {
    if (typeof v === 'string') values.push(v);
    else if (Array.isArray(v)) values.push(...v.filter((x): x is string => typeof x === 'string'));
  }
  return values.join(' ');
}

export function buildIndex(root: string): Index {
  const docs: DocMeta[] = [];
  for (const md of iterConceptFiles(root)) {
    const c = parseConcept(md, resolve(root));
    if (c.reserved !== null) continue;
    const title = fmStr(c.frontmatter, 'title');
    const type = fmStr(c.frontmatter, 'type');
    const tags = fmStrList(c.frontmatter, 'tags');
    const description = fmStr(c.frontmatter, 'description');
    docs.push({
      cid: c.cid,
      title,
      type,
      tags,
      description,
      body: c.body,
      titleTerms: counter(title),
      tagTerms: counter(tags.join(' ')),
      typeTerms: counter(type),
      descTerms: counter(description),
      fmTerms: counter(fmText(c.frontmatter)),
      bodyTerms: counter(c.body),
    });
  }
  return { docs };
}

export function toDict(
  index: Index,
): { cid: string; title: string; type: string; tags: string[] }[] {
  return index.docs.map((d) => ({ cid: d.cid, title: d.title, type: d.type, tags: [...d.tags] }));
}

export function search(
  index: Index,
  q: string,
  opts: {
    type?: string[] | undefined;
    tag?: string[] | undefined;
    limit?: number | undefined;
  } = {},
): Hit[] {
  const limit = opts.limit ?? 20;
  const qTerms = tokenize(q);
  const normQuery = q.trim().toLowerCase();
  const typeFilter = opts.type ? new Set(opts.type) : null;
  const tagFilter = opts.tag ? new Set(opts.tag) : null;
  const hits: Hit[] = [];
  for (const doc of index.docs) {
    if (typeFilter && !typeFilter.has(doc.type)) continue;
    if (tagFilter && !doc.tags.some((t) => tagFilter.has(t))) continue;
    const score = scoreDoc(normQuery, qTerms, doc);
    if (qTerms.length && score <= 0) continue;
    hits.push({
      cid: doc.cid,
      title: doc.title || doc.cid,
      type: doc.type,
      snippet: snippet(qTerms, doc),
      score,
    });
  }
  hits.sort((a, b) => b.score - a.score || a.cid.localeCompare(b.cid));
  return hits.slice(0, limit);
}

function scoreDoc(normQuery: string, qTerms: string[], doc: DocMeta): number {
  if (!qTerms.length) return 0.0;
  let score = 0.0;
  if (normQuery && doc.title.trim().toLowerCase() === normQuery) score += EXACT_TITLE_BOOST;
  for (const term of qTerms) {
    score +=
      (doc.titleTerms.get(term) ?? 0) * WEIGHTS.title +
      (doc.tagTerms.get(term) ?? 0) * WEIGHTS.tag +
      (doc.typeTerms.get(term) ?? 0) * WEIGHTS.type +
      (doc.descTerms.get(term) ?? 0) * WEIGHTS.description +
      (doc.fmTerms.get(term) ?? 0) * WEIGHTS.frontmatter +
      (doc.bodyTerms.get(term) ?? 0) * WEIGHTS.body;
  }
  return score;
}

function snippet(qTerms: string[], doc: DocMeta): string {
  const text = doc.body.trim() || doc.description.trim();
  if (!text) return '';
  const lower = text.toLowerCase();
  const positions = qTerms.filter((t) => t && lower.includes(t)).map((t) => lower.indexOf(t));
  if (positions.length) {
    const center = Math.min(...positions);
    const start = Math.max(0, center - 40);
    const end = Math.min(text.length, center + 40);
    const prefix = start > 0 ? '…' : '';
    const suffix = end < text.length ? '…' : '';
    return prefix + text.slice(start, end) + suffix;
  }
  return text.slice(0, 80) + (text.length > 80 ? '…' : '');
}

import { resolve } from 'node:path';
