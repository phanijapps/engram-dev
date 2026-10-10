---
title: "Specpack status and wiki lifecycle are separate"
type: Domain
description: "Current derived stage order, evidence admission, and snapshot authority."
status: stable
created: 2026-10-10
updated: 2026-10-10
sources:
  - {"id": "s1", "resource": "treadle/packages/core/src/stages.ts"}
  - {"id": "s2", "resource": "treadle/packages/core/src/specpack/derive.ts"}
  - {"id": "s3", "resource": "treadle/packages/core/src/specpack/record.ts"}
  - {"id": "s4", "resource": "treadle/packages/core/src/specpack/normalize.ts"}
  - {"id": "s5", "resource": "treadle/packages/cli/src/harness/where.ts"}
---

# Vocabulary and derivation

The frozen stage vocabulary is `drafted`, `planning`, `in_progress`, `blocked`,
`awaiting_owner`, `in_review`, and `delivered`.
Source: `treadle/packages/core/src/stages.ts:6`.

`deriveStage` applies the first matching condition:

| Condition | Stage |
| --- | --- |
| Pack lifecycle is complete | delivered |
| A task is blocked and no task is doing | blocked |
| All tasks done, with proposed decisions or open questions | awaiting_owner |
| All tasks done, without a PACK PASS review | in_review |
| All tasks done, PACK PASS exists, pack not closed | in_progress |
| Any task doing or done | in_progress |
| Open questions before task progress | planning |
| Proposed decisions | drafted |
| Ceremony exists and approval is absent | awaiting_owner |
| Remaining cases | planning if approved, otherwise drafted |

Source: `treadle/packages/core/src/specpack/derive.ts:30`.
PACK review presence is checked by `closureGaps` at the same file's line 14.

Task states include `todo`, `doing`, `done`, and `blocked`.
A passing record needs commands with zero exits. Repeated failures can block a task.
Source: `treadle/packages/core/src/specpack/record.ts:19`.
A complete pack refuses further task recording; open a new initiative.

# Wiki projection

The canonical pack owns mutable work state. Wiki initiative pages carry dated
snapshots and their hashes. They do not maintain a second live task ledger.
Use `do where` for discovered pack status.
Source: `treadle/packages/cli/src/harness/where.ts:109`.

Concept lifecycle values describe knowledge maturity. They do not represent work
stages. A stable retrospective is a preserved report, not proof of every outcome.
See [initiatives](/initiatives/index.md) and [retrospectives](/retrospectives/index.md).
