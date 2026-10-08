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
source_hash: b0369be3bdb996d75fc123a34638e76478a6bf2d239706709ecb84e6eeac015d
managed_by: okf-code
generated_profile: compact
created: 2026-10-08T00:43:25Z
generated:
  by: process:okf-code
  at: '2026-10-08T23:21:37Z'
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
| function | `_build_parser` | 40-198 |
| function | `_dispatch` | 201-224 |
| function | `_cmd_init` | 227-230 |
| function | `_cmd_new` | 233-243 |
| function | `_cmd_validate` | 246-252 |
| function | `_cmd_search` | 255-268 |
| function | `_cmd_read` | 271-279 |
| function | `_cmd_index_regen` | 282-285 |
| function | `_cmd_findings` | 288-318 |
| function | `_cmd_fingerprints` | 321-329 |
| function | `_cmd_anchors` | 332-343 |
| function | `_cmd_status` | 346-360 |
| function | `_cmd_code` | 363-368 |
| function | `_cmd_code_rules` | 371-379 |
| function | `_cmd_code_index` | 382-409 |
| function | `_print_report` | 412-421 |
| function | `_print_hits` | 424-430 |
| function | `_hit_dict` | 433-440 |

# Relationships

- `__future__.annotations`
- `argparse`
- `json`
- `okf_kit.code.indexer.index_codebase`
- `okf_kit.code.semantic.write_candidates_manifest`
- `okf_kit.core.context`
- `okf_kit.core.context.ConceptNotFound`
- `okf_kit.core.findings.list_findings`
- `okf_kit.core.findings.propose_finding`
- `okf_kit.core.findings.resolve_finding`
- `okf_kit.core.fingerprints.anchor_review`
- `okf_kit.core.fingerprints.write_fingerprints`
- `okf_kit.core.index.regenerate_indexes`
- `okf_kit.core.search.build_index`
- `okf_kit.core.search.search`
- `okf_kit.core.stamp.write_freshness_stamp`
- `okf_kit.core.status.bundle_status`
- `okf_kit.core.templates.TEMPLATE_TYPES`
- `okf_kit.core.templates.create_concept`
- `okf_kit.core.templates.init_bundle`
- 5 imports omitted from compact profile.

# Impact notes

Impact candidates on this page are syntax-derived. Treat them as a starting point for inspection, not as complete semantic proof of all callers, callees, or runtime effects.

<!-- okf-code:end -->
