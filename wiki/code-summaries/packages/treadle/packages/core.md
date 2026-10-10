---
type: CodeSummary
title: repository/treadle/packages/core
description: 'Generated package code summary for repository/treadle/packages/core.
  Top dependencies: ../events.js, ../refusals.js, ../stages.js, ./derive.js, ./emit.js.
  Top dependents: treadle/conformance/generators/gen_corpus.ts, treadle/packages/core/src/specpack/admission.ts,
  treadle/packages/core/src/specpack/alignment.ts, treadle/packages/core/src/specpack/close.ts,
  treadle/packages/core/src/specpack/derive.ts.'
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
package: treadle/packages/core
---
<!-- okf-code:start -->
# Overview

Generated package summary for `repository/treadle/packages/core`. Purpose: provide a low-token entry point for code search and impact analysis before opening file-level concepts.

# Key modules

- [treadle/packages/core/src/specpack/model.ts](/code/treadle/packages/core/src/specpack/model.ts.md) - model module; depends on 0; used by 11; high-signal symbols: `Question`, `Decision`, `Task`
- [treadle/packages/core/src/refusals.ts](/code/treadle/packages/core/src/refusals.ts.md) - module; depends on 0; used by 6; high-signal symbols: `REFUSAL_CODES`, `refuse`
- [treadle/packages/core/src/specpack/derive.ts](/code/treadle/packages/core/src/specpack/derive.ts.md) - module; depends on 2; used by 4; high-signal symbols: `PACK_COMPLETE`, `ClosureGaps`, `closureGaps`
- [treadle/packages/core/src/specpack/loader.ts](/code/treadle/packages/core/src/specpack/loader.ts.md) - module; depends on 4; used by 0; high-signal symbols: `KNOWN_FORMATS`, `loadPack`, `found`
- [treadle/packages/core/src/specpack/next.ts](/code/treadle/packages/core/src/specpack/next.ts.md) - module; depends on 4; used by 0; high-signal symbols: `nextTask`, `tasks`, `done`
- [treadle/packages/core/src/specpack/close.ts](/code/treadle/packages/core/src/specpack/close.ts.md) - module; depends on 3; used by 0; high-signal symbols: `CloseResult`, `closePack`, `problems`
- [treadle/packages/core/src/specpack/save.ts](/code/treadle/packages/core/src/specpack/save.ts.md) - module; depends on 3; used by 0; high-signal symbols: `savePack`, `bytes`, `tmp`
- [treadle/packages/core/src/specpack/admission.ts](/code/treadle/packages/core/src/specpack/admission.ts.md) - module; depends on 2; used by 0; high-signal symbols: `PACK_COMPLETE`, `mutable`, `AnswerStamp`
- [treadle/packages/core/src/specpack/alignment.ts](/code/treadle/packages/core/src/specpack/alignment.ts.md) - module; depends on 2; used by 0; high-signal symbols: `Alignment`, `alignment`, `d`
- [treadle/packages/core/src/specpack/emit.ts](/code/treadle/packages/core/src/specpack/emit.ts.md) - module; depends on 1; used by 1; high-signal symbols: `CANONICAL_ORDER`, `isObj`, `emit`
- [treadle/packages/core/src/specpack/normalize.ts](/code/treadle/packages/core/src/specpack/normalize.ts.md) - module; depends on 1; used by 1; high-signal symbols: `str`, `isObj`, `normalize`
- [treadle/packages/core/src/specpack/pins.ts](/code/treadle/packages/core/src/specpack/pins.ts.md) - module; depends on 1; used by 1; high-signal symbols: `Drift`, `pinOrVerify`, `t`
- [treadle/packages/core/src/specpack/record.ts](/code/treadle/packages/core/src/specpack/record.ts.md) - module; depends on 2; used by 0; high-signal symbols: `STALL_LIMIT`, `ExecutedCommand`, `RecordResult`
- [treadle/packages/core/src/events.ts](/code/treadle/packages/core/src/events.ts.md) - module; depends on 0; used by 1; high-signal symbols: `EVENT_KINDS`, `BaseEvent`, `QuestionEvent`
- [treadle/packages/core/src/index.ts](/code/treadle/packages/core/src/index.ts.md) - entry-point module; depends on 0; used by 1
- [treadle/packages/core/src/specpack/events.ts](/code/treadle/packages/core/src/specpack/events.ts.md) - module; depends on 1; used by 0; high-signal symbols: `EVENT_FORMAT`, `SCOPED`, `JournalEvent`
- [treadle/packages/core/src/stages.ts](/code/treadle/packages/core/src/stages.ts.md) - module; depends on 0; used by 1; high-signal symbols: `DELIVERABLE_STAGES`, `STAGE_WORDS`, `stageWord`
- [treadle/packages/core/src/assert.ts](/code/treadle/packages/core/src/assert.ts.md) - module; depends on 0; used by 0; high-signal symbols: `assertNever`
- [treadle/packages/core/src/ids.ts](/code/treadle/packages/core/src/ids.ts.md) - module; depends on 0; used by 0; high-signal symbols: `brand`, `ID_RE`, `FAMILY`
- [treadle/packages/core/src/specpack/index.ts](/code/treadle/packages/core/src/specpack/index.ts.md) - entry-point module; depends on 0; used by 0

