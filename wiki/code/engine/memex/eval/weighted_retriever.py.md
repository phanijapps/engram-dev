---
type: CodeModule
title: engine/memex/eval/weighted_retriever.py
description: Generated code map for engine/memex/eval/weighted_retriever.py.
resource: engine/memex/eval/weighted_retriever.py
tags:
- code
- python
source_path: engine/memex/eval/weighted_retriever.py
language: python
source_hash: e0a80060a75f11730e56f5c02b031bdb4044f9e611cd6ca46432376a1d3becb1
managed_by: okf-code
generated_profile: compact
package: engine/memex
---
<!-- okf-code:start -->
# Overview

Generated CodeModule concept for `engine/memex/eval/weighted_retriever.py`. Purpose: engine/memex/eval/weighted_retriever.py is a `python` model module in package `engine/memex`. Role: model module. high-signal symbols: `_accepted_tokens`, `WeightedLexicalRetriever`, `__init__`, `close`, `retrieve`. Dependency context: 0 local dependencies and 0 local dependents are linked when resolvable. Impact: changes here may affect linked dependents, imported dependencies, and callers identified by generated reverse edges. This page is syntax-derived for code finding, code-logic search, and impact-analysis groundwork.

# Symbols

| Kind | Name | Lines |
|---|---|---|
| function | `_accepted_tokens` | 78-83 |
| class | `WeightedLexicalRetriever` | 86-233 |
| function | `__init__` | 91-95 |
| function | `close` | 97-98 |
| function | `retrieve` | 100-122 |
| function | `metadata` | 124-137 |
| function | `_search_channel` | 139-159 |
| function | `_hydrate` | 161-180 |
| function | `_links` | 182-192 |
| function | `_record_access` | 194-201 |
| function | `_to_hit` | 204-233 |

# Relationships

- `__future__.annotations`
- `collections.abc.Sequence`
- `eval.candidates.CandidateSource`
- `eval.candidates.DEFAULT_LEXICAL_RECIPE`
- `eval.candidates.RRF_RANK_CONSTANT`
- `eval.candidates.RankedCandidate`
- `eval.candidates.fuse_candidate_sources`
- `json`
- `memex.domain.models.RecallHit`
- `memex.domain.models.RecallResult`
- `memex.domain.models.utc_now_iso`
- `pathlib.Path`
- `re`
- `sqlite3`
- `time`

# Impact notes

Impact candidates on this page are syntax-derived. Treat them as a starting point for inspection, not as complete semantic proof of all callers, callees, or runtime effects.

# Citations

- Source: `engine/memex/eval/weighted_retriever.py`
- Source hash: `e0a80060a75f11730e56f5c02b031bdb4044f9e611cd6ca46432376a1d3becb1`
<!-- okf-code:end -->
