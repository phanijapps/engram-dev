---
type: CodeModule
title: treadle/packages/web/src/page.html
description: Generated code map for treadle/packages/web/src/page.html.
resource: treadle/packages/web/src/page.html
tags:
- code
- html
source_path: treadle/packages/web/src/page.html
language: html
sources:
- id: src
  resource: treadle/packages/web/src/page.html
source_hash: 17f7c597ba6d870beda45fd6cf28f5f94ed8f24d06a2c760cfb3ebf120501e14
managed_by: okf-code
generated_profile: compact
created: 2026-10-10T00:37:58Z
generated:
  by: process:okf-code
  at: '2026-10-10T02:02:42Z'
status: stable
package: treadle/packages/web
---
<!-- okf-code:start -->
# Overview

Generated CodeModule concept for `treadle/packages/web/src/page.html`. Purpose: treadle/packages/web/src/page.html is a `html` UI module in package `treadle/packages/web`. Role: UI module. high-signal symbols: `html`, `head`, `meta`, `meta`, `title`. Dependency context: 0 local dependencies and 0 local dependents are linked when resolvable. Impact: changes here may affect linked dependents, imported dependencies, and callers identified by generated reverse edges. This page is syntax-derived for code finding, code-logic search, and impact-analysis groundwork.

# Symbols

| Kind | Name | Lines |
|---|---|---|
| element | `html` | 2-418 |
| element | `head` | 3-388 |
| element | `meta` | 4-4 |
| element | `meta` | 5-5 |
| element | `title` | 6-6 |
| element | `body` | 389-417 |
| element | `header` | 390-396 |
| element | `h1` | 391-391 |
| element | `span` | 392-392 |
| element | `span` | 393-393 |
| element | `span` | 394-394 |
| element | `span` | 395-395 |
| element | `main` | 397-415 |
| element | `section` | 398-398 |
| element | `section` | 399-414 |
| element | `div` | 400-403 |
| element | `span` | 401-401 |
| element | `span` | 401-402 |
| element | `span` | 402-402 |
| element | `div` | 404-406 |

8 symbols omitted from compact profile.

# Relationships

