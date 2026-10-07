---
type: CodeModule
title: engine/memex/memex/infrastructure/store/backup.py
description: Generated code map for engine/memex/memex/infrastructure/store/backup.py.
resource: engine/memex/memex/infrastructure/store/backup.py
tags:
- code
- python
source_path: engine/memex/memex/infrastructure/store/backup.py
language: python
source_hash: 1f94c22bd56c5cd7420789c669120ee221bdaed218a3b82e47a349a0de0be382
managed_by: okf-code
generated_profile: compact
package: engine/memex
---
<!-- okf-code:start -->
# Overview

Generated CodeModule concept for `engine/memex/memex/infrastructure/store/backup.py`. Purpose: engine/memex/memex/infrastructure/store/backup.py is a `python` model module in package `engine/memex`. Role: model module. high-signal symbols: `BackupRestore`, `__init__`, `_pages_dir`, `backup`, `verify`. Dependency context: 0 local dependencies and 0 local dependents are linked when resolvable. Impact: changes here may affect linked dependents, imported dependencies, and callers identified by generated reverse edges. This page is syntax-derived for code finding, code-logic search, and impact-analysis groundwork.

# Symbols

| Kind | Name | Lines |
|---|---|---|
| class | `BackupRestore` | 26-189 |
| function | `__init__` | 29-31 |
| function | `_pages_dir` | 33-36 |
| function | `backup` | 38-77 |
| function | `verify` | 79-92 |
| function | `restore` | 94-144 |
| function | `_snapshot_db` | 146-156 |
| function | `_safe_extract` | 159-169 |
| function | `_count_files` | 172-180 |
| function | `_add_text` | 183-189 |
| function | `_version` | 192-195 |

# Relationships

- `__future__.annotations`
- `io`
- `json`
- `memex.__version__`
- `memex.domain.errors.BackupError`
- `memex.domain.models.BackupReport`
- `memex.domain.models.RestoreReport`
- `memex.domain.models.utc_now_iso`
- `memex.domain.reserved.RESERVED_FILENAMES`
- `pathlib.Path`
- `shutil`
- `sqlite3`
- `tarfile`
- `tempfile`
- `time`

# Impact notes

Impact candidates on this page are syntax-derived. Treat them as a starting point for inspection, not as complete semantic proof of all callers, callees, or runtime effects.

# Citations

- Source: `engine/memex/memex/infrastructure/store/backup.py`
- Source hash: `1f94c22bd56c5cd7420789c669120ee221bdaed218a3b82e47a349a0de0be382`
<!-- okf-code:end -->
