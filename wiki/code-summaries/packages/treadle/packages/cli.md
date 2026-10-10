---
type: CodeSummary
title: repository/treadle/packages/cli
description: 'Generated package code summary for repository/treadle/packages/cli.
  Top dependencies: ./commands/do.js, ./commands/know.js. Top dependents: treadle/packages/cli/src/main.ts.'
tags:
- code
- summary
- impact
- package
- depends-on
- used-by
summary_level: package
managed_by: okf-code
created: 2026-10-09T21:44:45Z
generated:
  by: process:okf-code
  at: '2026-10-10T02:02:41Z'
status: stable
package: treadle/packages/cli
---
<!-- okf-code:start -->
# Overview

Generated package summary for `repository/treadle/packages/cli`. Purpose: provide a low-token entry point for code search and impact analysis before opening file-level concepts.

# Key modules

- [treadle/packages/cli/src/main.ts](/code/treadle/packages/cli/src/main.ts.md) - module; depends on 2; used by 0; high-signal symbols: `buildProgram`, `p`, `doCmd`
- [treadle/packages/cli/src/commands/do.ts](/code/treadle/packages/cli/src/commands/do.ts.md) - module; depends on 0; used by 1; high-signal symbols: `now`, `Loaded`, `load`
- [treadle/packages/cli/src/commands/know.ts](/code/treadle/packages/cli/src/commands/know.ts.md) - module; depends on 0; used by 1; high-signal symbols: `registerKnow`, `idx`, `hits`

# Impact map

| Module | Depends | Used by | Relationship signals |
|---|---:|---:|---|
| [treadle/packages/cli/src/main.ts](/code/treadle/packages/cli/src/main.ts.md) | 2 | 0 | ./commands/do.js, ./commands/know.js |
| [treadle/packages/cli/src/commands/do.ts](/code/treadle/packages/cli/src/commands/do.ts.md) | 0 | 1 | treadle/packages/cli/src/main.ts |
| [treadle/packages/cli/src/commands/know.ts](/code/treadle/packages/cli/src/commands/know.ts.md) | 0 | 1 | treadle/packages/cli/src/main.ts |

# Impact notes

Use this summary to choose a target module, then read that module at depth 0 or depth 1 for dependency and dependent context.
<!-- okf-code:end -->
