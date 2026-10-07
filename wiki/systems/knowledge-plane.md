---
type: System
title: Knowledge plane (engine/okf)
description: OKF bundle machinery and the tree-sitter code-to-concept indexer
tags: [architecture, okf, knowledge]
---

# Overview

The absorbed `phanijapps/okf-kit` — OKF bundle tooling: permissive
front-matter parsing, link graph, index regeneration, FTS search,
conformance validation, and `code/`: language adapters + tree-sitter
extraction rendering managed CodeModule concepts (generated sections are
marked and regenerated; human content is preserved). CLI `okf` is bundle
plumbing; core wraps the operations agents need.

Upgrade path: OKF 0.1 → 0.2 per `docs/product/Kit_Wiki_Engine_Plan.md`
(this wiki's root already declares `okf_version: "0.2"`; the validator
reports the mismatch at info level until U1 lands).

# Relationships

- Core `wiki init/update` wrap `init_bundle`/`index_codebase`.
- The indexer produced every page under `wiki/code/**` in this bundle —
  and rebuilds them byte-identically from unchanged sources.

# Evidence

- Generated module maps: `wiki/code/engine/okf/okf_kit/**` (22 pages);
  package summary `wiki/code-summaries/packages/engine/okf.md`.
- Format spec (vendored): `docs/product/OKF_SPEC_v0.2.md`.
