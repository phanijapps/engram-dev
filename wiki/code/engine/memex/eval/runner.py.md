---
type: CodeModule
title: engine/memex/eval/runner.py
description: Generated code map for engine/memex/eval/runner.py.
resource: engine/memex/eval/runner.py
tags:
- code
- python
source_path: engine/memex/eval/runner.py
language: python
source_hash: 9be41770acf26a05807ddeb3f2d8c23e6f5cd2d76f9edbd2d0d237c538c50333
managed_by: okf-code
generated_profile: compact
package: engine/memex
---
<!-- okf-code:start -->
# Overview

Generated CodeModule concept for `engine/memex/eval/runner.py`. Purpose: engine/memex/eval/runner.py is a `python` model module in package `engine/memex`. Role: model module. high-signal symbols: `HitResult`, `EvalReport`, `run_retrieval_eval`, `_compute_metrics`, `_recall`. Dependency context: 0 local dependencies and 0 local dependents are linked when resolvable. Impact: changes here may affect linked dependents, imported dependencies, and callers identified by generated reverse edges. This page is syntax-derived for code finding, code-logic search, and impact-analysis groundwork.

# Symbols

| Kind | Name | Lines |
|---|---|---|
| class | `HitResult` | 13-20 |
| class | `EvalReport` | 24-36 |
| function | `run_retrieval_eval` | 39-70 |
| function | `_compute_metrics` | 73-135 |
| function | `_recall` | 79-80 |
| function | `_precision_at_5` | 82-89 |
| function | `format_report` | 138-172 |

# Relationships

- `__future__.annotations`
- `dataclasses.dataclass`
- `dataclasses.field`
- `eval.corpus.CorpusResult`
- `memex.application.memory.Memex`
- `time`

# Impact notes

Impact candidates on this page are syntax-derived. Treat them as a starting point for inspection, not as complete semantic proof of all callers, callees, or runtime effects.

# Citations

- Source: `engine/memex/eval/runner.py`
- Source hash: `9be41770acf26a05807ddeb3f2d8c23e6f5cd2d76f9edbd2d0d237c538c50333`
<!-- okf-code:end -->
