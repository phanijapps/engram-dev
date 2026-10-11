---
title: "SDD harness architecture"
type: System
description: "Current package boundaries, knowledge flow, work admission, and runtime limits."
status: stable
created: 2026-10-10
updated: 2026-10-10
sources:
  - { "id": "s1", "resource": "treadle/pnpm-workspace.yaml" }
  - { "id": "s2", "resource": "treadle/packages/core/src/specpack/derive.ts" }
  - {
      "id": "s3",
      "resource": "treadle/packages/core/src/specpack/admission.ts",
    }
  - { "id": "s4", "resource": "treadle/packages/core/src/specpack/record.ts" }
  - { "id": "s5", "resource": "treadle/packages/cli/src/harness/where.ts" }
  - { "id": "s6", "resource": "treadle/packages/knowledge/src/parse.ts" }
  - { id: service, resource: treadle/packages/cli/src/serve/runtime.ts }
  - { id: projects, resource: treadle/packages/web/src/project-server.ts }
  - { id: context, resource: treadle/packages/cli/src/harness/context.ts }
  - {
      id: owner,
      resource: specs/documentation-consolidation/owner-decision-revision.md,
    }
---

# Purpose and flow

The harness connects repository knowledge with evidence-based work.
The active runtime is the TypeScript workspace in `treadle/`.
Package membership is declared in `treadle/pnpm-workspace.yaml:1`.

```text
repository → wiki sources → know search/read → bounded analysis
analysis → design/task plan → specpack admission → evidence → review
observed session → wiki retrospective → proposed lessons
historical specpack → factual initiative snapshot
```

The owner rejected retrospective reconstruction from historical specpacks.
Source: `specs/documentation-consolidation/owner-decision-revision.md:1`, D-3.
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
The CLI discovers packs under `specs/`, including registered worktrees.
Source: `treadle/packages/cli/src/harness/where.ts:109`.

# Knowledge limits

The bundle enumerates Markdown and parses its frontmatter.
It does not reconstruct a code graph or execute spec tasks.
Source: `treadle/packages/knowledge/src/parse.ts:123`.
External code indexing remains delegated. Current freshness limitations are
[documented separately](/domain/pattern-content-hash-change-detection.md).

# History

The prior Python architecture explanation is preserved at
`specs/archive/documentation/2026-10-10/wiki/systems/sdd-harness-architecture.md`.
The [TypeScript decision](/decisions/port-to-typescript.md) explains the transition.

# Shared background service — 2026-10-10

`start serve` detaches one service per operating-system user; `stop serve`
requests authenticated shutdown. Startup/recovery publishes owned directories
atomically and never expires a live lock. Project enrollment persists separately
from the process descriptor. Source: `treadle/packages/cli/src/serve/runtime.ts`
and `treadle/packages/cli/src/serve/projects.ts`.

```text
project install / session event
    → ensure shared service → enroll explicit event workspace
    → read-only context → choose new or continuing spec
shared browser → project → wiki/search + spec library → existing owner gates
stop serve → next session event → ensure + reconnect
session exit → service remains running
```

The browser lists enrolled roots and uses project-qualified library/wiki routes;
equal spec slugs in different roots stay separate. Missing/moved roots are
reported unavailable. It does not discover or enroll unrelated worktrees.
Source: `treadle/packages/web/src/project-server.ts`.

Context reports core workflow gates, doing work, evidence, refused packs and
non-admitted candidates. It does not grant approval or advance task state.
Freshness still has Python-only/HEAD limits; dirty TypeScript and Markdown
require direct inspection. Source: `treadle/packages/cli/src/harness/context.ts`.
Native artifacts and compatibility wiring come from one authoritative tree;
activation/trust remains a host action. Actual native OS/host release coverage
is tracked in `specs/background-harness/`, not inferred from a CI declaration.
