---
type: CodeModule
title: engine/memex/eval/comparison.py
description: Generated code map for engine/memex/eval/comparison.py.
resource: engine/memex/eval/comparison.py
tags:
- code
- python
source_path: engine/memex/eval/comparison.py
language: python
source_hash: 17f515150598835be128888544e91e10f6dc06acf04846aef0bbc2e6d11d2f49
managed_by: okf-code
generated_profile: compact
package: engine/memex
---
<!-- okf-code:start -->
# Overview

Generated CodeModule concept for `engine/memex/eval/comparison.py`. Purpose: engine/memex/eval/comparison.py is a `python` model module in package `engine/memex`. Role: model module. high-signal symbols: `CandidateMetrics`, `GateVerdict`, `to_dict`, `CandidateVerdict`, `to_dict`. Dependency context: 0 local dependencies and 0 local dependents are linked when resolvable. Impact: changes here may affect linked dependents, imported dependencies, and callers identified by generated reverse edges. This page is syntax-derived for code finding, code-logic search, and impact-analysis groundwork.

# Symbols

| Kind | Name | Lines |
|---|---|---|
| class | `CandidateMetrics` | 29-35 |
| class | `GateVerdict` | 39-51 |
| function | `to_dict` | 45-51 |
| class | `CandidateVerdict` | 55-65 |
| function | `to_dict` | 60-65 |
| class | `QueryContextObservation` | 69-77 |
| class | `ComparisonMetadata` | 81-123 |
| function | `to_dict` | 101-123 |
| class | `VolatileRunMetadata` | 127-132 |
| function | `to_dict` | 131-132 |
| class | `ComparisonReport` | 136-159 |
| function | `stable_payload` | 143-150 |
| function | `volatile_payload` | 152-153 |
| function | `to_dict` | 155-159 |
| function | `evaluate_candidate` | 162-184 |
| function | `nearest_rank_p99_ms` | 187-192 |
| function | `p99_latency_from_hits` | 195-196 |
| function | `tokens_per_correct_hard_query` | 199-227 |
| function | `build_comparison_report` | 230-243 |
| function | `_minimum_delta_gate` | 246-254 |

7 symbols omitted from compact profile.

# Relationships

- `__future__.annotations`
- `collections.abc.Mapping`
- `collections.abc.Sequence`
- `dataclasses.dataclass`
- `eval.runner.HitResult`
- `math`
- `memex.application.compiler`
- `memex.domain.models.RecallHit`
- `memex.domain.models.RecallResult`

# Impact notes

Impact candidates on this page are syntax-derived. Treat them as a starting point for inspection, not as complete semantic proof of all callers, callees, or runtime effects.

# Citations

- Source: `engine/memex/eval/comparison.py`
- Source hash: `17f515150598835be128888544e91e10f6dc06acf04846aef0bbc2e6d11d2f49`
<!-- okf-code:end -->
