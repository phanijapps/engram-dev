---
type: CodeModule
title: engine/memex/memex/domain/models.py
description: Generated code map for engine/memex/memex/domain/models.py.
resource: engine/memex/memex/domain/models.py
tags:
- code
- python
source_path: engine/memex/memex/domain/models.py
language: python
source_hash: 8edeb1ec95c0ded2824a79daddf0a02e874574ec7582abd5f53178649af7a41b
managed_by: okf-code
generated_profile: compact
package: engine/memex
---
<!-- okf-code:start -->
# Overview

Generated CodeModule concept for `engine/memex/memex/domain/models.py`. Purpose: engine/memex/memex/domain/models.py is a `python` model module in package `engine/memex`. Role: model module. high-signal symbols: `utc_now_iso`, `new_id`, `_check_iso`, `_check_description`, `_check_project_metadata`. Dependency context: 0 local dependencies and 0 local dependents are linked when resolvable. Impact: changes here may affect linked dependents, imported dependencies, and callers identified by generated reverse edges. This page is syntax-derived for code finding, code-logic search, and impact-analysis groundwork.

# Symbols

| Kind | Name | Lines |
|---|---|---|
| function | `utc_now_iso` | 40-42 |
| function | `new_id` | 45-47 |
| function | `_check_iso` | 50-56 |
| function | `_check_description` | 59-64 |
| function | `_check_project_metadata` | 67-75 |
| function | `_norm_tags` | 78-87 |
| function | `_norm_slugs` | 90-96 |
| class | `SemanticLink` | 100-160 |
| function | `__post_init__` | 112-123 |
| function | `parse` | 126-153 |
| function | `to_mapping` | 155-160 |
| function | `_norm_links` | 163-174 |
| class | `TurnStreamEntry` | 178-232 |
| function | `__post_init__` | 196-204 |
| function | `from_dict` | 207-232 |
| class | `SessionHeader` | 236-250 |
| class | `WriteInput` | 254-322 |
| function | `__post_init__` | 289-322 |
| class | `WikiNode` | 326-412 |
| function | `__post_init__` | 373-395 |

19 symbols omitted from compact profile.

# Relationships

- `__future__.annotations`
- `collections.abc.Mapping`
- `dataclasses.dataclass`
- `dataclasses.field`
- `datetime.UTC`
- `datetime.datetime`
- `memex.domain.types.DESCRIPTION_MAX_BYTES`
- `memex.domain.types.validate_type_name`
- `re`
- `typing.Literal`
- `unicodedata`
- `uuid`

# Impact notes

Impact candidates on this page are syntax-derived. Treat them as a starting point for inspection, not as complete semantic proof of all callers, callees, or runtime effects.

# Citations

- Source: `engine/memex/memex/domain/models.py`
- Source hash: `8edeb1ec95c0ded2824a79daddf0a02e874574ec7582abd5f53178649af7a41b`
<!-- okf-code:end -->
