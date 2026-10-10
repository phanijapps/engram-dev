---
title: "treadle: the active TypeScript harness"
type: System
description: "Six packages, portable localhost surfaces, the self-hosted corpus, and qualified verification."
status: stable
created: 2026-10-10
updated: 2026-10-10
sources:
  - {"id": "s1", "resource": "treadle/package.json"}
  - {"id": "s2", "resource": "treadle/packages/core/src/index.ts"}
  - {"id": "s3", "resource": "treadle/packages/knowledge/src/index.ts"}
  - {"id": "s4", "resource": "treadle/packages/web/src/servers.ts"}
  - {"id": "s5", "resource": "treadle/packages/cli/src/main.ts"}
  - {"id": "s6", "resource": "treadle/conformance/generators/gen_corpus.ts"}
  - {"id": "s7", "resource": ".github/workflows/ci.yml"}
  - {"id": "s8", "resource": "treadle/vitest.config.ts"}
  - {"id": "s9", "resource": "treadle/packages/brand/src/brand.ts"}
---

# Packages

| Package | Responsibility | Source |
| --- | --- | --- |
| `@treadle/core` | Specpacks, admission, derived stages, evidence, pins | `treadle/packages/core/src/index.ts:1` |
| `@treadle/knowledge` | OKF bundles, search, links, findings, freshness | `treadle/packages/knowledge/src/index.ts:1` |
| `@treadle/web` | Room and library servers and browser assets | `treadle/packages/web/src/servers.ts:148` |
| `@treadle/cli` | `do`, `know`, harness installation | `treadle/packages/cli/src/main.ts:1` |
| `@treadle/conformance` | Golden corpus checks | `treadle/conformance/generators/gen_corpus.ts:1` |
| `@treadle/brand` | User-facing naming configuration | `treadle/packages/brand/src/brand.ts:1` |

The room and library bind `127.0.0.1`.
Sources: `treadle/packages/web/src/servers.ts:189` and
`treadle/packages/web/src/servers.ts:311`.
See [security posture](/project/security-posture.md) before serving content.

# Corpus and retirement

The Python engines are retired under the `python-final` tag.
The committed goldens preserve the port witness. The TypeScript generator
reproduces them; `pnpm corpus:check` checks the difference.
Source: `treadle/package.json:16` and `treadle/conformance/generators/gen_corpus.ts:1`.
This proves equality for covered cases, not every possible program behavior.
See [the corpus decision](/decisions/corpus-self-hosting.md).

# Verification

`pnpm check` runs types, lint, format, and tests.
Coverage thresholds include 75% lines and 65% branches.
Sources: `treadle/package.json:10`; `treadle/vitest.config.ts:11`.
CI declares Node 22 and 24 across Linux, macOS, and Windows.
Source: `.github/workflows/ci.yml:10`.
A declared matrix does not establish a successful remote run.

Test counts and coverage percentages belong in dated evidence, rather than
this architecture page. See [open work](/project/open-work.md) and the
[documentation retrospective](/retrospectives/2026-10-10-documentation-consolidation.md).

# Scope

Code indexing is delegated to external tools. The engine owns the bundle.
The [authority map](/project/documentation-map.md) distinguishes current wiki
knowledge from executable work, format contracts, and historical records.
