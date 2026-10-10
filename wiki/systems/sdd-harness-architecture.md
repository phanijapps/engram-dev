---
title: "SDD harness architecture"
type: System
description: "Current package boundaries, knowledge flow, work admission, and runtime limits."
status: stable
created: 2026-10-10
updated: 2026-10-10
sources:
  - {"id": "s1", "resource": "treadle/pnpm-workspace.yaml"}
  - {"id": "s2", "resource": "treadle/packages/core/src/specpack/derive.ts"}
  - {"id": "s3", "resource": "treadle/packages/core/src/specpack/admission.ts"}
  - {"id": "s4", "resource": "treadle/packages/core/src/specpack/record.ts"}
  - {"id": "s5", "resource": "treadle/packages/cli/src/harness/where.ts"}
  - {"id": "s6", "resource": "treadle/packages/knowledge/src/parse.ts"}
---

# Purpose and flow

The harness connects repository knowledge with evidence-based work.
The active runtime is the TypeScript workspace in `treadle/`.
Package membership is declared in `treadle/pnpm-workspace.yaml:1`.

```text
repository → wiki sources → know search/read → bounded analysis
analysis → design/task plan → specpack admission → evidence → review
completed initiative → dated wiki retrospective → proposed lessons
```

The last arrow is the documentation arrangement of this repair.
Automatic retrospective capture is not implemented.
See [the lifecycle proposal](/project/documentation-lifecycle.md).

# Boundaries

`core` owns specpack normalization, stages, admission, evidence, and drift pins.
`knowledge` owns OKF concepts, links, validation, search, findings, and stamps.
`web` supplies the localhost room and library; `cli` exposes both planes.
`conformance` tests the golden corpus; `brand` holds naming configuration.
See [the active engine](/systems/treadle.md) for package source references.

Answers and approval require human-shaped claims.
Task evidence can identify an agent or human. These are caller claims,
not authentication. Sources: `treadle/packages/core/src/specpack/admission.ts:17`
and `treadle/packages/core/src/specpack/record.ts:19`.

Stages derive from recorded state. They are not manually maintained wiki fields.
Source: `treadle/packages/core/src/specpack/derive.ts:30`.
The CLI discovers packs under `docs/specs/`, including registered worktrees.
Source: `treadle/packages/cli/src/harness/where.ts:109`.

# Knowledge limits

The bundle enumerates Markdown and parses its frontmatter.
It does not reconstruct a code graph or execute spec tasks.
Source: `treadle/packages/knowledge/src/parse.ts:123`.
External code indexing remains delegated. Current freshness limitations are
[documented separately](/domain/pattern-content-hash-change-detection.md).

# History

The prior Python architecture explanation is preserved at
`docs/archive/documentation/2026-10-10/wiki/systems/sdd-harness-architecture.md`.
The [TypeScript decision](/decisions/port-to-typescript.md) explains the transition.
