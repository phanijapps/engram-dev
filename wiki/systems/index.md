
# System
* [memex — the memory plane](memex.md) - engine/memex (package memex v0.5.0): durable memory layer for AI coding agents - hexagonal layers, wiki-as-store, SQLite secondary index, transcript ingestion, backup/restore.
* [memex-core — the control-plane front face](memex-core.md) - engine/core (package memex-core): the 8-op control plane CLI and library that fronts both planes; where new control-plane work lands.
* [okf-kit — the knowledge plane](okf-kit.md) - engine/okf (package okf-kit v0.1.0): Open Knowledge Format bundle machinery - parse/model/links/index/search/validate/context - plus the tree-sitter code indexer that writes managed wiki/code concepts.
* [One-engine architecture (memex-core over two planes)](one-engine.md) - How engine/core (control-plane front face), engine/memex (memory plane), and engine/okf (knowledge plane) compose into one engine via strangler-fig delegation.
