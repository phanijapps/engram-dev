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
source_hash: 5703698d09e16ef60711b7bcb779ec34724c2bf73831c999e61427c160fce202
managed_by: okf-code
generated_profile: compact
created: 2026-10-08T02:51:49Z
generated:
  by: process:okf-code
  at: '2026-10-09T14:19:03Z'
status: stable
package: engine/loom
---
<!-- okf-code:start -->
# Overview

Generated CodeModule concept for `engine/loom/src/loom_kit/specpack.py`. Purpose: engine/loom/src/loom_kit/specpack.py is a `python` module in package `engine/loom`. Role: module. high-signal symbols: `derive_deliverable`, `_normalize`, `_emit`, `save`, `_now`. Dependency context: 1 local dependencies and 1 local dependents are linked when resolvable. Impact: changes here may affect linked dependents, imported dependencies, and callers identified by generated reverse edges. This page is syntax-derived for code finding, code-logic search, and impact-analysis groundwork.

# Symbols

| Kind | Name | Lines |
|---|---|---|
| function | `derive_deliverable` | 51-74 |
| function | `_normalize` | 77-116 |
| function | `_emit` | 119-162 |
| function | `save` | 165-186 |
| function | `_now` | 189-190 |
| function | `_digest` | 193-194 |
| function | `_vschema` | 197-199 |
| function | `spec_path` | 202-216 |
| function | `load_specpack` | 219-249 |
| function | `validate` | 252-256 |
| function | `_families` | 259-271 |
| function | `alignment` | 274-406 |
| function | `dfs` | 327-334 |
| function | `closure_gaps` | 409-417 |
| function | `_decision` | 420-424 |
| function | `_assert_mutable` | 427-429 |
| function | `accept_decision` | 432-452 |
| function | `reject_decision` | 455-466 |
| function | `close` | 469-499 |
| function | `_fail_streak` | 502-509 |

12 symbols omitted from compact profile.

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
- `os`
- `pathlib.Path`
- `threading`

Used by:
- [engine/loom/src/loom_kit/cli.py](/code/engine/loom/src/loom_kit/cli.py.md)

# Impact notes

Impact candidates on this page are syntax-derived. Treat them as a starting point for inspection, not as complete semantic proof of all callers, callees, or runtime effects.

<!-- okf-code:end -->
