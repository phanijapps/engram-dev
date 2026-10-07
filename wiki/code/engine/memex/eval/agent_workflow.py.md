---
type: CodeModule
title: engine/memex/eval/agent_workflow.py
description: Generated code map for engine/memex/eval/agent_workflow.py.
resource: engine/memex/eval/agent_workflow.py
tags:
- code
- python
source_path: engine/memex/eval/agent_workflow.py
language: python
source_hash: 4409c65d751cc9dfb9df579c1c592d83e638912af7bc14e74f0155c50807b272
managed_by: okf-code
generated_profile: compact
package: engine/memex
---
<!-- okf-code:start -->
# Overview

Generated CodeModule concept for `engine/memex/eval/agent_workflow.py`. Purpose: engine/memex/eval/agent_workflow.py is a `python` model module in package `engine/memex`. Role: model module. high-signal symbols: `_summary_links`, `MemorySpec`, `TaskSpec`, `Fixture`, `LinkedSummarySpec`. Dependency context: 0 local dependencies and 0 local dependents are linked when resolvable. Impact: changes here may affect linked dependents, imported dependencies, and callers identified by generated reverse edges. This page is syntax-derived for code finding, code-logic search, and impact-analysis groundwork.

# Symbols

| Kind | Name | Lines |
|---|---|---|
| function | `_summary_links` | 38-44 |
| class | `MemorySpec` | 47-53 |
| class | `TaskSpec` | 56-59 |
| class | `Fixture` | 62-68 |
| class | `LinkedSummarySpec` | 71-73 |
| class | `LinkedSummaryFixture` | 76-77 |
| class | `HumanFocusedQuerySpec` | 80-82 |
| class | `HumanFocusedQueryFixture` | 85-86 |
| class | `RecallCost` | 90-93 |
| class | `TaskStrategyResult` | 97-107 |
| function | `complete` | 106-107 |
| class | `StrategyReport` | 111-119 |
| class | `BenchmarkReport` | 123-130 |
| function | `load_fixture` | 133-135 |
| function | `load_linked_summaries` | 138-142 |
| function | `load_human_focused_queries` | 145-147 |
| function | `_validate_fixture` | 150-153 |
| function | `_populate` | 156-180 |
| function | `_populate_linked_summaries` | 183-211 |
| function | `_human_query_plan` | 214-228 |

14 symbols omitted from compact profile.

# Relationships

- `__future__.annotations`
- `dataclasses.asdict`
- `dataclasses.dataclass`
- `json`
- `memex.application.compiler.( DEFAULT_INJECTION_TOP_K`
- `memex.application.compiler.)`
- `memex.application.compiler.build_injection`
- `memex.application.compiler.estimate_tokens`
- `memex.application.memory.Memex`
- `memex.domain.models.RecallHit`
- `memex.domain.models.WriteInput`
- `memex.infrastructure.config.MemexConfig`
- `pathlib.Path`
- `re`
- `tempfile`
- `time`
- `typing.NotRequired`
- `typing.TypedDict`
- `typing.cast`

# Impact notes

Impact candidates on this page are syntax-derived. Treat them as a starting point for inspection, not as complete semantic proof of all callers, callees, or runtime effects.

# Citations

- Source: `engine/memex/eval/agent_workflow.py`
- Source hash: `4409c65d751cc9dfb9df579c1c592d83e638912af7bc14e74f0155c50807b272`
<!-- okf-code:end -->
