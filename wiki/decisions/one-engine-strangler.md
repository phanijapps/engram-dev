---
type: Decision
title: One engine via strangler fig (draft — acceptance pending)
description: DRAFT. Absorb both planes into memex-core incrementally instead of a big-bang rewrite or keeping two engines; normative acceptance requested through the findings ledger.
status: draft
tags: [decision, architecture, strangler-fig, migration, draft]
---

# Overview

**Status: draft — normative acceptance requested** (see the pending finding
in `wiki/.okf/findings.toml`; a human must accept before this page is
treated as settled).

The chosen architecture direction: **one engine, reached by strangler fig**.
`memex-core` (engine/core) already fronts both planes through their public
APIs. The internals migrate inward over time — engine's store/search and
kit's bundle machinery become `memex_core` internals; `engine/` and `kit/`
shrink to compatibility shims, then vanish; the repo renames to memex and
the core binary takes the `memex` name. Meanwhile every new control-plane
op lands in `engine/core`, not in the planes.

Rationale:

- The 8-op surface is small and test-pinned — fronting it first lets agents
  and skills migrate to one CLI immediately, without waiting for internal
  unification.
- Strangler fig keeps each plane working (and tested) at every step; no
  feature freeze, no big-bang cutover risk.
- The alternative — a greenfield rewrite — discards two tested codebases and
  their pinned tests; the other alternative — keeping two engines —
  permanently pays double maintenance and confuses the "which CLI do I
  call?" answer.

Rejected alternatives (recorded in the review docs): big-bang rewrite into a
single new package; long-term two-engine federation with no convergence
plan.

# Relationships

- Implemented by [memex-core](/systems/memex-core.md); shapes the delegation
  map in [one-engine](/systems/one-engine.md).
- Sequenced in `docs/product/Memex_Core_Layer.md` ("Migration path to one
  engine", steps 1–3) and workstreams WS1–WS6 in
  `docs/product/Engine_Conformance_Strategy.md`.
- Owner decisions and dispositioned findings live in
  `docs/product/Lean_Control_Plane_Review.md` §6.

# Evidence

- `docs/product/Memex_Core_Layer.md` — the migration-path section and the
  "End goal: one engine" statement.
- `docs/product/Lean_Control_Plane_Review.md` — review synthesis that
  arbitrated the lean-down and requested owner decisions; §5 invariants
  survive every phase.
- `AGENTS.md` (repo root) — "New control-plane work lands HERE [engine/core],
  not in engine/memex/ or engine/okf/".
- Pending finding in `wiki/.okf/findings.toml` — the acceptance route for
  this page.
