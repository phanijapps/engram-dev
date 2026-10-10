---
title: "Engineering controls actually present"
type: Project
description: "Observed build and runtime controls, separated from the forty-rule historical standards proposal."
status: stable
created: 2026-10-10
updated: 2026-10-10
sources:
  - {"id": "s1", "resource": "treadle/package.json"}
  - {"id": "s2", "resource": "treadle/tsconfig.base.json"}
  - {"id": "s3", "resource": "treadle/eslint.config.mjs"}
  - {"id": "s4", "resource": "treadle/vitest.config.ts"}
  - {"id": "s5", "resource": ".github/workflows/ci.yml"}
  - {"id": "s6", "resource": "treadle/packages/knowledge/package.json"}
  - {"id": "s7", "resource": "docs/research/nodejs-engineering-standards.md"}
---

# Observed controls

| Control | Evidence |
| --- | --- |
| pnpm workspace and Node minimum | `treadle/package.json:5` |
| Strict TypeScript options | `treadle/tsconfig.base.json:1` |
| Types, lint, format, tests in one command | `treadle/package.json:10` |
| Explicit-any and unused-private-member lint rules | `treadle/eslint.config.mjs:26` |
| Coverage floors, including 75% lines and 65% branches | `treadle/vitest.config.ts:11` |
| CI declaration for two Node floors and three operating systems | `.github/workflows/ci.yml:10` |
| Corpus, brand, audit, and links commands | `treadle/package.json:15` |

These are implementation-supported configurations. Their presence does not prove
that the latest run passed. Current execution evidence belongs in dated records.

# Historical standards proposal

The forty-rule research document is an input, not an attestation that every
rule is implemented. Source: `docs/research/nodejs-engineering-standards.md:1`.
It includes proposals for property testing, publishing provenance, benchmarks,
logging, generated API docs, and broader type-aware lint configuration.
Do not read these as current runtime guarantees.

The knowledge package depends on YAML and is an independent plane;
it does not depend on core. Source: `treadle/packages/knowledge/package.json:5`.
The historical proposed package dependency chain therefore needs qualification.

Current test files are outside the composite source typecheck, and ESLint excludes
package tests and shipped/browser payloads. Source: `treadle/eslint.config.mjs:6`.
See [open work](/project/open-work.md) for deferred improvements.
