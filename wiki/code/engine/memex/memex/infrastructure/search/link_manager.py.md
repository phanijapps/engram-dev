---
type: CodeModule
title: engine/memex/memex/infrastructure/search/link_manager.py
description: Generated code map for engine/memex/memex/infrastructure/search/link_manager.py.
resource: engine/memex/memex/infrastructure/search/link_manager.py
tags:
- code
- python
source_path: engine/memex/memex/infrastructure/search/link_manager.py
language: python
source_hash: acd6a4e9ffa28916286e8a4723e9b0f85ad60e4617cd3ca3267a900f2c2dd2b1
managed_by: okf-code
generated_profile: compact
package: engine/memex
---
<!-- okf-code:start -->
# Overview

Generated CodeModule concept for `engine/memex/memex/infrastructure/search/link_manager.py`. Purpose: engine/memex/memex/infrastructure/search/link_manager.py is a `python` model module in package `engine/memex`. Role: model module. high-signal symbols: `LinkManager`, `__init__`, `parse_links`, `sync_links`, `sync_node`. Dependency context: 0 local dependencies and 0 local dependents are linked when resolvable. Impact: changes here may affect linked dependents, imported dependencies, and callers identified by generated reverse edges. This page is syntax-derived for code finding, code-logic search, and impact-analysis groundwork.

# Symbols

| Kind | Name | Lines |
|---|---|---|
| class | `LinkManager` | 15-229 |
| function | `__init__` | 26-28 |
| function | `parse_links` | 30-31 |
| function | `sync_links` | 33-49 |
| function | `sync_node` | 51-59 |
| function | `_replace` | 61-83 |
| function | `get_outgoing` | 85-135 |
| function | `get_backlinks` | 137-150 |
| function | `link_exists` | 152-164 |
| function | `validate_links` | 166-180 |
| function | `get_link_graph` | 182-196 |
| function | `remove_slug` | 198-222 |
| function | `_page_exists` | 224-229 |
| function | `_unique` | 232-234 |
| function | `_source_namespace_complete` | 237-240 |
| function | `_refuse_ambiguous_source_slugs` | 243-254 |

# Relationships

- `__future__.annotations`
- `memex.domain.errors.IndexManagerError`
- `memex.domain.links.parse_links`
- `memex.domain.models.BODY_REL`
- `memex.domain.models.WikiNode`
- `memex.domain.reserved.is_structural`
- `memex.infrastructure.search.index_manager.check_slug`
- `pathlib.Path`
- `sqlite3`

# Impact notes

Impact candidates on this page are syntax-derived. Treat them as a starting point for inspection, not as complete semantic proof of all callers, callees, or runtime effects.

# Citations

- Source: `engine/memex/memex/infrastructure/search/link_manager.py`
- Source hash: `acd6a4e9ffa28916286e8a4723e9b0f85ad60e4617cd3ca3267a900f2c2dd2b1`
<!-- okf-code:end -->
