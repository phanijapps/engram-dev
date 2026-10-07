---
type: CodeModule
title: engine/memex/eval/task_evidence_model.py
description: Generated code map for engine/memex/eval/task_evidence_model.py.
resource: engine/memex/eval/task_evidence_model.py
tags:
- code
- python
source_path: engine/memex/eval/task_evidence_model.py
language: python
source_hash: 388d9d407741b3a2aa7fa4f112676d22c5bf917317fd17abe3037704d5f0ead8
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

Generated CodeModule concept for `engine/memex/eval/task_evidence_model.py`. Purpose: engine/memex/eval/task_evidence_model.py is a `python` model module in package `engine/memex`. Role: model module. high-signal symbols: `TaskQuestionInput`, `TaskEvidenceSnapshot`, `BaselineTaskEvidenceSnapshot`, `RecoveryBudget`, `ModelRunLimits`. Dependency context: 0 local dependencies and 0 local dependents are linked when resolvable. Impact: changes here may affect linked dependents, imported dependencies, and callers identified by generated reverse edges. This page is syntax-derived for code finding, code-logic search, and impact-analysis groundwork.

# Symbols

| Kind | Name | Lines |
|---|---|---|
| class | `TaskQuestionInput` | 53-55 |
| class | `TaskEvidenceSnapshot` | 58-70 |
| class | `BaselineTaskEvidenceSnapshot` | 73-82 |
| class | `RecoveryBudget` | 85-90 |
| class | `ModelRunLimits` | 94-96 |
| function | `_finite_positive_number` | 99-105 |
| class | `ModelUsage` | 109-113 |
| class | `QuestionPlan` | 117-120 |
| class | `QuestionRun` | 124-135 |
| class | `PromotionGate` | 139-149 |
| class | `ModelComparisonReport` | 153-157 |
| class | `RecoveryHoldout` | 161-164 |
| class | `RecoveryComparisonReport` | 168-171 |
| class | `QuestionPlanner` | 174-177 |
| function | `plan` | 177-177 |
| class | `HarnessQuestionPlanner` | 181-246 |
| function | `plan` | 195-246 |
| function | `pi_question_planner` | 249-285 |
| function | `run_model_comparison` | 288-304 |
| function | `run_recovery_comparison` | 307-320 |

29 symbols omitted from compact profile.

# Relationships

- `__future__.annotations`
- `dataclasses.dataclass`
- `dataclasses.replace`
- `eval.agent_workflow.BenchmarkReport`
- `eval.agent_workflow.Fixture`
- `eval.agent_workflow.LinkedSummaryFixture`
- `eval.agent_workflow.StrategyReport`
- `eval.agent_workflow._focused_result`
- `eval.agent_workflow._populate`
- `eval.agent_workflow._strategy_report`
- `eval.agent_workflow._validate_fixture`
- `eval.agent_workflow.load_fixture`
- `eval.agent_workflow.run_benchmark`
- `eval.agent_workflow.run_benchmark_for_fixture`
- `json`
- `math`
- `memex.application.compiler.estimate_tokens`
- `memex.application.memory.Memex`
- `memex.infrastructure.config.MemexConfig`
- `os`
- 9 imports omitted from compact profile.

# Impact notes

Impact candidates on this page are syntax-derived. Treat them as a starting point for inspection, not as complete semantic proof of all callers, callees, or runtime effects.

# Citations

- Source: `engine/memex/eval/task_evidence_model.py`
- Source hash: `388d9d407741b3a2aa7fa4f112676d22c5bf917317fd17abe3037704d5f0ead8`
<!-- okf-code:end -->