# Impact map

| Module | Depends | Used by | Relationship signals |
|---|---:|---:|---|
| [treadle/packages/core/src/specpack/model.ts](/code/treadle/packages/core/src/specpack/model.ts.md) | 0 | 11 | treadle/packages/core/src/specpack/admission.ts, treadle/packages/core/src/specpack/alignment.ts, treadle/packages/core/src/specpack/close.ts |
| [treadle/packages/core/src/refusals.ts](/code/treadle/packages/core/src/refusals.ts.md) | 0 | 6 | treadle/packages/core/src/specpack/admission.ts, treadle/packages/core/src/specpack/alignment.ts, treadle/packages/core/src/specpack/close.ts |
| [treadle/packages/core/src/specpack/derive.ts](/code/treadle/packages/core/src/specpack/derive.ts.md) | 2 | 4 | ../stages.js, ./model.js, treadle/packages/core/src/specpack/close.ts, treadle/packages/core/src/specpack/loader.ts, treadle/packages/core/src/specpack/next.ts |
| [treadle/packages/core/src/specpack/loader.ts](/code/treadle/packages/core/src/specpack/loader.ts.md) | 4 | 0 | ../refusals.js, ./derive.js, ./model.js |
| [treadle/packages/core/src/specpack/next.ts](/code/treadle/packages/core/src/specpack/next.ts.md) | 4 | 0 | ../refusals.js, ./derive.js, ./model.js |
| [treadle/packages/core/src/specpack/close.ts](/code/treadle/packages/core/src/specpack/close.ts.md) | 3 | 0 | ../refusals.js, ./derive.js, ./model.js |
| [treadle/packages/core/src/specpack/save.ts](/code/treadle/packages/core/src/specpack/save.ts.md) | 3 | 0 | ./derive.js, ./emit.js, ./model.js |
| [treadle/packages/core/src/specpack/admission.ts](/code/treadle/packages/core/src/specpack/admission.ts.md) | 2 | 0 | ../refusals.js, ./model.js |
| [treadle/packages/core/src/specpack/alignment.ts](/code/treadle/packages/core/src/specpack/alignment.ts.md) | 2 | 0 | ../refusals.js, ./model.js |
| [treadle/packages/core/src/specpack/emit.ts](/code/treadle/packages/core/src/specpack/emit.ts.md) | 1 | 1 | ./model.js, treadle/packages/core/src/specpack/save.ts |

7 impact candidates omitted from compact summary.

# Impact notes

Use this summary to choose a target module, then read that module at depth 0 or depth 1 for dependency and dependent context.
<!-- okf-code:end -->
