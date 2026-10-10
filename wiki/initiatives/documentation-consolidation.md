---
title: "Documentation consolidation: analysis, repair, and remaining gaps"
type: Initiative
description: "Connect current wiki knowledge, retained specs, and dated retrospectives without a root migration."
status: stable
created: 2026-10-10
updated: 2026-10-10
sources:
  - {"id": "s1", "resource": "specs/documentation-consolidation/feature.md"}
  - {"id": "s2", "resource": "specs/documentation-consolidation/design.md"}
  - {"id": "s3", "resource": "specs/documentation-consolidation/plan.md"}
  - {"id": "s4", "resource": "specs/documentation-consolidation/baseline.json"}
  - {"id": "s5", "resource": "wiki/assets/replays/2026-10-10/index.html"}
  - {"id": "machine", "resource": "specs/documentation-consolidation/documentation-consolidation.json"}
  - {id: owner, resource: specs/documentation-consolidation/owner-decision-revision.md}
---

# Intent and artifacts

The root migration supersedes the earlier root and research arrangement.
Current work lives in `specs`; full research now lives in the wiki. Paths below
are retargeted for navigation; original pack and evidence text remain unchanged.
Source: `specs/docs-root-migration/design.md:1`.

The owner rejected D-2 and D-3 after review. D-4 is accepted; D-1 remains
proposed. Historical retrospective interpretations are withdrawn. The subsequent root migration
consolidates research into the wiki. The initial repair below describes
the earlier state, not acceptance of those rejected choices.
Source: `specs/documentation-consolidation/owner-decision-revision.md:1`.

The owner requested current knowledge consolidated into the workspace wiki,
easier spec tracking, and saved retrospectives. The analysis recommends retaining
`specs/` and projecting initiatives into the wiki.
Source: `specs/documentation-consolidation/feature.md:1`.

The design and task plan live beside that analysis. Their exact evidence and
status ledger remain there. The initial repair had prose artifacts and
no executable specpack. That omission was corrected on 2026-10-10; see below.
Source: `treadle/packages/cli/src/harness/where.ts:109`.

# What the repair connects

Current architecture and domain explanations; research interpretation; project
controls and gaps; four completed initiative records; dated retrospectives.
The original research and closed specpacks remain protected.
Source: `specs/documentation-consolidation/baseline.json:1`.

Read [the authority map](/project/documentation-map.md),
[the open-work register](/project/open-work.md), and
[the repair retrospective](/retrospectives/2026-10-10-documentation-consolidation.md).
The future maintenance practice remains a [draft](/project/documentation-lifecycle.md).

# Earlier replay

The earlier HTML repository replay remains at `wiki/assets/replays/2026-10-10/index.html`.
Its source snapshot predates this repair and is historical evidence, not a live
view of the rewritten wiki. Its recorded browser checks remain unchanged.

# Machine handoff correction — 2026-10-10

The missing JSON was an agent workflow error. The corrected
[canonical pack](../../specs/documentation-consolidation/documentation-consolidation.json)
now carries requirements, proposed decisions, task dependencies, and evidence.
Source: `specs/documentation-consolidation/bug-missing-specpack.md:1`.

Its engine-derived stage is authoritative. At the correction snapshot, human
approval and closure were unset. New evidence is current re-verification, not
a fabricated historical handout. The earlier snapshot and retrospective remain
dated observations.

# Owner approval — 2026-10-10

The browser recorded approval by `human:owner` at `2026-10-10T20:40:25Z`.
The pack is at revision 15. Its stage remains `awaiting_owner` because
decisions D-1 through D-4 remain proposed. Closure remains unset.
Source: `specs/documentation-consolidation/documentation-consolidation.json:8`,
`date.approved`, `design.decisions`, and `status`.
