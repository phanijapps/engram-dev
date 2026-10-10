---
type: CodeModule
title: treadle/packages/knowledge/src/links.ts
description: Generated code map for treadle/packages/knowledge/src/links.ts. Depends
  on ./parse.js.
resource: treadle/packages/knowledge/src/links.ts
tags:
- code
- typescript
- depends-on
source_path: treadle/packages/knowledge/src/links.ts
language: typescript
sources:
- id: src
  resource: treadle/packages/knowledge/src/links.ts
source_hash: 23f0df950bf6f70a4a46d26a2d80efb68943768ff311938e0c9f029585aa2972
managed_by: okf-code
generated_profile: compact
created: 2026-10-10T00:37:58Z
generated:
  by: process:okf-code
  at: '2026-10-10T02:02:42Z'
status: stable
package: treadle/packages/knowledge
---
<!-- okf-code:start -->
# Overview

Generated CodeModule concept for `treadle/packages/knowledge/src/links.ts`. Purpose: treadle/packages/knowledge/src/links.ts is a `typescript` module in package `treadle/packages/knowledge`. Role: module. high-signal symbols: `LINK_RE`, `SEGMENT_RE`, `RESERVED`, `isExternalTarget`, `cidSegmentsValid`. Dependency context: 1 local dependencies and 2 local dependents are linked when resolvable. Impact: changes here may affect linked dependents, imported dependencies, and callers identified by generated reverse edges. This page is syntax-derived for code finding, code-logic search, and impact-analysis groundwork.

# Symbols

| Kind | Name | Lines |
|---|---|---|
| function | `LINK_RE` | 12-12 |
| function | `SEGMENT_RE` | 13-13 |
| function | `RESERVED` | 14-14 |
| function | `isExternalTarget` | 16-18 |
| function | `cidSegmentsValid` | 20-23 |
| function | `isWithin` | 27-35 |
| function | `realPath` | 28-28 |
| function | `realRoot` | 29-29 |
| function | `rel` | 31-31 |
| function | `safeReal` | 37-43 |
| function | `resolveCidPath` | 45-56 |
| function | `rootR` | 46-46 |
| function | `candidate` | 48-48 |
| function | `extractLinkTargets` | 58-66 |
| function | `targets` | 59-59 |
| function | `t` | 61-61 |
| function | `resolveTarget` | 68-71 |
| function | `conceptOutgoing` | 74-92 |
| function | `rootR` | 75-75 |
| function | `srcDir` | 76-76 |

15 symbols omitted from compact profile.

# Relationships

Depends on:
- [./parse.js](/code/treadle/packages/knowledge/src/parse.ts.md)
- `node:fs`
- `node:path`

Used by:
- [treadle/packages/knowledge/src/read.ts](/code/treadle/packages/knowledge/src/read.ts.md)
- [treadle/packages/knowledge/src/validate.ts](/code/treadle/packages/knowledge/src/validate.ts.md)

# Impact notes

Impact candidates on this page are syntax-derived. Treat them as a starting point for inspection, not as complete semantic proof of all callers, callees, or runtime effects.

<!-- okf-code:end -->
