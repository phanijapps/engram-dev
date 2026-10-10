---
type: Decision
status: stable
created: 2026-10-07
updated: 2026-10-08
title: Okf-only engine (accepted 2026-10-07)
description: "ACCEPTED. The engine is okf alone; engine/memex and engine/core were removed. A future memex is a consumer layer on top, never a plane inside."
sources: [{ id: src, resource: docs/archive/specs/okf-only-engine/design.md }]
tags: [decision, architecture, accepted]
---

# Decision

The engine is **okf only** (accepted 2026-10-07, finding
`golden-path-79bba45a`). The memory plane and the control plane were
removed; the workspace builds okf alone.

# Consequences

- One CLI (`okf`) owns init, indexing, validation, search, findings.
- The trust machinery (stamp, ledger) lives in okf, file formats unchanged.
- Hooks/session capture are a declared non-goal (see
  [the policy](/domain/policy-no-session-capture-in-engine.md)).

# Evidence

- `docs/specs/okf-only-engine/` — feature, impact, design, plan, and the
  removal wave's ledger.
