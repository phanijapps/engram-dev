---
type: CodeSummary
title: repository/treadle/packages/knowledge
description: 'Generated package code summary for repository/treadle/packages/knowledge.
  Top dependencies: ./links.js, ./parse.js. Top dependents: treadle/conformance/generators/gen_corpus.ts,
  treadle/packages/knowledge/src/fingerprints.ts, treadle/packages/knowledge/src/links.ts,
  treadle/packages/knowledge/src/read.ts, treadle/packages/knowledge/src/search.ts.'
tags:
- code
- summary
- impact
- package
- depends-on
- used-by
summary_level: package
managed_by: okf-code
created: 2026-10-10T00:37:58Z
generated:
  by: process:okf-code
  at: '2026-10-10T02:02:41Z'
status: stable
package: treadle/packages/knowledge
---
<!-- okf-code:start -->
# Overview

Generated package summary for `repository/treadle/packages/knowledge`. Purpose: provide a low-token entry point for code search and impact analysis before opening file-level concepts.

# Key modules

- [treadle/packages/knowledge/src/parse.ts](/code/treadle/packages/knowledge/src/parse.ts.md) - module; depends on 0; used by 5; high-signal symbols: `YAML_OPTS`, `DELIMITER`, `RESERVED`
- [treadle/packages/knowledge/src/links.ts](/code/treadle/packages/knowledge/src/links.ts.md) - module; depends on 1; used by 2; high-signal symbols: `LINK_RE`, `SEGMENT_RE`, `RESERVED`
- [treadle/packages/knowledge/src/read.ts](/code/treadle/packages/knowledge/src/read.ts.md) - model module; depends on 2; used by 0; high-signal symbols: `CHARS_PER_TOKEN`, `ConceptNotFound`, `constructor`
- [treadle/packages/knowledge/src/validate.ts](/code/treadle/packages/knowledge/src/validate.ts.md) - module; depends on 2; used by 0; high-signal symbols: `KNOWN_KEYS`, `STATUS_VALUES`, `RECOMMENDED`
- [treadle/packages/knowledge/src/fingerprints.ts](/code/treadle/packages/knowledge/src/fingerprints.ts.md) - module; depends on 1; used by 0; high-signal symbols: `FILENAME`, `SKIP_DIRS`, `sha256`
- [treadle/packages/knowledge/src/index.ts](/code/treadle/packages/knowledge/src/index.ts.md) - entry-point module; depends on 0; used by 1
- [treadle/packages/knowledge/src/search.ts](/code/treadle/packages/knowledge/src/search.ts.md) - module; depends on 1; used by 0; high-signal symbols: `TOKEN_RE`, `WEIGHTS`, `EXACT_TITLE_BOOST`
- [treadle/packages/knowledge/src/findings.ts](/code/treadle/packages/knowledge/src/findings.ts.md) - module; depends on 0; used by 0; high-signal symbols: `STATE_DIR`, `LEDGER`, `LedgerEntry`
- [treadle/packages/knowledge/src/stamp.ts](/code/treadle/packages/knowledge/src/stamp.ts.md) - module; depends on 0; used by 0; high-signal symbols: `DIR`, `FILE`, `FreshnessStamp`

# Impact map

| Module | Depends | Used by | Relationship signals |
|---|---:|---:|---|
| [treadle/packages/knowledge/src/parse.ts](/code/treadle/packages/knowledge/src/parse.ts.md) | 0 | 5 | treadle/packages/knowledge/src/fingerprints.ts, treadle/packages/knowledge/src/links.ts, treadle/packages/knowledge/src/read.ts |
| [treadle/packages/knowledge/src/links.ts](/code/treadle/packages/knowledge/src/links.ts.md) | 1 | 2 | ./parse.js, treadle/packages/knowledge/src/read.ts, treadle/packages/knowledge/src/validate.ts |
| [treadle/packages/knowledge/src/read.ts](/code/treadle/packages/knowledge/src/read.ts.md) | 2 | 0 | ./links.js, ./parse.js |
| [treadle/packages/knowledge/src/validate.ts](/code/treadle/packages/knowledge/src/validate.ts.md) | 2 | 0 | ./links.js, ./parse.js |
| [treadle/packages/knowledge/src/fingerprints.ts](/code/treadle/packages/knowledge/src/fingerprints.ts.md) | 1 | 0 | ./parse.js |
| [treadle/packages/knowledge/src/index.ts](/code/treadle/packages/knowledge/src/index.ts.md) | 0 | 1 | treadle/conformance/generators/gen_corpus.ts |
| [treadle/packages/knowledge/src/search.ts](/code/treadle/packages/knowledge/src/search.ts.md) | 1 | 0 | ./parse.js |

# Impact notes

Use this summary to choose a target module, then read that module at depth 0 or depth 1 for dependency and dependent context.
<!-- okf-code:end -->
