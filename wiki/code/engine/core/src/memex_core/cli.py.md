---
type: CodeModule
title: engine/core/src/memex_core/cli.py
description: Generated code map for engine/core/src/memex_core/cli.py. Depends on
  memex_core.compile_context.compile_context, memex_core.findings.list_findings, memex_core.knowledge.wiki_init,
  memex_core.record.record_note, memex_core.resolve.resolve.
resource: engine/core/src/memex_core/cli.py
tags:
- code
- python
- depends-on
source_path: engine/core/src/memex_core/cli.py
language: python
source_hash: 6db4dc6c140eb7fb2d5ccdfe7e2a0b482abc99b188f821fc9aaf13f301f378a9
managed_by: okf-code
generated_profile: compact
package: engine/core
---
<!-- okf-code:start -->
# Overview

Generated CodeModule concept for `engine/core/src/memex_core/cli.py`. Purpose: engine/core/src/memex_core/cli.py is a `python` module in package `engine/core`. Role: module. high-signal symbols: `_jsonable`, `_from_dataclass`, `_emit`, `_build_parser`, `main`. Dependency context: 7 local dependencies and 0 local dependents are linked when resolvable. Impact: changes here may affect linked dependents, imported dependencies, and callers identified by generated reverse edges. This page is syntax-derived for code finding, code-logic search, and impact-analysis groundwork.

# Symbols

| Kind | Name | Lines |
|---|---|---|
| function | `_jsonable` | 15-24 |
| function | `_from_dataclass` | 27-30 |
| function | `_emit` | 33-34 |
| function | `_build_parser` | 37-94 |
| function | `main` | 97-203 |

# Relationships

Depends on:
- [memex_core.compile_context.compile_context](/code/engine/core/src/memex_core/compile_context.py.md)
- [memex_core.findings.list_findings](/code/engine/core/src/memex_core/findings.py.md)
- [memex_core.knowledge.wiki_init](/code/engine/core/src/memex_core/knowledge.py.md)
- [memex_core.record.record_note](/code/engine/core/src/memex_core/record.py.md)
- [memex_core.resolve.resolve](/code/engine/core/src/memex_core/resolve.py.md)
- [memex_core.search.federated_search](/code/engine/core/src/memex_core/search.py.md)
- [memex_core.status.combined_status](/code/engine/core/src/memex_core/status.py.md)
- `__future__.annotations`
- `argparse`
- `dataclasses`
- `dataclasses.is_dataclass`
- `json`
- `memex.infrastructure.workspace_context.project_context`
- `memex_core.__version__`
- `memex_core.findings.propose_finding`
- `memex_core.findings.resolve_finding`
- `memex_core.knowledge.wiki_update`
- `pathlib.Path`
- `sys`
- `typing.Any`

# Impact notes

Impact candidates on this page are syntax-derived. Treat them as a starting point for inspection, not as complete semantic proof of all callers, callees, or runtime effects.

# Citations

- Source: `engine/core/src/memex_core/cli.py`
- Source hash: `6db4dc6c140eb7fb2d5ccdfe7e2a0b482abc99b188f821fc9aaf13f301f378a9`
<!-- okf-code:end -->
