---
kind: plan
slug: documentation-consolidation
title: Repair and connect workspace documentation
status: draft
created: 2026-10-10
repo_head: b4dd8706f2646fbc1b122a49501445ee55ccb150
design_ref: design.md
analysis_inputs: [feature.md]
depth: full-design
rationale_for_depth: Several documentation surfaces share authority and navigation boundaries.
---

# Plan — repair and connect documentation

## Task DAG

| ID | Task | Implements | Prereqs | Verification expectation | Size | Initial status |
| --- | --- | --- | --- | --- | --- | --- |
| T1 | Preserve prior prose and repair current architecture/domain descriptions | R1, D2, D4 | None | Existing CIDs retained; cited resources exist; snapshot hashes match | M | todo |
| T2 | Consolidate project/research knowledge and redirect entry documents | R2, R6, D1, D2 | T1 | Every original docs category has a disposition; live links resolve; policy finding remains pending | M | todo |
| T3 | Backfill four initiative pages and dated retrospectives | R3, R4, D1, D3 | T2 | Every closed pack has linked pages with matching hash/revision; no protected record changed | M | todo |
| T4 | Audit navigation, sources, and gates; record retrospective and review | R5, D4 | T3 | Run audit and all required gates; record exact failures; red-foreman has no unresolved document defects | M | todo |

The topological order is T1, T2, T3, T4. There are no self prerequisites or
cycles. T2 uses the current authority descriptions from T1. T3 uses the project
navigation from T2. T4 audits the complete connected result from T3.

## Frozen context

- **T1:** Query `wiki freshness`; concepts `systems/treadle`,
  `systems/sdd-harness-architecture`, `domain/wiki-contract`, all existing domain
  and decision concepts. References: feature current-behavior table; design D2/D4;
  `baseline.json`; knowledge `parse.ts`, `validate.ts`, `links.ts`, `findings.ts`,
  `fingerprints.ts`, `stamp.ts`; core `stages.ts`, `specpack/derive.ts`.
  Owned files: existing wiki systems/domain/decisions and documentation archive copies.
- **T2:** Query `engineering standards`; concepts from T1 and existing research.
  References: feature R2/R6; design authority boundary; four original research files;
  `treadle/package.json`, `.github/workflows/ci.yml`, `treadle/DEBT.md`, README,
  CONTRIBUTING, AGENTS. Owned files: wiki project/research, entry documents,
  lifecycle draft, indexes, proposal ledger entry.
- **T3:** Query `specpack status`; concept `domain/specpack-status-vocabulary`.
  References: feature R3/R4; design D3; four original specpack JSON files and
  their research/design/interview artifacts listed in `baseline.json`.
  Owned files: wiki initiatives and dated retrospective concepts.
- **T4:** Query `retrospective`; concepts from T1–T3. References: R5, D4,
  `baseline.json`, AGENTS verification requirements, previous replay evidence.
  Owned files: this initiative's audit/evidence/review artifacts, wiki indexes/log,
  documentation-repair retrospective, and `.okf` freshness state.

## Traceability matrix

| Requirement | Design | Tasks | Verification |
| --- | --- | --- | --- |
| R1 | Change by surface; D2 | T1 | Resource and preserved-history audit |
| R2 | Approach; D1/D2 | T2 | Inventory dispositions and navigation |
| R3 | Contracts; D1 | T3 | Pack coverage and immutable hashes |
| R4 | Contracts; D3 | T3 | Provenance and retrospective review |
| R5 | Failure behavior; D4 | T4 | Audit, wiki ritual, repository gates, review |
| R6 | D3 | T2 | Draft status and pending findings entry |

## Ready set

At planning: **T1**. Execute one task at a time. Later task observations belong
in the status ledger below and `evidence.md`; initial expectations stay intact.

## Status ledger

The initial planning table records expectations, not observed completion.
The following ledger records observations made on 2026-10-10.

| Task | Observed status | Evidence |
| --- | --- | --- |
| T1 | Documentation slice verified | `verification.json`, `evidence.md`: preserved prose and source locators |
| T2 | Documentation slice verified | `links.log`, `verification.json`: navigation and pending lifecycle finding |
| T3 | Documentation slice verified | `verification.json`: four pack projections, unchanged source hashes |
| T4 | Documentation slice verified; full-workspace failure disclosed | `gates.json`, `review.md`; check/coverage fail existing G3 |

## Handoff

- **Ready now:** T1 through the implementation discipline, using its frozen context.
- **Blocked:** No repair task. Q1–Q3 remain future work or claim limitations.
- **Next step:** Preserve and repair the current wiki explanations for T1.

### Execution observations — 2026-10-10

| Task | Observation | Evidence |
| --- | --- | --- |
| T1 | Documentation slice verified | `evidence.md`, snapshot/source audit |
| T2 | Documentation slice verified | `evidence.md`, pending policy-1662c471, link check |
| T3 | Documentation slice verified | `verification.json`, four pack projections |
| T4 | Documentation audit and closing review passed | `gates.json`, `evidence.md`; check/coverage fail existing G3 |

The original task expectations remain above. No task status is substituted for
a green full-workspace gate. Runtime follow-ups remain outside this repair.

### Closing observation — 2026-10-10

T4's documentation verification is complete: the independent reviewer reran the
audit with exit 0 and returned PASS. `review.md` preserves both earlier finding
sets and their corrections. Full workspace check and coverage still fail G3;
this observation does not mark those runtime gates green.

### Correction task — missing machine handoff

T5 implements R7 from `bug-missing-specpack.md`. Register the five-task machine
record and update the four shipped SDD skill handoffs. Sync the Pi/Codex copies
through the installer. Verify loader admission, zero alignment violations, work
discovery, current evidence, unset human approval/closure, original-record hashes,
skill validity, and byte equality between shipped and installed skill files.

Machine IDs map R1–R7 to FR-1–FR-7, D1–D4 to D-1–D-4, and T1–T5 to T-1–T-5.
The original repair was implemented before a pack existed; its re-verification
evidence is a backfill dated now, not a fabricated earlier machine handout.

### Machine correction observation — 2026-10-10

T5 is recorded as T-5 in the canonical JSON. The machine now holds the task
DAG and evidence; prose supplies context and historical observations. All five
registered tasks have admitted current verification evidence. The correction's
independent reviewer returned PASS after re-running alignment and both verifiers.
See `machine-handoff-evidence.md` and `machine-handoff-review.md`. Human approval,
decision acceptance, and closure remain unset; engine stage is authoritative.
