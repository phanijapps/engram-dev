---
type: CodeModule
title: engine/core/src/memex_core/search.py
description: Generated code map for engine/core/src/memex_core/search.py. Depends
  on memex_core.resolve.WIKI_DIRNAME.
resource: engine/core/src/memex_core/search.py
tags:
- code
- python
- depends-on
source_path: engine/core/src/memex_core/search.py
language: python
source_hash: c1d34232f0d0a43d5dadc75fcdff9a664091ab949874be1aeef2fa4a3f45ca37
managed_by: okf-code
generated_profile: compact
package: engine/core
---
<!-- okf-code:start -->
# Overview

Generated CodeModule concept for `engine/core/src/memex_core/search.py`. Purpose: engine/core/src/memex_core/search.py is a `python` model module in package `engine/core`. Role: model module. high-signal symbols: `CoreHit`, `_memory_hits`, `_wiki_hits`, `_interleave`, `federated_search`. Dependency context: 1 local dependencies and 3 local dependents are linked when resolvable. Impact: changes here may affect linked dependents, imported dependencies, and callers identified by generated reverse edges. This page is syntax-derived for code finding, code-logic search, and impact-analysis groundwork.

# Symbols

| Kind | Name | Lines |
|---|---|---|
| class | `CoreHit` | 21-30 |
| function | `_memory_hits` | 33-56 |
| function | `_wiki_hits` | 59-76 |
| function | `_interleave` | 79-98 |
| function | `federated_search` | 101-125 |

# Relationships

Depends on:
- [memex_core.resolve.WIKI_DIRNAME](/code/engine/core/src/memex_core/resolve.py.md)
- `__future__.annotations`
- `dataclasses.dataclass`
- `memex.Memex`
- `memex.infrastructure.config.MemexConfig`
- `memex_core.resolve.repo_root_of`
- `okf_kit.core.search.build_index`
- `okf_kit.core.search.search`
- `pathlib.Path`

Used by:
- [engine/core/src/memex_core/__init__.py](/code/engine/core/src/memex_core/__init__.py.md)
- [engine/core/src/memex_core/cli.py](/code/engine/core/src/memex_core/cli.py.md)
- [engine/core/src/memex_core/compile_context.py](/code/engine/core/src/memex_core/compile_context.py.md)

# Impact notes

Impact candidates on this page are syntax-derived. Treat them as a starting point for inspection, not as complete semantic proof of all callers, callees, or runtime effects.

# Citations

- Source: `engine/core/src/memex_core/search.py`
- Source hash: `c1d34232f0d0a43d5dadc75fcdff9a664091ab949874be1aeef2fa4a3f45ca37`
<!-- okf-code:end -->
