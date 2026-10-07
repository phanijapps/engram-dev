---
type: Decision
title: One engine, strangler-fig migration
description: Core fronts and progressively absorbs the two planes instead of a big-bang merge
tags: [decision, architecture, normative-draft]
status: draft
---

# Overview

Chosen: keep two absorbed codebases as plane internals behind a new core
layer; migrate inward (fronts → contract stabilizes → internals move in →
planes become shims → core takes the `memex` name) rather than rewriting
or merging in place.

# Alternatives considered

- **Big-bang merge of memex + okf** — rejected: high blast radius, loses
  runnable tests-per-plane during the merge window.
- **Keep three front faces (memex, okf, core CLIs)** — rejected:
  institutionalizes three contracts; recreates the verb bloat the
  lean-down removed.

# Consequences

- One CLI front face from day one; planes stay green and testable.
- Adapter/hook surface retired, to be rebuilt from scratch on core.
- This page is normative (architecture direction): acceptance tracked as
  a finding; see the ledger.

# Evidence

- Decision record + execution: `docs/product/Lean_Control_Plane_Review.md`
  (core-layer decision, 2026-10-07); `docs/product/Memex_Core_Layer.md`
  migration path.
