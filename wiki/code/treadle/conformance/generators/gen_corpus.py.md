---
type: CodeModule
title: treadle/conformance/generators/gen_corpus.py
description: Generated code map for treadle/conformance/generators/gen_corpus.py.
  Depends on loom_kit.events, loom_kit.specpack, loom_kit.spine.LoomError.
resource: treadle/conformance/generators/gen_corpus.py
tags:
- code
- python
- depends-on
source_path: treadle/conformance/generators/gen_corpus.py
language: python
sources:
- id: src
  resource: treadle/conformance/generators/gen_corpus.py
source_hash: 4d7932a5f90d079a69330c74c9b94e1b09cefa64eed7e2d0440a065a5601f894
managed_by: okf-code
generated_profile: compact
created: 2026-10-10T00:37:58Z
generated:
  by: process:okf-code
  at: '2026-10-10T01:57:55Z'
status: stable
package: treadle
---
<!-- okf-code:start -->
# Overview

Generated CodeModule concept for `treadle/conformance/generators/gen_corpus.py`. Purpose: treadle/conformance/generators/gen_corpus.py is a `python` module in package `treadle`. Role: module. high-signal symbols: `_norm`, `J`, `emit_bytes`, `born_doc`, `write_input`. Dependency context: 3 local dependencies and 0 local dependents are linked when resolvable. Impact: changes here may affect linked dependents, imported dependencies, and callers identified by generated reverse edges. This page is syntax-derived for code finding, code-logic search, and impact-analysis groundwork.

# Symbols

| Kind | Name | Lines |
|---|---|---|
| function | `_norm` | 46-53 |
| function | `J` | 56-57 |
| function | `emit_bytes` | 60-61 |
| function | `born_doc` | 64-82 |
| function | `write_input` | 85-91 |
| function | `gen_l1` | 95-145 |
| function | `stage_case` | 109-117 |
| function | `open_q` | 119-121 |
| function | `doing` | 123-124 |
| function | `blocked` | 126-128 |
| function | `awaiting` | 130-131 |
| function | `in_review` | 133-134 |
| function | `all_done_pass` | 136-138 |
| function | `gen_l2` | 149-215 |
| function | `refusal_case` | 150-174 |
| function | `resolve_q1` | 176-177 |
| function | `unknown_q2` | 179-180 |
| function | `done_task` | 182-186 |
| function | `gen_l3` | 219-354 |
| function | `seq` | 220-251 |

11 symbols omitted from compact profile.

# Relationships

Depends on:
- [loom_kit.events](/code/engine/loom/src/loom_kit/events.py.md)
- [loom_kit.specpack](/code/engine/loom/src/loom_kit/specpack.py.md)
- [loom_kit.spine.LoomError](/code/engine/loom/src/loom_kit/spine.py.md)
- `__future__.annotations`
- `datetime`
- `hashlib`
- `json`
- `okf_kit.core.context.read_concept`
- `okf_kit.core.links.broken_links`
- `okf_kit.core.links.build_adjacency`
- `okf_kit.core.links.build_backlinks`
- `okf_kit.core.links.iter_concept_files`
- `okf_kit.core.parse.parse_concept`
- `okf_kit.core.search.build_index`
- `okf_kit.core.search.search`
- `okf_kit.core.validate.validate_bundle`
- `pathlib.Path`
- `shutil`
- `sys`
- `tempfile`

# Impact notes

Impact candidates on this page are syntax-derived. Treat them as a starting point for inspection, not as complete semantic proof of all callers, callees, or runtime effects.

<!-- okf-code:end -->
