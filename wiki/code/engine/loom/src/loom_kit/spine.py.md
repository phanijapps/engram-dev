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
source_hash: 6331aa23041e67a8e8bf42f6c1eefa9d049fcdca28d518f6272ac47a9862b6b3
managed_by: okf-code
generated_profile: compact
created: 2026-10-08T01:36:35Z
generated:
  by: process:okf-code
  at: '2026-10-10T00:37:58Z'
status: stable
package: engine/loom
---
<!-- okf-code:start -->
# Overview

Generated CodeModule concept for `engine/loom/src/loom_kit/spine.py`. Purpose: engine/loom/src/loom_kit/spine.py is a `python` model module in package `engine/loom`. Role: model module. high-signal symbols: `LoomError`, `_schema`, `MiniValidator`, `__init__`, `_ref`. Dependency context: 1 local dependencies and 6 local dependents are linked when resolvable. Impact: changes here may affect linked dependents, imported dependencies, and callers identified by generated reverse edges. This page is syntax-derived for code finding, code-logic search, and impact-analysis groundwork.

# Symbols

| Kind | Name | Lines |
|---|---|---|
| class | `LoomError` | 25-26 |
| function | `_schema` | 29-31 |
| class | `MiniValidator` | 34-136 |
| function | `__init__` | 56-57 |
| function | `_ref` | 59-65 |
| function | `validate` | 67-136 |
| function | `validate_schema` | 139-141 |
| function | `_now` | 144-147 |
| function | `semantic_errors` | 150-206 |
| function | `dfs` | 174-181 |
| function | `load` | 209-224 |
| function | `save` | 227-244 |
| function | `bump` | 247-249 |
| function | `new_spine` | 252-272 |
| function | `node_ids` | 275-276 |
| function | `task_state` | 279-283 |
| function | `requires_of` | 286-291 |

# Relationships

Depends on:
- [.PROFILES](/code/engine/loom/src/loom_kit/__init__.py.md)
- `.SCHEMA_VERSION`
- `__future__.annotations`
- `datetime.datetime`
- `datetime.timezone`
- `json`
- `os`
- `pathlib.Path`
- `re`
- `threading`

Used by:
- [engine/loom/src/loom_kit/cli.py](/code/engine/loom/src/loom_kit/cli.py.md)
- [engine/loom/src/loom_kit/machine.py](/code/engine/loom/src/loom_kit/machine.py.md)
- [engine/loom/src/loom_kit/specpack.py](/code/engine/loom/src/loom_kit/specpack.py.md)
- [engine/loom/src/loom_kit/web/library.py](/code/engine/loom/src/loom_kit/web/library.py.md)
- [engine/loom/src/loom_kit/web/server.py](/code/engine/loom/src/loom_kit/web/server.py.md)
- [treadle/conformance/generators/gen_corpus.py](/code/treadle/conformance/generators/gen_corpus.py.md)

# Impact notes

Impact candidates on this page are syntax-derived. Treat them as a starting point for inspection, not as complete semantic proof of all callers, callees, or runtime effects.

<!-- okf-code:end -->
