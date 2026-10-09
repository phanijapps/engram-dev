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
source_hash: 6e05fa2d2a055e3e9ff3ef4dbc38ded85ed06aeeeac934599474b0ada987d1ee
managed_by: okf-code
generated_profile: compact
created: 2026-10-08T01:36:35Z
generated:
  by: process:okf-code
  at: '2026-10-09T03:37:20Z'
status: stable
package: engine/loom
---
<!-- okf-code:start -->
# Overview

Generated CodeModule concept for `engine/loom/src/loom_kit/cli.py`. Purpose: engine/loom/src/loom_kit/cli.py is a `python` module in package `engine/loom`. Role: module. high-signal symbols: `_mode`, `_specpack_path`, `cmd_check`, `_evidence`, `cmd_init`. Dependency context: 5 local dependencies and 0 local dependents are linked when resolvable. Impact: changes here may affect linked dependents, imported dependencies, and callers identified by generated reverse edges. This page is syntax-derived for code finding, code-logic search, and impact-analysis groundwork.

# Symbols

| Kind | Name | Lines |
|---|---|---|
| function | `_mode` | 24-29 |
| function | `_specpack_path` | 32-33 |
| function | `cmd_check` | 36-76 |
| function | `_evidence` | 79-87 |
| function | `cmd_init` | 90-102 |
| function | `cmd_add` | 105-126 |
| function | `cmd_validate` | 129-138 |
| function | `cmd_next` | 141-170 |
| function | `cmd_record` | 173-197 |
| function | `cmd_accept` | 200-212 |
| function | `cmd_close` | 215-232 |
| function | `cmd_reject` | 235-244 |
| function | `cmd_rebase` | 247-259 |
| function | `cmd_status` | 262-276 |
| function | `_next_specpack` | 279-360 |
| function | `esc_local` | 363-364 |
| function | `_record_specpack` | 367-385 |
| function | `_status_specpack` | 388-413 |
| function | `cmd_selftest` | 416-503 |
| function | `main` | 506-596 |

1 symbols omitted from compact profile.

# Relationships

Depends on:
- [.__version__](/code/engine/loom/src/loom_kit/__init__.py.md)
- [.machine](/code/engine/loom/src/loom_kit/machine.py.md)
- [.specpack](/code/engine/loom/src/loom_kit/specpack.py.md)
- [.spine.LoomError](/code/engine/loom/src/loom_kit/spine.py.md)
- [.templates.PLAN_TMPL](/code/engine/loom/src/loom_kit/templates.py.md)
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
- `json`
- `loom_kit.specpack`
- 3 imports omitted from compact profile.

# Impact notes

Impact candidates on this page are syntax-derived. Treat them as a starting point for inspection, not as complete semantic proof of all callers, callees, or runtime effects.

<!-- okf-code:end -->
