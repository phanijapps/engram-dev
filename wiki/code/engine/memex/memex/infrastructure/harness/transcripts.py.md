---
type: CodeModule
title: engine/memex/memex/infrastructure/harness/transcripts.py
description: Generated code map for engine/memex/memex/infrastructure/harness/transcripts.py.
resource: engine/memex/memex/infrastructure/harness/transcripts.py
tags:
- code
- python
source_path: engine/memex/memex/infrastructure/harness/transcripts.py
language: python
source_hash: 660ae3a942f8f638b66083988f968b50ac35693604306ba21987eb1aeab586be
managed_by: okf-code
generated_profile: compact
package: engine/memex
---
<!-- okf-code:start -->
# Overview

Generated CodeModule concept for `engine/memex/memex/infrastructure/harness/transcripts.py`. Purpose: engine/memex/memex/infrastructure/harness/transcripts.py is a `python` model module in package `engine/memex`. Role: model module. high-signal symbols: `ParsedTranscript`, `normalize_ts`, `suggest_session_id`, `_read_jsonl`, `_blocks_text`. Dependency context: 0 local dependencies and 0 local dependents are linked when resolvable. Impact: changes here may affect linked dependents, imported dependencies, and callers identified by generated reverse edges. This page is syntax-derived for code finding, code-logic search, and impact-analysis groundwork.

# Symbols

| Kind | Name | Lines |
|---|---|---|
| class | `ParsedTranscript` | 36-45 |
| function | `normalize_ts` | 48-62 |
| function | `suggest_session_id` | 65-69 |
| function | `_read_jsonl` | 72-84 |
| function | `_blocks_text` | 87-98 |
| function | `_opt_str` | 101-103 |
| function | `_finalize` | 106-126 |
| function | `_pi_usage` | 132-144 |
| function | `parse_pi_session` | 147-206 |
| function | `parse_claude_transcript` | 212-337 |
| function | `_usage_dict` | 343-350 |
| function | `_parse_iso_epoch` | 353-357 |
| function | `parse_codex_rollout` | 360-534 |
| function | `parse_transcript` | 544-549 |
| function | `read_transcript_turns` | 552-570 |

# Relationships

- `__future__.annotations`
- `collections.abc.Callable`
- `dataclasses.dataclass`
- `datetime.UTC`
- `datetime.datetime`
- `json`
- `memex.domain.models.SessionHeader`
- `memex.domain.models.TurnStreamEntry`
- `pathlib.Path`
- `re`
- `typing.Any`

# Impact notes

Impact candidates on this page are syntax-derived. Treat them as a starting point for inspection, not as complete semantic proof of all callers, callees, or runtime effects.

# Citations

- Source: `engine/memex/memex/infrastructure/harness/transcripts.py`
- Source hash: `660ae3a942f8f638b66083988f968b50ac35693604306ba21987eb1aeab586be`
<!-- okf-code:end -->
