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
source_hash: 1677e00afda97790884a95c242b8bc5a5f9125e9d8d0dac39e538fc6d09cec4a
managed_by: okf-code
generated_profile: compact
created: 2026-10-08T02:51:49Z
generated:
  by: process:okf-code
  at: '2026-10-08T23:21:39Z'
status: stable
package: engine/loom
---
<!-- okf-code:start -->
# Overview

Generated CodeModule concept for `engine/loom/src/loom_kit/specpack.py`. Purpose: engine/loom/src/loom_kit/specpack.py is a `python` module in package `engine/loom`. Role: module. high-signal symbols: `_now`, `_digest`, `_vschema`, `load_specpack`, `validate`. Dependency context: 1 local dependencies and 1 local dependents are linked when resolvable. Impact: changes here may affect linked dependents, imported dependencies, and callers identified by generated reverse edges. This page is syntax-derived for code finding, code-logic search, and impact-analysis groundwork.

# Symbols

| Kind | Name | Lines |
|---|---|---|
| function | `_now` | 35-36 |
| function | `_digest` | 39-40 |
| function | `_vschema` | 43-45 |
| function | `load_specpack` | 48-69 |
| function | `validate` | 72-76 |
| function | `_families` | 79-88 |
| function | `alignment` | 91-203 |
| function | `dfs` | 143-150 |
| function | `closure_gaps` | 206-214 |
| function | `_decision` | 217-221 |
| function | `_assert_mutable` | 224-226 |
| function | `accept_decision` | 229-249 |
| function | `reject_decision` | 252-263 |
| function | `close` | 266-296 |
| function | `_fail_streak` | 299-306 |
| function | `_task` | 309-313 |
| function | `_git_root` | 316-321 |
| function | `_resolve_path` | 324-329 |
| function | `_pin_or_verify` | 332-361 |
| function | `_verify_refs` | 364-396 |

7 symbols omitted from compact profile.

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
