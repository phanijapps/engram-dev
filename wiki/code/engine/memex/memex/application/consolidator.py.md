---
type: CodeModule
title: engine/memex/memex/application/consolidator.py
description: Generated code map for engine/memex/memex/application/consolidator.py.
resource: engine/memex/memex/application/consolidator.py
tags:
- code
- python
source_path: engine/memex/memex/application/consolidator.py
language: python
source_hash: 079e38dec5fc76ade79167d3406881a65e053746b531bd583b574d725424e01e
managed_by: okf-code
generated_profile: compact
package: engine/memex
---
<!-- okf-code:start -->
# Overview

Generated CodeModule concept for `engine/memex/memex/application/consolidator.py`. Purpose: engine/memex/memex/application/consolidator.py is a `python` model module in package `engine/memex`. Role: model module. high-signal symbols: `_format_existing`, `_format_episodes`, `WikiConsolidator`, `__init__`, `consolidate`. Dependency context: 0 local dependencies and 0 local dependents are linked when resolvable. Impact: changes here may affect linked dependents, imported dependencies, and callers identified by generated reverse edges. This page is syntax-derived for code finding, code-logic search, and impact-analysis groundwork.

# Symbols

| Kind | Name | Lines |
|---|---|---|
| function | `_format_existing` | 91-96 |
| function | `_format_episodes` | 99-104 |
| class | `WikiConsolidator` | 107-389 |
| function | `__init__` | 110-126 |
| function | `consolidate` | 128-152 |
| function | `_consolidate_group` | 154-214 |
| function | `_select_episodes` | 216-227 |
| function | `_build_prompt` | 229-236 |
| function | `_parse_nodes` | 238-270 |
| function | `_accepted_proposed_type` | 273-286 |
| function | `_model_description` | 289-297 |
| function | `_store_node` | 299-351 |
| function | `_declare_draft_if_needed` | 353-389 |

# Relationships

- `__future__.annotations`
- `collections.Counter`
- `collections.abc.Callable`
- `json`
- `logging`
- `memex.application.ports.LLMClient`
- `memex.domain.errors.LLMError`
- `memex.domain.models.( ConsolidateInput`
- `memex.domain.models.)`
- `memex.domain.models.ConsolidationReport`
- `memex.domain.models.SemanticLink`
- `memex.domain.models.WikiNode`
- `memex.domain.models.WriteInput`
- `memex.domain.scrub.scrub`
- `memex.domain.types.initial_status`
- `memex.domain.types.validate_type_name`
- `memex.infrastructure.config.MemexConfig`
- `memex.infrastructure.search.index_manager.IndexManager`
- `memex.infrastructure.search.link_manager.LinkManager`
- `memex.infrastructure.store.wiki_store.WikiStore`
- 2 imports omitted from compact profile.

# Impact notes

Impact candidates on this page are syntax-derived. Treat them as a starting point for inspection, not as complete semantic proof of all callers, callees, or runtime effects.

# Citations

- Source: `engine/memex/memex/application/consolidator.py`
- Source hash: `079e38dec5fc76ade79167d3406881a65e053746b531bd583b574d725424e01e`
<!-- okf-code:end -->
