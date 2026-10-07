---
type: CodeModule
title: engine/core/src/memex_core/compile_context.py
description: Generated code map for engine/core/src/memex_core/compile_context.py.
  Depends on memex_core.search.CoreHit.
resource: engine/core/src/memex_core/compile_context.py
tags:
- code
- python
- depends-on
source_path: engine/core/src/memex_core/compile_context.py
language: python
source_hash: 40a2a64e88249ad34d9822676ba923af1426393a5318c70fd44177d3a82b8150
managed_by: okf-code
generated_profile: compact
created: 2026-10-07T23:07:32Z
generated:
  by: process:okf-code
  at: '2026-10-07T23:07:34Z'
status: stable
package: engine/core
---
<!-- okf-code:start -->
# Overview

Generated CodeModule concept for `engine/core/src/memex_core/compile_context.py`. Purpose: engine/core/src/memex_core/compile_context.py is a `python` model module in package `engine/core`. Role: model module. high-signal symbols: `Manifest`, `Compiled`, `_Packable`, `__init__`, `snippet`. Dependency context: 1 local dependencies and 2 local dependents are linked when resolvable. Impact: changes here may affect linked dependents, imported dependencies, and callers identified by generated reverse edges. This page is syntax-derived for code finding, code-logic search, and impact-analysis groundwork.

# Symbols

| Kind | Name | Lines |
|---|---|---|
| class | `Manifest` | 28-33 |
| class | `Compiled` | 37-39 |
| class | `_Packable` | 42-52 |
| function | `__init__` | 47-48 |
| function | `snippet` | 51-52 |
| function | `_render` | 55-63 |
| function | `compile_context` | 66-145 |

# Relationships

Depends on:
- [memex_core.search.CoreHit](/code/engine/core/src/memex_core/search.py.md)
- `__future__.annotations`
- `dataclasses.dataclass`
- `dataclasses.field`
- `memex.application.compiler.estimate_tokens`
- `memex.application.compiler.pack_to_budget`
- `memex.infrastructure.config.MemexConfig`
- `memex_core.search.federated_search`
- `pathlib.Path`

Used by:
- [engine/core/src/memex_core/__init__.py](/code/engine/core/src/memex_core/__init__.py.md)
- [engine/core/src/memex_core/cli.py](/code/engine/core/src/memex_core/cli.py.md)

# Impact notes

Impact candidates on this page are syntax-derived. Treat them as a starting point for inspection, not as complete semantic proof of all callers, callees, or runtime effects.

# Citations

- Source: `engine/core/src/memex_core/compile_context.py`
- Source hash: `40a2a64e88249ad34d9822676ba923af1426393a5318c70fd44177d3a82b8150`
<!-- okf-code:end -->
