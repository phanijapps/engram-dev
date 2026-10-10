/**
 * Progressive read (context, ported): depth=0 returns the raw file; depth>0
 * returns the seed in full plus its N-hop neighbors in BFS order under
 * `# <cid> (depth k)` headers, truncated to a token budget with an honest
 * omission marker naming what was cut.
 */
import { trustTier } from './validate.js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { iterConceptFiles, parseConcept } from './parse.js';
import { buildAdjacency, resolveCidPath } from './links.js';

const CHARS_PER_TOKEN = 4;

export class ConceptNotFound extends Error {
  constructor(
    readonly cid: string,
    readonly suggestions: string[],
  ) {
    super(`concept not found: ${cid}`);
  }
}

export function readConcept(root: string, cid: string, depth = 0, tokenBudget = 8000): string {
  const rootR = resolve(root);
  const seedPath = resolveCidPath(rootR, cid);
  if (seedPath === null) throw new ConceptNotFound(cid, suggest(rootR, cid));
  if (depth <= 0) return readFileSync(seedPath, 'utf8');

  const concepts = [...iterConceptFiles(rootR)].map((md) => parseConcept(md, rootR));
  const byCid = new Map(concepts.map((c) => [c.cid, c]));
  const adjacency = buildAdjacency(rootR, concepts);
  const levels = bfsLevels(cid, adjacency, depth);

  const seedFm = parseConcept(seedPath, rootR).frontmatter;
  const tier = trustTier(seedFm['verified']);
  const parts: string[] = [
    `<!-- okf context: seed=${cid} depth=${depth} token_budget=${tokenBudget} -->\n\n`,
    `<!-- trust tier: ${tier} (§5.3, advisory) -->\n\n`,
  ];
  let used = estimate(parts[0]!);
  const seedBlock = `# ${cid} (seed)\n\n${readFileSync(seedPath, 'utf8')}\n\n`;
  parts.push(seedBlock);
  used += estimate(seedBlock);

  const omitted: string[] = [];
  for (let k = 1; k < levels.length; k++) {
    for (const nb of levels[k]!) {
      const concept = byCid.get(nb);
      if (!concept) continue;
      const block = `# ${nb} (depth ${k})\n\n${readFileSync(concept.path, 'utf8')}\n\n`;
      const cost = estimate(block);
      if (used + cost > tokenBudget) {
        omitted.push(nb);
        continue;
      }
      parts.push(block);
      used += cost;
    }
  }
  if (omitted.length) {
    const preview = omitted.slice(0, 10).join(', ');
    const more = omitted.length > 10 ? ' …' : '';
    const word = omitted.length === 1 ? 'concept' : 'concepts';
    parts.push(
      `… (${omitted.length} ${word} omitted to fit token_budget=${tokenBudget}: ${preview}${more} — raise depth or token_budget, or read each).\n`,
    );
  }
  return parts.join('');
}

function bfsLevels(seed: string, adjacency: Record<string, string[]>, depth: number): string[][] {
  const levels: string[][] = [[seed]];
  const seen = new Set<string>([seed]);
  for (let k = 0; k < depth; k++) {
    const next: string[] = [];
    for (const cid of levels[k]!) {
      for (const t of adjacency[cid] ?? []) {
        if (!seen.has(t)) {
          seen.add(t);
          next.push(t);
        }
      }
    }
    if (!next.length) break;
    levels.push(next.sort());
  }
  return levels;
}

function suggest(root: string, cid: string): string[] {
  const out: string[] = [];
  for (const md of iterConceptFiles(root)) {
    const c = parseConcept(md, root);
    if (
      c.reserved === null &&
      (c.cid.endsWith(cid) || c.cid.split('/').pop() === cid.split('/').pop())
    ) {
      out.push(c.cid);
    }
  }
  return out.sort();
}

function estimate(text: string): number {
  return Math.floor(text.length / CHARS_PER_TOKEN);
}
