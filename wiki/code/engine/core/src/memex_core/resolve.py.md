---
type: CodeModule
title: engine/core/src/memex_core/resolve.py
description: Generated code map for engine/core/src/memex_core/resolve.py.
resource: engine/core/src/memex_core/resolve.py
tags:
- code
- python
source_path: engine/core/src/memex_core/resolve.py
language: python
source_hash: 3ace278d7b79407829e423709cb2e9be389cc73777d2d2ace231a3af54732c5a
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

Generated CodeModule concept for `engine/core/src/memex_core/resolve.py`. Purpose: engine/core/src/memex_core/resolve.py is a `python` model module in package `engine/core`. Role: model module. high-signal symbols: `WikiState`, `ResolveReport`, `_git_output`, `repo_root_of`, `_read_okf_version`. Dependency context: 0 local dependencies and 6 local dependents are linked when resolvable. Impact: changes here may affect linked dependents, imported dependencies, and callers identified by generated reverse edges. This page is syntax-derived for code finding, code-logic search, and impact-analysis groundwork.

# Symbols

| Kind | Name | Lines |
|---|---|---|
| class | `WikiState` | 28-37 |
| class | `ResolveReport` | 41-48 |
| function | `_git_output` | 51-58 |
| function | `repo_root_of` | 61-63 |
| function | `_read_okf_version` | 66-74 |
| function | `_count_concepts` | 77-82 |
| function | `_pending_findings` | 85-95 |
| function | `_wiki_state` | 98-123 |
| function | `resolve` | 126-143 |

# Relationships

- `__future__.annotations`
- `dataclasses.dataclass`
- `dataclasses.field`
- `json`
- `memex.infrastructure.config.MemexConfig`
- `memex.infrastructure.workspace_context.project_context`
- `okf_kit.core.parse.split_frontmatter`
- `pathlib.Path`
- `shutil`
- `subprocess`
- `tomllib`

Used by:
- [engine/core/src/memex_core/__init__.py](/code/engine/core/src/memex_core/__init__.py.md)
- [engine/core/src/memex_core/cli.py](/code/engine/core/src/memex_core/cli.py.md)
- [engine/core/src/memex_core/findings.py](/code/engine/core/src/memex_core/findings.py.md)
- [engine/core/src/memex_core/knowledge.py](/code/engine/core/src/memex_core/knowledge.py.md)
- [engine/core/src/memex_core/search.py](/code/engine/core/src/memex_core/search.py.md)
- [engine/core/src/memex_core/status.py](/code/engine/core/src/memex_core/status.py.md)

# Impact notes

Impact candidates on this page are syntax-derived. Treat them as a starting point for inspection, not as complete semantic proof of all callers, callees, or runtime effects.

# Citations

- Source: `engine/core/src/memex_core/resolve.py`
- Source hash: `3ace278d7b79407829e423709cb2e9be389cc73777d2d2ace231a3af54732c5a`
<!-- okf-code:end -->
