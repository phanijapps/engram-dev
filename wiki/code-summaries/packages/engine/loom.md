---
type: CodeSummary
title: repository/engine/loom
description: 'Generated package code summary for repository/engine/loom. Top dependencies:
  ..events, ..specpack, ..spine.LoomError, .EPISTEMIC, .PROFILES. Top dependents:
  engine/loom/src/loom_kit/cli.py, engine/loom/src/loom_kit/machine.py, engine/loom/src/loom_kit/specpack.py,
  engine/loom/src/loom_kit/spine.py, engine/loom/src/loom_kit/web/library.py.'
tags:
- code
- summary
- impact
- package
- depends-on
- used-by
summary_level: package
managed_by: okf-code
created: 2026-10-08T01:36:35Z
generated:
  by: process:okf-code
  at: '2026-10-09T21:44:45Z'
status: stable
package: engine/loom
---
<!-- okf-code:start -->
# Overview

Generated package summary for `repository/engine/loom`. Purpose: provide a low-token entry point for code search and impact analysis before opening file-level concepts.

# Key modules

- [engine/loom/src/loom_kit/cli.py](/code/engine/loom/src/loom_kit/cli.py.md) - module; depends on 7; used by 0; high-signal symbols: `_mode`, `_specpack_path`, `cmd_check`
- [engine/loom/src/loom_kit/spine.py](/code/engine/loom/src/loom_kit/spine.py.md) - model module; depends on 1; used by 5; high-signal symbols: `LoomError`, `_schema`, `MiniValidator`
- [engine/loom/src/loom_kit/web/server.py](/code/engine/loom/src/loom_kit/web/server.py.md) - model module; depends on 3; used by 2; high-signal symbols: `_Denied`, `_admit`, `interview_complete`
- [engine/loom/src/loom_kit/specpack.py](/code/engine/loom/src/loom_kit/specpack.py.md) - module; depends on 1; used by 3; high-signal symbols: `derive_deliverable`, `_normalize`, `_emit`
- [engine/loom/src/loom_kit/web/library.py](/code/engine/loom/src/loom_kit/web/library.py.md) - model module; depends on 4; used by 0; high-signal symbols: `list_specs`, `_Handler`, `log_message`
- [engine/loom/src/loom_kit/__init__.py](/code/engine/loom/src/loom_kit/__init__.py.md) - module; depends on 0; used by 3
- [engine/loom/src/loom_kit/machine.py](/code/engine/loom/src/loom_kit/machine.py.md) - module; depends on 2; used by 1; high-signal symbols: `_digest`, `_prereq_states`, `_satisfied`
- [engine/loom/src/loom_kit/events.py](/code/engine/loom/src/loom_kit/events.py.md) - module; depends on 0; used by 2; high-signal symbols: `_now`, `event`, `validate_event`
- [engine/loom/src/loom_kit/templates.py](/code/engine/loom/src/loom_kit/templates.py.md) - module; depends on 0; used by 1
- [engine/loom/src/loom_kit/web/library.html](/code/engine/loom/src/loom_kit/web/library.html.md) - UI module; depends on 0; used by 1; high-signal symbols: `html`, `head`, `meta`
- [engine/loom/src/loom_kit/web/__init__.py](/code/engine/loom/src/loom_kit/web/__init__.py.md) - module; depends on 0; used by 0
- [engine/loom/src/loom_kit/web/library.js](/code/engine/loom/src/loom_kit/web/library.js.md) - module; depends on 0; used by 0; high-signal symbols: `S`, `$`, `WORDS`
- [engine/loom/src/loom_kit/web/page.html](/code/engine/loom/src/loom_kit/web/page.html.md) - UI module; depends on 0; used by 0; high-signal symbols: `html`, `head`, `meta`
- [engine/loom/src/loom_kit/web/page.js](/code/engine/loom/src/loom_kit/web/page.js.md) - module; depends on 0; used by 0; high-signal symbols: `SECTIONS`, `KINDS`, `STAGES`

# Impact map

| Module | Depends | Used by | Relationship signals |
|---|---:|---:|---|
| [engine/loom/src/loom_kit/cli.py](/code/engine/loom/src/loom_kit/cli.py.md) | 7 | 0 | .__version__, .machine, .specpack |
| [engine/loom/src/loom_kit/spine.py](/code/engine/loom/src/loom_kit/spine.py.md) | 1 | 5 | .PROFILES, engine/loom/src/loom_kit/cli.py, engine/loom/src/loom_kit/machine.py, engine/loom/src/loom_kit/specpack.py |
| [engine/loom/src/loom_kit/web/server.py](/code/engine/loom/src/loom_kit/web/server.py.md) | 3 | 2 | ..events, ..specpack, ..spine.LoomError, engine/loom/src/loom_kit/cli.py, engine/loom/src/loom_kit/web/library.py |
| [engine/loom/src/loom_kit/specpack.py](/code/engine/loom/src/loom_kit/specpack.py.md) | 1 | 3 | .spine.LoomError, engine/loom/src/loom_kit/cli.py, engine/loom/src/loom_kit/web/library.py, engine/loom/src/loom_kit/web/server.py |
| [engine/loom/src/loom_kit/web/library.py](/code/engine/loom/src/loom_kit/web/library.py.md) | 4 | 0 | ..events, ..specpack, ..spine.LoomError |
| [engine/loom/src/loom_kit/__init__.py](/code/engine/loom/src/loom_kit/__init__.py.md) | 0 | 3 | engine/loom/src/loom_kit/cli.py, engine/loom/src/loom_kit/machine.py, engine/loom/src/loom_kit/spine.py |
| [engine/loom/src/loom_kit/machine.py](/code/engine/loom/src/loom_kit/machine.py.md) | 2 | 1 | .EPISTEMIC, .spine.LoomError, engine/loom/src/loom_kit/cli.py |
| [engine/loom/src/loom_kit/events.py](/code/engine/loom/src/loom_kit/events.py.md) | 0 | 2 | engine/loom/src/loom_kit/web/library.py, engine/loom/src/loom_kit/web/server.py |
| [engine/loom/src/loom_kit/templates.py](/code/engine/loom/src/loom_kit/templates.py.md) | 0 | 1 | engine/loom/src/loom_kit/cli.py |
| [engine/loom/src/loom_kit/web/library.html](/code/engine/loom/src/loom_kit/web/library.html.md) | 0 | 1 | engine/loom/src/loom_kit/cli.py |

# Impact notes

Use this summary to choose a target module, then read that module at depth 0 or depth 1 for dependency and dependent context.
<!-- okf-code:end -->
