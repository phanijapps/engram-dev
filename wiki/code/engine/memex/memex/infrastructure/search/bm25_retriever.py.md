---
type: CodeModule
title: engine/memex/memex/infrastructure/search/bm25_retriever.py
description: Generated code map for engine/memex/memex/infrastructure/search/bm25_retriever.py.
resource: engine/memex/memex/infrastructure/search/bm25_retriever.py
tags:
- code
- python
source_path: engine/memex/memex/infrastructure/search/bm25_retriever.py
language: python
source_hash: 293b665aba9d165018918a6d4d504f3af9002d9889fe1b00e0357a7a26f0faa0
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

Generated CodeModule concept for `engine/memex/memex/infrastructure/search/bm25_retriever.py`. Purpose: engine/memex/memex/infrastructure/search/bm25_retriever.py is a `python` model module in package `engine/memex`. Role: model module. high-signal symbols: `_stable_dedupe`, `_query_tokens`, `_phrase_indexes`, `_how_does_handle_indexes`, `_why_is_showing_indexes`. Dependency context: 0 local dependencies and 0 local dependents are linked when resolvable. Impact: changes here may affect linked dependents, imported dependencies, and callers identified by generated reverse edges. This page is syntax-derived for code finding, code-logic search, and impact-analysis groundwork.

# Symbols

| Kind | Name | Lines |
|---|---|---|
| function | `_stable_dedupe` | 94-102 |
| function | `_query_tokens` | 105-113 |
| function | `_phrase_indexes` | 116-122 |
| function | `_how_does_handle_indexes` | 125-135 |
| function | `_why_is_showing_indexes` | 138-147 |
| function | `_drop_semantic_scaffolding` | 150-158 |
| function | `production_ranker_metadata` | 161-187 |
| class | `BM25Retriever` | 190-609 |
| function | `__init__` | 193-210 |
| function | `_match_query` | 212-214 |
| function | `_semantic_tokens` | 216-221 |
| function | `search_fts` | 223-231 |
| function | `retrieve_legacy_or` | 233-266 |
| function | `retrieve` | 268-321 |
| function | `retrieve_without_access` | 323-384 |
| function | `_validated_limit` | 386-390 |
| function | `_execute_ranked_query` | 392-426 |
| function | `_hits_from_rows` | 428-433 |
| function | `_eligibility_filters` | 435-474 |
| function | `_dedupe_rows` | 477-486 |

6 symbols omitted from compact profile.

# Relationships

- `__future__.annotations`
- `collections.abc.Sequence`
- `json`
- `memex.domain.models.RecallHit`
- `memex.domain.models.RecallResult`
- `memex.domain.models.utc_now_iso`
- `pathlib.Path`
- `re`
- `sqlite3`
- `threading`
- `time`

# Impact notes

Impact candidates on this page are syntax-derived. Treat them as a starting point for inspection, not as complete semantic proof of all callers, callees, or runtime effects.

# Citations

- Source: `engine/memex/memex/infrastructure/search/bm25_retriever.py`
- Source hash: `293b665aba9d165018918a6d4d504f3af9002d9889fe1b00e0357a7a26f0faa0`
<!-- okf-code:end -->
