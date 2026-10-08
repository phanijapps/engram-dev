---
type: CodeModule
title: engine/loom/src/loom_kit/spine.py
description: Generated code map for engine/loom/src/loom_kit/spine.py. Depends on
  .PROFILES.
resource: engine/loom/src/loom_kit/spine.py
tags:
- code
- python
- depends-on
source_path: engine/loom/src/loom_kit/spine.py
language: python
sources:
- id: src
  resource: engine/loom/src/loom_kit/spine.py
source_hash: b5abacd357eb159c953565807ff6eb5ed29ad1535fade16a75a1a73e53b706f2
managed_by: okf-code
generated_profile: compact
created: '2026-10-08T01:36:35Z'
generated:
  by: process:okf-code
  at: '2026-10-08T01:36:35Z'
status: stable
package: engine/loom
---
<!-- okf-code:start -->
# Overview

Generated CodeModule concept for `engine/loom/src/loom_kit/spine.py`. Purpose: engine/loom/src/loom_kit/spine.py is a `python` model module in package `engine/loom`. Role: model module. high-signal symbols: `LoomError`, `_schema`, `MiniValidator`, `__init__`, `_ref`. Dependency context: 1 local dependencies and 2 local dependents are linked when resolvable. Impact: changes here may affect linked dependents, imported dependencies, and callers identified by generated reverse edges. This page is syntax-derived for code finding, code-logic search, and impact-analysis groundwork.

# Symbols

| Kind | Name | Lines |
|---|---|---|
| class | `LoomError` | 24-25 |
| function | `_schema` | 28-30 |
| class | `MiniValidator` | 33-108 |
| function | `__init__` | 41-42 |
| function | `_ref` | 44-49 |
| function | `validate` | 51-108 |
| function | `validate_schema` | 111-113 |
| function | `_now` | 116-119 |
| function | `semantic_errors` | 122-178 |
| function | `dfs` | 146-153 |
| function | `load` | 181-196 |
| function | `save` | 199-203 |
| function | `bump` | 206-208 |
| function | `new_spine` | 211-231 |
| function | `node_ids` | 234-235 |
| function | `task_state` | 238-242 |
| function | `requires_of` | 245-250 |

# Relationships

Depends on:
- [.PROFILES](/code/engine/loom/src/loom_kit/__init__.py.md)
- `.SCHEMA_VERSION`
- `__future__.annotations`
- `datetime.datetime`
- `datetime.timezone`
- `json`
- `pathlib.Path`
- `re`
- `threading`

Used by:
- [engine/loom/src/loom_kit/cli.py](/code/engine/loom/src/loom_kit/cli.py.md)
- [engine/loom/src/loom_kit/machine.py](/code/engine/loom/src/loom_kit/machine.py.md)

# Impact notes

Impact candidates on this page are syntax-derived. Treat them as a starting point for inspection, not as complete semantic proof of all callers, callees, or runtime effects.

<!-- okf-code:end -->
