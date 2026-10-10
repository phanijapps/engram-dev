---
kind: feature
slug: docs-root-migration
title: Remove docs and use root specs with one wiki knowledge home
status: draft
repo_head: a14ae28
created: 2026-10-10
related: [impact-roots.md, design.md, plan.md, relocations.json]
---

# Feature analysis

## Problem and current behavior

Declared: the owner wants the repository's `docs/` directory removable and
executable work under `./specs`. This supersedes the initial root-retention
proposal. The owner already rejected duplicate research reading homes and
retrospectives reconstructed from unobserved sessions.

Implementation-supported: discovery hard-codes `docs/specs` for the workspace
and each worktree (`treadle/packages/cli/src/harness/where.ts:109`). The SDD
skills use the same root. The link gate and wiki sources reference other
`docs/` categories (`treadle/scripts/link-check.mjs:25`). The wiki enumerates
all Markdown below its root; raw historical Markdown cannot be placed there
without becoming concepts (`treadle/packages/knowledge/src/parse.ts:123`).

Implementation-supported: current guidance and unresolved consolidation are in
`wiki/project/documentation-map.md` and `wiki/project/open-work.md`. The
pre-move inventory in `relocations.json` records each file and content hash.

## Proposed behavior and requirements

- FR-1: Discover root `specs` in the workspace and its worktrees. Prefer it
  exclusively when present. Existing external projects with only the legacy
  root can remain readable; no new work is directed to that root.
- FR-2: Remove the repository's `docs` directory without a compatibility
  symlink. Preserve moved bytes and closed pack content through a relocation map.
- FR-3: Put all four full research inputs into their existing wiki concepts,
  with historical context clearly labelled. Archives supply provenance only.
- FR-4: Retarget current wiki sources, navigation, entry documents, and shipped
  and installed harness skills. Preserve historical artifact text and corpus.
- FR-5: Serve current work from `specs` in the library; open the migration for
  owner review. Record actual checks and independent review.
- FR-6: Keep historical retrospective interpretations withdrawn. Do not
  manufacture owner approval, decision acceptance, or closure.

## Affected surfaces and impact

`impact-roots.md` records the shared path contract and its dispositions.
The affected surfaces are discovery/tests, wiki sources/assets/research,
repository entry instructions, harness skills, the standing local surfaces,
and all paths in the relocation inventory. Evidence status:
implementation-supported by the cited code and inventory.

## Questions and assumptions

No owner question blocks this bounded migration: root `specs` and deletion
of `docs` are explicit user direction. The asset/archive destinations are
reversible design choices, subject to review rather than invented acceptance.

A1: original closed artifacts remain historical, including embedded commands
and old paths. Validation checks exact bytes at their mapped destinations;
new work uses current paths. A source selector with an old path can be resolved
through the relocation map without rewriting its historical record.

## Out of scope

Freshness engine redesign, new retrospective enforcement, new schema behavior,
corpus golden changes, external websites, and deletion of historical evidence.

## Handoff

Ready now: discovery compatibility, physical migration, current knowledge and
skill reconciliation, and local review handoff. Route: full plan, then execute
its tasks in dependency order. No blocked slice needs an invented owner answer.
