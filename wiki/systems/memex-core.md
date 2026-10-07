---
type: System
title: memex-core — the control-plane front face
description: 'engine/core (package memex-core): the 8-op control plane CLI and library that fronts both planes; where new control-plane work lands.'
tags: [cli, control-plane, package, engine-core]
---

# Overview

`engine/core` ships `memex-core` (v0.1.0) — the one-engine seed and the CLI
front face. It is intentionally small: 9 modules, each one op (plus the CLI).
Run from anywhere in the workspace as `uv run memex-core <op> <args>` (root
venv; `--cwd` overrides the workspace dir, `--data-dir` overrides the memory
store `~/.memex`).

Public surface (re-exported in `engine/core/src/memex_core/__init__.py`):
`resolve`, `wiki_init`, `wiki_update`, `federated_search` (+ `CoreHit`),
`compile_context` (+ `Compiled`), `record_note`, findings ops
(`findings_path`, `list_findings`, `propose_finding`, `resolve_finding`),
`combined_status`.

Design shape: every op is a pure function over `(cwd, ...) -> JSON-emittable
dataclass/dict`; plane imports happen *inside* the ops (lazy), so the package
loads without either plane present until an op actually needs it
(`engine/core/src/memex_core/knowledge.py:43,79`).

# Relationships

- **Delegates down, never up**: each op calls the memory plane (`memex`) and/or
  knowledge plane (`okf_kit`) public APIs — see
  [one-engine](/systems/one-engine.md) for the per-op delegation map.
- **Owns the wiki conventions**: `<repo>/wiki/` bundle location, `.okf/` state
  dir (`last-index.json` freshness stamp, `findings.toml` ledger) — see
  [wiki-contract](/domain/wiki-contract.md).
- **Federation, not absorption**: `federated_search` runs `memex` recall and
  `okf_kit` search side by side, tags hits by origin, and round-robin merges
  (`engine/core/src/memex_core/search.py` — `_memory_hits` / `_wiki_hits`);
  neither plane's index absorbs the other's rows.
- **CLI family**: `memex-core` (porcelain) vs `memex` / `okf` (plumbing);
  during migration the plumbing verbs fold in, and at the end core's binary
  takes the `memex` name (`docs/product/Memex_Core_Layer.md`).

# Evidence

- `engine/core/src/memex_core/cli.py` — the full argparse surface (8 ops;
  `wiki` and `findings` are the two with subcommands).
- `engine/core/src/memex_core/__init__.py` — the public API and `__all__`.
- `engine/core/pyproject.toml` — package metadata, workspace deps,
  `[project.scripts] memex-core = "memex_core.cli:main"`.
- `engine/core/tests/` — op-level tests pinning resolve/freshness, federated
  search origin interleaving, findings, record/status (e.g.
  `engine/core/tests/test_resolve_knowledge.py`,
  `engine/core/tests/test_ops.py`).
- [core package summary](/code-summaries/packages/engine/core.md) — module
  impact map (resolve is the most depended-on module: used by 6).
