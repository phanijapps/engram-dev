---
type: CodeModule
title: engine/loom/src/loom_kit/specpack.py
description: Generated code map for engine/loom/src/loom_kit/specpack.py. Depends
  on .spine.LoomError.
resource: engine/loom/src/loom_kit/specpack.py
tags:
- code
- python
- depends-on
source_path: engine/loom/src/loom_kit/specpack.py
language: python
sources:
- id: src
  resource: engine/loom/src/loom_kit/specpack.py
source_hash: d7e0f1e0874f9ce7a621621c87e626b8bf2fc7f3e914cd860efb7621201286de
managed_by: okf-code
generated_profile: compact
created: 2026-10-08T02:51:49Z
generated:
  by: process:okf-code
  at: '2026-10-08T13:28:24Z'
status: stable
package: engine/loom
---
<!-- okf-code:start -->
# Overview

Generated CodeModule concept for `engine/loom/src/loom_kit/specpack.py`. Purpose: engine/loom/src/loom_kit/specpack.py is a `python` module in package `engine/loom`. Role: module. high-signal symbols: `_now`, `_digest`, `_vschema`, `load_specpack`, `validate`. Dependency context: 1 local dependencies and 1 local dependents are linked when resolvable. Impact: changes here may affect linked dependents, imported dependencies, and callers identified by generated reverse edges. This page is syntax-derived for code finding, code-logic search, and impact-analysis groundwork.

# Symbols

| Kind | Name | Lines |
|---|---|---|
| function | `_now` | 24-25 |
| function | `_digest` | 28-29 |
| function | `_vschema` | 32-34 |
| function | `load_specpack` | 37-53 |
| function | `validate` | 56-60 |
| function | `_families` | 63-72 |
| function | `alignment` | 75-171 |
| function | `dfs` | 127-134 |
| function | `_fail_streak` | 174-181 |
| function | `_task` | 184-188 |
| function | `next_task` | 191-217 |
| function | `slice_for` | 220-250 |
| function | `_lookup` | 253-275 |
| function | `record` | 278-318 |

# Relationships

Depends on:
- [.spine.LoomError](/code/engine/loom/src/loom_kit/spine.py.md)
- `.spine.save`
- `__future__.annotations`
- `datetime.datetime`
- `datetime.timezone`
- `hashlib`
- `json`
- `jsonschema.Draft202012Validator`
- `pathlib.Path`

Used by:
- [engine/loom/src/loom_kit/cli.py](/code/engine/loom/src/loom_kit/cli.py.md)

# Impact notes

Impact candidates on this page are syntax-derived. Treat them as a starting point for inspection, not as complete semantic proof of all callers, callees, or runtime effects.

<!-- okf-code:end -->
