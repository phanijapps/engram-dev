---
type: CodeModule
title: engine/memex/memex/infrastructure/store/navigation.py
description: Generated code map for engine/memex/memex/infrastructure/store/navigation.py.
resource: engine/memex/memex/infrastructure/store/navigation.py
tags:
- code
- python
source_path: engine/memex/memex/infrastructure/store/navigation.py
language: python
source_hash: 8c8a950d5509f10063ed4196f89eab7146cc740bcf7a75cad3682a1dd9842187
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

Generated CodeModule concept for `engine/memex/memex/infrastructure/store/navigation.py`. Purpose: engine/memex/memex/infrastructure/store/navigation.py is a `python` model module in package `engine/memex`. Role: model module. high-signal symbols: `NavigationError`, `NavigationChange`, `NavigationReport`, `by_category`, `category_counts`. Dependency context: 0 local dependencies and 0 local dependents are linked when resolvable. Impact: changes here may affect linked dependents, imported dependencies, and callers identified by generated reverse edges. This page is syntax-derived for code finding, code-logic search, and impact-analysis groundwork.

# Symbols

| Kind | Name | Lines |
|---|---|---|
| class | `NavigationError` | 38-39 |
| class | `NavigationChange` | 43-47 |
| class | `NavigationReport` | 51-62 |
| function | `by_category` | 58-59 |
| function | `category_counts` | 61-62 |
| function | `_escape` | 65-67 |
| function | `_entry_link` | 70-84 |
| class | `NavigationGenerator` | 87-457 |
| function | `__init__` | 90-92 |
| function | `regenerate` | 94-111 |
| function | `refresh_page` | 113-161 |
| function | `refresh` | 163-183 |
| function | `diagnose` | 185-209 |
| function | `render` | 211-231 |
| function | `_entry` | 233-237 |
| function | `_heading` | 239-242 |
| function | `_compose` | 244-261 |
| function | `_parse_index` | 263-323 |
| function | `_needed_dirs` | 325-344 |
| function | `_sweep_stale_tmps` | 346-352 |

9 symbols omitted from compact profile.

# Relationships

- `__future__.annotations`
- `collections.abc.Callable`
- `dataclasses.dataclass`
- `dataclasses.field`
- `itertools`
- `memex.domain.errors.MemexError`
- `memex.domain.models.WikiNode`
- `memex.domain.reserved.OKF_VERSION`
- `memex.domain.reserved.classify_reserved_text`
- `memex.domain.reserved.is_structural`
- `memex.domain.types.NODE_TYPES`
- `memex.domain.types.SUBDIRECTORIES_HEADING`
- `memex.domain.types.heading_for`
- `memex.domain.types.type_for_heading`
- `memex.infrastructure.store.wiki_store.is_type_dir`
- `os`
- `pathlib.Path`
- `posixpath`
- `typing.ClassVar`

# Impact notes

Impact candidates on this page are syntax-derived. Treat them as a starting point for inspection, not as complete semantic proof of all callers, callees, or runtime effects.

# Citations

- Source: `engine/memex/memex/infrastructure/store/navigation.py`
- Source hash: `8c8a950d5509f10063ed4196f89eab7146cc740bcf7a75cad3682a1dd9842187`
<!-- okf-code:end -->
