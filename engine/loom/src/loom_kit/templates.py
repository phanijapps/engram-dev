"""Markdown artifact templates. EPIC-structured (arXiv 2610.07534)."""

SPEC_TMPL = """# Spec — {slug}

> Machine authority lives in `sdd.json`. This file is the human-facing
> prose the spine refers to. Keep the two in agreement; the spine wins.

## Goal

<!-- EPIC I3: one-line orientation. -->
<!-- This initiative is ..., not ... -->

## Requirements

<!-- EPIC E2: one capability per requirement. One requirement per
     node in sdd.json; keep node ids in the headings. -->
### R: {slug}-r1

- [NEEDS CLARIFICATION: ...] marks unresolved decisions. Every marker
  becomes a QUESTION node with an owner.

## Acceptance

<!-- EPIC E3: measurable target + the command that checks it + what
     counts as complete. -->

## Constraints and dependencies

<!-- EPIC P1: assumptions, dependencies, failure handling. -->

## Out of scope

<!-- EPIC P2/C1: explicit exclusions. -->

## Questions

| # | Question | Owner | Path |
|---|---|---|---|
"""

PLAN_TMPL = """# Plan — {slug}

> Tasks are nodes in `sdd.json`. This file holds the human prose per
> task; `loom next` compiles the frozen context.

## Tasks

<!-- EPIC C2: every task states what it produces and its observable
     verification expectation (the command + the pass condition). -->
### T: {slug}-t1

- Produces: ...
- Verified by: `...` exiting 0
- Requires: ...
"""

REVIEW_TMPL = """# Review — {slug}

Verdict routing (SpecAgent): ACCEPT — done; IMPROVE — local weakness,
regenerate the slice; REPLAN — structural weakness, re-open the analysis.

| Task | Verdict | Findings | Severity | Fix routed to |
|---|---|---|---|---|
"""
