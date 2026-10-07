---
type: CodeModule
title: engine/memex/memex/infrastructure/store/wiki_store.py
description: Generated code map for engine/memex/memex/infrastructure/store/wiki_store.py.
resource: engine/memex/memex/infrastructure/store/wiki_store.py
tags:
- code
- python
source_path: engine/memex/memex/infrastructure/store/wiki_store.py
language: python
source_hash: cccbfec529b60ef9827205e8c3d7b0bbc4d41ee1569b737321b258595ba06582
managed_by: okf-code
generated_profile: compact
package: engine/memex
---
<!-- okf-code:start -->
# Overview

Generated CodeModule concept for `engine/memex/memex/infrastructure/store/wiki_store.py`. Purpose: engine/memex/memex/infrastructure/store/wiki_store.py is a `python` model module in package `engine/memex`. Role: model module. high-signal symbols: `_validate_log_text`, `hash_body`, `is_type_dir`, `_builtin_declarations`, `_MissingWikiPage`. Dependency context: 0 local dependencies and 0 local dependents are linked when resolvable. Impact: changes here may affect linked dependents, imported dependencies, and callers identified by generated reverse edges. This page is syntax-derived for code finding, code-logic search, and impact-analysis groundwork.

# Symbols

| Kind | Name | Lines |
|---|---|---|
| function | `_validate_log_text` | 47-65 |
| function | `hash_body` | 128-130 |
| function | `is_type_dir` | 144-166 |
| function | `_builtin_declarations` | 169-180 |
| class | `_MissingWikiPage` | 183-184 |
| class | `WikiStore` | 187-846 |
| function | `__init__` | 193-212 |
| function | `get_path` | 214-242 |
| function | `get_slug_from_path` | 244-245 |
| function | `exists` | 247-252 |
| function | `read` | 254-266 |
| function | `write` | 268-322 |
| function | `list` | 324-333 |
| function | `scan_all` | 335-350 |
| function | `scan_dir` | 352-375 |
| function | `_type_dir` | 377-393 |
| function | `_scope_root` | 395-400 |
| function | `_is_type_dir` | 402-404 |
| function | `_log_state` | 406-435 |
| function | `declared_types_in` | 437-466 |

36 symbols omitted from compact profile.

# Relationships

- `__future__.annotations`
- `hashlib`
- `memex.domain.errors.WikiStoreError`
- `memex.domain.frontmatter.parse_front_matter`
- `memex.domain.frontmatter.serialize_front_matter`
- `memex.domain.models.( PAGE_STATUSES`
- `memex.domain.models.)`
- `memex.domain.models.SemanticLink`
- `memex.domain.models.WikiNode`
- `memex.domain.models.new_id`
- `memex.domain.models.utc_now_iso`
- `memex.domain.reserved.OKF_VERSION`
- `memex.domain.reserved.RESERVED_SLUGS`
- `memex.domain.reserved.is_structural`
- `memex.domain.slugs.derive_slug`
- `memex.domain.slugs.unique_slug`
- `memex.domain.types.( CATALOGUE`
- `memex.domain.types.)`
- `memex.domain.types.DESCRIPTION_MAX_BYTES`
- `memex.domain.types.TYPE_DIRS`
- 9 imports omitted from compact profile.

# Impact notes

Impact candidates on this page are syntax-derived. Treat them as a starting point for inspection, not as complete semantic proof of all callers, callees, or runtime effects.

# Citations

- Source: `engine/memex/memex/infrastructure/store/wiki_store.py`
- Source hash: `cccbfec529b60ef9827205e8c3d7b0bbc4d41ee1569b737321b258595ba06582`
<!-- okf-code:end -->
