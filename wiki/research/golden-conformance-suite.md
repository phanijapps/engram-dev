---
title: "Golden conformance: design lineage and current witness"
type: Research
description: "The historical corpus design, actual self-hosted generator, and coverage limits."
status: stable
created: 2026-10-10
updated: 2026-10-10
sources:
  - {"id": "s1", "resource": "docs/research/golden-conformance-suite.md"}
  - {"id": "s2", "resource": "treadle/conformance/generators/gen_corpus.ts"}
  - {"id": "s3", "resource": "treadle/scripts/corpus-check.mjs"}
  - {"id": "s4", "resource": "wiki/decisions/corpus-self-hosting.md"}
---

# Design lineage

The original research describes a proposed layered corpus and design-only status.
Source: `docs/research/golden-conformance-suite.md:1`.
That status predates implementation. It is retained as design evidence.

# Current implementation

The TypeScript generator emits the canonical corpus.
Source: `treadle/conformance/generators/gen_corpus.ts:1`.
The check regenerates and compares it against committed witnesses.
Source: `treadle/scripts/corpus-check.mjs:1`.
See [the self-hosting decision](/decisions/corpus-self-hosting.md).

The existing generator covers specpack emissions, refusals, event paths, and
knowledge bundle cases. Proposed extra layers are not evidence of implemented
coverage. A zero difference proves equality only for the generated cases.

# Verification boundary

Current commands and outcomes belong in dated evidence. Historical “design only”
and mutable case counts do not belong in an undated architecture guarantee.
See [the active engine](/systems/treadle.md).
