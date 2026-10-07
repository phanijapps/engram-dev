---
type: CodeModule
title: engine/memex/eval/rgapi_candidate.py
description: Generated code map for engine/memex/eval/rgapi_candidate.py.
resource: engine/memex/eval/rgapi_candidate.py
tags:
- code
- python
source_path: engine/memex/eval/rgapi_candidate.py
language: python
source_hash: e7e9a0756bb315c0f290f788e6d570a1d040553a07fa5caa28429559353814ef
managed_by: okf-code
generated_profile: compact
created: 2026-10-07T23:07:32Z
generated:
  by: process:okf-code
  at: '2026-10-07T23:07:34Z'
status: stable
package: engine/memex
---
<!-- okf-code:start -->
# Overview

Generated CodeModule concept for `engine/memex/eval/rgapi_candidate.py`. Purpose: engine/memex/eval/rgapi_candidate.py is a `python` model module in package `engine/memex`. Role: model module. high-signal symbols: `RgapiCandidateResult`, `actual_slugs`, `ranker_metadata`, `rank_rgapi_candidate`, `safe_rgapi_pattern`. Dependency context: 0 local dependencies and 0 local dependents are linked when resolvable. Impact: changes here may affect linked dependents, imported dependencies, and callers identified by generated reverse edges. This page is syntax-derived for code finding, code-logic search, and impact-analysis groundwork.

# Symbols

| Kind | Name | Lines |
|---|---|---|
| class | `RgapiCandidateResult` | 29-46 |
| function | `actual_slugs` | 35-36 |
| function | `ranker_metadata` | 38-46 |
| function | `rank_rgapi_candidate` | 49-87 |
| function | `safe_rgapi_pattern` | 90-101 |
| function | `_completion_state` | 104-109 |
| function | `_validated_markdown_paths` | 112-132 |
| function | `_resolved_docs_root` | 135-144 |
| function | `_is_junction` | 147-148 |
| function | `_sanitize_stop_reason` | 151-156 |
| function | `_incomplete` | 159-160 |

# Relationships

- `__future__.annotations`
- `dataclasses.dataclass`
- `eval.candidates.RankedCandidate`
- `pathlib.Path`
- `re`
- `rgapi`
- `stat`
- `typing.Any`

# Impact notes

Impact candidates on this page are syntax-derived. Treat them as a starting point for inspection, not as complete semantic proof of all callers, callees, or runtime effects.

# Citations

- Source: `engine/memex/eval/rgapi_candidate.py`
- Source hash: `e7e9a0756bb315c0f290f788e6d570a1d040553a07fa5caa28429559353814ef`
<!-- okf-code:end -->
