---
type: System
title: Memory plane (engine/memex)
description: Filesystem wiki memory with BM25 recall, consolidation, and provenance
tags: [architecture, memory]
---

# Overview

The absorbed `phanijapps/memex` v0.5.0 — personal + project memory as
Markdown pages under a data dir (`~/.memex` by default), a disposable
SQLite FTS5 index, LLM consolidation behind an explicit port, transcript
capture helpers, and deterministic `verify` gates. Its CLI is plane
plumbing during migration; core fronts it.

# Relationships

- Core `record`/`search`/`status` delegate to the `Memex` facade
  (`memex/application/memory.py`).
- Pages use OKF v0.2 front matter; the format is shared vocabulary with
  the knowledge plane's bundles.
- Consolidation is the only LLM edge and always lands as proposals under
  governance, never direct truth.

# Evidence

- Generated module maps: `wiki/code/engine/memex/memex/**` (39 pages);
  package summary `wiki/code-summaries/packages/engine/memex.md`.
- Decision ledger history: `docs/history/memex-adr/` (ADRs 0001–0007),
  `docs/history/memex-CHARTER.md`.
