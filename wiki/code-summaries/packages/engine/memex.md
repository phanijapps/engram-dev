---
type: CodeSummary
title: repository/engine/memex
description: Generated package code summary for repository/engine/memex.
tags:
- code
- summary
- impact
- package
summary_level: package
managed_by: okf-code
created: 2026-10-07T23:07:31Z
generated:
  by: process:okf-code
  at: '2026-10-07T23:07:34Z'
status: stable
package: engine/memex
---
<!-- okf-code:start -->
# Overview

Generated package summary for `repository/engine/memex`. Purpose: provide a low-token entry point for code search and impact analysis before opening file-level concepts.

# Key modules

- [engine/memex/eval/__init__.py](/code/engine/memex/eval/__init__.py.md) - module; depends on 0; used by 0
- [engine/memex/eval/agent_workflow.py](/code/engine/memex/eval/agent_workflow.py.md) - model module; depends on 0; used by 0; high-signal symbols: `_summary_links`, `MemorySpec`, `TaskSpec`
- [engine/memex/eval/candidates.py](/code/engine/memex/eval/candidates.py.md) - model module; depends on 0; used by 0; high-signal symbols: `RankedCandidate`, `CandidateSource`, `CurrentFtsSearcher`
- [engine/memex/eval/comparison.py](/code/engine/memex/eval/comparison.py.md) - model module; depends on 0; used by 0; high-signal symbols: `CandidateMetrics`, `GateVerdict`, `to_dict`
- [engine/memex/eval/corpus.py](/code/engine/memex/eval/corpus.py.md) - model module; depends on 0; used by 0; high-signal symbols: `QuerySpec`, `relevant_slugs`, `CorpusResult`
- [engine/memex/eval/realistic.py](/code/engine/memex/eval/realistic.py.md) - model module; depends on 0; used by 0; high-signal symbols: `RealisticCorpusGenerator`, `__init__`, `generate`
- [engine/memex/eval/rgapi_candidate.py](/code/engine/memex/eval/rgapi_candidate.py.md) - model module; depends on 0; used by 0; high-signal symbols: `RgapiCandidateResult`, `actual_slugs`, `ranker_metadata`
- [engine/memex/eval/run.py](/code/engine/memex/eval/run.py.md) - module; depends on 0; used by 0; high-signal symbols: `_build_parser`, `_generate_corpus`, `_git_state`
- [engine/memex/eval/runner.py](/code/engine/memex/eval/runner.py.md) - model module; depends on 0; used by 0; high-signal symbols: `HitResult`, `EvalReport`, `run_retrieval_eval`
- [engine/memex/eval/selection.py](/code/engine/memex/eval/selection.py.md) - model module; depends on 0; used by 0; high-signal symbols: `GitState`, `promotion_eligible`, `EvaluationConfig`
- [engine/memex/eval/task_evidence_model.py](/code/engine/memex/eval/task_evidence_model.py.md) - model module; depends on 0; used by 0; high-signal symbols: `TaskQuestionInput`, `TaskEvidenceSnapshot`, `BaselineTaskEvidenceSnapshot`
- [engine/memex/eval/weighted_retriever.py](/code/engine/memex/eval/weighted_retriever.py.md) - model module; depends on 0; used by 0; high-signal symbols: `_accepted_tokens`, `WeightedLexicalRetriever`, `__init__`
- [engine/memex/eval/workloads.py](/code/engine/memex/eval/workloads.py.md) - model module; depends on 0; used by 0; high-signal symbols: `GutenbergProvenance`, `to_dict`, `GutenbergImportError`
- [engine/memex/memex/__init__.py](/code/engine/memex/memex/__init__.py.md) - module; depends on 0; used by 0
- [engine/memex/memex/application/__init__.py](/code/engine/memex/memex/application/__init__.py.md) - module; depends on 0; used by 0
- [engine/memex/memex/application/compiler.py](/code/engine/memex/memex/application/compiler.py.md) - model module; depends on 0; used by 0; high-signal symbols: `estimate_tokens`, `identity`, `_hit_identity`
- [engine/memex/memex/application/concept_types.py](/code/engine/memex/memex/application/concept_types.py.md) - model module; depends on 0; used by 0; high-signal symbols: `ConceptTypes`, `__init__`, `add`
- [engine/memex/memex/application/consolidator.py](/code/engine/memex/memex/application/consolidator.py.md) - model module; depends on 0; used by 0; high-signal symbols: `_format_existing`, `_format_episodes`, `WikiConsolidator`
- [engine/memex/memex/application/dto.py](/code/engine/memex/memex/application/dto.py.md) - module; depends on 0; used by 0; high-signal symbols: `to_jsonable`
- [engine/memex/memex/application/memory.py](/code/engine/memex/memex/application/memory.py.md) - model module; depends on 0; used by 0; high-signal symbols: `Memex`, `__init__`, `_open_storage`
- 32 modules omitted from compact summary.

# Impact map

No local dependency edges detected in this summary scope.

# Impact notes

Use this summary to choose a target module, then read that module at depth 0 or depth 1 for dependency and dependent context.
<!-- okf-code:end -->
