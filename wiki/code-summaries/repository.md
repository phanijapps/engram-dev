---
type: CodeSummary
title: repository
description: 'Generated repository code summary for repository. Top dependencies:
  .EPISTEMIC, .PROFILES, .__version__, .machine, .specpack. Top dependents: engine/loom/src/loom_kit/cli.py,
  engine/loom/src/loom_kit/machine.py, engine/loom/src/loom_kit/specpack.py, engine/loom/src/loom_kit/spine.py.'
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
  at: '2026-10-08T22:24:57Z'
status: stable
---
<!-- okf-code:start -->
# Overview

Generated repository summary for `repository`. Purpose: provide a low-token entry point for code search and impact analysis before opening file-level concepts.

# Key modules

- [engine/loom/src/loom_kit/cli.py](/code/engine/loom/src/loom_kit/cli.py.md) - module; depends on 5; used by 0; high-signal symbols: `_mode`, `_specpack_path`, `cmd_check`
- [engine/loom/src/loom_kit/spine.py](/code/engine/loom/src/loom_kit/spine.py.md) - model module; depends on 1; used by 3; high-signal symbols: `LoomError`, `_schema`, `MiniValidator`
- [engine/loom/src/loom_kit/__init__.py](/code/engine/loom/src/loom_kit/__init__.py.md) - module; depends on 0; used by 3
- [engine/loom/src/loom_kit/machine.py](/code/engine/loom/src/loom_kit/machine.py.md) - module; depends on 2; used by 1; high-signal symbols: `_digest`, `_prereq_states`, `_satisfied`
- [engine/loom/src/loom_kit/specpack.py](/code/engine/loom/src/loom_kit/specpack.py.md) - module; depends on 1; used by 1; high-signal symbols: `_now`, `_digest`, `_vschema`
- [engine/loom/src/loom_kit/templates.py](/code/engine/loom/src/loom_kit/templates.py.md) - module; depends on 0; used by 1
- [engine/okf/okf_kit/__init__.py](/code/engine/okf/okf_kit/__init__.py.md) - module; depends on 0; used by 0
- [engine/okf/okf_kit/cli.py](/code/engine/okf/okf_kit/cli.py.md) - module; depends on 0; used by 0; high-signal symbols: `main`, `_build_parser`, `_dispatch`
- [engine/okf/okf_kit/code/__init__.py](/code/engine/okf/okf_kit/code/__init__.py.md) - module; depends on 0; used by 0
- [engine/okf/okf_kit/code/discovery.py](/code/engine/okf/okf_kit/code/discovery.py.md) - model module; depends on 0; used by 0; high-signal symbols: `WorkspaceRepo`, `discover_repositories`, `_all_repositories`
- [engine/okf/okf_kit/code/indexer.py](/code/engine/okf/okf_kit/code/indexer.py.md) - module; depends on 0; used by 0; high-signal symbols: `extract_module`, `index_codebase`, `_has_explicit_scope`
- [engine/okf/okf_kit/code/managed.py](/code/engine/okf/okf_kit/code/managed.py.md) - module; depends on 0; used by 0; high-signal symbols: `merge_managed`, `split_generated`
- [engine/okf/okf_kit/code/model.py](/code/engine/okf/okf_kit/code/model.py.md) - model module; depends on 0; used by 0; high-signal symbols: `DiscoveredSource`, `CodeSymbol`, `CodeRelationship`
- [engine/okf/okf_kit/code/paths.py](/code/engine/okf/okf_kit/code/paths.py.md) - module; depends on 0; used by 0; high-signal symbols: `concept_id`, `concept_path`, `safe_segment`
- [engine/okf/okf_kit/code/render.py](/code/engine/okf/okf_kit/code/render.py.md) - module; depends on 0; used by 0; high-signal symbols: `_lifecycle_frontmatter`, `render_concept`, `render_summary_concept`
- [engine/okf/okf_kit/code/semantic.py](/code/engine/okf/okf_kit/code/semantic.py.md) - model module; depends on 0; used by 0; high-signal symbols: `RuleCandidate`, `_snippet`, `_call_name`
- [engine/okf/okf_kit/code/treesitter/__init__.py](/code/engine/okf/okf_kit/code/treesitter/__init__.py.md) - module; depends on 0; used by 0
- [engine/okf/okf_kit/code/treesitter/languages/__init__.py](/code/engine/okf/okf_kit/code/treesitter/languages/__init__.py.md) - module; depends on 0; used by 0
- [engine/okf/okf_kit/code/treesitter/languages/base.py](/code/engine/okf/okf_kit/code/treesitter/languages/base.py.md) - model module; depends on 0; used by 0; high-signal symbols: `LanguageAdapter`, `extract`, `_walk`
- [engine/okf/okf_kit/code/treesitter/runtime.py](/code/engine/okf/okf_kit/code/treesitter/runtime.py.md) - module; depends on 0; used by 0; high-signal symbols: `parse_source`, `root_node`, `node_kind`
- 13 modules omitted from compact summary.

# Impact map

| Module | Depends | Used by | Relationship signals |
|---|---:|---:|---|
| [engine/loom/src/loom_kit/cli.py](/code/engine/loom/src/loom_kit/cli.py.md) | 5 | 0 | .__version__, .machine, .specpack |
| [engine/loom/src/loom_kit/spine.py](/code/engine/loom/src/loom_kit/spine.py.md) | 1 | 3 | .PROFILES, engine/loom/src/loom_kit/cli.py, engine/loom/src/loom_kit/machine.py, engine/loom/src/loom_kit/specpack.py |
| [engine/loom/src/loom_kit/__init__.py](/code/engine/loom/src/loom_kit/__init__.py.md) | 0 | 3 | engine/loom/src/loom_kit/cli.py, engine/loom/src/loom_kit/machine.py, engine/loom/src/loom_kit/spine.py |
| [engine/loom/src/loom_kit/machine.py](/code/engine/loom/src/loom_kit/machine.py.md) | 2 | 1 | .EPISTEMIC, .spine.LoomError, engine/loom/src/loom_kit/cli.py |
| [engine/loom/src/loom_kit/specpack.py](/code/engine/loom/src/loom_kit/specpack.py.md) | 1 | 1 | .spine.LoomError, engine/loom/src/loom_kit/cli.py |
| [engine/loom/src/loom_kit/templates.py](/code/engine/loom/src/loom_kit/templates.py.md) | 0 | 1 | engine/loom/src/loom_kit/cli.py |

# Impact notes

Use this summary to choose a target module, then read that module at depth 0 or depth 1 for dependency and dependent context.
<!-- okf-code:end -->
