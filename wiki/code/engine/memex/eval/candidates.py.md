---
type: CodeModule
title: engine/memex/eval/candidates.py
description: Generated code map for engine/memex/eval/candidates.py.
resource: engine/memex/eval/candidates.py
tags:
- code
- python
source_path: engine/memex/eval/candidates.py
language: python
source_hash: 8d8b99e4af631b7f737dc2f7897911afc04520e4fd475bac18710e9ab06ea950
managed_by: okf-code
generated_profile: compact
package: engine/memex
---
<!-- okf-code:start -->
# Overview

Generated CodeModule concept for `engine/memex/eval/candidates.py`. Purpose: engine/memex/eval/candidates.py is a `python` model module in package `engine/memex`. Role: model module. high-signal symbols: `RankedCandidate`, `CandidateSource`, `CurrentFtsSearcher`, `search_fts`, `LexicalCandidateRecipe`. Dependency context: 0 local dependencies and 0 local dependents are linked when resolvable. Impact: changes here may affect linked dependents, imported dependencies, and callers identified by generated reverse edges. This page is syntax-derived for code finding, code-logic search, and impact-analysis groundwork.

# Symbols

| Kind | Name | Lines |
|---|---|---|
| class | `RankedCandidate` | 17-20 |
| class | `CandidateSource` | 24-27 |
| class | `CurrentFtsSearcher` | 30-31 |
| function | `search_fts` | 31-31 |
| class | `LexicalCandidateRecipe` | 35-52 |
| function | `metadata` | 43-52 |
| class | `CandidateRequest` | 66-71 |
| class | `CandidateRanking` | 75-91 |
| function | `actual_slugs` | 82-83 |
| function | `ranker_metadata` | 85-91 |
| class | `CandidateQueryOutcome` | 95-97 |
| function | `reciprocal_rank_fusion` | 100-109 |
| function | `rank_current_fts_candidate` | 112-138 |
| function | `rank_declared_lexical_candidates` | 141-146 |
| function | `run_declared_candidate_query` | 149-171 |
| function | `fuse_candidate_sources` | 174-201 |
| function | `rank_with_query_backoff` | 204-221 |
| function | `title_body_tag_sources` | 224-235 |
| function | `_search_source` | 238-249 |
| function | `_ranked_from_fts_rows` | 252-256 |

3 symbols omitted from compact profile.

# Relationships

- `__future__.annotations`
- `collections.abc.Mapping`
- `collections.abc.Sequence`
- `dataclasses.dataclass`
- `eval.runner.HitResult`
- `time`
- `typing.Protocol`

# Impact notes

Impact candidates on this page are syntax-derived. Treat them as a starting point for inspection, not as complete semantic proof of all callers, callees, or runtime effects.

# Citations

- Source: `engine/memex/eval/candidates.py`
- Source hash: `8d8b99e4af631b7f737dc2f7897911afc04520e4fd475bac18710e9ab06ea950`
<!-- okf-code:end -->
