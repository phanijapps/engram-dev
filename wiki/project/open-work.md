---
title: "Open work and evidence gaps"
type: Project
description: "Current gaps, deferred work, resolution paths, and limits of historical completion evidence."
status: stable
created: 2026-10-10
updated: 2026-10-10
sources:
  - { "id": "s1", "resource": "treadle/packages/knowledge/src/fingerprints.ts" }
  - { "id": "s2", "resource": "treadle/packages/knowledge/src/stamp.ts" }
  - { "id": "s3", "resource": "treadle/packages/cli/test/where.test.ts" }
  - { "id": "s4", "resource": "treadle/packages/cli/src/harness/where.ts" }
  - { "id": "s5", "resource": "treadle/packages/cli/src/commands/do.ts" }
  - { "id": "s6", "resource": "specs/fresh-harness/fresh-harness.json" }
  - {
      "id": "s7",
      "resource": "specs/archive/documentation/2026-10-10/treadle/DEBT.md",
    }
  - {
      id: owner,
      resource: specs/documentation-consolidation/owner-decision-revision.md,
    }
  - { id: shared, resource: treadle/packages/web/src/project-server.ts }
  - { id: migration, resource: specs/docs-root-migration/plan.md }
  - { id: host-acceptance, resource: specs/harness-host-acceptance/harness-host-acceptance.json }
---

# Gap register — 2026-10-10

These are observations and proposed follow-ups. Owners and priorities are
unassigned unless the retained record names them.

| ID  | Gap                                                                                                                                                      | Evidence                                                                                         | Resolution path                                                                                                           |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| G1  | Fingerprint scanning excludes TypeScript and Markdown; untracked sources do not flag status.                                                             | `treadle/packages/knowledge/src/fingerprints.ts:54`                                              | Separate engine wave; test dirty TS source detection and affected concept reporting; review corpus contract changes.      |
| G2  | Stamp compares HEAD rather than source content; committed stamp can lag its own commit.                                                                  | `treadle/packages/knowledge/src/stamp.ts:68`                                                     | Analyze content-based freshness, including commits that change only documentation state.                                  |
| G4  | Shared browser now navigates explicitly enrolled projects; automatic worktree discovery and complete native host/platform release witnesses remain open. | `treadle/packages/web/src/project-server.ts`; `specs/background-harness/background-harness.json` | Verify release matrix; evaluate broader worktree navigation separately.                                                   |
| G5  | Fresh-harness PACK review leaves the external CI green run open.                                                                                         | `specs/fresh-harness/fresh-harness.json:1`, `review.verdicts[on=PACK].note`                      | Attach the actual CI run evidence in a dated supplement. Do not alter the closed pack.                                    |
| G6  | Test files are outside composite source typecheck.                                                                                                       | Preserved `treadle/README.md` in the documentation archive                                       | Plan per-package test typechecking with existing suite compatibility.                                                     |
| G7  | License choice remains an owner question in retained debt notes.                                                                                         | Preserved `treadle/DEBT.md` in the documentation archive                                         | Owner decision before publication.                                                                                        |
| G8  | Attested computation execution was deferred after format admission work.                                                                                 | Preserved `treadle/DEBT.md` in the documentation archive                                         | Reopen at the first real receipt consumer; do not call admission support an executor.                                     |
| G9  | Legacy MCP, templates, and old spine parity were not established by the port.                                                                            | Preserved `treadle/DEBT.md` in the documentation archive                                         | Decide port or drop based on an actual consumer; delegated code indexing remains outside the engine.                      |
| G10 | Retrospectives and initiative snapshots have no automatic generation or closure hook.                                                                    | `specs/documentation-consolidation/feature.md:1`                                                 | Use the draft practice first; decide enforcement separately through Q1.                                                   |
| G13 | Legacy formats retain their original decision and closure rules.                                                                                         | `treadle/packages/core/src/specpack/workflow.ts:1`                                               | New gated work uses 0.4; active legacy adoption needs explicit owner action. Do not close earlier initiatives implicitly. |
| G12 | Past session evidence is unavailable for the four completed initiatives.                                                                                 | `specs/documentation-consolidation/owner-decision-revision.md:1`, D-3                            | Retain factual pack snapshots. Do not reconstruct retrospectives from them.                                               |

# Resolved historical claims

G3: the stale assumption that install-paths remains open was removed during
the root migration. The replacement test checks its immutable delivered record;
path fixtures cover canonical precedence and legacy-only worktrees.
Source: `specs/docs-root-migration/T-1.log:1`.

G11: the four full research texts now live in their current wiki concepts.
The standalone originals are archived provenance, with a relocation map.
Source: `specs/docs-root-migration/relocations.json:1`.

The previous debt page said Python retirement and corpus self-hosting were pending.
They are now recorded in [the active engine](/systems/treadle.md) and
[the corpus decision](/decisions/corpus-self-hosting.md).
Original debt prose remains preserved, rather than silently disappearing.

The guided-loop record reports the five SPEC admission debts paid.
Source: `specs/guided-loop/guided-loop.json:1`, `review.verdicts[on=PACK].note`.
This report does not imply attested computation execution exists.

# Verification boundary

## CI evidence supplement — 2026-10-11

For G5, current native execution evidence is now available: run 38175935828
passed Linux, macOS and Windows on Node 22 and 24 for branch commit
`76e2486c025de56df3ad795c508e5f75512eb3af` (PR merge `400c231cfed503e5cfaf290ee97d9c069bf96750`).
The retained matrix receipts include corpus comparison, links, coverage,
production audit, runtime packaging and smoke outcomes. Sources:
`artifacts/ci-cleanup/native-run-76e2486.json` and
`artifacts/ci-cleanup/native-76e2486/`.
See [CI verification](/project/ci-verification.md) for the original failure,
repairs, source boundaries and chronology. This supplies current execution
evidence without changing the historical fresh-harness pack or certifying its
original revision. The real host/platform acceptance in G4 remains separate.

The owner deferred the remaining background harness host journeys to
`specs/harness-host-acceptance/harness-host-acceptance.json`. That canonical
backlog preserves the platform and surface acceptance requirements; runtime
CI success does not establish real host activation or human hook trust.
The scope instruction and original pack are preserved in
`specs/background-harness/closure-authorization.md` and
`specs/background-harness/history/revision-46/background-harness.json`.

The previous documentation repair failed the obsolete G3 workspace assumption.
That dated failure and its coverage limitation remain recorded in the
[repair retrospective](/retrospectives/2026-10-10-documentation-consolidation.md).
Runtime follow-ups remain separate work; no resolved status is invented here.
