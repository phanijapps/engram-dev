/**
 * The know plane's CLI skin: everything the knowledge engine already does,
 * spoke plainly. Read-only commands exit 0 on success; validate exits 1 on
 * conformance errors (warnings never fail — consumers MUST NOT reject, §11).
 */
import type { Command } from 'commander';
import {
  buildIndex,
  search,
  readConcept,
  ConceptNotFound,
  validateBundle,
  buildAdjacency,
  buildBacklinks,
  brokenLinks,
  iterConceptFiles,
  parseConcept,
  proposeFinding,
  resolveFinding,
  listFindings,
  writeFingerprints,
  anchorReview,
  readFreshness,
} from '@treadle/knowledge';
import { resolve } from 'node:path';

export function registerKnow(knowCmd: Command): void {
  knowCmd
    .command('search <bundle> <query...>')
    .option('--type <types...>', 'allowed concept types')
    .option('--tag <tags...>', 'required tags (any match qualifies)')
    .option('--limit <n>', 'max hits', (v) => parseInt(v), 20)
    .action(
      (
        bundle: string,
        query: string[],
        opts: { type?: string[]; tag?: string[]; limit: number },
      ) => {
        const idx = buildIndex(bundle);
        const hits = search(idx, query.join(' '), {
          type: opts.type,
          tag: opts.tag,
          limit: opts.limit,
        });
        for (const h of hits) {
          console.log(
            `${String(h.score).padStart(8)}  ${h.cid}${h.title && h.title !== h.cid ? ` — ${h.title}` : ''}`,
          );
          if (h.snippet) console.log(`          ${h.snippet}`);
        }
        if (!hits.length) console.log('no hits');
      },
    );

  knowCmd
    .command('read <bundle> <cid>')
    .option('--depth <n>', 'neighborhood depth', (v) => parseInt(v), 0)
    .option('--budget <n>', 'token budget for depth>0', (v) => parseInt(v), 8000)
    .action((bundle: string, cid: string, opts: { depth: number; budget: number }) => {
      try {
        console.log(readConcept(bundle, cid, opts.depth, opts.budget));
      } catch (e) {
        if (e instanceof ConceptNotFound) {
          console.error(`REFUSED: ${e.message}`);
          process.exitCode = 1;
          return;
        }
        throw e;
      }
    });

  knowCmd.command('validate <bundle>').action((bundle: string) => {
    const rep = validateBundle(bundle);
    for (const f of rep.errors) console.log(`ERROR   ${f.cid ?? '-'} ${f.code}: ${f.message}`);
    for (const f of rep.warnings) console.log(`WARNING ${f.cid ?? '-'} ${f.code}: ${f.message}`);
    for (const f of rep.info) console.log(`info    ${f.cid ?? '-'} ${f.code}: ${f.message}`);
    console.log(
      `conformant: ${rep.errors.length} error(s), ${rep.warnings.length} warning(s), ${rep.info.length} info — warnings never block (§11)`,
    );
    if (rep.errors.length) process.exitCode = 1;
  });

  knowCmd.command('links <bundle>').action((bundle: string) => {
    const concepts = iterConceptFiles(bundle).map((md) => parseConcept(md, bundle));
    const adj = buildAdjacency(bundle, concepts);
    for (const [cid, out] of Object.entries(adj)) {
      if (out.length) console.log(`${cid} → ${out.join(', ')}`);
      const b = brokenLinks(
        bundle,
        concepts.find((c) => c.cid === cid)!.path,
        concepts.find((c) => c.cid === cid)!.body,
      );
      if (b.length) console.log(`  broken: ${b.join(', ')}`);
    }
    const back = buildBacklinks(adj);
    for (const [cid, srcs] of Object.entries(back)) {
      if (srcs.length) console.log(`${cid} ← ${srcs.join(', ')}`);
    }
  });

  const findings = knowCmd.command('findings');
  findings
    .command('list <bundle>')
    .option('--status <s>', 'pending | accepted | declined')
    .action((bundle: string, opts: { status?: 'pending' | 'accepted' | 'declined' }) => {
      for (const f of listFindings({ bundle, status: opts.status })) {
        console.log(`${f.status.padEnd(8)} ${f.id}  ${f.source} → ${f.destination}`);
      }
    });
  findings
    .command('propose <bundle> <source> <destination> <kind>')
    .option('--rationale <text>', 'why this finding matters')
    .action(
      (
        bundle: string,
        source: string,
        destination: string,
        kind: string,
        opts: { rationale?: string },
      ) => {
        const r = proposeFinding(source, destination, kind, {
          bundle,
          ...(opts.rationale ? { rationale: opts.rationale } : {}),
        });
        console.log(
          `${r.deduped ? 'deduped' : 'proposed'} ${r.id} (${r.status})${r.refused ? ' — REFUSED: declined key' : ''}`,
        );
        if (r.refused) process.exitCode = 1;
      },
    );
  findings
    .command('resolve <bundle> <id> <decision>')
    .action((bundle: string, id: string, decision: 'accepted' | 'declined') => {
      try {
        const f = resolveFinding(id, decision, { bundle });
        console.log(`${f.id} ${f.status}`);
      } catch (e) {
        console.error(`REFUSED: ${(e as Error).message}`);
        process.exitCode = 1;
      }
    });

  knowCmd
    .command('fingerprints <workspace> <bundle>')
    .action((workspace: string, bundle: string) => {
      const path = writeFingerprints(workspace, bundle);
      console.log(`fingerprints: ${resolve(path)}`);
    });

  knowCmd
    .command('anchors <bundle>')
    .requiredOption('--workspace <root>', 'repo root the anchor paths resolve against')
    .action((bundle: string, opts: { workspace: string }) => {
      const review = anchorReview(bundle, opts.workspace);
      let flagged = 0;
      for (const r of review) {
        if (r.verdict !== 'current' && r.verdict !== 'wiki-internal') {
          flagged++;
          console.log(`${r.verdict.padEnd(13)} ${r.page} → ${r.resource}`);
        }
      }
      console.log(
        `anchors: ${review.length} checked, ${flagged} need review${flagged ? ' — the gardener re-verifies and re-anchors' : ''}`,
      );
    });

  knowCmd
    .command('status <bundle>')
    .requiredOption('--workspace <root>', 'repo root (freshness + fingerprints)')
    .action((bundle: string, opts: { workspace: string }) => {
      const fresh = readFreshness(bundle, opts.workspace);
      const concepts = iterConceptFiles(bundle).filter((md) => {
        const c = parseConcept(md, bundle);
        return c.reserved === null;
      });
      const rep = validateBundle(bundle);
      const review = anchorReview(bundle, opts.workspace);
      const flagged = review.filter(
        (r) => r.verdict === 'changed' || r.verdict === 'missing-file', // python parity: untracked is report-only
      ).length;
      const pending = listFindings({ bundle, status: 'pending' }).length;
      console.log(`freshness: ${fresh}`);
      console.log(`concepts: ${concepts.length}`);
      console.log(`conformance: ${rep.errors.length} error(s), ${rep.warnings.length} warning(s)`);
      console.log(`anchors: ${review.length} checked, ${flagged} need review`);
      console.log(`findings: ${pending} pending`);
      if (rep.errors.length) process.exitCode = 1;
    });
}
