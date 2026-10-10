---
type: CodeModule
title: engine/loom/src/loom_kit/cli.py
description: Generated code map for engine/loom/src/loom_kit/cli.py. Depends on .__version__,
  .machine, .specpack, .spine.LoomError, .templates.PLAN_TMPL.
resource: engine/loom/src/loom_kit/cli.py
tags:
- code
- python
- depends-on
source_path: engine/loom/src/loom_kit/cli.py
language: python
sources:
- id: src
  resource: engine/loom/src/loom_kit/cli.py
source_hash: 94e8106fbb33e77c5d8b1f0f729ccfc50e2c20a2e8b3752363817e750bc95ed3
managed_by: okf-code
generated_profile: compact
created: 2026-10-08T01:36:35Z
generated:
  by: process:okf-code
  at: '2026-10-10T02:00:52Z'
status: stable
package: engine/loom
---
<!-- okf-code:start -->
# Overview

Generated CodeModule concept for `engine/loom/src/loom_kit/cli.py`. Purpose: engine/loom/src/loom_kit/cli.py is a `python` module in package `engine/loom`. Role: module. high-signal symbols: `_mode`, `_specpack_path`, `cmd_check`, `_evidence`, `cmd_init`. Dependency context: 7 local dependencies and 0 local dependents are linked when resolvable. Impact: changes here may affect linked dependents, imported dependencies, and callers identified by generated reverse edges. This page is syntax-derived for code finding, code-logic search, and impact-analysis groundwork.

# Symbols

| Kind | Name | Lines |
|---|---|---|
| function | `_mode` | 24-29 |
| function | `_specpack_path` | 32-33 |
| function | `cmd_check` | 36-74 |
| function | `_evidence` | 77-85 |
| function | `cmd_init` | 88-100 |
| function | `cmd_add` | 103-124 |
| function | `cmd_validate` | 127-136 |
| function | `cmd_next` | 139-168 |
| function | `cmd_record` | 171-195 |
| function | `cmd_accept` | 198-210 |
| function | `cmd_close` | 213-230 |
| function | `cmd_answer` | 233-243 |
| function | `cmd_approve` | 246-256 |
| function | `cmd_reject` | 259-268 |
| function | `cmd_rebase` | 271-283 |
| function | `cmd_status` | 286-300 |
| function | `_next_specpack` | 303-384 |
| function | `esc_local` | 387-388 |
| function | `_record_specpack` | 391-409 |
| function | `_status_specpack` | 412-437 |

5 symbols omitted from compact profile.

# Relationships

Depends on:
- [.__version__](/code/engine/loom/src/loom_kit/__init__.py.md)
- [.machine](/code/engine/loom/src/loom_kit/machine.py.md)
- [.specpack](/code/engine/loom/src/loom_kit/specpack.py.md)
- [.spine.LoomError](/code/engine/loom/src/loom_kit/spine.py.md)
- [.templates.PLAN_TMPL](/code/engine/loom/src/loom_kit/templates.py.md)
- [.web.library](/code/engine/loom/src/loom_kit/web/library.html.md)
- [.web.server](/code/engine/loom/src/loom_kit/web/server.py.md)
- `.spine.SPINE_NAME`
- `.spine._now`
- `.spine.load`
- `.spine.new_spine`
- `.spine.save`
- `.spine.semantic_errors`
- `.spine.validate_schema`
- `.templates.REVIEW_TMPL`
- `.templates.SPEC_TMPL`
- `__future__.annotations`
- `argparse`
- `collections.Counter`
- `datetime.datetime`
- 5 imports omitted from compact profile.

# Impact notes

Impact candidates on this page are syntax-derived. Treat them as a starting point for inspection, not as complete semantic proof of all callers, callees, or runtime effects.

<!-- okf-code:end -->
