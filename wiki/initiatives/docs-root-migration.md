---
title: "Root specs and wiki documentation migration"
type: Initiative
description: "Move active work to root specs, consolidate research in the wiki, and remove docs without losing evidence."
status: stable
created: 2026-10-10
updated: 2026-10-10
sources:
  - {id: pack, resource: specs/docs-root-migration/docs-root-migration.json}
  - {id: design, resource: specs/docs-root-migration/design.md}
  - {id: map, resource: specs/docs-root-migration/relocations.json}
---

# Intent and work record

The owner requested complete removal of `docs` and root `./specs` for work.
The [canonical pack](../../specs/docs-root-migration/docs-root-migration.json)
holds task state, owner decision acts, evidence, and review.
Source: `specs/docs-root-migration/feature.md:1`.

# Locations and evidence

Active work lives in `specs`; the wiki contains current knowledge and complete
research. Documentation assets live in `wiki/assets`. Frozen history is under
`specs/archive`, excluded from active discovery. The relocation map preserves
old path selectors and content hashes.
Source: `specs/docs-root-migration/relocations.json:1`.

Read [the authority map](/project/documentation-map.md),
[research](/research/index.md), and [setup](/project/setup.md).
The current pack owns completion and acceptance; this page does not infer closure.
