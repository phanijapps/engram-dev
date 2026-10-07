---
kind: feature
slug: <kebab-slug>
title: <capability change, plainly>
status: draft
created: YYYY-MM-DD
repo_head: <commit pinned at authoring>
wiki_freshness: fresh | stale | unknown
related: []
---

# Feature analysis — <title>

> The what-and-why artifact. It does NOT spec (that is spec.md) and does
> NOT enumerate breakage (that is impact-*.md) — it links to them when
> needed. Evidence status on every claim; sections without content say
> "none identified" + why credible.

## Problem & evidence

The problem in the user's terms, and the pinned evidence that it exists
(issues, failing scenarios, wiki concepts — with status labels).

## Current behavior

What the system does today, pinned to `repo_head`. Cite wiki concepts
(`wiki/systems/**`, `wiki/code/**`) and source paths. If wiki was stale,
say so and label claims `declared`.

## Proposed behavior

What should change, at the capability level (not implementation detail).
One paragraph, testable in principle.

## Affected surfaces

| Surface | Why affected | Evidence (wiki cid / path) | Status |
|---------|--------------|---------------------------|--------|
| … | … | … | implementation-supported |

From wiki traversal + compile, not guesswork. Unknown surfaces are listed
with status `unknown` — that is a finding, not a failure.

## Impact candidates

Shared contracts, storage formats, or public APIs touched? If yes →
summarize here in one line each and run the **impact** mode as a separate
artifact this section links to. If no → "none identified" + why credible.

## Open questions

| ID | Question | Blocks | Owner | Resolution path |
|----|----------|--------|-------|-----------------|

## Assumptions

| ID | Assumption | Blast radius | Validation trigger |
|----|-----------|--------------|--------------------|

## Decisions needed

| Decision | Needed by (what it unblocks) | Two-way / one-way | Evidence status |
|----------|------------------------------|-------------------|-----------------|

Decisions not yet made stay here — do not manufacture them.

## Handoff

- **Route:** needs `spec` / needs `spike` first / straight to `plan`
- **Ready now:** …
- **Blocked on:** …
- **Next step:** …
