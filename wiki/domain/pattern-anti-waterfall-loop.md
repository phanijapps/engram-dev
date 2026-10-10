---
type: Pattern
status: stable
created: 2026-10-08
updated: 2026-10-08
title: The anti-waterfall loop — bounded artifacts, interleaved work
description: "The SDD loop pattern: knowledge first, then the smallest analysis/design that unblocks the next slice; uncertainty recorded as a deliverable; unblocked work proceeds while questions run."
sources: [{ id: src, resource: treadle/harness/skills/sdlc/analyze/SKILL.md }]
tags: [pattern, sdd, anti-waterfall, loop]
---

# Pattern

Knowledge first, then five basic skills in a loop — with the loop's shape
itself preventing waterfall:

[^l1]:
    `treadle/harness/skills/sdlc/analyze/SKILL.md` §0 — bounded artifacts, uncertainty
    as a deliverable, interleaving is the point.

[^l2]:
    `skills/sdlc/plan/SKILL.md` §0 — plans only Ready-now slices;
    blocked slices are placeholders, never designed around.

[^l3]:
    `skills/sdlc/implement/SKILL.md` §0 — frozen context, scope jail,
    observable verification as the exit criterion.

[^l4]:
    `skills/sdlc/review/SKILL.md` §0 — re-run, don't trust; read-only
    verdicts; fixes become tasks.

# When to apply

Every initiative. The loop replaces phase gates: analyze the smallest
next thing, plan its slices, implement one, review with re-runs — and let
recorded questions (not silence) gate what is not yet known.

# Examples

`docs/specs/okf-only-engine/` — the removal wave ran the full loop:
analysis gated planning, planning gated slices, review re-ran every
expectation before the slice passed.
