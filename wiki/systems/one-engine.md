---
type: System
title: The one-engine architecture
description: How core, memex, and okf compose into a single engine with one CLI front face
tags: [architecture, top]
---

# Overview

memex is three packages composing one engine, plus the product docs that
specify where it is heading.

- **core** (`engine/core`, package `memex-core`) — the front face and
  control plane. One CLI (`memex-core`) exposes eight operations; agents,
  skills, and users talk only to it.
- **memex** (`engine/memex`) — the memory plane: a filesystem wiki of
  personal/project memory pages (OKF 0.2 front matter), SQLite FTS5
  recall, consolidation, transcripts.
- **okf** (`engine/okf`, package `okf-kit`) — the knowledge plane: OKF
  bundle machinery (parse/validate/search/index) and the tree-sitter
  code-to-concept indexer that generates `wiki/code/**`.

Core delegates to both planes through their public APIs; neither plane
index absorbs the other's rows.

# Relationships

- core fronts memex and okf; see [memex-core](memex-core.md).
- Project knowledge lives in-repo as this very wiki; the lifecycle
  (init/update/freshness/findings) is defined in
  [the findings ledger](../domain/findings-ledger.md).
- The consolidation path (memex plane) is the only LLM edge; everything
  else is deterministic.

# Evidence

- Layout and roles: `engine/{core,memex,okf}`, workspace root
  `pyproject.toml` (`[tool.uv.workspace] members`).
- Front-face decision: `docs/product/Memex_Core_Layer.md`;
  execution log in `docs/product/Lean_Control_Plane_Review.md`.
- This wiki itself was produced by the `build-kb` skill driving
  `memex-core wiki init|update`.
