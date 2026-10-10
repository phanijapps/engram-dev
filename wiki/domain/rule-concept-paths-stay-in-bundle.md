---
type: BusinessRule
title: A concept path must never escape the bundle root
description: "Every write and resolution of a concept path checks bundle containment — symlinks and hostile ids cannot move writes outside the wiki, even through parent traversal."
status: stable
created: 2026-10-07
updated: 2026-10-07
# sources: retired with the python engines — evidence preserved at git tag python-final
tags: [security, paths, domain]
---

# Rule

Concept writes resolve to a path **inside the bundle root** or they raise.
The check runs on the resolved (real) path, so symlinks do not bypass it,
and on every entry point that turns a cid into a filesystem location.

[^p1]:
    `treadle/packages/knowledge/src/code/paths.ts` — `concept_path` raises on
    escape during cid→path resolution.

[^p2]:
    `treadle/packages/knowledge/src/code/indexer.ts` — the indexer re-checks
    before each concept write.

[^p3]:
    `treadle/packages/knowledge/src/code/indexer.ts` — symlink-aware
    containment checks for managed concepts, summaries, and managed roots.

# Enforcement

`raise ValueError(f"concept path escapes bundle: …")` at every boundary;
`create_concept` performs the same containment check on the resolved write
path (`templates.py`).

# Examples

A cid like `../../etc/passwd` fails the segment rules before containment
is even reached; a symlinked `wiki/out` directory fails containment.
