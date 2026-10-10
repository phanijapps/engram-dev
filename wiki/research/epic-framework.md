---
type: Domain
status: stable
created: 2026-10-08
updated: 2026-10-08
title: EPIC — 40 practices for specification-driven development artifacts (arXiv 2610.07534)
description: 'Claudino and others, 2026. An empirical study of 114 open-source SDD repositories. 40 practices in 10 quality dimensions in 4 categories: Expressive, Precise, Interpretable, Compartmentalized. Better specifications tracked with fewer bug-fix commits and more contributors.'
sources: [{ id: src, resource: docs/archive/specs/sdd-research/analysis.md }]
tags: [research, sdd, specification, quality]
---

# Overview

An empirical answer to: what does a good SDD artifact contain? A
template shows where information belongs. It does not show whether the
artifact says enough. Agents fill gaps with their own assumptions. One
practitioner: the agent is "making a decision even if I don't."

# The framework

Four categories, ten dimensions, forty practices. Each dimension holds
three to five practices; see [the digest](/research/sdd-loop-synthesis.md)
for the full list with examples.

- **E — Expressive.** The agent must know what is required and how the
  work gets checked. Unambiguous (mark unresolved decisions
  `[NEEDS CLARIFICATION]`; use MUST, not *should*; give measurable
  bounds). Singular (one capability per statement). Verifiable (a
  measurable target, the checking command, the scenarios to cover, and
  what counts as complete).
- **P — Precise.** Dependency control (declare assumptions, link them
  to tasks, say what happens on failure). Completeness (cover
  exceptional behavior; record constraints; track unresolved items).
- **I — Interpretable.** Conformance (stable unique identifiers,
  declared templates). Consistency (same term, same meaning, same
  names across artifacts). Comprehensibility (purpose-ordered
  sections, cross-document links, one-line orientation).
- **C — Compartmentalized.** Scope discipline (the specification
  states required behavior; design and tasks live in their own
  artifacts). Implementation-planning information (technical context,
  task outcomes, typed contracts, requirement-to-task traceability).

# Evidence status

- Method: ISO 29148 lens; 114 scored repositories; 5,675 coded
  segments; 30 grey-literature sources added no new practice; 15
  practitioners endorsed all 40 practices (declared).
- Outcome association: top-third specification quality came with 11.8%
  bug-fix commits versus 20.4% in the bottom third, 15% lower
  complexity, and 4× the median contributors. Observational;
  hypothesis-generating (implementation-supported at best).

# Practitioner findings to bank

- Teams write "must" instead of "should" — agents treat *should* as
  optional.
- "The checks that you mechanize and make blockers on your process are
  the ones that actually get followed."
- Measurable outcomes let an agent stop the harness loop: "if it
  doesn't know it's done, it's impossible for it to stop."

# Relationships

- Applied in [The SDD loop synthesis](/research/sdd-loop-synthesis.md)
  as the artifact review checklist.
