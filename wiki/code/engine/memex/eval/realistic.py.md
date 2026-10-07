---
type: CodeModule
title: engine/memex/eval/realistic.py
description: Generated code map for engine/memex/eval/realistic.py.
resource: engine/memex/eval/realistic.py
tags:
- code
- python
source_path: engine/memex/eval/realistic.py
language: python
source_hash: 9fced6d8034c7809da4d9bbbf236f5b488af6b03175af0fe004338f9b962174f
managed_by: okf-code
generated_profile: compact
package: engine/memex
---
<!-- okf-code:start -->
# Overview

Generated CodeModule concept for `engine/memex/eval/realistic.py`. Purpose: engine/memex/eval/realistic.py is a `python` model module in package `engine/memex`. Role: model module. high-signal symbols: `RealisticCorpusGenerator`, `__init__`, `generate`, `_gen_architecture`, `_gen_debugging`. Dependency context: 0 local dependencies and 0 local dependents are linked when resolvable. Impact: changes here may affect linked dependents, imported dependencies, and callers identified by generated reverse edges. This page is syntax-derived for code finding, code-logic search, and impact-analysis groundwork.

# Symbols

| Kind | Name | Lines |
|---|---|---|
| class | `RealisticCorpusGenerator` | 268-676 |
| function | `__init__` | 271-285 |
| function | `generate` | 287-331 |
| function | `_gen_architecture` | 335-370 |
| function | `_gen_debugging` | 372-406 |
| function | `_gen_api_contract` | 408-437 |
| function | `_gen_convention` | 439-479 |
| function | `_gen_infrastructure` | 481-524 |
| function | `_gen_domain_knowledge` | 526-548 |
| function | `_gen_temporal` | 550-575 |
| function | `_gen_session` | 577-614 |
| function | `_write` | 618-655 |
| function | `_add_query` | 657-659 |
| function | `_resolve_queries` | 661-676 |

# Relationships

- `__future__.annotations`
- `collections.abc.Sequence`
- `eval.corpus.CorpusResult`
- `eval.corpus.QuerySpec`
- `memex.domain.frontmatter.serialize_front_matter`
- `memex.domain.models.WikiNode`
- `memex.domain.models.utc_now_iso`
- `memex.domain.slugs.slugify`
- `memex.domain.slugs.unique_slug`
- `memex.domain.types.TYPE_DIRS`
- `memex.infrastructure.store.wiki_store.hash_body`
- `memex.infrastructure.store.wiki_store.node_front_matter`
- `pathlib.Path`
- `random`
- `time`
- `uuid`

# Impact notes

Impact candidates on this page are syntax-derived. Treat them as a starting point for inspection, not as complete semantic proof of all callers, callees, or runtime effects.

# Citations

- Source: `engine/memex/eval/realistic.py`
- Source hash: `9fced6d8034c7809da4d9bbbf236f5b488af6b03175af0fe004338f9b962174f`
<!-- okf-code:end -->
