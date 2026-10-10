# Plan

The JSON pack owns task states. This document supplies frozen context and
verification expectations. All six tasks implement DES-1.

| Task | Goal                                                                | Requirements     | Prerequisite | Observable verification                                                                           |
| ---- | ------------------------------------------------------------------- | ---------------- | ------------ | ------------------------------------------------------------------------------------------------- |
| T-1  | Replatform discovery and path regression tests                      | FR-1             | None         | `cd treadle && pnpm exec vitest run packages/cli/test/where.test.ts` exits 0                      |
| T-2  | Relocate docs, consolidate research, and retarget wiki/entry paths  | FR-2, FR-3, FR-6 | T-1          | `cd treadle && pnpm exec tsx ../specs/docs-root-migration/verify-migration.mjs --files` exits 0   |
| T-3  | Update/sync skills, verify gates, and open current library          | FR-4, FR-5       | T-2          | `cd treadle && pnpm exec tsx ../specs/docs-root-migration/verify-migration.mjs --handoff` exits 0 |
| T-4  | Isolate the recall gate test from real workspace initiative counts  | FR-5             | T-3          | `cd treadle && pnpm exec vitest run packages/cli/test/init-surfaces.test.ts` exits 0              |
| T-5  | Make coverage measure the runtime source modules exercised by tests | FR-5             | T-4          | `cd treadle && pnpm coverage` exits 0 with unchanged thresholds                                   |

| T-6 | Preserve and supersede the open consolidation approach and correct current wiki decision prose | FR-4, FR-6 | T-5 | `cd treadle && pnpm exec tsx ../specs/docs-root-migration/verify-migration.mjs --handoff` exits 0 |

## Frozen context

- T-1: query `spec root discovery`; wiki systems/sdd-harness-architecture and
  project/overview; feature FR-1 and impact discovery row; where.ts and where.test.ts.
- T-2: query `documentation authority research`; wiki project/documentation-map,
  project/open-work, research index and four full research concepts; feature
  FR-2/3/6, design relocation mechanism, inventory; all inventoried docs paths,
  wiki, README.md, AGENTS.md, install.sh, treadle/DEBT.md, link-check.mjs.
- T-3: query `SDD machine handoff`; wiki project/documentation-map and
  domain/specpack-status-vocabulary; feature FR-4/5, shipped seven affected
  skills and their installed Pi/Codex/Claude copies, installer manifest/apply,
  SECURITY.md, CLI library command, web servers, and task verification script.

No prerequisite is merely chronological: discovery enables the move, and the
mapped filesystem enables installed instructions and server handoff.
Traceability is requirements → DES-1 → listed tasks → declared commands.

## Handoff and evidence ledger

Ready set initially T-1. Task evidence is admitted through do next/record.
Current gate outputs and actual independent review will be recorded alongside
this plan. Owner approval and closure remain separate acts.

Plan revision: the full check exposed the existing workspace-count assumption
documented in `bug-shared-workspace-gate.md`. T-4 owns only the failing test;
its frozen context is the bug artifact, the last test in init-surfaces.test.ts,
and the session-recall.js input/report contract. Runtime hook behavior is unchanged.

Plan revision: all tests pass, but the source-resolution gap in
`bug-coverage-source-resolution.md` prevents the required coverage floor.
T-5 owns only Vitest configuration. Frozen context: that bug artifact, the
coverage report, package exports for core/knowledge/web/brand, source entry
points, and public package imports in the existing tests. Runtime exports,
coverage include scope, and thresholds are unchanged.

Plan revision: independent review found a superseded approach still presented
as current. T-6 owns the open consolidation pack, its archived pre-edit snapshot,
the map entry, the current wiki approval paragraph, and verifier assertions.
Frozen context: bug-superseded-consolidation-approach.md, actual review findings,
revision-23 consolidation JSON and its map hash. Preserve owner/evidence fields;
change no closed pack, approval act, or closure.

Final independent PACK review: PASS — nothing to fix. All six task verification
expectations were independently rerun with exit 0. See review.md, the earlier
review-findings.md, and the machine review ledger. Owner D-2/D-3 decisions,
approval, and closure remain separate.
