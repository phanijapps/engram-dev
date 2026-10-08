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
source_hash: 9e997d5611c270f25222618d4f0fb33c3236e0327d31c9f5725a2236b600644a
managed_by: okf-code
generated_profile: compact
created: 2026-10-08T02:51:49Z
generated:
  by: process:okf-code
  at: '2026-10-08T21:54:43Z'
status: stable
package: engine/loom
---
<!-- okf-code:start -->
# Overview

Generated CodeModule concept for `engine/loom/src/loom_kit/specpack.py`. Purpose: engine/loom/src/loom_kit/specpack.py is a `python` module in package `engine/loom`. Role: module. high-signal symbols: `_now`, `_digest`, `_vschema`, `load_specpack`, `validate`. Dependency context: 1 local dependencies and 1 local dependents are linked when resolvable. Impact: changes here may affect linked dependents, imported dependencies, and callers identified by generated reverse edges. This page is syntax-derived for code finding, code-logic search, and impact-analysis groundwork.

# Symbols

| Kind | Name | Lines |
|---|---|---|
| function | `_now` | 25-26 |
| function | `_digest` | 29-30 |
| function | `_vschema` | 33-35 |
| function | `load_specpack` | 38-57 |
| function | `validate` | 60-64 |
| function | `_families` | 67-76 |
| function | `alignment` | 79-191 |
| function | `dfs` | 131-138 |
| function | `_fail_streak` | 194-201 |
| function | `_task` | 204-208 |
| function | `_git_root` | 211-216 |
| function | `_resolve_path` | 219-224 |
| function | `_pin_or_verify` | 227-256 |
| function | `_verify_refs` | 259-291 |
| function | `rebase` | 294-329 |
| function | `_repin` | 310-317 |
| function | `next_task` | 332-372 |
| function | `_task_body` | 375-381 |
| function | `_node_body` | 384-410 |
| function | `slice_for` | 413-463 |

1 symbols omitted from compact profile.

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
