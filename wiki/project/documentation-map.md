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
---

# Authority map — 2026-10-10

| Location | Authority | Wiki entry |
| --- | --- | --- |
| `wiki/systems`, `wiki/domain` | Current architecture and domain explanations | Section indexes |
| `wiki/decisions` | Recorded decisions, alternatives, consequences, and supersession | Decisions index |
| `wiki/research` | Interpretation and relevance of retained research inputs | Research index |
| `wiki/project` | Project overview, documentation boundaries, controls, and open gaps | Project index |
| `wiki/initiatives` | Dated navigation to canonical work records | Initiatives index |
| `wiki/retrospectives` | Dated outcome reports and proposed lessons | Retrospectives index |
| `docs/specs/<slug>/` | Canonical analysis/design and executable specpack records | Initiative concepts |
| `docs/product/` | Vendored OKF specification and specpack schema | Wiki contract and status pages |
| `docs/research/` | Original dated research; retained for provenance and pinned references | Current wiki research interpretations |
| `docs/archive/` | Historical evidence and superseded text | Relevant concept history/source sections |
| `docs/replays/` | Dated HTML replay and its captured verification | Documentation initiative and retrospective |
| `docs/guide/index.html` | Installation walkthrough | Repository README |
| `SECURITY.md`, `AGENTS.md`, shipped skills | Reporting policy and operating instructions | Wiki summaries; original authority retained |

The complete file-level `docs/` disposition inventory is
`docs/specs/documentation-consolidation/baseline.json`.
It does not claim that every archived initiative has a new retrospective.
This repair covers the four active-root completed packs.

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
