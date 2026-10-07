---
type: System
title: One-engine architecture (memex-core over two planes)
description: How engine/core (control-plane front face), engine/memex (memory plane), and engine/okf (knowledge plane) compose into one engine via strangler-fig delegation.
tags: [architecture, control-plane, strangler-fig]
---

# Overview

The repository is one engine assembled from three uv-workspace packages under
`engine/`:

| Package | Import name | Role |
|---|---|---|
| `engine/core` | `memex_core` | The one-engine seed and **CLI front face** — 8 control-plane ops |
| `engine/memex` | `memex` | Memory plane — durable memory layer for AI coding agents (v0.5.0) |
| `engine/okf` | `okf_kit` | Knowledge plane — OKF bundle machinery (parse/model/links/index/search/validate) + tree-sitter code indexer |

`memex-core` is the porcelain: the single surface agents, skills, and users
drive. The plane CLIs (`memex`, `okf`) are plumbing — `memex` remains the
deployed hook/capture surface, `okf` remains bundle tooling for wiki
maintainers and CI. Control-plane work lands in `engine/core`; over time the
plane internals migrate inward (strangler fig) until one engine remains.

# Relationships

The 8 ops and their per-op delegation, as wired in the code (all imports
verified at repo HEAD 39bad0f):

| Op | Delegates to | Import site |
|---|---|---|
| `resolve` | `memex.infrastructure.workspace_context.project_context` + `okf_kit.core.parse.split_frontmatter` | `engine/core/src/memex_core/resolve.py:18,70` |
| `wiki init` | `okf_kit.core.templates.init_bundle` | `engine/core/src/memex_core/knowledge.py:43` |
| `wiki update` | `okf_kit.code.indexer.index_codebase` | `engine/core/src/memex_core/knowledge.py:79` |
| `search` | `memex.Memex` (recall) + `okf_kit.core.search` | `engine/core/src/memex_core/search.py:36,60` |
| `compile` | `memex.application.compiler.estimate_tokens/pack_to_budget` | `engine/core/src/memex_core/compile_context.py:14` |
| `record` | `memex.Memex` (write) | `engine/core/src/memex_core/record.py:28` |
| `findings` | `.okf/findings.toml` ledger (no plane call) | `engine/core/src/memex_core/findings.py` |
| `status` | `memex.Memex.status` + `okf_kit.core.validate.validate_bundle` | `engine/core/src/memex_core/status.py:17,33` |

The dependency direction is strictly core → planes: `engine/core/pyproject.toml`
depends on workspace `memex` and `okf-kit`; neither plane imports `memex_core`.
Package-level dependency edges are also visible in the graphify per-package
extracts (`core::pkg_memex_core` depends_on `core::pkg_memex`,
`engine/core/pyproject.toml` L1).

The wiki itself is the dogfood instance of this architecture: it is an OKF
bundle (knowledge plane product) at `<repo>/wiki/`, indexed by the same
`wiki update` op the core fronts.

# Evidence

- `docs/product/Memex_Core_Layer.md` — the one-engine seed doc; the 8-op
  delegation table and the strangler-fig diagram (diagram in prose above).
- `engine/core/src/memex_core/cli.py` — `memex-core` argparse surface:
  resolve · wiki(init|update) · search · compile · record ·
  findings(list|propose|resolve) · status (8 top-level ops).
- `engine/core/pyproject.toml` — `memex-core` v0.1.0 depends on workspace
  `memex` + `okf-kit` + pinned `tree-sitter==0.25.2` /
  `tree-sitter-language-pack==1.8.1`.
- `pyproject.toml` (root) — uv workspace, members
  `engine/{memex,okf,core}`; one root venv; all three CLIs on PATH.
- `docs/product/Lean_Control_Plane_Review.md` §1 — the 8-op control-plane
  contract this shape implements; §"Invariants" for the over-trim guard.
- Package summaries: [core](/code-summaries/packages/engine/core.md),
  [memex](/code-summaries/packages/engine/memex.md),
  [okf](/code-summaries/packages/engine/okf.md),
  [area: engine](/code-summaries/areas/engine.md).
