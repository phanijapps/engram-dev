---
type: CodeModule
title: treadle/packages/knowledge/src/search.ts
description: Generated code map for treadle/packages/knowledge/src/search.ts. Depends
  on ./parse.js.
resource: treadle/packages/knowledge/src/search.ts
tags:
- code
- typescript
- depends-on
source_path: treadle/packages/knowledge/src/search.ts
language: typescript
sources:
- id: src
  resource: treadle/packages/knowledge/src/search.ts
source_hash: 3eb923542451d258b6edda543350f97ed52934dbac482e2148c35ff7f209df8e
managed_by: okf-code
generated_profile: compact
created: 2026-10-10T00:37:58Z
generated:
  by: process:okf-code
  at: '2026-10-10T02:00:52Z'
status: stable
package: treadle/packages/knowledge
---
<!-- okf-code:start -->
# Overview

Generated CodeModule concept for `treadle/packages/knowledge/src/search.ts`. Purpose: treadle/packages/knowledge/src/search.ts is a `typescript` module in package `treadle/packages/knowledge`. Role: module. high-signal symbols: `TOKEN_RE`, `WEIGHTS`, `EXACT_TITLE_BOOST`, `Hit`, `Index`. Dependency context: 1 local dependencies and 0 local dependents are linked when resolvable. Impact: changes here may affect linked dependents, imported dependencies, and callers identified by generated reverse edges. This page is syntax-derived for code finding, code-logic search, and impact-analysis groundwork.

# Symbols

| Kind | Name | Lines |
|---|---|---|
| function | `TOKEN_RE` | 6-6 |
| function | `WEIGHTS` | 7-7 |
| function | `EXACT_TITLE_BOOST` | 8-8 |
| interface | `Hit` | 10-16 |
| interface | `Index` | 18-20 |
| interface | `DocMeta` | 22-35 |
| function | `tokenize` | 37-39 |
| function | `counter` | 41-45 |
| function | `m` | 42-42 |
| function | `fmStr` | 47-50 |
| function | `v` | 48-48 |
| function | `fmStrList` | 52-55 |
| function | `v` | 53-53 |
| function | `fmText` | 57-64 |
| function | `values` | 58-58 |
| function | `buildIndex` | 66-91 |
| function | `docs` | 67-67 |
| function | `c` | 69-69 |
| function | `title` | 71-71 |
| function | `type` | 72-72 |

30 symbols omitted from compact profile.

# Relationships

Depends on:
- [./parse.js](/code/treadle/packages/knowledge/src/parse.ts.md)
- `node:path`

# Impact notes

Impact candidates on this page are syntax-derived. Treat them as a starting point for inspection, not as complete semantic proof of all callers, callees, or runtime effects.

<!-- okf-code:end -->
