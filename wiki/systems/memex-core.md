---
type: System
title: memex-core — the control plane
description: The eight-operation front face spanning memory and knowledge planes
tags: [architecture, cli, contract]
---

# Overview

`engine/core/src/memex_core` is the porcelain CLI (`memex-core`) and the
seed of the single engine. Eight operations, each delegating to a plane:

| Op | Delegates to |
|---|---|
| `resolve` | git identity + wiki presence/freshness (stamp vs HEAD) |
| `wiki init` / `wiki update` | okf `init_bundle` / `index_codebase` + freshness stamp |
| `search` | memex recall + okf search, origin-tagged round-robin |
| `compile` | federated hits + engine packing → context + manifest |
| `record` | memex write path (scrub, budgets, governance) |
| `findings` | `.okf/findings.toml` ledger |
| `status` | memex status + okf conformance + freshness |

# Relationships

- Compile implements the [context compiler](../domain/context-compiler.md)
  contract.
- Normative wiki changes route through
  [the findings ledger](../domain/findings-ledger.md).
- Strangler plan: planes migrate inward until core takes the `memex` name.

# Evidence

- Modules: `wiki/code/engine/core/src/memex_core/` (9 generated pages).
- Contract doc: `docs/product/Memex_Core_Layer.md`.
- Tests: `engine/core/tests/` (15, isolated stores).
