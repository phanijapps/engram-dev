---
type: CodeSummary
title: repository/engine/core
description: 'Generated package code summary for repository/engine/core. Top dependencies:
  memex_core.compile_context.Compiled, memex_core.compile_context.compile_context,
  memex_core.findings.( findings_path, memex_core.findings.list_findings, memex_core.knowledge.wiki_init.
  Top dependents: engine/core/src/memex_core/__init__.py, engine/core/src/memex_core/cli.py,
  engine/core/src/memex_core/compile_context.py, engine/core/src/memex_core/findings.py,
  engine/core/src/memex_core/knowledge.py.'
tags:
- code
- summary
- impact
- package
- depends-on
- used-by
summary_level: package
managed_by: okf-code
package: engine/core
---
<!-- okf-code:start -->
# Overview

Generated package summary for `repository/engine/core`. Purpose: provide a low-token entry point for code search and impact analysis before opening file-level concepts.

# Key modules

- [engine/core/src/memex_core/__init__.py](/code/engine/core/src/memex_core/__init__.py.md) - module; depends on 7; used by 0
- [engine/core/src/memex_core/cli.py](/code/engine/core/src/memex_core/cli.py.md) - module; depends on 7; used by 0; high-signal symbols: `_jsonable`, `_from_dataclass`, `_emit`
- [engine/core/src/memex_core/resolve.py](/code/engine/core/src/memex_core/resolve.py.md) - model module; depends on 0; used by 6; high-signal symbols: `WikiState`, `ResolveReport`, `_git_output`
- [engine/core/src/memex_core/search.py](/code/engine/core/src/memex_core/search.py.md) - model module; depends on 1; used by 3; high-signal symbols: `CoreHit`, `_memory_hits`, `_wiki_hits`
- [engine/core/src/memex_core/compile_context.py](/code/engine/core/src/memex_core/compile_context.py.md) - model module; depends on 1; used by 2; high-signal symbols: `Manifest`, `Compiled`, `_Packable`
- [engine/core/src/memex_core/findings.py](/code/engine/core/src/memex_core/findings.py.md) - model module; depends on 1; used by 2; high-signal symbols: `FindingsError`, `Finding`, `findings_path`
- [engine/core/src/memex_core/knowledge.py](/code/engine/core/src/memex_core/knowledge.py.md) - model module; depends on 1; used by 2; high-signal symbols: `KnowledgeError`, `_bundle_root`, `wiki_init`
- [engine/core/src/memex_core/status.py](/code/engine/core/src/memex_core/status.py.md) - module; depends on 1; used by 2; high-signal symbols: `combined_status`
- [engine/core/src/memex_core/record.py](/code/engine/core/src/memex_core/record.py.md) - module; depends on 0; used by 2; high-signal symbols: `record_note`

# Impact map

| Module | Depends | Used by | Relationship signals |
|---|---:|---:|---|
| [engine/core/src/memex_core/__init__.py](/code/engine/core/src/memex_core/__init__.py.md) | 7 | 0 | memex_core.compile_context.Compiled, memex_core.findings.( findings_path, memex_core.knowledge.wiki_init |
| [engine/core/src/memex_core/cli.py](/code/engine/core/src/memex_core/cli.py.md) | 7 | 0 | memex_core.compile_context.compile_context, memex_core.findings.list_findings, memex_core.knowledge.wiki_init |
| [engine/core/src/memex_core/resolve.py](/code/engine/core/src/memex_core/resolve.py.md) | 0 | 6 | engine/core/src/memex_core/__init__.py, engine/core/src/memex_core/cli.py, engine/core/src/memex_core/findings.py |
| [engine/core/src/memex_core/search.py](/code/engine/core/src/memex_core/search.py.md) | 1 | 3 | memex_core.resolve.WIKI_DIRNAME, engine/core/src/memex_core/__init__.py, engine/core/src/memex_core/cli.py, engine/core/src/memex_core/compile_context.py |
| [engine/core/src/memex_core/compile_context.py](/code/engine/core/src/memex_core/compile_context.py.md) | 1 | 2 | memex_core.search.CoreHit, engine/core/src/memex_core/__init__.py, engine/core/src/memex_core/cli.py |
| [engine/core/src/memex_core/findings.py](/code/engine/core/src/memex_core/findings.py.md) | 1 | 2 | memex_core.resolve.OKF_STATE_DIRNAME, engine/core/src/memex_core/__init__.py, engine/core/src/memex_core/cli.py |
| [engine/core/src/memex_core/knowledge.py](/code/engine/core/src/memex_core/knowledge.py.md) | 1 | 2 | memex_core.resolve.( LAST_INDEX_STAMP, engine/core/src/memex_core/__init__.py, engine/core/src/memex_core/cli.py |
| [engine/core/src/memex_core/status.py](/code/engine/core/src/memex_core/status.py.md) | 1 | 2 | memex_core.resolve.WIKI_DIRNAME, engine/core/src/memex_core/__init__.py, engine/core/src/memex_core/cli.py |
| [engine/core/src/memex_core/record.py](/code/engine/core/src/memex_core/record.py.md) | 0 | 2 | engine/core/src/memex_core/__init__.py, engine/core/src/memex_core/cli.py |

# Impact notes

Use this summary to choose a target module, then read that module at depth 0 or depth 1 for dependency and dependent context.
<!-- okf-code:end -->
