---
type: CodeSummary
title: repository
description: 'Generated repository code summary for repository. Top dependencies:
  ../events.js, ../refusals.js, ../stages.js, ..events, ..specpack. Top dependents:
  engine/loom/src/loom_kit/cli.py, engine/loom/src/loom_kit/machine.py, engine/loom/src/loom_kit/specpack.py,
  engine/loom/src/loom_kit/spine.py, engine/loom/src/loom_kit/web/library.py.'
tags:
- code
- summary
- impact
- repository
- depends-on
- used-by
summary_level: repository
managed_by: okf-code
created: 2026-10-08T00:43:25Z
generated:
  by: process:okf-code
  at: '2026-10-10T00:37:58Z'
status: stable
---
<!-- okf-code:start -->
# Overview

Generated repository summary for `repository`. Purpose: provide a low-token entry point for code search and impact analysis before opening file-level concepts.

# Key modules

- [treadle/packages/core/src/specpack/model.ts](/code/treadle/packages/core/src/specpack/model.ts.md) - model module; depends on 0; used by 11; high-signal symbols: `Question`, `Decision`, `Task`
- [engine/loom/src/loom_kit/cli.py](/code/engine/loom/src/loom_kit/cli.py.md) - module; depends on 7; used by 0; high-signal symbols: `_mode`, `_specpack_path`, `cmd_check`
- [engine/loom/src/loom_kit/spine.py](/code/engine/loom/src/loom_kit/spine.py.md) - model module; depends on 1; used by 6; high-signal symbols: `LoomError`, `_schema`, `MiniValidator`
- [treadle/packages/core/src/refusals.ts](/code/treadle/packages/core/src/refusals.ts.md) - module; depends on 0; used by 6; high-signal symbols: `REFUSAL_CODES`, `refuse`
- [treadle/packages/core/src/specpack/derive.ts](/code/treadle/packages/core/src/specpack/derive.ts.md) - module; depends on 2; used by 4; high-signal symbols: `PACK_COMPLETE`, `ClosureGaps`, `closureGaps`
- [engine/loom/src/loom_kit/specpack.py](/code/engine/loom/src/loom_kit/specpack.py.md) - module; depends on 1; used by 4; high-signal symbols: `derive_deliverable`, `_normalize`, `_emit`
- [engine/loom/src/loom_kit/web/server.py](/code/engine/loom/src/loom_kit/web/server.py.md) - model module; depends on 3; used by 2; high-signal symbols: `_Denied`, `_admit`, `interview_complete`
- [treadle/packages/knowledge/src/parse.ts](/code/treadle/packages/knowledge/src/parse.ts.md) - module; depends on 0; used by 5; high-signal symbols: `YAML_OPTS`, `DELIMITER`, `RESERVED`
- [engine/loom/src/loom_kit/web/library.py](/code/engine/loom/src/loom_kit/web/library.py.md) - model module; depends on 4; used by 0; high-signal symbols: `list_specs`, `_Handler`, `log_message`
- [treadle/packages/core/src/specpack/loader.ts](/code/treadle/packages/core/src/specpack/loader.ts.md) - module; depends on 4; used by 0; high-signal symbols: `KNOWN_FORMATS`, `loadPack`, `found`
- [treadle/packages/core/src/specpack/next.ts](/code/treadle/packages/core/src/specpack/next.ts.md) - module; depends on 4; used by 0; high-signal symbols: `nextTask`, `tasks`, `done`
- [engine/loom/src/loom_kit/__init__.py](/code/engine/loom/src/loom_kit/__init__.py.md) - module; depends on 0; used by 3
- [engine/loom/src/loom_kit/events.py](/code/engine/loom/src/loom_kit/events.py.md) - module; depends on 0; used by 3; high-signal symbols: `_now`, `event`, `validate_event`
- [engine/loom/src/loom_kit/machine.py](/code/engine/loom/src/loom_kit/machine.py.md) - module; depends on 2; used by 1; high-signal symbols: `_digest`, `_prereq_states`, `_satisfied`
- [treadle/conformance/generators/gen_corpus.py](/code/treadle/conformance/generators/gen_corpus.py.md) - module; depends on 3; used by 0; high-signal symbols: `_norm`, `J`, `emit_bytes`
- [treadle/packages/core/src/specpack/close.ts](/code/treadle/packages/core/src/specpack/close.ts.md) - module; depends on 3; used by 0; high-signal symbols: `CloseResult`, `closePack`, `problems`
- [treadle/packages/core/src/specpack/save.ts](/code/treadle/packages/core/src/specpack/save.ts.md) - module; depends on 3; used by 0; high-signal symbols: `savePack`, `bytes`, `tmp`
- [treadle/packages/knowledge/src/links.ts](/code/treadle/packages/knowledge/src/links.ts.md) - module; depends on 1; used by 2; high-signal symbols: `LINK_RE`, `SEGMENT_RE`, `RESERVED`
- [treadle/packages/core/src/specpack/admission.ts](/code/treadle/packages/core/src/specpack/admission.ts.md) - module; depends on 2; used by 0; high-signal symbols: `PACK_COMPLETE`, `mutable`, `AnswerStamp`
- [treadle/packages/core/src/specpack/alignment.ts](/code/treadle/packages/core/src/specpack/alignment.ts.md) - module; depends on 2; used by 0; high-signal symbols: `Alignment`, `alignment`, `d`
- 68 modules omitted from compact summary.

