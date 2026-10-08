---
type: CodeModule
title: engine/loom/src/loom_kit/machine.py
description: Generated code map for engine/loom/src/loom_kit/machine.py. Depends on
  .EPISTEMIC, .spine.LoomError.
resource: engine/loom/src/loom_kit/machine.py
tags:
- code
- python
- depends-on
source_path: engine/loom/src/loom_kit/machine.py
language: python
sources:
- id: src
  resource: engine/loom/src/loom_kit/machine.py
source_hash: 9c59f30b250ca4d172ce92da488af0e32831d8aa07eff08dedf63b0e8d888d4b
managed_by: okf-code
generated_profile: compact
created: 2026-10-08T01:36:35Z
generated:
  by: process:okf-code
  at: '2026-10-08T23:21:39Z'
status: stable
package: engine/loom
---
<!-- okf-code:start -->
# Overview

Generated CodeModule concept for `engine/loom/src/loom_kit/machine.py`. Purpose: engine/loom/src/loom_kit/machine.py is a `python` module in package `engine/loom`. Role: module. high-signal symbols: `_digest`, `_prereq_states`, `_satisfied`, `_upstream_chain`, `walk`. Dependency context: 2 local dependencies and 1 local dependents are linked when resolvable. Impact: changes here may affect linked dependents, imported dependencies, and callers identified by generated reverse edges. This page is syntax-derived for code finding, code-logic search, and impact-analysis groundwork.

# Symbols

| Kind | Name | Lines |
|---|---|---|
| function | `_digest` | 26-27 |
| function | `_prereq_states` | 30-32 |
| function | `_satisfied` | 35-36 |
| function | `_upstream_chain` | 39-51 |
| function | `walk` | 43-48 |
| function | `add_node` | 54-118 |
| function | `_relation_kinds_ok` | 121-126 |
| function | `promote` | 129-139 |
| function | `compile_context` | 142-172 |
| function | `next_task` | 175-226 |
| function | `record` | 229-306 |
| function | `_fail_streak` | 309-318 |
| function | `persist` | 321-322 |

# Relationships

Depends on:
- [.EPISTEMIC](/code/engine/loom/src/loom_kit/__init__.py.md)
- [.spine.LoomError](/code/engine/loom/src/loom_kit/spine.py.md)
- `.NODE_KINDS`
- `.RELATION_KINDS`
- `.TERMINAL`
- `.spine._now`
- `.spine.bump`
- `.spine.node_ids`
- `.spine.requires_of`
- `.spine.save`
- `.spine.task_state`
- `__future__.annotations`
- `hashlib`
- `json`

Used by:
- [engine/loom/src/loom_kit/cli.py](/code/engine/loom/src/loom_kit/cli.py.md)

# Impact notes

Impact candidates on this page are syntax-derived. Treat them as a starting point for inspection, not as complete semantic proof of all callers, callees, or runtime effects.

<!-- okf-code:end -->
