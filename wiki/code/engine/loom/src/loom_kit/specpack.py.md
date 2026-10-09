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
source_hash: af98134aec0827bb8cfdcdc2357cc9be478a46ef5b95c6142cab9d92d46fe5fa
managed_by: okf-code
generated_profile: compact
created: 2026-10-08T02:51:49Z
generated:
  by: process:okf-code
  at: '2026-10-09T20:22:42Z'
status: stable
package: engine/loom
---
<!-- okf-code:start -->
# Overview

Generated CodeModule concept for `engine/loom/src/loom_kit/specpack.py`. Purpose: engine/loom/src/loom_kit/specpack.py is a `python` module in package `engine/loom`. Role: module. high-signal symbols: `derive_deliverable`, `_normalize`, `_emit`, `save`, `_now`. Dependency context: 1 local dependencies and 3 local dependents are linked when resolvable. Impact: changes here may affect linked dependents, imported dependencies, and callers identified by generated reverse edges. This page is syntax-derived for code finding, code-logic search, and impact-analysis groundwork.

# Symbols

| Kind | Name | Lines |
|---|---|---|
| function | `derive_deliverable` | 51-82 |
| function | `_normalize` | 85-130 |
| function | `_emit` | 133-178 |
| function | `save` | 181-202 |
| function | `_now` | 205-206 |
| function | `_digest` | 209-210 |
| function | `_vschema` | 213-215 |
| function | `spec_path` | 218-232 |
| function | `load_specpack` | 235-265 |
| function | `validate` | 268-272 |
| function | `_families` | 275-287 |
| function | `alignment` | 290-422 |
| function | `dfs` | 343-350 |
| function | `closure_gaps` | 425-433 |
| function | `answer_question` | 436-465 |
| function | `_decision` | 468-472 |
| function | `_assert_mutable` | 475-477 |
| function | `accept_decision` | 480-500 |
| function | `approve_spec` | 503-516 |
| function | `reject_decision` | 519-530 |

14 symbols omitted from compact profile.

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
- [engine/loom/src/loom_kit/web/library.py](/code/engine/loom/src/loom_kit/web/library.py.md)
- [engine/loom/src/loom_kit/web/server.py](/code/engine/loom/src/loom_kit/web/server.py.md)

# Impact notes

Impact candidates on this page are syntax-derived. Treat them as a starting point for inspection, not as complete semantic proof of all callers, callees, or runtime effects.

<!-- okf-code:end -->
