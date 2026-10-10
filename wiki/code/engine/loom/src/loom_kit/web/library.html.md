---
type: CodeModule
title: engine/loom/src/loom_kit/web/library.html
description: Generated code map for engine/loom/src/loom_kit/web/library.html.
resource: engine/loom/src/loom_kit/web/library.html
tags:
- code
- html
source_path: engine/loom/src/loom_kit/web/library.html
language: html
sources:
- id: src
  resource: engine/loom/src/loom_kit/web/library.html
source_hash: d1c1f42539a455cd900cc393929f504c492f5a891310040d8b521a4505d30fb1
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

Generated CodeModule concept for `engine/loom/src/loom_kit/web/library.html`. Purpose: engine/loom/src/loom_kit/web/library.html is a `html` UI module in package `engine/loom`. Role: UI module. high-signal symbols: `html`, `head`, `meta`, `meta`, `title`. Dependency context: 0 local dependencies and 1 local dependents are linked when resolvable. Impact: changes here may affect linked dependents, imported dependencies, and callers identified by generated reverse edges. This page is syntax-derived for code finding, code-logic search, and impact-analysis groundwork.

# Symbols

| Kind | Name | Lines |
|---|---|---|
| element | `html` | 2-91 |
| element | `head` | 3-76 |
| element | `meta` | 4-5 |
| element | `meta` | 5-6 |
| element | `title` | 6-6 |
| element | `body` | 77-90 |
| element | `header` | 78-82 |
| element | `h1` | 79-79 |
| element | `input` | 80-81 |
| element | `span` | 81-81 |
| element | `div` | 83-86 |
| element | `aside` | 84-84 |
| element | `div` | 85-85 |
| element | `main` | 85-85 |
| element | `footer` | 87-87 |

# Relationships

