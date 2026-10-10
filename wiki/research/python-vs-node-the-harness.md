---
title: "Python versus Node: historical research and current outcome"
type: Research
description: "Preserved port research, its decision context, and the resulting TypeScript runtime."
status: stable
created: 2026-10-10
updated: 2026-10-10
sources:
  - {"id": "s1", "resource": "docs/research/python-vs-node-the-harness.md"}
  - {"id": "s2", "resource": "wiki/decisions/port-to-typescript.md"}
  - {"id": "s3", "resource": "treadle/package.json"}
---

# Research context

The October 9 research compared keeping Python, merging in Python, a per-plane
split, and a TypeScript port. It explicitly was not a migration decision.
Source: `docs/research/python-vs-node-the-harness.md:1`.
Its inventory and registry observations describe that dated repository.
They are not measurements of the current workspace.

# Current interpretation

The subsequent [owner decision](/decisions/port-to-typescript.md) selected a
single TypeScript runtime, with golden conformance as migration evidence.
The active workspace declares Node and pnpm at `treadle/package.json:5`.
Code indexing was delegated, so historical tree-sitter port analysis does not
establish an implemented TypeScript code indexer.

The enduring trade-off is distribution and one runtime versus re-earned behavior.
The corpus checks covered behavior; it does not prove all historical Python
features have TypeScript equivalents. See [open work](/project/open-work.md).

# Provenance

The original research remains unchanged at its source path for frozen references.
Its ecosystem claims have not been independently rechecked in this repair.
