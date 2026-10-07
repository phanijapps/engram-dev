---
type: Decision
title: Okf-only engine (accepted 2026-10-07)
description: 'DRAFT. The engine is okf alone: repository in, knowledge out, tree-sitter for codebase understanding (structural today; business rules, encapsulated logic, patterns, and policies next). A future memex is a consumer layer on top, not a plane. Supersedes the deprecated one-engine strangler direction.'
status: stable
created: 2026-10-07
updated: 2026-10-07
verified:
  - { by: human:owner, at: 2026-10-07T23:30:00Z }
tags: [decision, architecture, okf, draft]
---

# Overview

**Status: draft — normative acceptance requested** through the findings
ledger (proposed from `docs/specs/okf-only-engine/design.md`).

The engine is **okf only**. `engine/memex` (memory plane) and
`engine/core` (control plane) were removed; the workspace builds okf
alone. Direction signed by the owner (okf-only-engine feature Q-round,
2026-10-07); the former one-engine strangler direction is deprecated and
its pending finding was declined.

## What the engine does

1. **Repository → knowledge.** `okf code index` builds managed concepts
   from source (tree-sitter), plus summaries; freshness is stamped per
   run (`.okf/last-index.json`).
2. **Trustable bundle.** OKF 0.2 lifecycle frontmatter on every concept;
   the findings ledger governs normative content — nothing becomes
   settled truth without human acceptance.
3. **Searchable, anchored.** Full-text search + progressive reading
   (`okf read --depth`); claims cite source locations.

## Non-goals (owner-declared)

- Hooks / session / token capture (D5).
- Project memory store (back-burnered; a future memex layer may return
  as a **consumer** of okf — never a plane inside it).

## Sequel direction

Tree-sitter understanding moves from per-module structure to **semantic
knowledge**: business rules, encapsulated logic, patterns, and policies —
location-anchored, searchable (see `docs/specs/okf-only-engine/`).

# Relationships

- Supersedes [One engine via strangler fig](/decisions/one-engine-strangler.md)
  (deprecated).
- [okf-kit — the knowledge plane](/systems/okf-kit.md) is the engine.
- The exchange contract it implements:
  [The wiki contract](/domain/wiki-contract.md).

# Evidence

- `docs/specs/okf-only-engine/feature.md` + `impact-okf-only.md` — the
  analyzed direction (11 effects dispositioned).
- `docs/specs/okf-only-engine/design.md` + `plan.md` — the removal wave
  (amputate → port stamp/ledger → retarget skills → rewrite docs).
- `engine/okf/pyproject.toml` — okf standalone (pyyaml + pydantic only).
