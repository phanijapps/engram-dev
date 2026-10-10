---
type: CodeModule
title: treadle/packages/knowledge/src/parse.ts
description: Generated code map for treadle/packages/knowledge/src/parse.ts.
resource: treadle/packages/knowledge/src/parse.ts
tags:
- code
- typescript
source_path: treadle/packages/knowledge/src/parse.ts
language: typescript
sources:
- id: src
  resource: treadle/packages/knowledge/src/parse.ts
source_hash: f068b95d43927f8e1a696d578525e013939461f037ddb615f514b8dd97548f0e
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

Generated CodeModule concept for `treadle/packages/knowledge/src/parse.ts`. Purpose: treadle/packages/knowledge/src/parse.ts is a `typescript` module in package `treadle/packages/knowledge`. Role: module. high-signal symbols: `YAML_OPTS`, `DELIMITER`, `RESERVED`, `MAX_CONCEPT_BYTES`, `Concept`. Dependency context: 0 local dependencies and 5 local dependents are linked when resolvable. Impact: changes here may affect linked dependents, imported dependencies, and callers identified by generated reverse edges. This page is syntax-derived for code finding, code-logic search, and impact-analysis groundwork.

# Symbols

| Kind | Name | Lines |
|---|---|---|
| function | `YAML_OPTS` | 13-13 |
| function | `DELIMITER` | 15-15 |
| function | `RESERVED` | 16-16 |
| function | `MAX_CONCEPT_BYTES` | 17-17 |
| interface | `Concept` | 19-27 |
| function | `splitFrontmatter` | 29-70 |
| function | `lines` | 37-37 |
| function | `closeIdx` | 41-41 |
| function | `fmText` | 44-48 |
| function | `bodyText` | 49-49 |
| function | `data` | 52-52 |
| function | `rstripEol` | 73-75 |
| function | `parseConcept` | 77-100 |
| function | `rel` | 78-78 |
| function | `cid` | 79-79 |
| function | `reserved` | 80-80 |
| function | `size` | 81-81 |
| function | `r` | 90-90 |
| function | `pyTypeName` | 103-109 |
| function | `errConcept` | 111-121 |

9 symbols omitted from compact profile.

# Relationships

- `node:fs`
- `node:path`
- `yaml`

Used by:
- [treadle/packages/knowledge/src/fingerprints.ts](/code/treadle/packages/knowledge/src/fingerprints.ts.md)
- [treadle/packages/knowledge/src/links.ts](/code/treadle/packages/knowledge/src/links.ts.md)
- [treadle/packages/knowledge/src/read.ts](/code/treadle/packages/knowledge/src/read.ts.md)
- [treadle/packages/knowledge/src/search.ts](/code/treadle/packages/knowledge/src/search.ts.md)
- [treadle/packages/knowledge/src/validate.ts](/code/treadle/packages/knowledge/src/validate.ts.md)

# Impact notes

Impact candidates on this page are syntax-derived. Treat them as a starting point for inspection, not as complete semantic proof of all callers, callees, or runtime effects.

<!-- okf-code:end -->
