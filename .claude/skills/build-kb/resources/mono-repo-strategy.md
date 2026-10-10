# Mono-repo strategy

Multiple packages under one roof (e.g. `packages/{core,knowledge,web}`),
**one wiki at the repo root** — a reader must see the whole system in one
place.

## Index pass (one pass, all packages)

The indexer is workspace-aware (it writes package/area summaries) but each
run re-scopes the managed tree — **sequential per-package passes do not
accumulate**. Use ONE update pass with an include per package:

```
# code indexing delegated — curated anchors only (recorded gap);
# --include strategies apply when indexing returns
```

This yields `wiki/code/**` module concepts plus
`wiki/code-summaries/{repository,areas/*,packages/**}`.

## Curated concept seeds

- `systems/<package>.md` per package — role, public surface, owner plane.
- `systems/<top-architecture>.md` — how the packages compose (the diagram
  in prose); this is usually the highest-value concept in the repo.
- `domain/<shared-contract>.md` — the contracts packages exchange
  (formats, front matter, CLI surfaces).
- `decisions/<big-choice>.md` — recorded architecture decisions with
  rationale and the alternative rejected.

## Graphs

If graphify is available, build per-package graphs and
`graphify merge-graphs` into one cross-package graph; cite cross-package
edges in the top-architecture concept's Evidence section.

## Gotchas

- One freshness stamp per update run — after the last package pass,
  `resolve` reflects that pass's `repo_head`; commit code+wiki together.
- Never index dependency/vendor trees or generated output; include-globs
  are the guardrail.
- Package READMEs/docs may already exist elsewhere (e.g. `docs/history/`)
  for absorbed codebases — link them as sources rather than duplicating.
