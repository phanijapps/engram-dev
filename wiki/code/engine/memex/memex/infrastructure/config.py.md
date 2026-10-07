---
type: CodeModule
title: engine/memex/memex/infrastructure/config.py
description: Generated code map for engine/memex/memex/infrastructure/config.py.
resource: engine/memex/memex/infrastructure/config.py
tags:
- code
- python
source_path: engine/memex/memex/infrastructure/config.py
language: python
source_hash: fe54dfe577ebce1da4c8cfd3aa7b7ae9709fdd8f67bde3525cdfeb36cf220acb
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

Generated CodeModule concept for `engine/memex/memex/infrastructure/config.py`. Purpose: engine/memex/memex/infrastructure/config.py is a `python` model module in package `engine/memex`. Role: model module. high-signal symbols: `LLMConfig`, `base_url`, `ConsolidationConfig`, `GovernanceConfig`, `BM25Config`. Dependency context: 0 local dependencies and 0 local dependents are linked when resolvable. Impact: changes here may affect linked dependents, imported dependencies, and callers identified by generated reverse edges. This page is syntax-derived for code finding, code-logic search, and impact-analysis groundwork.

# Symbols

| Kind | Name | Lines |
|---|---|---|
| class | `LLMConfig` | 36-51 |
| function | `base_url` | 45-51 |
| class | `ConsolidationConfig` | 55-66 |
| class | `GovernanceConfig` | 70-74 |
| class | `BM25Config` | 78-83 |
| class | `RecencyDecayConfig` | 87-89 |
| class | `IndexConfig` | 93-95 |
| class | `WikiConfig` | 99-104 |
| class | `LoggingConfig` | 108-110 |
| class | `MemexConfig` | 114-154 |
| function | `consolidation_llm` | 126-137 |
| function | `db_path` | 140-141 |
| function | `docs_dir` | 144-145 |
| function | `wiki_dir` | 148-150 |
| function | `transcripts_dir` | 153-154 |
| function | `_table` | 157-161 |
| function | `_get` | 164-170 |
| function | `_or` | 173-174 |
| function | `_pages_table` | 177-182 |
| class | `ConfigLoader` | 185-317 |

6 symbols omitted from compact profile.

# Relationships

- `__future__.annotations`
- `dataclasses.dataclass`
- `memex.domain.errors.ConfigError`
- `memex.domain.types.KNOWLEDGE_APPROVAL_VALUES`
- `os`
- `pathlib.Path`
- `tomllib`

# Impact notes

Impact candidates on this page are syntax-derived. Treat them as a starting point for inspection, not as complete semantic proof of all callers, callees, or runtime effects.

# Citations

- Source: `engine/memex/memex/infrastructure/config.py`
- Source hash: `fe54dfe577ebce1da4c8cfd3aa7b7ae9709fdd8f67bde3525cdfeb36cf220acb`
<!-- okf-code:end -->
