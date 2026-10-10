---
title: "Content hashes and the current freshness gap"
type: Domain
description: "Spec pins use hashes, while wiki fingerprints remain Python-only and the stamp compares HEAD."
status: stable
created: 2026-10-10
updated: 2026-10-10
sources:
  - {"id": "s1", "resource": "treadle/packages/core/src/specpack/pins.ts"}
  - {"id": "s2", "resource": "treadle/packages/knowledge/src/fingerprints.ts"}
  - {"id": "s3", "resource": "treadle/packages/knowledge/src/stamp.ts"}
  - {"id": "s4", "resource": "treadle/packages/cli/src/commands/know.ts"}
---

# Current mechanisms

Spec context pins use source digests to detect drift.
Source: `treadle/packages/core/src/specpack/pins.ts:1`.
Wiki fingerprints also hash file bytes, but their scanner currently selects `.py`
files. TypeScript and Markdown are not baselined by that scanner.
Source: `treadle/packages/knowledge/src/fingerprints.ts:54`.

Anchor review compares a concept's source resources with stored hashes.
An absent hash is `untracked`; a missing file is `missing-file`.
Source: `treadle/packages/knowledge/src/fingerprints.ts:123`.
The CLI flags changed or missing sources, while untracked sources remain report-only.
Source: `treadle/packages/cli/src/commands/know.ts:158`.

The freshness stamp compares saved HEAD with current HEAD.
It does not compare dirty source bytes. A committed stamp contains its parent
revision, so a later commit can also make it stale without source drift.
Source: `treadle/packages/knowledge/src/stamp.ts:68`.

# Interpretation

A fresh stamp and zero flagged anchors establish only these limited checks.
They do not prove that current TypeScript claims are up to date.
Source reinspection and independent source hashes qualify the documentation repair.
The dated audit is `specs/documentation-consolidation/verification.json`.

# Proposed follow-up

A separate engine wave could baseline supported source types and compare actual
source content. It needs contract tests and deliberate corpus review.
See [open work](/project/open-work.md). This page records a gap;
it does not declare that the engine gap has been fixed.
