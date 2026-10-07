---
type: CodeSummary
title: repository/engine/memex
description: Generated package code summary for repository/engine/memex.
tags:
- code
- summary
- impact
- package
summary_level: package
managed_by: okf-code
package: engine/memex
---
<!-- okf-code:start -->
# Overview

Generated package summary for `repository/engine/memex`. Purpose: provide a low-token entry point for code search and impact analysis before opening file-level concepts.

# Key modules

- [engine/memex/memex/__init__.py](/code/engine/memex/memex/__init__.py.md) - module; depends on 0; used by 0
- [engine/memex/memex/application/__init__.py](/code/engine/memex/memex/application/__init__.py.md) - module; depends on 0; used by 0
- [engine/memex/memex/application/compiler.py](/code/engine/memex/memex/application/compiler.py.md) - model module; depends on 0; used by 0; high-signal symbols: `estimate_tokens`, `identity`, `_hit_identity`
- [engine/memex/memex/application/concept_types.py](/code/engine/memex/memex/application/concept_types.py.md) - model module; depends on 0; used by 0; high-signal symbols: `ConceptTypes`, `__init__`, `add`
- [engine/memex/memex/application/consolidator.py](/code/engine/memex/memex/application/consolidator.py.md) - model module; depends on 0; used by 0; high-signal symbols: `_format_existing`, `_format_episodes`, `WikiConsolidator`
- [engine/memex/memex/application/dto.py](/code/engine/memex/memex/application/dto.py.md) - module; depends on 0; used by 0; high-signal symbols: `to_jsonable`
- [engine/memex/memex/application/memory.py](/code/engine/memex/memex/application/memory.py.md) - model module; depends on 0; used by 0; high-signal symbols: `Memex`, `__init__`, `_open_storage`
- [engine/memex/memex/application/ports.py](/code/engine/memex/memex/application/ports.py.md) - model module; depends on 0; used by 0; high-signal symbols: `LLMResponse`, `LLMClient`, `complete`
- [engine/memex/memex/application/verify.py](/code/engine/memex/memex/application/verify.py.md) - model module; depends on 0; used by 0; high-signal symbols: `VerifyReport`, `_check`, `count_stale_index_rows`
- [engine/memex/memex/cli.py](/code/engine/memex/memex/cli.py.md) - module; depends on 0; used by 0; high-signal symbols: `_build_parser`, `_csv`, `_load_turns`
- [engine/memex/memex/domain/__init__.py](/code/engine/memex/memex/domain/__init__.py.md) - module; depends on 0; used by 0
- [engine/memex/memex/domain/errors.py](/code/engine/memex/memex/domain/errors.py.md) - model module; depends on 0; used by 0; high-signal symbols: `MemexError`, `ConfigError`, `WikiStoreError`
- [engine/memex/memex/domain/frontmatter.py](/code/engine/memex/memex/domain/frontmatter.py.md) - module; depends on 0; used by 0; high-signal symbols: `_parse_scalar`, `_unquote`, `_split_items`
- [engine/memex/memex/domain/links.py](/code/engine/memex/memex/domain/links.py.md) - module; depends on 0; used by 0; high-signal symbols: `parse_links`
- [engine/memex/memex/domain/models.py](/code/engine/memex/memex/domain/models.py.md) - model module; depends on 0; used by 0; high-signal symbols: `utc_now_iso`, `new_id`, `_check_iso`
- [engine/memex/memex/domain/operations.py](/code/engine/memex/memex/domain/operations.py.md) - model module; depends on 0; used by 0; high-signal symbols: `summary`, `TurnDict`, `WriteResultDict`
- [engine/memex/memex/domain/reserved.py](/code/engine/memex/memex/domain/reserved.py.md) - module; depends on 0; used by 0; high-signal symbols: `_is_okf_root_shape`, `classify_reserved`, `classify_reserved_text`
- [engine/memex/memex/domain/scrub.py](/code/engine/memex/memex/domain/scrub.py.md) - module; depends on 0; used by 0; high-signal symbols: `scrub`
- [engine/memex/memex/domain/slugs.py](/code/engine/memex/memex/domain/slugs.py.md) - module; depends on 0; used by 0; high-signal symbols: `slugify`, `sha1_slug`, `derive_slug`
- [engine/memex/memex/domain/types.py](/code/engine/memex/memex/domain/types.py.md) - model module; depends on 0; used by 0; high-signal symbols: `TypeDeclaration`, `TypeContract`, `_echo`
- 19 modules omitted from compact summary.

# Impact map

No local dependency edges detected in this summary scope.

# Impact notes

Use this summary to choose a target module, then read that module at depth 0 or depth 1 for dependency and dependent context.
<!-- okf-code:end -->
