---
type: System
status: stable
created: 2026-10-06
updated: 2026-10-07
title: memex — the memory plane
description: 'engine/memex (package memex v0.5.0): durable memory layer for AI coding agents - hexagonal layers, wiki-as-store, SQLite secondary index, transcript ingestion, backup/restore.'
tags: [memory, package, engine-memex, agents]
---

# Overview

`engine/memex` ships `memex` (v0.5.0) — "a durable, team-ready memory layer
for AI coding agents" (`engine/memex/pyproject.toml`). Storage model:
**files-as-truth** — durable memory is a wiki of Markdown pages under a data
dir (default `~/.memex`), with a SQLite secondary index for search that can be
rebuilt from the wiki at any time (`rebuild_index`). No daemon;
local-first.

Layering (hexagonal):

- `memex/domain/` — pure core: models, front-matter codec, slugs, link
  parsing, reserved-name classification, scrubbing, errors, operations types.
- `memex/application/` — use cases: `Memex` facade, compiler (token
  estimation / budget packing), consolidator, verify, ports (`LLMClient`).
- `memex/infrastructure/` — adapters: config, store, search index, harness
  (hook/transcript capture), `llm_clients`, workspace context.

The `Memex` facade (`engine/memex/memex/application/memory.py:56`) is the
public API surface `memex-core` calls: `write`, `recall`, `recall_task`,
`consolidate`, `forget`, `ingest_transcript`, `rebuild_index`, `backup`,
`restore`, `approve`, `get_provenance`, `list_sessions`, `status`.

CLI: `memex` — the plumbing/deployed surface (write, recall, consolidate,
forget, ingest-transcript, clear-transcripts, rebuild-index, backup,
restore, approve, types, sessions, info, status, verify). Adapters install
its hook/capture surface
today; agents target `memex-core` instead.

# Relationships

- **Fronted by core**: `memex-core` ops `record`, `search`, `compile`,
  `status`, `resolve` call this plane's public API
  (`engine/core/src/memex_core/record.py:28`, `search.py:36`,
  `compile_context.py:14`, `status.py:17`, `resolve.py:18`).
- **Wiki-page contract shared with OKF**: memory pages use the same
  hand-written front-matter codec (`memex/domain/frontmatter.py`) that OKF
  readers parse — pinned by a test-only `pyyaml` cross-check
  (`engine/memex/pyproject.toml` dev deps comment).
- **LLM at the edge only**: `LLMClient` is an application port
  (`engine/memex/memex/application/ports.py`); consolidation/episode
  enrichment call it through infrastructure clients — the deterministic
  store never depends on a model.
- **History**: absorbed from the standalone memex repo — decision ledger in
  `docs/history/memex-adr/` (ADRs 0001–0007) and
  `docs/history/memex-architecture/` (pinned by tests); remote `memex`
  points at the absorbed source tree.

# Evidence

- `engine/memex/pyproject.toml` — deps `mcp>=2,<3`, `openai>=1.60,<3`;
  strict mypy; coverage fail-under 90.
- `engine/memex/memex/application/memory.py` — the `Memex` facade and ops.
- `engine/memex/memex/cli.py` — `_build_parser` verb list.
- `docs/product/Lean_Control_Plane_Review.md` — review verdict on this
  codebase: well-layered for the trim, `web/` a leaf with zero core imports,
  small test-pinned adapter contract.
- [memex package summary](/code-summaries/packages/engine/memex.md).
