---
type: CodeModule
title: engine/okf/okf_kit/code/semantic.py
description: Generated code map for engine/okf/okf_kit/code/semantic.py.
resource: engine/okf/okf_kit/code/semantic.py
tags:
- code
- python
source_path: engine/okf/okf_kit/code/semantic.py
language: python
sources:
- id: src
  resource: engine/okf/okf_kit/code/semantic.py
source_hash: dcded661d5ffe5a4c88dbd0a0df727a459932a796e1028dde061b7ae51fb96f0
managed_by: okf-code
generated_profile: compact
created: 2026-10-08T00:43:25Z
generated:
  by: process:okf-code
  at: '2026-10-08T22:24:58Z'
status: stable
package: engine/okf
---
<!-- okf-code:start -->
# Overview

Generated CodeModule concept for `engine/okf/okf_kit/code/semantic.py`. Purpose: engine/okf/okf_kit/code/semantic.py is a `python` model module in package `engine/okf`. Role: model module. high-signal symbols: `RuleCandidate`, `_snippet`, `_call_name`, `_enclosing`, `_walk`. Dependency context: 0 local dependencies and 0 local dependents are linked when resolvable. Impact: changes here may affect linked dependents, imported dependencies, and callers identified by generated reverse edges. This page is syntax-derived for code finding, code-logic search, and impact-analysis groundwork.

# Symbols

| Kind | Name | Lines |
|---|---|---|
| class | `RuleCandidate` | 40-49 |
| function | `_snippet` | 52-55 |
| function | `_call_name` | 58-64 |
| function | `_enclosing` | 67-68 |
| function | `_walk` | 71-193 |
| function | `find_candidates_in_source` | 196-213 |
| function | `find_candidates` | 216-233 |
| function | `candidates_to_dict` | 236-237 |
| function | `write_candidates_manifest` | 240-256 |

# Relationships

- `__future__.annotations`
- `dataclasses.asdict`
- `dataclasses.dataclass`
- `datetime.UTC`
- `datetime.datetime`
- `hashlib`
- `json`
- `okf_kit.code.treesitter.runtime`
- `pathlib.Path`
- `re`
- `typing.Any`

# Impact notes

Impact candidates on this page are syntax-derived. Treat them as a starting point for inspection, not as complete semantic proof of all callers, callees, or runtime effects.

<!-- okf-code:end -->
