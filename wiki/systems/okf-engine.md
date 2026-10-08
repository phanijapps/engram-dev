---
type: System
status: stable
created: 2026-10-08
updated: 2026-10-08
title: okf — the engine of the SDD harness
description: 'The packagable engine of the harness: repository in, anchored searchable knowledge out. Tree-sitter extraction, freshness stamps, findings ledger, fingerprints, semantic candidate scanner, one CLI.'
sources: [{ id: src, resource: engine/okf/okf_kit/__init__.py }]
tags: [system, okf, engine]
---

# Overview

okf is the **sole engine** of the SDD harness. It turns a repository into
an OKF bundle of anchored, searchable knowledge — and gives agents the
trust machinery to keep that knowledge honest.

**CLI:** `init` (scaffold a bundle) · `new` (concept from type template) ·
`validate` (conformance) · `search` (full-text) · `read --depth`
(progressive context) · `index regen` (per-directory indexes) ·
`code index` (tree-sitter extraction + freshness stamp) · `code rules`
(semantic candidate scanner) · `status` (one-shot trust answer) ·
`findings propose|list|resolve` (normative proposals) ·
`fingerprints update` + `anchors` (staleness detection).

# Trust machinery

- **Freshness stamp** — `.okf/last-index.json` records the commit an index
  ran at; `okf status` compares it to HEAD. [^s1]
- **Findings ledger** — proposals at `(source, destination, kind)` keys,
  deduped; declined keys refuse re-proposals; terminal states immutable.
  Humans accept; nothing normative binds without that. [^s2]
- **Fingerprints + anchors** — per-file sha256 map; pages anchored to
  changed code get NEEDS_REVIEW. [^s3]
- **Semantic scanner** — rule-shaped code (guards, assertions, permission
  calls, enums, validators, deprecations, constants, TODOs) located
  deterministically; agents classify and author. [^s4]

# Non-goals

No hooks, no session/token capture. A future memex is a consumer layer
on top — never a plane inside. [^s5]

# Relationships

- [Okf-only engine](/decisions/okf-only-engine.md) — the accepted decision.
- [Fast-tracking graph engineering](/decisions/graph-engineering-fast-track.md) — the purpose.
- [The wiki contract](/domain/wiki-contract.md) — bundle rules.

# Evidence

[^s1]: `engine/okf/okf_kit/core/stamp.py` (implementation-supported)
[^s2]: `engine/okf/okf_kit/core/findings.py` (implementation-supported)
[^s3]: `engine/okf/okf_kit/core/fingerprints.py` (implementation-supported)
[^s4]: `engine/okf/okf_kit/code/semantic.py` (implementation-supported)
[^s5]: owner-declared non-goal, 2026-10-07 (declared)
