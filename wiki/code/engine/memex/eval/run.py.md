---
type: CodeModule
title: engine/memex/eval/run.py
description: Generated code map for engine/memex/eval/run.py.
resource: engine/memex/eval/run.py
tags:
- code
- python
source_path: engine/memex/eval/run.py
language: python
source_hash: 0f2791ea6e07004aa3cb9f7551c314773139a9a4e1fb2b32546cc846597cfddc
managed_by: okf-code
generated_profile: compact
package: engine/memex
---
<!-- okf-code:start -->
# Overview

Generated CodeModule concept for `engine/memex/eval/run.py`. Purpose: engine/memex/eval/run.py is a `python` module in package `engine/memex`. Role: module. high-signal symbols: `_build_parser`, `_generate_corpus`, `_git_state`, `_assert_fresh_eval_dir`, `_run_retrieval`. Dependency context: 0 local dependencies and 0 local dependents are linked when resolvable. Impact: changes here may affect linked dependents, imported dependencies, and callers identified by generated reverse edges. This page is syntax-derived for code finding, code-logic search, and impact-analysis groundwork.

# Symbols

| Kind | Name | Lines |
|---|---|---|
| function | `_build_parser` | 28-111 |
| function | `_generate_corpus` | 114-129 |
| function | `_git_state` | 132-152 |
| function | `_assert_fresh_eval_dir` | 155-158 |
| function | `_run_retrieval` | 161-195 |
| function | `main` | 198-267 |

# Relationships

- `__future__.annotations`
- `argparse`
- `dataclasses.asdict`
- `datetime.UTC`
- `datetime.datetime`
- `eval.corpus.CorpusGenerator`
- `eval.corpus.CorpusResult`
- `eval.realistic.RealisticCorpusGenerator`
- `eval.runner.format_report`
- `eval.runner.run_retrieval_eval`
- `eval.selection.CANDIDATE_NAMES`
- `eval.selection.EvaluationConfig`
- `eval.selection.WORKLOAD_NAMES`
- `eval.selection.run_selection`
- `eval.workloads.GutenbergImportError`
- `eval.workloads.import_gutenberg_catalog`
- `json`
- `memex.Memex`
- `memex.infrastructure.config.MemexConfig`
- `memex.infrastructure.search.bm25_retriever.production_ranker_metadata`
- 4 imports omitted from compact profile.

# Impact notes

Impact candidates on this page are syntax-derived. Treat them as a starting point for inspection, not as complete semantic proof of all callers, callees, or runtime effects.

# Citations

- Source: `engine/memex/eval/run.py`
- Source hash: `0f2791ea6e07004aa3cb9f7551c314773139a9a4e1fb2b32546cc846597cfddc`
<!-- okf-code:end -->
