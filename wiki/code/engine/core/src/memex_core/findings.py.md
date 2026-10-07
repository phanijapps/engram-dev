---
type: CodeModule
title: engine/core/src/memex_core/findings.py
description: Generated code map for engine/core/src/memex_core/findings.py. Depends
  on memex_core.resolve.OKF_STATE_DIRNAME.
resource: engine/core/src/memex_core/findings.py
tags:
- code
- python
- depends-on
source_path: engine/core/src/memex_core/findings.py
language: python
source_hash: 57f9ca7746a11d2bf3c49e6caad3426e7967767ca6bafa5269bdfbaf7d5adb0c
managed_by: okf-code
generated_profile: compact
package: engine/core
---
<!-- okf-code:start -->
# Overview

Generated CodeModule concept for `engine/core/src/memex_core/findings.py`. Purpose: engine/core/src/memex_core/findings.py is a `python` model module in package `engine/core`. Role: model module. high-signal symbols: `FindingsError`, `Finding`, `findings_path`, `_now`, `_finding_id`. Dependency context: 1 local dependencies and 2 local dependents are linked when resolvable. Impact: changes here may affect linked dependents, imported dependencies, and callers identified by generated reverse edges. This page is syntax-derived for code finding, code-logic search, and impact-analysis groundwork.

# Symbols

| Kind | Name | Lines |
|---|---|---|
| class | `FindingsError` | 29-30 |
| class | `Finding` | 34-42 |
| function | `findings_path` | 45-49 |
| function | `_now` | 52-53 |
| function | `_finding_id` | 56-58 |
| function | `_load` | 61-79 |
| function | `_dump` | 82-100 |
| function | `q` | 83-84 |
| function | `propose_finding` | 103-132 |
| function | `resolve_finding` | 135-149 |
| function | `list_findings` | 152-158 |

# Relationships

Depends on:
- [memex_core.resolve.OKF_STATE_DIRNAME](/code/engine/core/src/memex_core/resolve.py.md)
- `__future__.annotations`
- `dataclasses.asdict`
- `dataclasses.dataclass`
- `datetime.UTC`
- `datetime.datetime`
- `hashlib`
- `json`
- `memex_core.resolve.WIKI_DIRNAME`
- `memex_core.resolve.repo_root_of`
- `pathlib.Path`
- `tomllib`

Used by:
- [engine/core/src/memex_core/__init__.py](/code/engine/core/src/memex_core/__init__.py.md)
- [engine/core/src/memex_core/cli.py](/code/engine/core/src/memex_core/cli.py.md)

# Impact notes

Impact candidates on this page are syntax-derived. Treat them as a starting point for inspection, not as complete semantic proof of all callers, callees, or runtime effects.

# Citations

- Source: `engine/core/src/memex_core/findings.py`
- Source hash: `57f9ca7746a11d2bf3c49e6caad3426e7967767ca6bafa5269bdfbaf7d5adb0c`
<!-- okf-code:end -->
