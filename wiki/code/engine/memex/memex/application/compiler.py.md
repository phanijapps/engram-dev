---
type: CodeModule
title: engine/memex/memex/application/compiler.py
description: Generated code map for engine/memex/memex/application/compiler.py.
resource: engine/memex/memex/application/compiler.py
tags:
- code
- python
source_path: engine/memex/memex/application/compiler.py
language: python
source_hash: 09fd5b1cafdb3a9bb524667aa91c9f0b61e6ded838162cbadc2ad6153dab1143
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

Generated CodeModule concept for `engine/memex/memex/application/compiler.py`. Purpose: engine/memex/memex/application/compiler.py is a `python` model module in package `engine/memex`. Role: model module. high-signal symbols: `estimate_tokens`, `identity`, `_hit_identity`, `pack_to_budget`, `format_context_block`. Dependency context: 0 local dependencies and 0 local dependents are linked when resolvable. Impact: changes here may affect linked dependents, imported dependencies, and callers identified by generated reverse edges. This page is syntax-derived for code finding, code-logic search, and impact-analysis groundwork.

# Symbols

| Kind | Name | Lines |
|---|---|---|
| function | `estimate_tokens` | 49-51 |
| function | `identity` | 54-56 |
| function | `_hit_identity` | 59-60 |
| function | `pack_to_budget` | 63-77 |
| function | `format_context_block` | 83-106 |
| function | `build_injection` | 109-137 |
| class | `ExpansionEntry` | 150-163 |
| function | `depth` | 162-163 |
| class | `Expansion` | 167-171 |
| function | `omitted_marker` | 174-175 |
| function | `render_expansion` | 178-183 |
| function | `expand_links` | 186-231 |
| function | `_entry` | 234-253 |
| function | `_one_line` | 256-257 |
| function | `_pack_entries` | 260-274 |
| function | `_render` | 280-302 |
| function | `_gaps` | 305-317 |
| function | `assemble_task_recall` | 320-356 |
| function | `with_linked_pages` | 359-388 |
| function | `validate_task_budget` | 391-396 |

# Relationships

- `__future__.annotations`
- `collections.abc.Sequence`
- `dataclasses.dataclass`
- `dataclasses.replace`
- `json`
- `memex.application.memory.Memex`
- `memex.domain.models.RecallHit`
- `memex.domain.models.RecallResult`
- `memex.domain.models.TaskRecallInput`
- `memex.domain.models.TaskRecallResult`
- `sqlite3`
- `typing.TYPE_CHECKING`

# Impact notes

Impact candidates on this page are syntax-derived. Treat them as a starting point for inspection, not as complete semantic proof of all callers, callees, or runtime effects.

# Citations

- Source: `engine/memex/memex/application/compiler.py`
- Source hash: `09fd5b1cafdb3a9bb524667aa91c9f0b61e6ded838162cbadc2ad6153dab1143`
<!-- okf-code:end -->
