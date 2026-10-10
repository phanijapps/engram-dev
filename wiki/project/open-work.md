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
  - { id: migration, resource: specs/docs-root-migration/plan.md }
---

# Gap register — 2026-10-10

These are observations and proposed follow-ups. Owners and priorities are
unassigned unless the retained record names them.

| ID  | Gap                                                                                                                 | Evidence                                                                                       | Resolution path                                                                                                      |
| --- | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| G1  | Fingerprint scanning excludes TypeScript and Markdown; untracked sources do not flag status.                        | `treadle/packages/knowledge/src/fingerprints.ts:54`                                            | Separate engine wave; test dirty TS source detection and affected concept reporting; review corpus contract changes. |
| G2  | Stamp compares HEAD rather than source content; committed stamp can lag its own commit.                             | `treadle/packages/knowledge/src/stamp.ts:68`                                                   | Analyze content-based freshness, including commits that change only documentation state.                             |
| G4  | Library serves one explicit root; `where` discovers worktrees.                                                      | `treadle/packages/cli/src/commands/do.ts:243`; `treadle/packages/cli/src/harness/where.ts:109` | Analyze navigation parity when a real multi-root user needs it.                                                      |
| G5  | Fresh-harness PACK review leaves the external CI green run open.                                                    | `specs/fresh-harness/fresh-harness.json:1`, `review.verdicts[on=PACK].note`                    | Attach the actual CI run evidence in a dated supplement. Do not alter the closed pack.                               |
| G6  | Test files are outside composite source typecheck.                                                                  | Preserved `treadle/README.md` in the documentation archive                                     | Plan per-package test typechecking with existing suite compatibility.                                                |
| G7  | License choice remains an owner question in retained debt notes.                                                    | Preserved `treadle/DEBT.md` in the documentation archive                                       | Owner decision before publication.                                                                                   |
| G8  | Attested computation execution was deferred after format admission work.                                            | Preserved `treadle/DEBT.md` in the documentation archive                                       | Reopen at the first real receipt consumer; do not call admission support an executor.                                |
| G9  | Legacy MCP, templates, and old spine parity were not established by the port.                                       | Preserved `treadle/DEBT.md` in the documentation archive                                       | Decide port or drop based on an actual consumer; delegated code indexing remains outside the engine.                 |
| G10 | Retrospectives and initiative snapshots have no automatic generation or closure hook.                               | `specs/documentation-consolidation/feature.md:1`                                               | Use the draft practice first; decide enforcement separately through Q1.                                              |
| G13 | Legacy formats retain their original decision and closure rules. | `treadle/packages/core/src/specpack/workflow.ts:1` | New gated work uses 0.4; active legacy adoption needs explicit owner action. Do not close earlier initiatives implicitly. |
| G12 | Past session evidence is unavailable for the four completed initiatives.                                            | `specs/documentation-consolidation/owner-decision-revision.md:1`, D-3                          | Retain factual pack snapshots. Do not reconstruct retrospectives from them.                                          |

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

The previous documentation repair failed the obsolete G3 workspace assumption.
That dated failure and its coverage limitation remain recorded in the
[repair retrospective](/retrospectives/2026-10-10-documentation-consolidation.md).
Runtime follow-ups remain separate work; no resolved status is invented here.
