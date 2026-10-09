---
type: CodeSummary
title: repository
description: 'Generated repository code summary for repository. Top dependencies:
  ..events, ..specpack, ..spine.LoomError, .EPISTEMIC, .PROFILES. Top dependents:
  engine/loom/src/loom_kit/cli.py, engine/loom/src/loom_kit/machine.py, engine/loom/src/loom_kit/specpack.py,
  engine/loom/src/loom_kit/spine.py, engine/loom/src/loom_kit/web/server.py.'
tags:
- code
- summary
- impact
- repository
- depends-on
- used-by
summary_level: repository
managed_by: okf-code
created: 2026-10-08T00:43:25Z
generated:
  by: process:okf-code
  at: '2026-10-09T19:33:51Z'
status: stable
---
<!-- okf-code:start -->
# Overview

Generated repository summary for `repository`. Purpose: provide a low-token entry point for code search and impact analysis before opening file-level concepts.

# Key modules

- [engine/loom/src/loom_kit/cli.py](/code/engine/loom/src/loom_kit/cli.py.md) - module; depends on 6; used by 0; high-signal symbols: `_mode`, `_specpack_path`, `cmd_check`
- [engine/loom/src/loom_kit/spine.py](/code/engine/loom/src/loom_kit/spine.py.md) - model module; depends on 1; used by 4; high-signal symbols: `LoomError`, `_schema`, `MiniValidator`
- [engine/loom/src/loom_kit/web/server.py](/code/engine/loom/src/loom_kit/web/server.py.md) - model module; depends on 3; used by 1; high-signal symbols: `_Denied`, `_admit`, `interview_complete`
- [engine/loom/src/loom_kit/__init__.py](/code/engine/loom/src/loom_kit/__init__.py.md) - module; depends on 0; used by 3
- [engine/loom/src/loom_kit/machine.py](/code/engine/loom/src/loom_kit/machine.py.md) - module; depends on 2; used by 1; high-signal symbols: `_digest`, `_prereq_states`, `_satisfied`
- [engine/loom/src/loom_kit/specpack.py](/code/engine/loom/src/loom_kit/specpack.py.md) - module; depends on 1; used by 2; high-signal symbols: `derive_deliverable`, `_normalize`, `_emit`
- [engine/loom/src/loom_kit/events.py](/code/engine/loom/src/loom_kit/events.py.md) - module; depends on 0; used by 1; high-signal symbols: `_now`, `event`, `validate_event`
- [engine/loom/src/loom_kit/templates.py](/code/engine/loom/src/loom_kit/templates.py.md) - module; depends on 0; used by 1
- [engine/loom/src/loom_kit/web/__init__.py](/code/engine/loom/src/loom_kit/web/__init__.py.md) - module; depends on 0; used by 0
- [engine/loom/src/loom_kit/web/page.html](/code/engine/loom/src/loom_kit/web/page.html.md) - UI module; depends on 0; used by 0; high-signal symbols: `html`, `head`, `meta`
- [engine/loom/src/loom_kit/web/page.js](/code/engine/loom/src/loom_kit/web/page.js.md) - module; depends on 0; used by 0; high-signal symbols: `SECTIONS`, `KINDS`, `STAGES`
- [engine/okf/okf_kit/__init__.py](/code/engine/okf/okf_kit/__init__.py.md) - module; depends on 0; used by 0
- [engine/okf/okf_kit/cli.py](/code/engine/okf/okf_kit/cli.py.md) - module; depends on 0; used by 0; high-signal symbols: `main`, `_build_parser`, `_dispatch`
- [engine/okf/okf_kit/code/__init__.py](/code/engine/okf/okf_kit/code/__init__.py.md) - module; depends on 0; used by 0
- [engine/okf/okf_kit/code/discovery.py](/code/engine/okf/okf_kit/code/discovery.py.md) - model module; depends on 0; used by 0; high-signal symbols: `WorkspaceRepo`, `discover_repositories`, `_all_repositories`
- [engine/okf/okf_kit/code/indexer.py](/code/engine/okf/okf_kit/code/indexer.py.md) - module; depends on 0; used by 0; high-signal symbols: `extract_module`, `index_codebase`, `_has_explicit_scope`
- [engine/okf/okf_kit/code/managed.py](/code/engine/okf/okf_kit/code/managed.py.md) - module; depends on 0; used by 0; high-signal symbols: `merge_managed`, `split_generated`
- [engine/okf/okf_kit/code/model.py](/code/engine/okf/okf_kit/code/model.py.md) - model module; depends on 0; used by 0; high-signal symbols: `DiscoveredSource`, `CodeSymbol`, `CodeRelationship`
- [engine/okf/okf_kit/code/paths.py](/code/engine/okf/okf_kit/code/paths.py.md) - module; depends on 0; used by 0; high-signal symbols: `concept_id`, `concept_path`, `safe_segment`
- [engine/okf/okf_kit/code/render.py](/code/engine/okf/okf_kit/code/render.py.md) - module; depends on 0; used by 0; high-signal symbols: `_lifecycle_frontmatter`, `render_concept`, `render_summary_concept`
- 18 modules omitted from compact summary.

# Impact map

| Module | Depends | Used by | Relationship signals |
|---|---:|---:|---|
| [engine/loom/src/loom_kit/cli.py](/code/engine/loom/src/loom_kit/cli.py.md) | 6 | 0 | .__version__, .machine, .specpack |
| [engine/loom/src/loom_kit/spine.py](/code/engine/loom/src/loom_kit/spine.py.md) | 1 | 4 | .PROFILES, engine/loom/src/loom_kit/cli.py, engine/loom/src/loom_kit/machine.py, engine/loom/src/loom_kit/specpack.py |
| [engine/loom/src/loom_kit/web/server.py](/code/engine/loom/src/loom_kit/web/server.py.md) | 3 | 1 | ..events, ..specpack, ..spine.LoomError, engine/loom/src/loom_kit/cli.py |
| [engine/loom/src/loom_kit/__init__.py](/code/engine/loom/src/loom_kit/__init__.py.md) | 0 | 3 | engine/loom/src/loom_kit/cli.py, engine/loom/src/loom_kit/machine.py, engine/loom/src/loom_kit/spine.py |
| [engine/loom/src/loom_kit/machine.py](/code/engine/loom/src/loom_kit/machine.py.md) | 2 | 1 | .EPISTEMIC, .spine.LoomError, engine/loom/src/loom_kit/cli.py |
| [engine/loom/src/loom_kit/specpack.py](/code/engine/loom/src/loom_kit/specpack.py.md) | 1 | 2 | .spine.LoomError, engine/loom/src/loom_kit/cli.py, engine/loom/src/loom_kit/web/server.py |
| [engine/loom/src/loom_kit/events.py](/code/engine/loom/src/loom_kit/events.py.md) | 0 | 1 | engine/loom/src/loom_kit/web/server.py |
| [engine/loom/src/loom_kit/templates.py](/code/engine/loom/src/loom_kit/templates.py.md) | 0 | 1 | engine/loom/src/loom_kit/cli.py |

# Impact notes

Use this summary to choose a target module, then read that module at depth 0 or depth 1 for dependency and dependent context.
<!-- okf-code:end -->
