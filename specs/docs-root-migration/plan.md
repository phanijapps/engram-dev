# Plan

The JSON pack owns task states. This document supplies frozen context and
verification expectations. All three tasks implement DES-1.

| Task | Goal | Requirements | Prerequisite | Observable verification |
| --- | --- | --- | --- | --- |
| T-1 | Replatform discovery and path regression tests | FR-1 | None | `cd treadle && pnpm exec vitest run packages/cli/test/where.test.ts` exits 0 |
| T-2 | Relocate docs, consolidate research, and retarget wiki/entry paths | FR-2, FR-3, FR-6 | T-1 | `cd treadle && pnpm exec tsx ../specs/docs-root-migration/verify-migration.mjs --files` exits 0 |
| T-3 | Update/sync skills, verify gates, and open current library | FR-4, FR-5 | T-2 | `cd treadle && pnpm exec tsx ../specs/docs-root-migration/verify-migration.mjs --handoff` exits 0 |

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
