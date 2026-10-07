---
type: CodeModule
title: engine/core/src/memex_core/knowledge.py
description: Generated code map for engine/core/src/memex_core/knowledge.py. Depends
  on memex_core.resolve.LAST_INDEX_STAMP.
resource: engine/core/src/memex_core/knowledge.py
tags:
- code
- python
- depends-on
source_path: engine/core/src/memex_core/knowledge.py
language: python
source_hash: 8e17539fcab290524361bc87ec71646b4dc6199da405b6b7e07d1253b5b043cf
managed_by: okf-code
generated_profile: compact
package: engine/core
---
<!-- okf-code:start -->
# Overview

Generated CodeModule concept for `engine/core/src/memex_core/knowledge.py`. Purpose: engine/core/src/memex_core/knowledge.py is a `python` model module in package `engine/core`. Role: model module. high-signal symbols: `KnowledgeError`, `_bundle_root`, `wiki_init`, `_counts_as_dict`, `wiki_update`. Dependency context: 1 local dependencies and 2 local dependents are linked when resolvable. Impact: changes here may affect linked dependents, imported dependencies, and callers identified by generated reverse edges. This page is syntax-derived for code finding, code-logic search, and impact-analysis groundwork.

# Symbols

| Kind | Name | Lines |
|---|---|---|
| class | `KnowledgeError` | 27-28 |
| function | `_bundle_root` | 31-32 |
| function | `wiki_init` | 35-52 |
| function | `_counts_as_dict` | 55-60 |
| function | `wiki_update` | 63-116 |
| function | `_head` | 119-133 |

# Relationships

Depends on:
- [memex_core.resolve.LAST_INDEX_STAMP](/code/engine/core/src/memex_core/resolve.py.md)
- `__future__.annotations`
- `dataclasses.asdict`
- `dataclasses.is_dataclass`
- `datetime.UTC`
- `datetime.datetime`
- `json`
- `memex_core.resolve.OKF_STATE_DIRNAME`
- `memex_core.resolve.WIKI_DIRNAME`
- `memex_core.resolve.repo_root_of`
- `okf_kit.code.indexer.index_codebase`
- `okf_kit.core.index.regenerate_indexes`
- `okf_kit.core.templates.init_bundle`
- `pathlib.Path`
- `subprocess`

Used by:
- [engine/core/src/memex_core/__init__.py](/code/engine/core/src/memex_core/__init__.py.md)
- [engine/core/src/memex_core/cli.py](/code/engine/core/src/memex_core/cli.py.md)

# Impact notes

Impact candidates on this page are syntax-derived. Treat them as a starting point for inspection, not as complete semantic proof of all callers, callees, or runtime effects.

# Citations

- Source: `engine/core/src/memex_core/knowledge.py`
- Source hash: `8e17539fcab290524361bc87ec71646b4dc6199da405b6b7e07d1253b5b043cf`
<!-- okf-code:end -->
