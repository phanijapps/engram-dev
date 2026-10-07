---
type: CodeModule
title: engine/memex/memex/infrastructure/search/index_manager.py
description: Generated code map for engine/memex/memex/infrastructure/search/index_manager.py.
resource: engine/memex/memex/infrastructure/search/index_manager.py
tags:
- code
- python
source_path: engine/memex/memex/infrastructure/search/index_manager.py
language: python
source_hash: bf9ed7f90cb109ede0417834d9704b2dadd1d5f4430236588d28567297b233e0
managed_by: okf-code
generated_profile: compact
package: engine/memex
---
<!-- okf-code:start -->
# Overview

Generated CodeModule concept for `engine/memex/memex/infrastructure/search/index_manager.py`. Purpose: engine/memex/memex/infrastructure/search/index_manager.py is a `python` model module in package `engine/memex`. Role: model module. high-signal symbols: `node_record`, `check_slug`, `IndexManager`, `__init__`, `connection`. Dependency context: 0 local dependencies and 0 local dependents are linked when resolvable. Impact: changes here may affect linked dependents, imported dependencies, and callers identified by generated reverse edges. This page is syntax-derived for code finding, code-logic search, and impact-analysis groundwork.

# Symbols

| Kind | Name | Lines |
|---|---|---|
| function | `node_record` | 145-175 |
| function | `check_slug` | 178-183 |
| class | `IndexManager` | 186-429 |
| function | `__init__` | 189-199 |
| function | `connection` | 202-204 |
| function | `needs_rebuild` | 206-240 |
| function | `drop_for_rebuild` | 242-252 |
| function | `initialize` | 254-269 |
| function | `_index_schema_is_incompatible` | 271-279 |
| function | `_links_schema_is_incompatible` | 281-288 |
| function | `build` | 290-300 |
| function | `update_record` | 302-311 |
| function | `remove_record` | 313-343 |
| function | `reset` | 345-351 |
| function | `get` | 353-376 |
| function | `get_all_slugs` | 378-381 |
| function | `get_all_records` | 383-386 |
| function | `get_by_type` | 388-393 |
| function | `count` | 395-398 |
| function | `increment_access` | 400-409 |

3 symbols omitted from compact profile.

# Relationships

- `__future__.annotations`
- `json`
- `memex.domain.errors.IndexManagerError`
- `memex.domain.models.WikiNode`
- `memex.domain.models.utc_now_iso`
- `pathlib.Path`
- `re`
- `sqlite3`
- `threading`
- `typing.cast`

# Impact notes

Impact candidates on this page are syntax-derived. Treat them as a starting point for inspection, not as complete semantic proof of all callers, callees, or runtime effects.

# Citations

- Source: `engine/memex/memex/infrastructure/search/index_manager.py`
- Source hash: `bf9ed7f90cb109ede0417834d9704b2dadd1d5f4430236588d28567297b233e0`
<!-- okf-code:end -->
