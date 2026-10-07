---
type: CodeSummary
title: repository
description: 'Generated repository code summary for repository. Top dependencies:
  memex_core.compile_context.Compiled, memex_core.compile_context.compile_context,
  memex_core.findings.( findings_path, memex_core.findings.list_findings, memex_core.knowledge.wiki_init.
  Top dependents: engine/core/src/memex_core/__init__.py, engine/core/src/memex_core/cli.py,
  engine/core/src/memex_core/compile_context.py, engine/core/src/memex_core/findings.py,
  engine/core/src/memex_core/knowledge.py.'
tags:
- code
- summary
- impact
- repository
- depends-on
- used-by
summary_level: repository
managed_by: okf-code
---
<!-- okf-code:start -->
# Overview

Generated repository summary for `repository`. Purpose: provide a low-token entry point for code search and impact analysis before opening file-level concepts.

# Key modules

- [engine/core/src/memex_core/__init__.py](/code/engine/core/src/memex_core/__init__.py.md) - module; depends on 7; used by 0
- [engine/core/src/memex_core/cli.py](/code/engine/core/src/memex_core/cli.py.md) - module; depends on 7; used by 0; high-signal symbols: `_jsonable`, `_from_dataclass`, `_emit`
- [engine/core/src/memex_core/resolve.py](/code/engine/core/src/memex_core/resolve.py.md) - model module; depends on 0; used by 6; high-signal symbols: `WikiState`, `ResolveReport`, `_git_output`
- [engine/core/src/memex_core/search.py](/code/engine/core/src/memex_core/search.py.md) - model module; depends on 1; used by 3; high-signal symbols: `CoreHit`, `_memory_hits`, `_wiki_hits`
- [engine/core/src/memex_core/compile_context.py](/code/engine/core/src/memex_core/compile_context.py.md) - model module; depends on 1; used by 2; high-signal symbols: `Manifest`, `Compiled`, `_Packable`
- [engine/core/src/memex_core/findings.py](/code/engine/core/src/memex_core/findings.py.md) - model module; depends on 1; used by 2; high-signal symbols: `FindingsError`, `Finding`, `findings_path`
- [engine/core/src/memex_core/knowledge.py](/code/engine/core/src/memex_core/knowledge.py.md) - model module; depends on 1; used by 2; high-signal symbols: `KnowledgeError`, `_bundle_root`, `wiki_init`
- [engine/core/src/memex_core/status.py](/code/engine/core/src/memex_core/status.py.md) - module; depends on 1; used by 2; high-signal symbols: `combined_status`
- [engine/core/src/memex_core/record.py](/code/engine/core/src/memex_core/record.py.md) - module; depends on 0; used by 2; high-signal symbols: `record_note`
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
- 63 modules omitted from compact summary.

# Impact map

| Module | Depends | Used by | Relationship signals |
|---|---:|---:|---|
| [engine/core/src/memex_core/__init__.py](/code/engine/core/src/memex_core/__init__.py.md) | 7 | 0 | memex_core.compile_context.Compiled, memex_core.findings.( findings_path, memex_core.knowledge.wiki_init |
| [engine/core/src/memex_core/cli.py](/code/engine/core/src/memex_core/cli.py.md) | 7 | 0 | memex_core.compile_context.compile_context, memex_core.findings.list_findings, memex_core.knowledge.wiki_init |
| [engine/core/src/memex_core/resolve.py](/code/engine/core/src/memex_core/resolve.py.md) | 0 | 6 | engine/core/src/memex_core/__init__.py, engine/core/src/memex_core/cli.py, engine/core/src/memex_core/findings.py |
| [engine/core/src/memex_core/search.py](/code/engine/core/src/memex_core/search.py.md) | 1 | 3 | memex_core.resolve.WIKI_DIRNAME, engine/core/src/memex_core/__init__.py, engine/core/src/memex_core/cli.py, engine/core/src/memex_core/compile_context.py |
| [engine/core/src/memex_core/compile_context.py](/code/engine/core/src/memex_core/compile_context.py.md) | 1 | 2 | memex_core.search.CoreHit, engine/core/src/memex_core/__init__.py, engine/core/src/memex_core/cli.py |
| [engine/core/src/memex_core/findings.py](/code/engine/core/src/memex_core/findings.py.md) | 1 | 2 | memex_core.resolve.OKF_STATE_DIRNAME, engine/core/src/memex_core/__init__.py, engine/core/src/memex_core/cli.py |
| [engine/core/src/memex_core/knowledge.py](/code/engine/core/src/memex_core/knowledge.py.md) | 1 | 2 | memex_core.resolve.( LAST_INDEX_STAMP, engine/core/src/memex_core/__init__.py, engine/core/src/memex_core/cli.py |
| [engine/core/src/memex_core/status.py](/code/engine/core/src/memex_core/status.py.md) | 1 | 2 | memex_core.resolve.WIKI_DIRNAME, engine/core/src/memex_core/__init__.py, engine/core/src/memex_core/cli.py |
| [engine/core/src/memex_core/record.py](/code/engine/core/src/memex_core/record.py.md) | 0 | 2 | engine/core/src/memex_core/__init__.py, engine/core/src/memex_core/cli.py |

# Impact notes

Use this summary to choose a target module, then read that module at depth 0 or depth 1 for dependency and dependent context.
<!-- okf-code:end -->
