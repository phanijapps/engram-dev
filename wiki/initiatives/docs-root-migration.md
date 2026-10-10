---
title: "Root specs and wiki documentation migration"
type: Initiative
description: "Move active work to root specs, consolidate research in the wiki, and remove docs without losing evidence."
status: stable
created: 2026-10-10
updated: 2026-10-10
sources:
  - { id: pack, resource: specs/docs-root-migration/docs-root-migration.json }
  - { id: design, resource: specs/docs-root-migration/design.md }
  - { id: map, resource: specs/docs-root-migration/relocations.json }
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

Read [this session’s retrospective](/retrospectives/2026-10-10-docs-root-migration.md).

# Dated approval and control gap

At revision 20, the owner approval was recorded. D-2 and D-3 were still proposed;
the pack was active without closure. The owner challenged the earlier execution of
these proposed decisions. The resulting analysis is a separate initiative.
Source: `specs/spec-completion-handoff/probe.json:1`.
Read [the owner-control analysis](/initiatives/spec-completion-handoff.md).

# Owner completion supplement

The canonical record now contains accepted D-2 and D-3, each attributed to human:owner.
The owner finished the spec at 2026-10-10T22:38:40Z.
Revision 23 records lifecycle complete and deliverable delivered.
The browser owner action supplies the completion record; no agent closure was inferred.
Source: `specs/docs-root-migration/docs-root-migration.json:1`.

Observed pack SHA-256: `45ff83511b8da6045c215c7368357a6e1c1ae7cd63aff496f1dbcef4a27b72b0`.
This is a dated record observation, not a new task verification run.
