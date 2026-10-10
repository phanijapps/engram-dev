# Design: root work records and wiki documentation

The selected layout places active packs in `specs/`, history in `specs/archive/`,
current documentation in `wiki/`, and non-concept files in `wiki/assets/`.
This follows FR-1 through FR-6. `relocations.json` is the complete old-to-new
path and hash map. It excludes this new initiative, whose machine record moves
as part of the migration and continues receiving current evidence.

## Decisions and alternatives

- D-1: Use root `specs` instead of `docs/specs`, following explicit owner direction.
  Alternative `.specs` hides the work root; keeping the old root fails the request.
- D-2: Preserve history under `specs/archive` and non-concept files under wiki
  assets. Alternative raw Markdown under the wiki becomes invalid concepts.
  The vendored OKF text and replay evidence use `.txt`; their bytes do not change.
- D-3: Prefer the canonical root, with a read fallback only when it is absent.
  Alternatives merging both roots duplicates work, while removing fallback
  breaks untouched external projects. Canonical-empty means deliberately empty.

These are reversible filesystem and adapter changes. Only D-1 has explicit
owner direction. Agent-selected details remain proposed; no review PASS
constitutes their acceptance or pack closure.

## Mechanism and failure behavior

One discovery helper resolves a project's work root. Both workspace and worktree
scans use it. Archive exclusion stays unchanged. Regression fixtures isolate
path behavior and replace the obsolete open-install-paths self-witness with a
check of its immutable closed record at the current root.

Move every inventoried file to its mapped destination after checking the source
hash and absence of destination conflicts. Consolidate research by retaining
the current contextual introduction and appending its complete dated source.
Retarget live source locators and replace the authority map with current state.
Historical files and old JSON pin/evidence fields retain their original bytes.
Old embedded commands are historical; this initiative supplies current checks.

No symlink recreates `docs`. Git and the relocation map make rollback reviewable.
The migration stops on a hash mismatch or destination collision. Validation
rejects broken current sources, changed preserved bytes, invalid wiki concepts,
or current skills that still direct new work into the old root.

## Context and limits

Source evidence: feature.md, impact-roots.md, relocations.json, discovery source
and test, parse.ts, link-check.mjs, and the current documentation map.
The existing Python-only freshness scanner remains a disclosed limitation.
Historical sessions remain unknown. No code/schema change is made to reconstruct them.
