---
type: CodeModule
title: engine/loom/src/loom_kit/web/server.py
description: Generated code map for engine/loom/src/loom_kit/web/server.py. Depends
  on ..events, ..specpack, ..spine.LoomError.
resource: engine/loom/src/loom_kit/web/server.py
tags:
- code
- python
- depends-on
source_path: engine/loom/src/loom_kit/web/server.py
language: python
sources:
- id: src
  resource: engine/loom/src/loom_kit/web/server.py
source_hash: 4498f5695ea8773f71585b31ec0a77546257a4e9db9f056c2765bf3cd1209238
managed_by: okf-code
generated_profile: compact
created: 2026-10-09T17:45:20Z
generated:
  by: process:okf-code
  at: '2026-10-10T01:57:54Z'
status: stable
package: engine/loom
---
<!-- okf-code:start -->
# Overview

Generated CodeModule concept for `engine/loom/src/loom_kit/web/server.py`. Purpose: engine/loom/src/loom_kit/web/server.py is a `python` model module in package `engine/loom`. Role: model module. high-signal symbols: `_Denied`, `_admit`, `interview_complete`, `_Handler`, `log_message`. Dependency context: 3 local dependencies and 2 local dependents are linked when resolvable. Impact: changes here may affect linked dependents, imported dependencies, and callers identified by generated reverse edges. This page is syntax-derived for code finding, code-logic search, and impact-analysis groundwork.

# Symbols

| Kind | Name | Lines |
|---|---|---|
| class | `_Denied` | 27-28 |
| function | `_admit` | 31-54 |
| function | `interview_complete` | 57-60 |
| class | `_Handler` | 63-108 |
| function | `log_message` | 68-69 |
| function | `_send` | 71-77 |
| function | `do_GET` | 79-94 |
| function | `do_POST` | 96-108 |
| class | `InterviewServer` | 111-130 |
| function | `__init__` | 114-118 |
| function | `url` | 121-122 |
| function | `start` | 124-126 |
| function | `shutdown` | 128-130 |
| function | `run` | 133-150 |

# Relationships

Depends on:
- [..events](/code/engine/loom/src/loom_kit/events.py.md)
- [..specpack](/code/engine/loom/src/loom_kit/specpack.py.md)
- [..spine.LoomError](/code/engine/loom/src/loom_kit/spine.py.md)
- `__future__.annotations`
- `http.server.BaseHTTPRequestHandler`
- `http.server.ThreadingHTTPServer`
- `json`
- `pathlib.Path`
- `threading`
- `time`
- `webbrowser`

Used by:
- [engine/loom/src/loom_kit/cli.py](/code/engine/loom/src/loom_kit/cli.py.md)
- [engine/loom/src/loom_kit/web/library.py](/code/engine/loom/src/loom_kit/web/library.py.md)

# Impact notes

Impact candidates on this page are syntax-derived. Treat them as a starting point for inspection, not as complete semantic proof of all callers, callees, or runtime effects.

<!-- okf-code:end -->
