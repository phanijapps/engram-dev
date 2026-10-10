---
kind: feature
slug: documentation-consolidation
title: Make the workspace wiki the project knowledge home
status: draft
created: 2026-10-10
repo_head: b4dd8706f2646fbc1b122a49501445ee55ccb150
wiki_freshness: fresh
related: [design.md, plan.md, baseline.json]
---

# Feature analysis — one project knowledge home

## Problem & evidence

**Declared:** The owner wants current workspace knowledge in the wiki,
easy tracking of specs, and retrospectives that remain available there.
The desired outcome is one place to understand work and learn from it.

**Conflicting:** The wiki describes retired Python APIs while the repository
uses TypeScript. Its systems index omits the active-engine page.
The workspace README says “scaffold”; four specpacks record delivered work.
Previous text is preserved in `docs/archive/documentation/2026-10-10/`.

**Implementation-supported:** Knowledge search found no retrospective.
The four completed initiatives have review notes inside JSON, but no wiki
pages that connect their intent, result, and lessons.
Sources: `docs/specs/{fresh-harness,guided-loop,stitch-ui,install-paths}/`
and `treadle/packages/cli/src/harness/where.ts:109`.

## Current behavior

This analysis pins the HEAD above and inspects its working tree.
Earlier replay artifacts and one wiki correction were already uncommitted.
`baseline.json` records file hashes and the complete `docs/` inventory.
The four closed specpacks, research originals, and replay evidence are protected.

| Claim | Evidence | Status |
| --- | --- | --- |
| Work discovery scans `docs/specs/` in the repository and worktrees. | `treadle/packages/cli/src/harness/where.ts:109` | implementation-supported |
| Wiki enumeration reads Markdown recursively; raw spec Markdown would become concepts. | `treadle/packages/knowledge/src/parse.ts:123` | implementation-supported |
| Concepts need frontmatter and a nonempty type; spec Markdown does not consistently have these. | `treadle/packages/knowledge/src/validate.ts:145`; `docs/specs/fresh-harness/design.md:1` | implementation-supported |
| Concept status and derived spec stage are separate vocabularies. | `treadle/packages/knowledge/src/validate.ts:211`; `treadle/packages/core/src/stages.ts:6` | implementation-supported |
| Markdown links outside the wiki are reported as broken bundle links. | `treadle/packages/knowledge/src/links.ts:94` | implementation-supported |
| Fingerprints scan only `.py`; TypeScript sources can remain untracked without a failing status. | `treadle/packages/knowledge/src/fingerprints.ts:54`; `treadle/packages/cli/src/commands/know.ts:203` | implementation-supported |
| The freshness stamp compares HEAD, not dirty source bytes. | `treadle/packages/knowledge/src/stamp.ts:68` | implementation-supported |
| Recorded pack delivery does not establish every external outcome. Fresh-harness leaves CI confirmation open. | `docs/specs/fresh-harness/fresh-harness.json`, `review.verdicts[on=PACK].note` | declared by the recorded reviewer |

The stamp currently says fresh. That is a revision check, not a claim that
every page is correct. The independent documentation audit must qualify it.

## Proposed behavior

**Proposed, inferred from the request:** Make `wiki/` the entry point for
current architecture, domain contracts, project gaps, research interpretation,
initiative navigation, and dated retrospectives. Keep executable records at
their current paths. Connect them through source references and wiki pages.

Consolidation means one current explanation for each subject. It does not
mean copying every file into the wiki. JSON schemas, executable specpacks,
skills, security reporting, and old evidence retain their own authorities.

### Placement options

| Option | Benefit | Cost and limitation | Recommendation |
| --- | --- | --- | --- |
| Put raw specs under `wiki/specs/`. | Physical proximity; Markdown could become searchable after conversion. | Requires frontmatter conversion, discovery changes, and separation of machine status from concept status. JSON and journals still do not become concepts. | Defer; proximity alone does not justify format migration. |
| Move raw specs to `.specs/`. | Compact root; separates work from knowledge. | Requires discovery and skill changes. Dot-directory placement does not provide wiki tracking or retrospectives. Existing paths and frozen contexts need migration. | Defer; no current evidence of benefit. |
| Keep `docs/specs/`; add `wiki/initiatives/` and `wiki/retrospectives/`. | Preserves tools and evidence; gives searchable connected navigation and lessons. | Summaries can drift unless dated and clearly subordinate to the pack. | Recommended for this repair. |

**D1, proposed, two-way door:** Retain `docs/specs/` and add wiki projections.
This is reversible through documentation edits. It does not authorize a
future root migration or a new automatic closure requirement.

### Scope and acceptance goals

