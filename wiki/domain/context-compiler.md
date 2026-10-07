---
type: Domain
title: Context compilation contract
description: Questions in, budgeted context plus manifest out; omissions are explicit
tags: [contract, context, budget]
---

# Overview

`memex-core compile` (and the engine-side `application/compiler.py` it
reuses) turns questions into one budgeted context block over federated
memory+wiki hits. Invariants:

- one token estimator and one page identity across all paths;
- the manifest records every inclusion *and* omission with a reason;
- an envelope that cannot fit reports `CONTEXT_INSUFFICIENT` — never a
  silent truncation;
- identical frozen inputs yield identical bytes.

# Relationships

- Feeds on [federated search](../systems/memex-core.md) output
  (origin-tagged interleaving).
- Engine-side packing policies are named, tested contracts in
  `engine/memex/memex/application/compiler.py`.

# Evidence

- Implementation: `engine/core/src/memex_core/compile_context.py`
  (map: `wiki/code/engine/core/src/memex_core/compile_context.py.md`).
- Tests pinning manifest + insufficiency: `engine/core/tests/test_ops.py`.