- `<script src="/app.js"></script>`
- `<script src="/marked.min.js"></script>`
- `<style> :root { --bg:#101418; --panel:#171d24; --card:#1d252e; --line:#2a3441; --ink:#e8edf2; --dim:#93a1b0; --you:#f5a623; --go:#3fb950; --stuck:#f85149; --rev:#58a6ff; --amber:#d29922; } * { box-sizing:border-box; } body { margin:0; font:15px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif; background:var(--bg); color:var(--ink); } header { display:flex; gap:16px; align-items:center; padding:12px 20px; border-bottom:1px solid var(--line); position:sticky; top:0; background:var(--bg); z-index:5; } header h1 { font-size:17px; margin:0; } #search { flex:0 1 340px; padding:8px 12px; border-radius:8px; border:1px solid var(--line); background:var(--panel); color:var(--ink); } #layout { display:grid; grid-template-columns:300px 1fr; min-height:calc(100vh - 57px); } aside { border-right:1px solid var(--line); padding:14px; overflow-y:auto; max-height:calc(100vh - 57px); position:sticky; top:57px; } main { padding:18px 26px; overflow-y:auto; } .group h2 { font-size:12px; letter-spacing:.08em; text-transform:uppercase; color:var(--dim); margin:14px 0 6px; } .group h2 .n { color:var(--you); } .card { padding:10px 12px; border:1px solid var(--line); border-radius:10px; background:var(--card); margin-bottom:8px; cursor:pointer; } .card:hover, .card.sel { border-color:var(--rev); } .card .t { font-weight:600; } .card .m { font-size:12px; color:var(--dim); display:flex; gap:8px; margin-top:2px; flex-wrap:wrap; } .chip { display:inline-block; padding:1px 8px; border-radius:99px; font-size:11px; border:1px solid var(--line); color:var(--dim); } .chip.you { color:var(--you); border-color:var(--you); } .chip.go { color:var(--go); border-color:var(--go); } .chip.stuck { color:var(--stuck); border-color:var(--stuck); } .tabs { display:flex; gap:4px; border-bottom:1px solid var(--line); margin-bottom:14px; flex-wrap:wrap; } .tab { padding:8px 16px; cursor:pointer; border-bottom:2px solid transparent; color:var(--dim); background:none; border-top:none; border-left:none; border-right:none; font:inherit; } .tab[aria-selected="true"] { color:var(--ink); border-bottom-color:var(--rev); } .journey { display:flex; align-items:center; gap:0; margin:10px 0 18px; flex-wrap:wrap; } .jnode { display:flex; flex-direction:column; align-items:center; width:110px; text-align:center; } .jdot { width:14px; height:14px; border-radius:50%; background:var(--line); margin-bottom:4px; } .jnode.lit .jdot { background:var(--go); box-shadow:0 0 8px var(--go); } .jnode.now .jdot { background:var(--you); box-shadow:0 0 10px var(--you); animation:pulse 1.6s infinite; } .jnode span { font-size:11px; color:var(--dim); } .jnode.lit span, .jnode.now span { color:var(--ink); } .jbar { flex:1 1 30px; height:2px; background:var(--line); margin-bottom:18px; min-width:20px; } .jbar.lit { background:var(--go); } @keyframes pulse { 50% { box-shadow:0 0 2px var(--you); } } .jflag { padding:2px 10px; border-radius:99px; font-size:12px; margin-left:10px; } .jflag.you { background:#3d2f10; color:var(--you); border:1px solid var(--you); } .jflag.stuck { background:#3a1512; color:var(--stuck); border:1px solid var(--stuck); } .doc { border:1px solid var(--line); border-radius:10px; background:var(--card); padding:16px 20px; margin-bottom:16px; } .doc h3 { margin:0 0 10px; font-size:14px; color:var(--rev); cursor:pointer; } .doc .md { max-height:420px; overflow-y:auto; } .doc.open .md { max-height:none; } .doc .md table { border-collapse:collapse; margin:10px 0; } .doc .md th, .doc .md td { border:1px solid var(--line); padding:5px 10px; font-size:13px; } .doc .md th { background:var(--panel); } .doc .md code { background:var(--panel); padding:1px 5px; border-radius:5px; font-size:13px; } .doc .md pre { background:var(--panel); padding:10px; border-radius:8px; overflow-x:auto; } .doc .md blockquote { border-left:3px solid var(--line); margin:8px 0; padding:2px 14px; color:var(--dim); } .item { border:1px solid var(--line); border-radius:10px; background:var(--card); padding:12px 16px; margin-bottom:10px; } .item.flash { border-color:var(--you); box-shadow:0 0 10px rgba(245,166,35,.35); } .item h4 { margin:0 0 6px; font-size:14px; } .item .meta { font-size:12px; color:var(--dim); display:flex; gap:10px; flex-wrap:wrap; } .idl { color:var(--rev); cursor:pointer; text-decoration:underline dotted; } .empty { color:var(--dim); font-style:italic; padding:24px; text-align:center; } .qcard textarea { width:100%; min-height:64px; background:var(--panel); color:var(--ink); border:1px solid var(--line); border-radius:8px; padding:8px; font:inherit; } .btn { background:var(--panel); color:var(--ink); border:1px solid var(--line); border-radius:8px; padding:6px 14px; cursor:pointer; font:inherit; } .btn.primary { background:#1f6feb; border-color:#1f6feb; color:#fff; } .btn.warn { color:var(--amber); border-color:var(--amber); } .btn.go { color:var(--go); border-color:var(--go); } .opts { display:flex; flex-direction:column; gap:6px; margin:8px 0; } .opt { text-align:left; } .opt[aria-pressed="true"] { border-color:var(--you); color:var(--you); } .err { color:var(--stuck); font-size:13px; margin-top:6px; white-space:pre-wrap; } .evi { font-family:ui-monospace,Menlo,monospace; font-size:12px; color:var(--dim); border-left:2px solid var(--line); padding:2px 10px; margin:4px 0; } .sev { font-size:11px; padding:1px 8px; border-radius:99px; border:1px solid var(--line); } .sev.b { color:var(--stuck); border-color:var(--stuck); } .sev.d { color:var(--amber); border-color:var(--amber); } .sev.s { color:var(--rev); border-color:var(--rev); } footer { color:var(--dim); font-size:12px; padding:16px 20px; border-top:1px solid var(--line); } </style>`

Used by:
- [engine/loom/src/loom_kit/cli.py](/code/engine/loom/src/loom_kit/cli.py.md)

# Impact notes

Impact candidates on this page are syntax-derived. Treat them as a starting point for inspection, not as complete semantic proof of all callers, callees, or runtime effects.

<!-- okf-code:end -->
