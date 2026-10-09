---
type: CodeModule
title: engine/okf/okf_kit/code/discovery.py
description: Generated code map for engine/okf/okf_kit/code/discovery.py.
resource: engine/okf/okf_kit/code/discovery.py
tags:
- code
- python
source_path: engine/okf/okf_kit/code/discovery.py
language: python
sources:
- id: src
  resource: engine/okf/okf_kit/code/discovery.py
source_hash: c1d35cbae4b90f99bcb41d17222d90e0e8ed93664cfb73f4e2d2f479df7eff1c
managed_by: okf-code
generated_profile: compact
created: 2026-10-08T00:43:25Z
generated:
  by: process:okf-code
  at: '2026-10-09T14:19:04Z'
status: stable
package: engine/okf
---
<!-- okf-code:start -->
# Overview

Generated CodeModule concept for `engine/okf/okf_kit/code/discovery.py`. Purpose: engine/okf/okf_kit/code/discovery.py is a `python` model module in package `engine/okf`. Role: model module. high-signal symbols: `WorkspaceRepo`, `discover_repositories`, `_all_repositories`, `_has_repo_marker`, `_validate_scope_patterns`. Dependency context: 0 local dependencies and 0 local dependents are linked when resolvable. Impact: changes here may affect linked dependents, imported dependencies, and callers identified by generated reverse edges. This page is syntax-derived for code finding, code-logic search, and impact-analysis groundwork.

# Symbols

| Kind | Name | Lines |
|---|---|---|
| class | `WorkspaceRepo` | 60-71 |
| function | `discover_repositories` | 74-122 |
| function | `_all_repositories` | 125-153 |
| function | `_has_repo_marker` | 156-157 |
| function | `_validate_scope_patterns` | 160-175 |
| function | `adapters_for` | 178-198 |
| function | `language_help` | 201-208 |
| function | `iter_source_files` | 211-282 |
| function | `adapter_for_path` | 285-302 |
| function | `_is_default_skipped` | 305-310 |
| function | `_is_test_path` | 313-321 |
| function | `_is_noisy_path` | 324-328 |
| function | `_matches_any` | 331-332 |
| function | `_package_id` | 335-347 |

# Relationships

- `__future__.annotations`
- `dataclasses.dataclass`
- `fnmatch.fnmatch`
- `okf_kit.code.model.DiscoveredSource`
- `okf_kit.code.paths.safe_segment`
- `okf_kit.code.treesitter.languages.ADAPTERS`
- `okf_kit.code.treesitter.languages.LanguageAdapter`
- `okf_kit.core.links.is_within`
- `pathlib.Path`

# Impact notes

Impact candidates on this page are syntax-derived. Treat them as a starting point for inspection, not as complete semantic proof of all callers, callees, or runtime effects.

<!-- okf-code:end -->
