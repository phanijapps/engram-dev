---
type: CodeSummary
title: repository/treadle
description: 'Generated area code summary for repository/treadle. Top dependencies:
  ../../packages/core/src/index.js, ../../packages/knowledge/src/index.js, ../events.js,
  ../refusals.js, ../stages.js. Top dependents: treadle/conformance/generators/gen_corpus.ts,
  treadle/packages/cli/src/main.ts, treadle/packages/core/src/specpack/admission.ts,
  treadle/packages/core/src/specpack/alignment.ts, treadle/packages/core/src/specpack/close.ts.'
tags:
- code
- summary
- impact
- area
- depends-on
- used-by
summary_level: area
managed_by: okf-code
created: 2026-10-09T21:44:45Z
generated:
  by: process:okf-code
  at: '2026-10-10T02:00:52Z'
status: stable
area: treadle
---
<!-- okf-code:start -->
# Overview

Generated area summary for `repository/treadle`. Purpose: provide a low-token entry point for code search and impact analysis before opening file-level concepts.

# Key modules

- [treadle/packages/core/src/specpack/model.ts](/code/treadle/packages/core/src/specpack/model.ts.md) - model module; depends on 0; used by 11; high-signal symbols: `Question`, `Decision`, `Task`
- [treadle/packages/core/src/refusals.ts](/code/treadle/packages/core/src/refusals.ts.md) - module; depends on 0; used by 6; high-signal symbols: `REFUSAL_CODES`, `refuse`
- [treadle/packages/core/src/specpack/derive.ts](/code/treadle/packages/core/src/specpack/derive.ts.md) - module; depends on 2; used by 4; high-signal symbols: `PACK_COMPLETE`, `ClosureGaps`, `closureGaps`
- [treadle/packages/knowledge/src/parse.ts](/code/treadle/packages/knowledge/src/parse.ts.md) - module; depends on 0; used by 5; high-signal symbols: `YAML_OPTS`, `DELIMITER`, `RESERVED`
- [treadle/packages/core/src/specpack/loader.ts](/code/treadle/packages/core/src/specpack/loader.ts.md) - module; depends on 4; used by 0; high-signal symbols: `KNOWN_FORMATS`, `loadPack`, `found`
- [treadle/packages/core/src/specpack/next.ts](/code/treadle/packages/core/src/specpack/next.ts.md) - module; depends on 4; used by 0; high-signal symbols: `nextTask`, `tasks`, `done`
- [treadle/conformance/generators/gen_corpus.py](/code/treadle/conformance/generators/gen_corpus.py.md) - module; depends on 3; used by 0; high-signal symbols: `_norm`, `J`, `emit_bytes`
- [treadle/packages/core/src/specpack/close.ts](/code/treadle/packages/core/src/specpack/close.ts.md) - module; depends on 3; used by 0; high-signal symbols: `CloseResult`, `closePack`, `problems`
- [treadle/packages/core/src/specpack/save.ts](/code/treadle/packages/core/src/specpack/save.ts.md) - module; depends on 3; used by 0; high-signal symbols: `savePack`, `bytes`, `tmp`
- [treadle/packages/knowledge/src/links.ts](/code/treadle/packages/knowledge/src/links.ts.md) - module; depends on 1; used by 2; high-signal symbols: `LINK_RE`, `SEGMENT_RE`, `RESERVED`
- [treadle/conformance/generators/gen_corpus.ts](/code/treadle/conformance/generators/gen_corpus.ts.md) - model module; depends on 2; used by 0; high-signal symbols: `FIXED`, `__dirname`, `REPO`
- [treadle/packages/cli/src/main.ts](/code/treadle/packages/cli/src/main.ts.md) - module; depends on 2; used by 0; high-signal symbols: `buildProgram`, `p`, `doCmd`
- [treadle/packages/core/src/specpack/admission.ts](/code/treadle/packages/core/src/specpack/admission.ts.md) - module; depends on 2; used by 0; high-signal symbols: `PACK_COMPLETE`, `mutable`, `AnswerStamp`
- [treadle/packages/core/src/specpack/alignment.ts](/code/treadle/packages/core/src/specpack/alignment.ts.md) - module; depends on 2; used by 0; high-signal symbols: `Alignment`, `alignment`, `d`
- [treadle/packages/core/src/specpack/emit.ts](/code/treadle/packages/core/src/specpack/emit.ts.md) - module; depends on 1; used by 1; high-signal symbols: `CANONICAL_ORDER`, `isObj`, `emit`
- [treadle/packages/core/src/specpack/normalize.ts](/code/treadle/packages/core/src/specpack/normalize.ts.md) - module; depends on 1; used by 1; high-signal symbols: `str`, `isObj`, `normalize`
- [treadle/packages/core/src/specpack/pins.ts](/code/treadle/packages/core/src/specpack/pins.ts.md) - module; depends on 1; used by 1; high-signal symbols: `Drift`, `pinOrVerify`, `t`
- [treadle/packages/core/src/specpack/record.ts](/code/treadle/packages/core/src/specpack/record.ts.md) - module; depends on 2; used by 0; high-signal symbols: `STALL_LIMIT`, `ExecutedCommand`, `RecordResult`
- [treadle/packages/knowledge/src/read.ts](/code/treadle/packages/knowledge/src/read.ts.md) - model module; depends on 2; used by 0; high-signal symbols: `CHARS_PER_TOKEN`, `ConceptNotFound`, `constructor`
- [treadle/packages/knowledge/src/validate.ts](/code/treadle/packages/knowledge/src/validate.ts.md) - module; depends on 2; used by 0; high-signal symbols: `KNOWN_KEYS`, `STATUS_VALUES`, `RECOMMENDED`
- 29 modules omitted from compact summary.

