---
type: CodeModule
title: engine/memex/eval/workloads.py
description: Generated code map for engine/memex/eval/workloads.py.
resource: engine/memex/eval/workloads.py
tags:
- code
- python
source_path: engine/memex/eval/workloads.py
language: python
source_hash: 85e06553748ad548182b6a2c358b10f19d3eeb211a931ae65ae5b812bf472c13
managed_by: okf-code
generated_profile: compact
package: engine/memex
---
<!-- okf-code:start -->
# Overview

Generated CodeModule concept for `engine/memex/eval/workloads.py`. Purpose: engine/memex/eval/workloads.py is a `python` model module in package `engine/memex`. Role: model module. high-signal symbols: `GutenbergProvenance`, `to_dict`, `GutenbergImportError`, `__init__`, `validate_queries`. Dependency context: 0 local dependencies and 0 local dependents are linked when resolvable. Impact: changes here may affect linked dependents, imported dependencies, and callers identified by generated reverse edges. This page is syntax-derived for code finding, code-logic search, and impact-analysis groundwork.

# Symbols

| Kind | Name | Lines |
|---|---|---|
| class | `GutenbergProvenance` | 53-67 |
| function | `to_dict` | 60-67 |
| class | `GutenbergImportError` | 70-75 |
| function | `__init__` | 73-75 |
| function | `validate_queries` | 78-88 |
| function | `validate_fixture_slug` | 91-100 |
| function | `validate_fixture_slug_value` | 103-107 |
| function | `ndcg_at_k` | 110-123 |
| function | `first_hit_rank` | 126-129 |
| function | `load_gutenberg_workload` | 132-134 |
| function | `load_salesforce_workload` | 137-139 |
| function | `import_gutenberg_catalog` | 142-174 |
| function | `_load_jsonl_workload` | 177-214 |
| function | `_validate_gutenberg_provenance` | 217-232 |
| function | `_validate_salesforce_cards` | 235-243 |
| function | `_regular_file` | 246-251 |
| function | `_confined_output` | 254-259 |
| function | `_load_provenance` | 262-288 |
| function | `_expanded_regular_file` | 291-294 |
| function | `_read_catalog_rows` | 297-317 |

14 symbols omitted from compact profile.

# Relationships

- `__future__.annotations`
- `collections.abc.Mapping`
- `collections.abc.Sequence`
- `contextlib.suppress`
- `csv`
- `dataclasses.dataclass`
- `datetime.UTC`
- `datetime.datetime`
- `eval.corpus.CorpusResult`
- `eval.corpus.QuerySpec`
- `gzip`
- `hashlib`
- `json`
- `math`
- `memex.domain.errors.IndexManagerError`
- `memex.infrastructure.search.index_manager.check_slug`
- `pathlib.Path`
- `shutil`
- `tempfile`
- `typing.Literal`
- 1 imports omitted from compact profile.

# Impact notes

Impact candidates on this page are syntax-derived. Treat them as a starting point for inspection, not as complete semantic proof of all callers, callees, or runtime effects.

# Citations

- Source: `engine/memex/eval/workloads.py`
- Source hash: `85e06553748ad548182b6a2c358b10f19d3eeb211a931ae65ae5b812bf472c13`
<!-- okf-code:end -->
