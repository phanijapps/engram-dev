---
title: "Documentation consolidation: analysis, repair, and remaining gaps"
type: Initiative
description: "Connect current wiki knowledge, retained specs, and dated retrospectives without a root migration."
status: stable
created: 2026-10-10
updated: 2026-10-10
sources:
  - {"id": "s1", "resource": "docs/specs/documentation-consolidation/feature.md"}
  - {"id": "s2", "resource": "docs/specs/documentation-consolidation/design.md"}
  - {"id": "s3", "resource": "docs/specs/documentation-consolidation/plan.md"}
  - {"id": "s4", "resource": "docs/specs/documentation-consolidation/baseline.json"}
  - {"id": "s5", "resource": "docs/replays/2026-10-10/index.html"}
  - {"id": "machine", "resource": "docs/specs/documentation-consolidation/documentation-consolidation.json"}
---

# Intent and artifacts

The owner requested current knowledge consolidated into the workspace wiki,
easier spec tracking, and saved retrospectives. The analysis recommends retaining
`docs/specs/` and projecting initiatives into the wiki.
Source: `docs/specs/documentation-consolidation/feature.md:1`.

The design and task plan live beside that analysis. Their exact evidence and
status ledger remain there. The initial repair had prose artifacts and
no executable specpack. That omission was corrected on 2026-10-10; see below.
Source: `treadle/packages/cli/src/harness/where.ts:109`.

# What the repair connects

Current architecture and domain explanations; research interpretation; project
controls and gaps; four completed initiative records; dated retrospectives.
The original research and closed specpacks remain protected.
Source: `docs/specs/documentation-consolidation/baseline.json:1`.

Read [the authority map](/project/documentation-map.md),
[the open-work register](/project/open-work.md), and
[the repair retrospective](/retrospectives/2026-10-10-documentation-consolidation.md).
The future maintenance practice remains a [draft](/project/documentation-lifecycle.md).

# Earlier replay

The earlier HTML repository replay remains at `docs/replays/2026-10-10/index.html`.
Its source snapshot predates this repair and is historical evidence, not a live
view of the rewritten wiki. Its recorded browser checks remain unchanged.

# Machine handoff correction — 2026-10-10

The missing JSON was an agent workflow error. The corrected
[canonical pack](../../docs/specs/documentation-consolidation/documentation-consolidation.json)
now carries requirements, proposed decisions, task dependencies, and evidence.
Source: `docs/specs/documentation-consolidation/bug-missing-specpack.md:1`.

Its engine-derived stage is authoritative. Human approval and closure remain
unset. New evidence is current re-verification, not a fabricated historical
handout. The earlier snapshot and retrospective remain dated observations.
