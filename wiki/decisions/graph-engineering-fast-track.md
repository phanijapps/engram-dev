---
type: Decision
status: stable
created: 2026-10-08
updated: 2026-10-08
verified:
  - { by: human:owner, at: 2026-10-08T00:50:00Z }
title: A packagable harness that fast-tracks graph engineering without the waterfall trap (accepted 2026-10-08)
description: 'DRAFT — acceptance requested. The harness ships as a package other teams install to run graph engineering (spec-driven development over a versioned solution graph) without falling into the waterfall trap: knowledge first, bounded artifacts, uncertainty recorded, humans accepting.'
sources: [{ id: src, resource: docs/product/Structured_Brief.md }]
tags: [decision, purpose, graph-engineering, anti-waterfall, draft]
---

# Decision (ACCEPTED 2026-10-08 — finding `golden-path-8481ab73`)

This project builds a **packagable harness**. Its purpose: **fast-track
graph engineering** — spec-driven development where intent, requirements,
designs, tasks, and verification stay connected — **without falling into
the waterfall trap**.

## What "without the waterfall trap" means here

1. **Knowledge before specifications** — the wiki is built by tools from
   code, so analysis starts grounded, not from interviews.
2. **Bounded artifacts** — the smallest analysis/design that unblocks the
   next step; explicit out-of-scope registers; no complete-up-front specs.
3. **Uncertainty is a deliverable** — questions and assumptions are
   recorded with owners and resolution paths, never silently resolved.
4. **Interleaved work** — unblocked slices proceed while spikes and
   questions run; sequencing follows the dependency graph, not a calendar.
5. **Humans accept, tools prove** — nothing normative binds without owner
   acceptance; nothing is "done" without observed evidence.

**This is the ratified purpose of the project.**

## Packaging

The harness = the okf engine + the five basic skills + the wiki contract.
It must install cleanly onto a target repository (skills + CLI
conventions), gather knowledge first, and run the loop on **full-stack
microservices projects** (the initial supported shape).

# Relationships

- Builds on [Okf-only engine](/decisions/okf-only-engine.md).
- Operationalized by the loop pattern:
  [The SDD loop](/domain/pattern-anti-waterfall-loop.md).
