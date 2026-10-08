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
source_hash: 94762572407bcc3064a67b88568f8c493c1fac49736f4a7c2de8c89568f0515c
managed_by: okf-code
generated_profile: compact
created: 2026-10-08T02:51:49Z
generated:
  by: process:okf-code
  at: '2026-10-08T22:24:57Z'
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
| function | `closure_gaps` | 194-202 |
| function | `_decision` | 205-209 |
| function | `_assert_mutable` | 212-214 |
| function | `accept_decision` | 217-237 |
| function | `reject_decision` | 240-251 |
| function | `close` | 254-284 |
| function | `_fail_streak` | 287-294 |
| function | `_task` | 297-301 |
| function | `_git_root` | 304-309 |
| function | `_resolve_path` | 312-317 |
| function | `_pin_or_verify` | 320-349 |
| function | `_verify_refs` | 352-384 |

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