# Impact map

| Module | Depends | Used by | Relationship signals |
|---|---:|---:|---|
| [treadle/packages/core/src/specpack/model.ts](/code/treadle/packages/core/src/specpack/model.ts.md) | 0 | 11 | treadle/packages/core/src/specpack/admission.ts, treadle/packages/core/src/specpack/alignment.ts, treadle/packages/core/src/specpack/close.ts |
| [engine/loom/src/loom_kit/cli.py](/code/engine/loom/src/loom_kit/cli.py.md) | 7 | 0 | .__version__, .machine, .specpack |
| [engine/loom/src/loom_kit/spine.py](/code/engine/loom/src/loom_kit/spine.py.md) | 1 | 6 | .PROFILES, engine/loom/src/loom_kit/cli.py, engine/loom/src/loom_kit/machine.py, engine/loom/src/loom_kit/specpack.py |
| [treadle/packages/core/src/refusals.ts](/code/treadle/packages/core/src/refusals.ts.md) | 0 | 6 | treadle/packages/core/src/specpack/admission.ts, treadle/packages/core/src/specpack/alignment.ts, treadle/packages/core/src/specpack/close.ts |
| [treadle/packages/core/src/specpack/derive.ts](/code/treadle/packages/core/src/specpack/derive.ts.md) | 2 | 4 | ../stages.js, ./model.js, treadle/packages/core/src/specpack/close.ts, treadle/packages/core/src/specpack/loader.ts, treadle/packages/core/src/specpack/next.ts |
| [engine/loom/src/loom_kit/specpack.py](/code/engine/loom/src/loom_kit/specpack.py.md) | 1 | 4 | .spine.LoomError, engine/loom/src/loom_kit/cli.py, engine/loom/src/loom_kit/web/library.py, engine/loom/src/loom_kit/web/server.py |
| [engine/loom/src/loom_kit/web/server.py](/code/engine/loom/src/loom_kit/web/server.py.md) | 3 | 2 | ..events, ..specpack, ..spine.LoomError, engine/loom/src/loom_kit/cli.py, engine/loom/src/loom_kit/web/library.py |
| [treadle/packages/knowledge/src/parse.ts](/code/treadle/packages/knowledge/src/parse.ts.md) | 0 | 5 | treadle/packages/knowledge/src/fingerprints.ts, treadle/packages/knowledge/src/links.ts, treadle/packages/knowledge/src/read.ts |
| [engine/loom/src/loom_kit/web/library.py](/code/engine/loom/src/loom_kit/web/library.py.md) | 4 | 0 | ..events, ..specpack, ..spine.LoomError |
| [treadle/packages/core/src/specpack/loader.ts](/code/treadle/packages/core/src/specpack/loader.ts.md) | 4 | 0 | ../refusals.js, ./derive.js, ./model.js |

25 impact candidates omitted from compact summary.

# Impact notes

Use this summary to choose a target module, then read that module at depth 0 or depth 1 for dependency and dependent context.
<!-- okf-code:end -->
