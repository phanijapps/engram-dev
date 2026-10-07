---
type: CodeModule
title: engine/memex/eval/corpus.py
description: Generated code map for engine/memex/eval/corpus.py.
resource: engine/memex/eval/corpus.py
tags:
- code
- python
source_path: engine/memex/eval/corpus.py
language: python
source_hash: 12dcb14c8782f184126800df07311559cc0655f20eccdeb0cc8cb30e3d63b923
managed_by: okf-code
generated_profile: compact
package: engine/memex
---
<!-- okf-code:start -->
# Overview

Generated CodeModule concept for `engine/memex/eval/corpus.py`. Purpose: engine/memex/eval/corpus.py is a `python` model module in package `engine/memex`. Role: model module. high-signal symbols: `QuerySpec`, `relevant_slugs`, `CorpusResult`, `CorpusGenerator`, `__init__`. Dependency context: 0 local dependencies and 0 local dependents are linked when resolvable. Impact: changes here may affect linked dependents, imported dependencies, and callers identified by generated reverse edges. This page is syntax-derived for code finding, code-logic search, and impact-analysis groundwork.

# Symbols

| Kind | Name | Lines |
|---|---|---|
| class | `QuerySpec` | 115-128 |
| function | `relevant_slugs` | 126-128 |
| class | `CorpusResult` | 132-138 |
| class | `CorpusGenerator` | 141-341 |
| function | `__init__` | 144-149 |
| function | `generate` | 151-193 |
| function | `_gen_entity` | 197-209 |
| function | `_gen_preference` | 211-227 |
| function | `_gen_procedure` | 229-253 |
| function | `_gen_summary` | 255-278 |
| function | `_gen_distractor` | 280-302 |
| function | `_write` | 306-338 |
| function | `_add_query` | 340-341 |
| function | `_slugify` | 344-349 |

# Relationships

- `__future__.annotations`
- `dataclasses.dataclass`
- `dataclasses.field`
- `memex.application.memory.Memex`
- `memex.domain.frontmatter.serialize_front_matter`
- `memex.domain.models.WikiNode`
- `memex.domain.models.utc_now_iso`
- `memex.domain.types.TYPE_DIRS`
- `memex.infrastructure.store.wiki_store.hash_body`
- `memex.infrastructure.store.wiki_store.node_front_matter`
- `random`
- `re`
- `time`

# Impact notes

Impact candidates on this page are syntax-derived. Treat them as a starting point for inspection, not as complete semantic proof of all callers, callees, or runtime effects.

# Citations

- Source: `engine/memex/eval/corpus.py`
- Source hash: `12dcb14c8782f184126800df07311559cc0655f20eccdeb0cc8cb30e3d63b923`
<!-- okf-code:end -->
