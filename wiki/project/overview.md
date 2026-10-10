---
title: "Project overview and reading path"
type: Project
description: "Start here for the current harness, work records, and retrospective history."
status: stable
created: 2026-10-10
updated: 2026-10-10
sources:
  - {"id": "s1", "resource": "AGENTS.md"}
  - {"id": "s2", "resource": "treadle/package.json"}
  - {"id": "s3", "resource": "treadle/packages/cli/src/harness/where.ts"}
---

# Start here

The project builds a spec-driven development harness. Knowledge comes first;
work then proceeds through bounded analysis, planning, implementation, and review.
The active runtime is strict TypeScript. Source: `AGENTS.md:1`.

Read [architecture](/systems/sdd-harness-architecture.md), then
[the active engine](/systems/treadle.md) and [the wiki contract](/domain/wiki-contract.md).
Find work through [initiatives](/initiatives/index.md).
Find recorded lessons through [retrospectives](/retrospectives/index.md).

# Commands

Run from `treadle/` after dependency installation:

```bash
corepack enable
pnpm install
pnpm check
pnpm corpus:check
pnpm brand:check
pnpm exec tsx packages/cli/src/main.ts do where ..
pnpm exec tsx packages/cli/src/main.ts know search ../wiki "retrospective"
```

The command definitions are in `treadle/package.json:9`.
Work discovery scans `docs/specs/`; source:
`treadle/packages/cli/src/harness/where.ts:109`.
The wiki also links draft prose analyses that have no executable pack yet.

# What is known and what is open

Current controls are described in [engineering controls](/project/engineering-controls.md).
Known runtime and evidence gaps remain in [open work](/project/open-work.md).
The [documentation map](/project/documentation-map.md) identifies each authority.
The [lifecycle draft](/project/documentation-lifecycle.md) proposes future maintenance.
