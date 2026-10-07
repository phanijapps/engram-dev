---
type: CodeModule
title: engine/okf/okf_kit/cli.py
description: Generated code map for engine/okf/okf_kit/cli.py.
resource: engine/okf/okf_kit/cli.py
tags:
- code
- python
source_path: engine/okf/okf_kit/cli.py
language: python
source_hash: 95df84fda92d4fdfa3feb246f0f9b5f848936bc44565d5f3de528ab9d1607f19
managed_by: okf-code
generated_profile: compact
created: 2026-10-07T23:07:32Z
generated:
  by: process:okf-code
  at: '2026-10-07T23:13:36Z'
status: stable
package: engine/okf
---
<!-- okf-code:start -->
# Overview

Generated CodeModule concept for `engine/okf/okf_kit/cli.py`. Purpose: engine/okf/okf_kit/cli.py is a `python` module in package `engine/okf`. Role: module. high-signal symbols: `main`, `_build_parser`, `_dispatch`, `_cmd_init`, `_cmd_new`. Dependency context: 0 local dependencies and 0 local dependents are linked when resolvable. Impact: changes here may affect linked dependents, imported dependencies, and callers identified by generated reverse edges. This page is syntax-derived for code finding, code-logic search, and impact-analysis groundwork.

# Symbols

| Kind | Name | Lines |
|---|---|---|
| function | `main` | 22-37 |
| function | `_build_parser` | 40-161 |
| function | `_dispatch` | 164-179 |
| function | `_cmd_init` | 182-185 |
| function | `_cmd_new` | 188-198 |
| function | `_cmd_validate` | 201-207 |
| function | `_cmd_search` | 210-223 |
| function | `_cmd_read` | 226-234 |
| function | `_cmd_index_regen` | 237-240 |
| function | `_cmd_code` | 243-246 |
| function | `_cmd_code_index` | 249-276 |
| function | `_print_report` | 279-288 |
| function | `_print_hits` | 291-297 |
| function | `_hit_dict` | 300-307 |

# Relationships

- `__future__.annotations`
- `argparse`
- `json`
- `okf_kit.code.indexer.index_codebase`
- `okf_kit.core.context`
- `okf_kit.core.context.ConceptNotFound`
- `okf_kit.core.index.regenerate_indexes`
- `okf_kit.core.search.build_index`
- `okf_kit.core.search.search`
- `okf_kit.core.stamp.write_freshness_stamp`
- `okf_kit.core.templates.TEMPLATE_TYPES`
- `okf_kit.core.templates.create_concept`
- `okf_kit.core.templates.init_bundle`
- `okf_kit.core.validate.Report`
- `okf_kit.core.validate.validate_bundle`
- `pathlib.Path`
- `sys`
- `typing.Any`

# Impact notes

Impact candidates on this page are syntax-derived. Treat them as a starting point for inspection, not as complete semantic proof of all callers, callees, or runtime effects.

# Citations

- Source: `engine/okf/okf_kit/cli.py`
- Source hash: `95df84fda92d4fdfa3feb246f0f9b5f848936bc44565d5f3de528ab9d1607f19`
<!-- okf-code:end -->
