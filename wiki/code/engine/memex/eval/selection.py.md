---
type: CodeModule
title: engine/memex/eval/selection.py
description: Generated code map for engine/memex/eval/selection.py.
resource: engine/memex/eval/selection.py
tags:
- code
- python
source_path: engine/memex/eval/selection.py
language: python
source_hash: 525f88e46423b545bdca2d4536cf396c8190d8a6d4fb0d64e52ea474190d8648
managed_by: okf-code
generated_profile: compact
created: 2026-10-07T23:07:32Z
generated:
  by: process:okf-code
  at: '2026-10-07T23:07:34Z'
status: stable
package: engine/memex
---
<!-- okf-code:start -->
# Overview

Generated CodeModule concept for `engine/memex/eval/selection.py`. Purpose: engine/memex/eval/selection.py is a `python` model module in package `engine/memex`. Role: model module. high-signal symbols: `GitState`, `promotion_eligible`, `EvaluationConfig`, `SelectionFailure`, `to_dict`. Dependency context: 0 local dependencies and 0 local dependents are linked when resolvable. Impact: changes here may affect linked dependents, imported dependencies, and callers identified by generated reverse edges. This page is syntax-derived for code finding, code-logic search, and impact-analysis groundwork.

# Symbols

| Kind | Name | Lines |
|---|---|---|
| class | `GitState` | 114-120 |
| function | `promotion_eligible` | 119-120 |
| class | `EvaluationConfig` | 124-133 |
| class | `SelectionFailure` | 137-142 |
| function | `to_dict` | 141-142 |
| class | `WorkloadMetrics` | 146-164 |
| function | `to_dict` | 155-164 |
| class | `WorkloadVerdict` | 168-173 |
| function | `to_dict` | 172-173 |
| class | `RunSummary` | 177-197 |
| function | `to_dict` | 187-197 |
| class | `CandidateSelection` | 201-225 |
| function | `to_dict` | 213-225 |
| class | `SelectionReport` | 229-247 |
| function | `to_dict` | 238-247 |
| class | `_MeasuredRun` | 251-255 |
| function | `run_selection` | 258-273 |
| function | `_run_in_root` | 276-348 |
| function | `stable_selection_payload` | 351-356 |
| function | `_validate_config` | 359-374 |

76 symbols omitted from compact profile.

# Relationships

- `__future__.annotations`
- `collections.abc.Mapping`
- `collections.abc.Sequence`
- `contextlib.nullcontext`
- `dataclasses.dataclass`
- `dataclasses.field`
- `datetime.UTC`
- `datetime.datetime`
- `eval.comparison.ABSOLUTE_P99_LIMITS_MS`
- `eval.comparison.COMPARISON_SCHEMA_VERSION`
- `eval.comparison.CandidateMetrics`
- `eval.comparison.ComparisonMetadata`
- `eval.comparison.FLOAT_TOLERANCE`
- `eval.comparison.QueryContextObservation`
- `eval.comparison.VolatileRunMetadata`
- `eval.comparison.build_comparison_report`
- `eval.comparison.evaluate_candidate`
- `eval.comparison.nearest_rank_p99_ms`
- `eval.comparison.p99_latency_from_hits`
- `eval.comparison.tokens_per_correct_hard_query`
- 45 imports omitted from compact profile.

# Impact notes

Impact candidates on this page are syntax-derived. Treat them as a starting point for inspection, not as complete semantic proof of all callers, callees, or runtime effects.

# Citations

- Source: `engine/memex/eval/selection.py`
- Source hash: `525f88e46423b545bdca2d4536cf396c8190d8a6d4fb0d64e52ea474190d8648`
<!-- okf-code:end -->