- **R1:** Current system and domain pages cite existing TypeScript sources.
  Historical decisions remain identifiable and retain their original records.
- **R2:** Each existing docs category has an explicit disposition.
  Current project knowledge is accessible through wiki navigation.
- **R3:** Each of the four closed specpacks has a wiki initiative page and
  a dated retrospective, with source revision and SHA-256.
- **R4:** Retrospectives distinguish plans, recorded outcomes, observed problems,
  inferred lessons, follow-up proposals, and unknown feedback.
- **R5:** Documentation audit, wiki validation, links, and anchor checks run.
  Full repository checks are reported, including failures and limitations.
- **R6:** A draft lifecycle proposal explains maintenance and promotion of lessons.
  New normative rules remain pending in the findings ledger.

### Retrospective reasoning

**Inferred:** A useful retrospective needs the gap between intended and
observed results. A “delivered” label alone cannot supply that gap.
Backfills therefore quote record locations and distinguish reviewer reports
from verification executed in this session. They do not invent owner feedback.

**Proposed:** Separate each retrospective from its initiative summary.
The summary helps readers find work. The dated retrospective preserves a
specific interpretation. A later interpretation becomes a new dated page.
Lessons can become proposed decisions or rules through the findings ledger.
An observation does not automatically become a binding rule.

## Affected surfaces

| Surface | Why affected | Evidence | Status |
| --- | --- | --- | --- |
| `wiki/systems`, `wiki/domain` | Replace retired runtime descriptions with current explanations. | `wiki/systems/treadle.md`; `wiki/domain/wiki-contract.md` | conflicting |
| `wiki/decisions`, `wiki/research` | Separate historical decisions and proposed standards from current implementation. | `wiki/decisions/okf-only-engine.md`; `docs/research/nodejs-engineering-standards.md` | conflicting |
| New wiki project, initiatives, retrospectives | Connect current knowledge, work records, and lessons. | Four closed specpack JSON files | implementation-supported |
| README, CONTRIBUTING, DEBT, AGENTS | Remove competing or stale project explanations; link wiki authority. | Repository entry documents | conflicting |
| `docs/archive/documentation/2026-10-10/` | Preserve superseded explanations byte-for-byte before repairs. | `baseline.json` | implementation-supported |

## Impact candidates

No machine format, engine API, server, corpus, or spec root changes are
planned. The chosen option retains their contracts. A root migration or
freshness implementation needs a separate impact analysis and runtime wave.

## Open questions

| ID | Question | Blocks | Owner | Resolution path |
| --- | --- | --- | --- | --- |
| Q1 | Should a retrospective later become a machine-enforced closure requirement? | Automatic closure enforcement only | Project owner | Review the draft lifecycle after use; then analyze a runtime wave. |
| Q2 | Which follow-ups deserve a new work wave, and who owns them? | Follow-up execution only | Project owner | Prioritize the wiki open-work register. No owner assignment is invented. |
| Q3 | What owner feedback and external CI evidence are missing from historical records? | Claims about those outcomes | Initiative owner | Add evidence in a new retrospective supplement; retain unknowns meanwhile. |

No question blocks the requested documentation repair. The source paths and
format boundaries already support a reversible choice.

## Assumptions

| ID | Assumption | Blast radius | Validation trigger |
| --- | --- | --- | --- |
| A1 | “Everything consolidated” means current project knowledge, while canonical executable and historical records retain their paths. | Navigation and authority map | Revisit if the owner requests physical migration. |
| A2 | A backfill from frozen records is useful with explicit limitations. | Four retrospective interpretations | Compare with owner feedback when supplied. |
| A3 | Source reinspection plus a hash audit can evidence this repair, despite the engine scanner gap. | Session freshness claim only | Re-audit after any relevant source edit; do not promise continuous detection. |

## Decisions needed

| Decision | Needed by | Door | Evidence status |
| --- | --- | --- | --- |
| D1: retain spec root, add wiki projections | This reversible documentation repair | two-way | proposed; implementation-supported constraints |
| Future closure enforcement | Q1 follow-up only | runtime contract change | unknown; not selected |

## Out of scope

Freshness engine repairs; fixing the existing workspace-dependent test;
rewriting closed packs; migrating installed platform skills; moving frozen
research; independently validating cited papers; publishing or changing license.
These have distinct contracts or unresolved outcomes.

## Handoff

- **Route:** Straight to `plan`, full design for several documentation surfaces.
- **Ready now:** R1–R6 documentation repairs, navigation, backfills, and evidence audit.
- **Blocked on:** Q1–Q3 affect future enforcement, follow-ups, and historical claims only.
- **Next step:** Plan from this feature analysis, then execute its bounded tasks.
