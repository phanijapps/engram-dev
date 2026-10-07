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
sources:
- id: src
  resource: engine/okf/okf_kit/cli.py
source_hash: a5f31f2a3dfa7e80f38dc20ea83a8c9be5fa43268aec0e3d7d3fe3a56e74f439
managed_by: okf-code
generated_profile: compact
created: 2026-10-07T23:07:32Z
generated:
  by: process:okf-code
  at: '2026-10-07T23:50:47Z'
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
| function | `_build_parser` | 40-177 |
| function | `_dispatch` | 180-197 |
| function | `_cmd_init` | 200-203 |
| function | `_cmd_new` | 206-216 |
| function | `_cmd_validate` | 219-225 |
| function | `_cmd_search` | 228-241 |
| function | `_cmd_read` | 244-252 |
| function | `_cmd_index_regen` | 255-258 |
| function | `_cmd_findings` | 261-291 |
| function | `_cmd_code` | 294-297 |
| function | `_cmd_code_index` | 300-327 |
| function | `_print_report` | 330-339 |
| function | `_print_hits` | 342-348 |
| function | `_hit_dict` | 351-358 |

# Relationships

- `__future__.annotations`
- `argparse`
- `json`
- `okf_kit.code.indexer.index_codebase`
- `okf_kit.core.context`
- `okf_kit.core.context.ConceptNotFound`
- `okf_kit.core.findings.list_findings`
- `okf_kit.core.findings.propose_finding`
- `okf_kit.core.findings.resolve_finding`
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
- 1 imports omitted from compact profile.

# Impact notes

Impact candidates on this page are syntax-derived. Treat them as a starting point for inspection, not as complete semantic proof of all callers, callees, or runtime effects.

<!-- okf-code:end -->
