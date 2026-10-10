---
title: "Documentation authority and consolidation map"
type: Project
description: "Root specs hold work; the wiki holds current knowledge and documentation assets; archives preserve history."
status: stable
created: 2026-10-10
updated: 2026-10-10
sources:
  - {id: migration, resource: specs/docs-root-migration/design.md}
  - {id: locations, resource: specs/docs-root-migration/relocations.json}
  - {id: discovery, resource: treadle/packages/cli/src/harness/where.ts}
  - {id: parsing, resource: treadle/packages/knowledge/src/parse.ts}
---

# Current authority map

| Location | Authority | Reading path |
| --- | --- | --- |
| `wiki/systems`, `wiki/domain`, `wiki/project` | Current architecture, domain, operating controls, and gaps | Section indexes |
| `wiki/decisions` | Dated decision records and their consequences | Decisions index |
| `wiki/research` | Complete research text with dated context and current qualifications | Research index |
| `wiki/initiatives` | Navigation to canonical work records | Initiatives index |
| `wiki/retrospectives` | Reports from observed sessions; historical withdrawal notices | Retrospectives index |
| `specs/<slug>/` | Executable specpack, analysis, design, task plan, and evidence | Initiative concepts and the local library |
| `specs/archive/` | Frozen history and original source bytes; excluded from active discovery | Source locators and relocation map |
| `wiki/assets/contracts/` | Vendored OKF text and specpack schema, outside the concept graph | Wiki contract page |
| `wiki/assets/guide/` | Installation walkthrough | Setup page and repository README |
| `wiki/assets/replays/` | Dated replay and captured evidence | Related initiative |
| `SECURITY.md`, `AGENTS.md`, shipped skills | Root reporting/operating authority and executable agent instructions | Wiki summaries |

Source: `specs/docs-root-migration/design.md:1`.
There is no `docs` directory or compatibility symlink. Current work uses root
`specs`. When that root exists, discovery does not merge a legacy work root.
Untouched external projects remain readable through a legacy-only fallback.
Source: `treadle/packages/cli/src/harness/where.ts:109`.

# Historical references and preservation

The complete relocation map records each old path, destination, and SHA-256:
`specs/docs-root-migration/relocations.json:1`.
Closed records retain their original bytes. Embedded commands, old paths,
review snapshots, and findings keys remain historical. Resolve those paths
through the map; do not treat them as current operating instructions.

The four research pages contain the complete original texts and current
qualifications in one reading home. Original bytes are retained only under
`specs/archive/research` for provenance. The original research checks and
proposals are dated observations, not new current guarantees.
Source: `specs/docs-root-migration/feature.md:1`, FR-3.

# Knowledge boundaries

Internal Markdown links connect wiki concepts. Repository evidence uses
frontmatter source resources and inline paths. Raw historical Markdown stays
outside the wiki. The vendored OKF specification is a `.txt` asset because
its illustrative links do not describe this project's concept graph.
Sources: `treadle/packages/knowledge/src/parse.ts:123` and
`specs/docs-root-migration/impact-roots.md:1`.

The owner rejected historical retrospective reconstruction. Factual initiative
snapshots remain; session experiences and lessons need actual session evidence.
Source: `specs/documentation-consolidation/owner-decision-revision.md:1`.
