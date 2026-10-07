---
type: CodeModule
title: engine/memex/memex/infrastructure/store/navigation_search.py
description: Generated code map for engine/memex/memex/infrastructure/store/navigation_search.py.
resource: engine/memex/memex/infrastructure/store/navigation_search.py
tags:
- code
- python
source_path: engine/memex/memex/infrastructure/store/navigation_search.py
language: python
source_hash: 3f4f56e03768fa316efb1ac16f25afc3a0cf1ceb6b0268548b51523bef7034ed
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

Generated CodeModule concept for `engine/memex/memex/infrastructure/store/navigation_search.py`. Purpose: engine/memex/memex/infrastructure/store/navigation_search.py is a `python` model module in package `engine/memex`. Role: model module. high-signal symbols: `_Row`, `NavigationSearch`, `__init__`, `search`, `_tokens`. Dependency context: 0 local dependencies and 0 local dependents are linked when resolvable. Impact: changes here may affect linked dependents, imported dependencies, and callers identified by generated reverse edges. This page is syntax-derived for code finding, code-logic search, and impact-analysis groundwork.

# Symbols

| Kind | Name | Lines |
|---|---|---|
| class | `_Row` | 50-59 |
| class | `NavigationSearch` | 62-292 |
| function | `__init__` | 65-74 |
| function | `search` | 76-147 |
| function | `_tokens` | 150-151 |
| function | `_score` | 154-161 |
| function | `_rows` | 163-180 |
| function | `_parse_index` | 182-227 |
| function | `_link_slug` | 230-238 |
| function | `_front_matter_node` | 240-252 |
| function | `_visible` | 255-261 |
| function | `_hit` | 264-292 |
| function | `_read_front_matter` | 295-319 |

# Relationships

- `__future__.annotations`
- `collections.abc.Callable`
- `dataclasses.dataclass`
- `memex.domain.errors.IndexManagerError`
- `memex.domain.errors.WikiStoreError`
- `memex.domain.frontmatter.parse_front_matter`
- `memex.domain.models.RecallHit`
- `memex.domain.models.RecallResult`
- `memex.domain.models.WikiNode`
- `memex.domain.models.utc_now_iso`
- `memex.domain.reserved.classify_reserved_text`
- `memex.domain.types.type_directory`
- `memex.domain.types.type_for_heading`
- `memex.infrastructure.search.bm25_retriever._query_tokens`
- `memex.infrastructure.search.bm25_retriever._stable_dedupe`
- `memex.infrastructure.search.index_manager.check_slug`
- `memex.infrastructure.store.wiki_store._node_from_dict`
- `pathlib.Path`
- `re`
- `time`

# Impact notes

Impact candidates on this page are syntax-derived. Treat them as a starting point for inspection, not as complete semantic proof of all callers, callees, or runtime effects.

# Citations

- Source: `engine/memex/memex/infrastructure/store/navigation_search.py`
- Source hash: `3f4f56e03768fa316efb1ac16f25afc3a0cf1ceb6b0268548b51523bef7034ed`
<!-- okf-code:end -->
