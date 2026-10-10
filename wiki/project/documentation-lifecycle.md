---
title: "Proposed documentation and retrospective lifecycle"
type: Policy
description: "Draft practice for current knowledge, initiative snapshots, retrospective supplements, and lesson promotion."
status: draft
created: 2026-10-10
updated: 2026-10-10
sources:
  - {"id": "s1", "resource": "docs/specs/documentation-consolidation/feature.md"}
  - {"id": "s2", "resource": "docs/specs/documentation-consolidation/design.md"}
  - {"id": "s3", "resource": "treadle/packages/knowledge/src/findings.ts"}
---

# Proposal status

This is a draft maintenance practice. It is not an accepted closure requirement.
The findings ledger holds the proposal for owner review.
Source: `docs/specs/documentation-consolidation/feature.md:1`, R6 and Q1.

# Proposed responsibilities

The wiki holds current explanations. Canonical packs hold executable state.
Each admitted initiative gets a wiki page with purpose, source location,
dated state, revision, and links to related decisions and retrospectives.
A prose analysis can have a wiki page before an executable pack exists.

An implementer updates affected knowledge after source changes. The reviewer
checks sources, navigation, and evidence limits. A closed pack gains a dated
retrospective from its record; later conclusions create dated supplements.
These are proposed practices, not engine-enforced transitions.

# Proposed retrospective fields

- Intent and expected outcome, with canonical source pointers.
- Observation date, source HEAD, pack revision, full hash, and author.
- Actual result, distinguishing recorded reports from checks rerun now.
- What worked and what failed, each tied to evidence.
- Causes and lessons, with inferred conclusions labelled.
- Alternatives or trade-offs that explain the resulting shape.
- Follow-ups linked to gaps or a new initiative, with owner and priority unknown
  when not assigned.
- Missing owner feedback, measurements, or external verification.

# Promotion and retention

Retrospective observations do not become binding rules automatically.
Propose a lesson through the findings ledger with source, destination, kind,
and rationale. Human resolution remains the authority boundary.
Source: `treadle/packages/knowledge/src/findings.ts:146`.

The proposed maintenance check combines wiki validation, anchors, links,
source inspection, and explicit untracked-source disclosure.
A stamp alone cannot establish current TypeScript knowledge.
See [freshness limits](/domain/pattern-content-hash-change-detection.md).

# Unresolved choices

Q1 asks whether closure should later require a retrospective.
Q2 asks who owns and prioritizes follow-up work. Neither blocks this doc repair.
Their resolution belongs in a future decision or analysis, not a fabricated
acceptance event on this page.
