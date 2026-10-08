---
type: CodeSummary
title: repository
description: Generated repository code summary for repository.
tags:
- code
- summary
- impact
- repository
summary_level: repository
managed_by: okf-code
created: 2026-10-07T23:07:31Z
generated:
  by: process:okf-code
  at: '2026-10-08T00:35:24Z'
status: stable
---
<!-- okf-code:start -->
# Overview

Generated repository summary for `repository`. Purpose: provide a low-token entry point for code search and impact analysis before opening file-level concepts.

# Key modules

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
- [engine/okf/okf_kit/core/__init__.py](/code/engine/okf/okf_kit/core/__init__.py.md) - module; depends on 0; used by 0
- [engine/okf/okf_kit/core/context.py](/code/engine/okf/okf_kit/core/context.py.md) - model module; depends on 0; used by 0; high-signal symbols: `ConceptNotFound`, `__init__`, `read_concept`
- [engine/okf/okf_kit/core/findings.py](/code/engine/okf/okf_kit/core/findings.py.md) - model module; depends on 0; used by 0; high-signal symbols: `FindingsError`, `Finding`, `findings_path`
- [engine/okf/okf_kit/core/fingerprints.py](/code/engine/okf/okf_kit/core/fingerprints.py.md) - module; depends on 0; used by 0; high-signal symbols: `_sha256`, `_git_head`, `compute_fingerprints`
- [engine/okf/okf_kit/core/index.py](/code/engine/okf/okf_kit/core/index.py.md) - module; depends on 0; used by 0; high-signal symbols: `regenerate_indexes`, `_render_index`, `_str_field`
- [engine/okf/okf_kit/core/links.py](/code/engine/okf/okf_kit/core/links.py.md) - module; depends on 0; used by 0; high-signal symbols: `is_external_target`, `is_absolute_target`, `cid_segments_valid`
- 7 modules omitted from compact summary.

# Impact map

No local dependency edges detected in this summary scope.

# Impact notes

Use this summary to choose a target module, then read that module at depth 0 or depth 1 for dependency and dependent context.
<!-- okf-code:end -->
