---
title: "Harness naming: dated research and the brand fence"
type: Research
description: "The retained naming evidence, current brand authority, and limits of registry claims."
status: stable
created: 2026-10-10
updated: 2026-10-10
sources:
  - {"id": "s1", "resource": "docs/research/harness-naming.md"}
  - {"id": "s2", "resource": "treadle/packages/brand/src/brand.ts"}
  - {"id": "s3", "resource": "treadle/scripts/brand-check.mjs"}
  - {"id": "s4", "resource": "wiki/decisions/port-to-typescript.md"}
---

# Research context

The original naming research records candidate names and dated registry checks.
Source: `docs/research/harness-naming.md:1`.
Those checks are historical evidence, not a current availability or trademark claim.

# Current implementation

The [port decision](/decisions/port-to-typescript.md) names treadle.
User-facing naming configuration is in `treadle/packages/brand/src/brand.ts:1`.
The brand gate is `treadle/scripts/brand-check.mjs:1`.
Format identifiers remain contract vocabulary rather than branding.

The pedal metaphor explains the intended owner role. It does not mean every
filesystem write authenticates a human. See [claim boundaries](/project/security-posture.md).
The retained public-repository naming note is separate from the runtime brand;
see [the prior debt record](/project/open-work.md).
