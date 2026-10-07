---
type: CodeModule
title: engine/memex/memex/application/verify.py
description: Generated code map for engine/memex/memex/application/verify.py.
resource: engine/memex/memex/application/verify.py
tags:
- code
- python
source_path: engine/memex/memex/application/verify.py
language: python
source_hash: 04b3370b93d0e6e876f4a818656615a8a6035a2d2f8dc939a635ad1c295aea9a
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

Generated CodeModule concept for `engine/memex/memex/application/verify.py`. Purpose: engine/memex/memex/application/verify.py is a `python` model module in package `engine/memex`. Role: model module. high-signal symbols: `VerifyReport`, `_check`, `count_stale_index_rows`, `verify`, `_slug_detail`. Dependency context: 0 local dependencies and 0 local dependents are linked when resolvable. Impact: changes here may affect linked dependents, imported dependencies, and callers identified by generated reverse edges. This page is syntax-derived for code finding, code-logic search, and impact-analysis groundwork.

# Symbols

| Kind | Name | Lines |
|---|---|---|
| class | `VerifyReport` | 21-28 |
| function | `_check` | 31-32 |
| function | `count_stale_index_rows` | 35-55 |
| function | `verify` | 58-126 |
| function | `_slug_detail` | 129-134 |
| function | `_undeclared_and_non_pending` | 137-155 |
| function | `type_checks` | 158-203 |
| function | `okf_checks` | 206-267 |
| function | `_navigation_detail` | 270-280 |

# Relationships

- `__future__.annotations`
- `dataclasses.dataclass`
- `dataclasses.field`
- `memex.application.memory.Memex`
- `memex.domain.models.WikiNode`
- `memex.domain.types.type_directory`
- `memex.infrastructure.run_log.read_runs`
- `memex.infrastructure.run_log.zero_yield_streak`
- `memex.infrastructure.store.navigation.NavigationChange`
- `memex.infrastructure.store.wiki_store.hash_body`
- `pathlib.Path`

# Impact notes

Impact candidates on this page are syntax-derived. Treat them as a starting point for inspection, not as complete semantic proof of all callers, callees, or runtime effects.

# Citations

- Source: `engine/memex/memex/application/verify.py`
- Source hash: `04b3370b93d0e6e876f4a818656615a8a6035a2d2f8dc939a635ad1c295aea9a`
<!-- okf-code:end -->
