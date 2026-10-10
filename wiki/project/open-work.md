---
title: "Open work and evidence gaps"
type: Project
description: "Current gaps, deferred work, resolution paths, and limits of historical completion evidence."
status: stable
created: 2026-10-10
updated: 2026-10-10
sources:
  - {"id": "s1", "resource": "treadle/packages/knowledge/src/fingerprints.ts"}
  - {"id": "s2", "resource": "treadle/packages/knowledge/src/stamp.ts"}
  - {"id": "s3", "resource": "treadle/packages/cli/test/where.test.ts"}
  - {"id": "s4", "resource": "treadle/packages/cli/src/harness/where.ts"}
  - {"id": "s5", "resource": "treadle/packages/cli/src/commands/do.ts"}
  - {"id": "s6", "resource": "docs/specs/fresh-harness/fresh-harness.json"}
  - {"id": "s7", "resource": "docs/archive/documentation/2026-10-10/treadle/DEBT.md"}
---

# Gap register — 2026-10-10

These are observations and proposed follow-ups. Owners and priorities are
unassigned unless the retained record names them.

| ID | Gap | Evidence | Resolution path |
| --- | --- | --- | --- |
| G1 | Fingerprint scanning excludes TypeScript and Markdown; untracked sources do not flag status. | `treadle/packages/knowledge/src/fingerprints.ts:54` | Separate engine wave; test dirty TS source detection and affected concept reporting; review corpus contract changes. |
| G2 | Stamp compares HEAD rather than source content; committed stamp can lag its own commit. | `treadle/packages/knowledge/src/stamp.ts:68` | Analyze content-based freshness, including commits that change only documentation state. |
| G3 | Workspace-dependent test assumes install-paths remains open, although its pack is closed. | `treadle/packages/cli/test/where.test.ts:175` | Replace incidental workspace expectations with isolated fixture-based verification in a test wave. |
| G4 | Library serves one explicit root; `where` discovers worktrees. | `treadle/packages/cli/src/commands/do.ts:243`; `treadle/packages/cli/src/harness/where.ts:109` | Analyze navigation parity when a real multi-root user needs it. |
| G5 | Fresh-harness PACK review leaves the external CI green run open. | `docs/specs/fresh-harness/fresh-harness.json:1`, `review.verdicts[on=PACK].note` | Attach the actual CI run evidence in a dated supplement. Do not alter the closed pack. |
| G6 | Test files are outside composite source typecheck. | Preserved `treadle/README.md` in the documentation archive | Plan per-package test typechecking with existing suite compatibility. |
| G7 | License choice remains an owner question in retained debt notes. | Preserved `treadle/DEBT.md` in the documentation archive | Owner decision before publication. |
| G8 | Attested computation execution was deferred after format admission work. | Preserved `treadle/DEBT.md` in the documentation archive | Reopen at the first real receipt consumer; do not call admission support an executor. |
| G9 | Legacy MCP, templates, and old spine parity were not established by the port. | Preserved `treadle/DEBT.md` in the documentation archive | Decide port or drop based on an actual consumer; delegated code indexing remains outside the engine. |
| G10 | Retrospectives and initiative snapshots have no automatic generation or closure hook. | `docs/specs/documentation-consolidation/feature.md:1` | Use the draft practice first; decide enforcement separately through Q1. |

# Resolved historical claims

The previous debt page said Python retirement and corpus self-hosting were pending.
They are now recorded in [the active engine](/systems/treadle.md) and
[the corpus decision](/decisions/corpus-self-hosting.md).
Original debt prose remains preserved, rather than silently disappearing.

The guided-loop record reports the five SPEC admission debts paid.
Source: `docs/specs/guided-loop/guided-loop.json:1`, `review.verdicts[on=PACK].note`.
This report does not imply attested computation execution exists.

# Verification boundary

The documentation audit can pass while the full workspace test gate fails G3.
Current test failures and coverage limitations are recorded in the
[repair retrospective](/retrospectives/2026-10-10-documentation-consolidation.md).
Runtime follow-ups remain separate work; no resolved status is invented here.
