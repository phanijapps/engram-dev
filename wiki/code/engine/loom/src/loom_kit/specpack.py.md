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
source_hash: bfe0cc94be4c61aa08f68702f1ef4cdc014cf46939b86752b1efb7189b4ae9e4
managed_by: okf-code
generated_profile: compact
created: 2026-10-08T02:51:49Z
generated:
  by: process:okf-code
  at: '2026-10-09T03:37:20Z'
status: stable
package: engine/loom
---
<!-- okf-code:start -->
# Overview

Generated CodeModule concept for `engine/loom/src/loom_kit/specpack.py`. Purpose: engine/loom/src/loom_kit/specpack.py is a `python` module in package `engine/loom`. Role: module. high-signal symbols: `derive_deliverable`, `save`, `_now`, `_digest`, `_vschema`. Dependency context: 1 local dependencies and 1 local dependents are linked when resolvable. Impact: changes here may affect linked dependents, imported dependencies, and callers identified by generated reverse edges. This page is syntax-derived for code finding, code-logic search, and impact-analysis groundwork.

# Symbols

| Kind | Name | Lines |
|---|---|---|
| function | `derive_deliverable` | 40-63 |
| function | `save` | 66-70 |
| function | `_now` | 73-74 |
| function | `_digest` | 77-78 |
| function | `_vschema` | 81-83 |
| function | `spec_path` | 86-100 |
| function | `load_specpack` | 103-132 |
| function | `validate` | 135-139 |
| function | `_families` | 142-154 |
| function | `alignment` | 157-289 |
| function | `dfs` | 210-217 |
| function | `closure_gaps` | 292-300 |
| function | `_decision` | 303-307 |
| function | `_assert_mutable` | 310-312 |
| function | `accept_decision` | 315-335 |
| function | `reject_decision` | 338-349 |
| function | `close` | 352-382 |
| function | `_fail_streak` | 385-392 |
| function | `_task` | 395-399 |
| function | `_git_root` | 402-407 |

10 symbols omitted from compact profile.

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
