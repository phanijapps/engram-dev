---
type: CodeModule
title: engine/loom/src/loom_kit/web/library.py
description: Generated code map for engine/loom/src/loom_kit/web/library.py. Depends
  on ..events, ..specpack, ..spine.LoomError, .server._Denied.
resource: engine/loom/src/loom_kit/web/library.py
tags:
- code
- python
- depends-on
source_path: engine/loom/src/loom_kit/web/library.py
language: python
sources:
- id: src
  resource: engine/loom/src/loom_kit/web/library.py
source_hash: 6861fa5af8e119a5446ab18abb93400fcc854f767ae6af85f940b89e889b7924
managed_by: okf-code
generated_profile: compact
created: 2026-10-09T20:22:36Z
generated:
  by: process:okf-code
  at: '2026-10-10T00:37:58Z'
status: stable
package: engine/loom
---
<!-- okf-code:start -->
# Overview

Generated CodeModule concept for `engine/loom/src/loom_kit/web/library.py`. Purpose: engine/loom/src/loom_kit/web/library.py is a `python` model module in package `engine/loom`. Role: model module. high-signal symbols: `list_specs`, `_Handler`, `log_message`, `_send`, `_json`. Dependency context: 4 local dependencies and 0 local dependents are linked when resolvable. Impact: changes here may affect linked dependents, imported dependencies, and callers identified by generated reverse edges. This page is syntax-derived for code finding, code-logic search, and impact-analysis groundwork.

# Symbols

| Kind | Name | Lines |
|---|---|---|
| function | `list_specs` | 37-67 |
| class | `_Handler` | 70-160 |
| function | `log_message` | 75-76 |
| function | `_send` | 78-84 |
| function | `_json` | 86-87 |
| function | `_pack_dir` | 89-93 |
| function | `do_GET` | 95-134 |
| function | `do_POST` | 136-160 |
| class | `LibraryServer` | 163-186 |
| function | `__init__` | 166-170 |
| function | `start` | 172-178 |
| function | `url` | 181-182 |
| function | `shutdown` | 184-186 |
| function | `run` | 189-202 |

# Relationships

Depends on:
- [..events](/code/engine/loom/src/loom_kit/events.py.md)
- [..specpack](/code/engine/loom/src/loom_kit/specpack.py.md)
- [..spine.LoomError](/code/engine/loom/src/loom_kit/spine.py.md)
- [.server._Denied](/code/engine/loom/src/loom_kit/web/server.py.md)
- `.server._admit`
- `__future__.annotations`
- `http.server.BaseHTTPRequestHandler`
- `http.server.ThreadingHTTPServer`
- `json`
- `pathlib.Path`
- `re`
- `threading`
- `webbrowser`

# Impact notes

Impact candidates on this page are syntax-derived. Treat them as a starting point for inspection, not as complete semantic proof of all callers, callees, or runtime effects.

<!-- okf-code:end -->
