---
type: Decision
status: deprecated
created: 2026-10-07
updated: 2026-10-08
title: Okf-only engine (accepted 2026-10-07)
description: "HISTORICAL, superseded by the TypeScript port. ACCEPTED. The engine is okf alone; engine/memex and engine/core were removed. A future memex is a consumer layer on top, never a plane inside."
sources: [{ id: src, resource: specs/archive/specs/okf-only-engine/design.md }]
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

- `specs/okf-only-engine/` — feature, impact, design, plan, and the
  removal wave's ledger.

# Implementation context — 2026-10-10

This decision describes the October 7 removal wave, not the current runtime.
Both planes now live in the [TypeScript harness](/systems/treadle.md), following
[the port decision](/decisions/port-to-typescript.md). The original decision and
its acceptance are retained above. Its source wave is now under
`specs/archive/specs/okf-only-engine/`.