# Impact map

| Module | Depends | Used by | Relationship signals |
|---|---:|---:|---|
| [treadle/packages/core/src/specpack/model.ts](/code/treadle/packages/core/src/specpack/model.ts.md) | 0 | 11 | treadle/packages/core/src/specpack/admission.ts, treadle/packages/core/src/specpack/alignment.ts, treadle/packages/core/src/specpack/close.ts |
| [treadle/packages/core/src/refusals.ts](/code/treadle/packages/core/src/refusals.ts.md) | 0 | 6 | treadle/packages/core/src/specpack/admission.ts, treadle/packages/core/src/specpack/alignment.ts, treadle/packages/core/src/specpack/close.ts |
| [treadle/packages/core/src/specpack/derive.ts](/code/treadle/packages/core/src/specpack/derive.ts.md) | 2 | 4 | ../stages.js, ./model.js, treadle/packages/core/src/specpack/close.ts, treadle/packages/core/src/specpack/loader.ts, treadle/packages/core/src/specpack/next.ts |
| [treadle/packages/knowledge/src/parse.ts](/code/treadle/packages/knowledge/src/parse.ts.md) | 0 | 5 | treadle/packages/knowledge/src/fingerprints.ts, treadle/packages/knowledge/src/links.ts, treadle/packages/knowledge/src/read.ts |
| [treadle/packages/core/src/specpack/loader.ts](/code/treadle/packages/core/src/specpack/loader.ts.md) | 4 | 0 | ../refusals.js, ./derive.js, ./model.js |
| [treadle/packages/core/src/specpack/next.ts](/code/treadle/packages/core/src/specpack/next.ts.md) | 4 | 0 | ../refusals.js, ./derive.js, ./model.js |
| [treadle/conformance/generators/gen_corpus.py](/code/treadle/conformance/generators/gen_corpus.py.md) | 3 | 0 | loom_kit.events, loom_kit.specpack, loom_kit.spine.LoomError |
| [treadle/packages/core/src/specpack/close.ts](/code/treadle/packages/core/src/specpack/close.ts.md) | 3 | 0 | ../refusals.js, ./derive.js, ./model.js |
| [treadle/packages/core/src/specpack/save.ts](/code/treadle/packages/core/src/specpack/save.ts.md) | 3 | 0 | ./derive.js, ./emit.js, ./model.js |
| [treadle/packages/knowledge/src/links.ts](/code/treadle/packages/knowledge/src/links.ts.md) | 1 | 2 | ./parse.js, treadle/packages/knowledge/src/read.ts, treadle/packages/knowledge/src/validate.ts |

19 impact candidates omitted from compact summary.

# Impact notes

Use this summary to choose a target module, then read that module at depth 0 or depth 1 for dependency and dependent context.
<!-- okf-code:end -->
