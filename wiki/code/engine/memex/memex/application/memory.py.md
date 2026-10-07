---
type: CodeModule
title: engine/memex/memex/application/memory.py
description: Generated code map for engine/memex/memex/application/memory.py.
resource: engine/memex/memex/application/memory.py
tags:
- code
- python
source_path: engine/memex/memex/application/memory.py
language: python
source_hash: e3edf8581843db0f56f69cd77180311d5762deff5968ae3205180d4bbb940421
managed_by: okf-code
generated_profile: compact
package: engine/memex
---
<!-- okf-code:start -->
# Overview

Generated CodeModule concept for `engine/memex/memex/application/memory.py`. Purpose: engine/memex/memex/application/memory.py is a `python` model module in package `engine/memex`. Role: model module. high-signal symbols: `Memex`, `__init__`, `_open_storage`, `close`, `write`. Dependency context: 0 local dependencies and 0 local dependents are linked when resolvable. Impact: changes here may affect linked dependents, imported dependencies, and callers identified by generated reverse edges. This page is syntax-derived for code finding, code-logic search, and impact-analysis groundwork.

# Symbols

| Kind | Name | Lines |
|---|---|---|
| class | `Memex` | 56-783 |
| function | `__init__` | 63-70 |
| function | `_open_storage` | 72-99 |
| function | `close` | 101-103 |
| function | `write` | 105-176 |
| function | `recall` | 178-312 |
| function | `_navigation_recall` | 314-347 |
| function | `recall_task` | 349-387 |
| function | `consolidate` | 389-435 |
| function | `forget` | 437-491 |
| function | `_validity_end` | 493-503 |
| function | `ingest_transcript` | 505-542 |
| function | `clear_transcripts` | 544-548 |
| function | `rebuild_index` | 550-633 |
| function | `backup` | 635-636 |
| function | `restore` | 638-658 |
| function | `_guard_reserved` | 661-676 |
| function | `approve` | 678-690 |
| function | `_on_page_written` | 692-699 |
| function | `_refresh_navigation` | 701-734 |

5 symbols omitted from compact profile.

# Relationships

- `__future__.annotations`
- `dataclasses.replace`
- `datetime.UTC`
- `datetime.datetime`
- `datetime.timedelta`
- `memex.application.compiler.( assemble_task_recall`
- `memex.application.compiler.)`
- `memex.application.compiler.pack_to_budget`
- `memex.application.compiler.validate_task_budget`
- `memex.application.compiler.with_linked_pages`
- `memex.application.concept_types.ConceptTypes`
- `memex.application.consolidator.WikiConsolidator`
- `memex.application.dto.to_jsonable`
- `memex.application.ports.LLMClient`
- `memex.application.verify.count_stale_index_rows`
- `memex.domain.errors.LLMError`
- `memex.domain.errors.WikiStoreError`
- `memex.domain.models.( FORGET_MODES`
- `memex.domain.models.)`
- `memex.domain.models.BackupReport`
- 40 imports omitted from compact profile.

# Impact notes

Impact candidates on this page are syntax-derived. Treat them as a starting point for inspection, not as complete semantic proof of all callers, callees, or runtime effects.

# Citations

- Source: `engine/memex/memex/application/memory.py`
- Source hash: `e3edf8581843db0f56f69cd77180311d5762deff5968ae3205180d4bbb940421`
<!-- okf-code:end -->
