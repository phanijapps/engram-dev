---
type: CodeModule
title: engine/memex/memex/cli.py
description: Generated code map for engine/memex/memex/cli.py.
resource: engine/memex/memex/cli.py
tags:
- code
- python
source_path: engine/memex/memex/cli.py
language: python
source_hash: 4e7ee95db6fc0df6082aedb76a9b79d63606ffd3cb876bc121fb5e0444e99a6f
managed_by: okf-code
generated_profile: compact
package: engine/memex
---
<!-- okf-code:start -->
# Overview

Generated CodeModule concept for `engine/memex/memex/cli.py`. Purpose: engine/memex/memex/cli.py is a `python` module in package `engine/memex`. Role: module. high-signal symbols: `_build_parser`, `_csv`, `_load_turns`, `_make_memex`, `_emit`. Dependency context: 0 local dependencies and 0 local dependents are linked when resolvable. Impact: changes here may affect linked dependents, imported dependencies, and callers identified by generated reverse edges. This page is syntax-derived for code finding, code-logic search, and impact-analysis groundwork.

# Symbols

| Kind | Name | Lines |
|---|---|---|
| function | `_build_parser` | 38-167 |
| function | `_csv` | 170-171 |
| function | `_load_turns` | 174-190 |
| function | `_make_memex` | 193-195 |
| function | `_emit` | 198-199 |
| function | `_run` | 202-347 |
| function | `_info` | 350-363 |
| function | `_project_arguments` | 366-380 |
| function | `main` | 383-390 |

# Relationships

- `__future__.annotations`
- `argparse`
- `collections.abc.Sequence`
- `json`
- `memex.Memex`
- `memex.__version__`
- `memex.application.compiler.build_injection`
- `memex.application.dto.to_jsonable`
- `memex.application.verify.verify`
- `memex.domain.errors.MemexError`
- `memex.domain.models.ConsolidateInput`
- `memex.domain.models.IngestTranscriptInput`
- `memex.domain.models.TaskRecallInput`
- `memex.domain.models.TurnStreamEntry`
- `memex.domain.models.WriteInput`
- `memex.domain.operations.summary`
- `memex.infrastructure.config.ConfigLoader`
- `memex.infrastructure.harness.transcripts.HARNESSES`
- `memex.infrastructure.harness.transcripts.parse_transcript`
- `memex.infrastructure.harness.transcripts.read_transcript_turns`
- 7 imports omitted from compact profile.

# Impact notes

Impact candidates on this page are syntax-derived. Treat them as a starting point for inspection, not as complete semantic proof of all callers, callees, or runtime effects.

# Citations

- Source: `engine/memex/memex/cli.py`
- Source hash: `4e7ee95db6fc0df6082aedb76a9b79d63606ffd3cb876bc121fb5e0444e99a6f`
<!-- okf-code:end -->