- `<script src="/page.js"></script>`
- `<style> :root { --ink: #17202b; --paper: #f6f7f5; --card: #fff; --line: #e2e4de; --muted: #66707d; --accent: #0f6b5f; --soft: #e3f0ed; --warn: #8a5a06; --bad: #8f1d1d; --good: #14532d; } * { box-sizing: border-box; } body { margin: 0; font: 15px/1.55 -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: var(--paper); color: var(--ink); } header { background: var(--ink); color: #fff; padding: 12px 20px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; } header h1 { margin: 0; font-size: 16px; font-weight: 650; } header .sub { color: #b9c2c9; font-size: 12.5px; } .chip { font: 700 11px/1 ui-monospace, Menlo, monospace; padding: 4px 9px; border-radius: 999px; background: #242e33; color: #d8e0dd; } .chip.on { background: #1d3a34; color: #9fe0d0; } main { display: grid; grid-template-columns: minmax(280px, 5fr) minmax(360px, 7fr); gap: 16px; padding: 16px 20px 60px; max-width: 1240px; margin: 0 auto; } @media (max-width: 900px) { main { grid-template-columns: 1fr; } .pane { position: static; } } h2 { font-size: 11.5px; margin: 16px 0 7px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.8px; } h2:first-child { margin-top: 0; } .card { background: var(--card); border: 1px solid var(--line); border-radius: 10px; padding: 11px 13px; margin-bottom: 9px; } .card h3 { margin: 0 0 3px; font-size: 13.5px; } .idchip { font: 700 10.5px/1 ui-monospace, monospace; background: var(--soft); color: var(--accent); padding: 3px 7px; border-radius: 4px; margin-right: 6px; } .st { font: 700 10px/1 ui-monospace, monospace; padding: 3px 7px; border-radius: 4px; } .st-open { background: #fde2e2; color: var(--bad); } .st-res { background: #d8efdf; color: var(--good); } .st-unk { background: #fdeecd; color: var(--warn); } .st-acc { background: #d8efdf; color: var(--good); } .st-rej { background: #fde2e2; color: var(--bad); } .st-prop { background: #e8eaee; color: #525f6f; } .st-todo { background: #e8eaee; color: #525f6f; } .st-doing { background: #fdeecd; color: var(--warn); } .st-done { background: #d8efdf; color: var(--good); } .st-blocked { background: #fde2e2; color: var(--bad); } .note { font-size: 12px; color: var(--muted); margin: 3px 0 0; } .links a { color: var(--accent); text-decoration: none; border-bottom: 1px dotted var(--accent); font-size: 12px; margin-right: 9px; } .ring { display: flex; align-items: center; gap: 10px; margin: 2px 0 8px; } .ring .stage { font: 700 12px/1.3 ui-monospace, monospace; } .ring .stage small { display: block; font-weight: 400; color: var(--muted); font-size: 10px; } .rounds { font: 600 11.5px/1.5 ui-monospace, monospace; color: var(--muted); border-top: 1px solid var(--line); padding-top: 9px; margin-top: 12px; } .rounds b { color: var(--ink); } .pane { position: sticky; top: 12px; align-self: start; } .qhead { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; } .count { font: 700 11px/1 ui-monospace, monospace; color: var(--muted); letter-spacing: 0.5px; } .qcard { background: var(--card); border: 1px solid var(--line); border-left: 4px solid var(--accent); border-radius: 10px; padding: 16px 18px; } .qcard.done { border-left-color: #b7c4bd; } .qtext { font-size: 17px; line-height: 1.45; margin: 6px 0 4px; font-weight: 560; } .blocks { font-size: 12px; color: var(--muted); margin-bottom: 10px; } .opt { display: flex; gap: 10px; align-items: flex-start; border: 1.5px solid var(--line); border-radius: 9px; padding: 10px 12px; margin: 7px 0; cursor: pointer; background: var(--paper); } .opt:hover, .opt:focus-visible { border-color: var(--accent); } .opt.sel { border-color: var(--accent); background: var(--soft); } .opt .dot { width: 15px; height: 15px; border-radius: 50%; border: 2px solid var(--line); margin-top: 2px; flex: none; } .opt.sel .dot { border-color: var(--accent); background: var(--accent); } .opt .lbl { font-size: 14px; } .opt .key { font: 700 10px/1 ui-monospace, monospace; color: var(--muted); margin-left: auto; flex: none; } textarea { width: 100%; min-height: 88px; border: 1.5px solid var(--line); border-radius: 9px; padding: 10px 12px; font: 14.5px/1.5 inherit; background: var(--paper); resize: vertical; } textarea:focus { outline: 2px solid var(--accent); outline-offset: 2px; } .qnav { display: flex; align-items: center; gap: 9px; margin-top: 12px; flex-wrap: wrap; } button.act { appearance: none; border: 0; border-radius: 999px; padding: 8px 16px; font: 650 13px/1 inherit; cursor: pointer; } .b-next { background: var(--ink); color: #fff; } .b-back { background: transparent; border: 1.5px solid var(--line); color: var(--ink); } .b-idk { background: transparent; border: 1.5px dashed #c9b98a; color: var(--warn); } .b-approve { background: var(--accent); color: #fff; font-size: 14.5px; padding: 11px 24px; margin-left: auto; } .kbd { font: 600 10.5px/1 ui-monospace, monospace; color: var(--muted); background: #eef0ec; border: 1px solid var(--line); border-radius: 5px; padding: 3px 6px; } .hint { font-size: 11.5px; color: var(--muted); margin-top: 10px; } .ansline { font-size: 13px; margin-top: 9px; padding-top: 9px; border-top: 1px dashed var(--line); } .approve-card { text-align: center; padding: 26px 20px; } .summary { text-align: left; margin: 12px auto; max-width: 420px; } .summary .row { display: flex; gap: 8px; align-items: baseline; padding: 5px 2px; border-bottom: 1px solid #eef0ec; font-size: 12.5px; } .err { background: #fde2e2; color: var(--bad); border-radius: 9px; padding: 10px 12px; font-size: 13px; margin-top: 10px; } ul.tight { margin: 4px 0 0; padding-left: 16px; } ul.tight li { margin: 2px 0; font-size: 12.5px; } </style>`

# Impact notes

Impact candidates on this page are syntax-derived. Treat them as a starting point for inspection, not as complete semantic proof of all callers, callees, or runtime effects.

<!-- okf-code:end -->
