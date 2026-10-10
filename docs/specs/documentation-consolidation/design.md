---
kind: design
slug: documentation-consolidation
title: Connect project knowledge, work records, and retrospectives
status: draft
created: 2026-10-10
repo_head: b4dd8706f2646fbc1b122a49501445ee55ccb150
wiki_freshness: fresh
analysis_inputs: [feature.md]
related: [plan.md, baseline.json]
---

# Technical design — connected documentation

## Approach

Use the existing spec root and wiki bundle. Create wiki concepts for current
knowledge, initiative navigation, and retrospective evidence. Preserve replaced
prose under `docs/archive/documentation/2026-10-10/` before edits.

The wiki owns explanations. The specpack owns decisions, tasks, evidence, and
derived work stage. Entry documents explain how to start and point into the
wiki. Original research, format contracts, and executable skills keep their paths.
This follows D1 and R1–R6 without changing runtime contracts.

## Options considered

| Option | Meets constraints? | Cost and risk | Disposition |
| --- | --- | --- | --- |
| Existing root plus wiki projections | Yes; works with current discovery and bundle rules | Manual summaries need dated provenance | Selected for repair; D1 |
| Specs inside wiki | Requires format and discovery changes | Raw Markdown becomes invalid concepts; status authority can duplicate | Deferred per D1 |
| `.specs/` root | Requires discovery and skill changes | Does not itself provide knowledge or retrospective search | Deferred per D1 |

## Change by surface

| Surface | Change | Contracts touched | Evidence |
| --- | --- | --- | --- |
| Systems and domain concepts | Current TypeScript architecture, vocabularies, containment, findings, qualified freshness | Prose only; existing CIDs retained | `parse.ts:123`, `links.ts:94`, `fingerprints.ts:54`, `specpack/derive.ts:30` |
| Decision concepts | Add dated implementation notes; identify superseded architecture | Existing acceptance records retained | Existing decision pages; `python-final` tag |
| Research and project concepts | Consolidate current interpretation; inventory source authorities and gaps | Prose only; original research unchanged | `baseline.json`; `.github/workflows/ci.yml:1` |
| Initiative concepts | Link dated pack snapshots to retrospective concepts | No duplicated mutable task ledger | Existing four specpacks |
| Retrospective concepts | Backfill recorded evidence and propose future capture practice | New producer-defined OKF types; lifecycle uses existing values | `validate.ts:162`, `validate.ts:211` |
| Entry documents and indexes | Make wiki reachable; retain usable setup commands | Navigation only | README, CONTRIBUTING, AGENTS |

## Contracts & data

Bundle root and OKF version stay unchanged. New concepts use nonempty types
`Initiative`, `Retrospective`, `Project`, or `Research`. These are descriptive
producer conventions, not additions to a closed engine enum.

Each concept carries title, type, description, dates, lifecycle status, and
source resources. Load-bearing prose cites repository `path:line` locations.
Specpack references also cite a JSON field selector and source hash.

Wiki Markdown links connect concepts inside the bundle. External Markdown
evidence uses workspace-relative `sources[].resource` and inline path locators.
This respects the bundle containment contract. Pack JSON links remain clickable
in repository viewers; the wiki does not treat JSON as concept edges.

Each backfill states its authoring date, HEAD, pack revision, full SHA-256,
recorded outcome, problems, inferred lessons, unknowns, and proposed follow-ups.
No human verification actor is created. “Stable” means a preserved report,
not a new owner acceptance of its lessons.

The new analysis folder initially contains prose artifacts, not an admitted
specpack. `do where` lists executable packs only; its absence there is explicit
on the wiki initiative page. The wiki links both types of initiative.

## Failure behavior

Summaries can drift. Date them and subordinate status to the canonical pack.
The audit verifies protected records, pack coverage, navigation, source presence,
line bounds, and preserved snapshots. It does not prove every prose statement.

The current engine can miss TypeScript drift. The independent audit records
source hashes for this session; it does not change engine behavior. Pending
findings remain pending, even after the documentation checks pass.

Rollback restores preserved prose and removes new navigation concepts.
Protected executable records remain unchanged. Historical source copies remain
outside the live bundle, so their period-correct links do not affect validation.

## Decisions

| ID | Decision | Alternatives | Door | Resolves | Status |
| --- | --- | --- | --- | --- | --- |
| D1 | Retain `docs/specs/`, add wiki initiatives and retrospectives | Co-locate specs; `.specs/` migration | two-way | R2, R3, A1 | Recommended repair choice; no machine root change |
| D2 | Preserve original research; consolidate current interpretation | Move originals; duplicate full mutable texts | two-way | R1, R2 | Inferred from frozen context references |
| D3 | Backfill dated reports; propose maintenance practice separately | Treat review PASS as all outcomes; automatic closure gate now | two-way | R4, R6, A2 | Inferred; normative practice stays draft |
| D4 | Audit source hashes independently and expose scanner limitation | Trust stamp alone; change engine in this wave | two-way | R5, A3 | Implementation-supported limitation |

No selected choice creates a one-way door.

## Carried uncertainty

Q1 remains open for future closure enforcement. Q2 remains open for follow-up
priority and ownership. Q3 limits historical outcome claims. A1–A3 are retained
with the validation triggers in `feature.md`.

## Out of scope

The exclusions in `feature.md` apply. Server implementation, formats, corpus,
installed skills, and all four closed specpacks remain outside the edit scope.

## Evidence index

`baseline.json` identifies the pinned revision, protected artifacts, the complete
docs inventory, and preserved prior explanations. `verification.json` will
record current audit results and source hashes. `evidence.md` will distinguish
documentation verification from the full repository gates.
