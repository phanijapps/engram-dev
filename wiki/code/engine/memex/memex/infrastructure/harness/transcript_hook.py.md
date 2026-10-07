---
type: CodeModule
title: engine/memex/memex/infrastructure/harness/transcript_hook.py
description: Generated code map for engine/memex/memex/infrastructure/harness/transcript_hook.py.
resource: engine/memex/memex/infrastructure/harness/transcript_hook.py
tags:
- code
- python
source_path: engine/memex/memex/infrastructure/harness/transcript_hook.py
language: python
source_hash: 8949c7ba4a846077bab48b3317f6e554b8730a95a4606190246fd9c18d3c1a0e
managed_by: okf-code
generated_profile: compact
package: engine/memex
---
<!-- okf-code:start -->
# Overview

Generated CodeModule concept for `engine/memex/memex/infrastructure/harness/transcript_hook.py`. Purpose: engine/memex/memex/infrastructure/harness/transcript_hook.py is a `python` model module in package `engine/memex`. Role: model module. high-signal symbols: `episode_slug`, `TranscriptHook`, `__init__`, `ingest`, `get_transcript_path`. Dependency context: 0 local dependencies and 0 local dependents are linked when resolvable. Impact: changes here may affect linked dependents, imported dependencies, and callers identified by generated reverse edges. This page is syntax-derived for code finding, code-logic search, and impact-analysis groundwork.

# Symbols

| Kind | Name | Lines |
|---|---|---|
| function | `episode_slug` | 29-30 |
| class | `TranscriptHook` | 33-414 |
| function | `__init__` | 36-51 |
| function | `ingest` | 53-124 |
| function | `get_transcript_path` | 126-130 |
| function | `get_episode_path` | 132-134 |
| function | `get_episode_by_session` | 136-137 |
| function | `get_provenance` | 139-157 |
| function | `list_sessions` | 159-160 |
| function | `list_sessions_report` | 162-176 |
| function | `delete_transcript` | 178-192 |
| function | `clear_transcripts` | 194-214 |
| function | `_write_episode` | 216-238 |
| function | `_notify_page_written` | 240-243 |
| function | `_summary` | 247-280 |
| function | `_episode_backlinks` | 282-291 |
| function | `_session_of` | 293-297 |
| function | `_report` | 299-314 |
| function | `_load_session_summary` | 316-349 |
| function | `_meta_path` | 351-353 |

9 symbols omitted from compact profile.

# Relationships

- `__future__.annotations`
- `collections.abc.Callable`
- `datetime.UTC`
- `datetime.datetime`
- `json`
- `memex.__version__`
- `memex.application.dto.to_jsonable`
- `memex.domain.models.IngestTranscriptInput`
- `memex.domain.models.ProvenanceReport`
- `memex.domain.models.SessionSummary`
- `memex.domain.models.TranscriptLinkReport`
- `memex.domain.models.TurnStreamEntry`
- `memex.domain.models.WikiNode`
- `memex.domain.slugs.slugify`
- `memex.infrastructure.search.index_manager.IndexManager`
- `memex.infrastructure.search.link_manager.LinkManager`
- `memex.infrastructure.store.wiki_store.WikiStore`
- `pathlib.Path`
- `re`

# Impact notes

Impact candidates on this page are syntax-derived. Treat them as a starting point for inspection, not as complete semantic proof of all callers, callees, or runtime effects.

# Citations

- Source: `engine/memex/memex/infrastructure/harness/transcript_hook.py`
- Source hash: `8949c7ba4a846077bab48b3317f6e554b8730a95a4606190246fd9c18d3c1a0e`
<!-- okf-code:end -->
