---
title: "Documentation authority and consolidation map"
type: Project
description: "One current knowledge home, with canonical work, format, operating, and historical records retained."
status: stable
created: 2026-10-10
updated: 2026-10-10
sources:
  - {"id": "s1", "resource": "docs/specs/documentation-consolidation/baseline.json"}
  - {"id": "s2", "resource": "treadle/packages/cli/src/harness/where.ts"}
  - {"id": "s3", "resource": "treadle/packages/knowledge/src/links.ts"}
  - {"id": "s4", "resource": "treadle/packages/knowledge/src/validate.ts"}
  - {id: owner, resource: docs/specs/documentation-consolidation/owner-decision-revision.md}
---

# Authority map — 2026-10-10

The owner rejected D-2, the two-location research arrangement, and D-3,
the historical retrospective backfills. The initial map below now carries
these corrections. Research consolidation still needs a replacement design.
Source: `docs/specs/documentation-consolidation/owner-decision-revision.md:1`.

| Location | Authority | Wiki entry |
| --- | --- | --- |
| `wiki/systems`, `wiki/domain` | Current architecture and domain explanations | Section indexes |
| `wiki/decisions` | Recorded decisions, alternatives, consequences, and supersession | Decisions index |
| `wiki/research` | Current research reading home; full consolidation remains open | Research index |
| `wiki/project` | Project overview, documentation boundaries, controls, and open gaps | Project index |
| `wiki/initiatives` | Dated navigation to canonical work records | Initiatives index |
| `wiki/retrospectives` | The observed-session report and withdrawal notices for unavailable historical retrospectives | Retrospectives index |
| `docs/specs/<slug>/` | Canonical analysis/design and executable specpack records | Initiative concepts |
| `docs/product/` | Vendored OKF specification and specpack schema | Wiki contract and status pages |
| `docs/research/` | Transitional source files; their duplication was rejected under D-2 | Research consolidation follow-up |
| `docs/archive/` | Historical evidence and superseded text | Relevant concept history/source sections |
| `docs/replays/` | Dated HTML replay and its captured verification | Documentation initiative and retrospective |
| `docs/guide/index.html` | Installation walkthrough | Repository README |
| `SECURITY.md`, `AGENTS.md`, shipped skills | Reporting policy and operating instructions | Wiki summaries; original authority retained |

The complete file-level `docs/` disposition inventory is
`docs/specs/documentation-consolidation/baseline.json`.
The four completed packs have factual initiative snapshots. Their generated
retrospectives are withdrawn because the agent did not observe those sessions.

# How to find evidence

Internal Markdown links are wiki graph edges. Repository evidence uses source
metadata and inline workspace paths. External `.md` links would violate bundle
containment. Source: `treadle/packages/knowledge/src/links.ts:94`.
Pack JSON links can be opened in repository viewers; JSON is not an OKF concept.

Keep work stage in the pack. Wiki snapshots name the observation date,
revision, and hash. The work root remains `docs/specs/` because current discovery
uses that root. Source: `treadle/packages/cli/src/harness/where.ts:109`.

# Migration boundary

No executable pack, frozen research, replay evidence, schema, or skill moved.
Previously published explanations are preserved under
`docs/archive/documentation/2026-10-10/`. Their links are period-correct history.
A future root migration needs its own analysis and compatibility plan.
The unchanged research paths describe current disk state, not an accepted
research arrangement. One wiki research home is the consolidation objective.
