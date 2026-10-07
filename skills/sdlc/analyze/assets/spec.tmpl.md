---
kind: spec
slug: <kebab-slug>
title: <what must be true, plainly>
status: draft
created: YYYY-MM-DD
repo_head: <commit pinned at authoring>
wiki_freshness: fresh | stale | unknown
related: [feature.md, spike-n-<topic>.md]
---

# Spec — <title>

> One bounded slice of testable contract. Spec ONLY in-scope behavior.
> Every claim carries an evidence status: declared / implementation-supported /
> inferred / conflicting / unknown. Sections without content say "none
> identified" and why that is credible — never invented filler.

## Why

Problem, user-visible outcome, and the evidence that it is a real problem
(links to feature.md, issues, wiki concepts — with status labels).

## Scope

**In:** the slices this spec makes testable.

**Out (mandatory):** everything deliberately excluded. An empty register
must state why completeness is credible.

## Requirements

| ID | Requirement (testable, MUST/SHOULD) | Acceptance criterion | Evidence / status |
|----|--------------------------------------|----------------------|-------------------|
| R1 | … | … | path:line (implementation-supported) |

Requirements cover in-scope slices only. No "while we're here" creep.

## Acceptance criteria

Given/when/then per requirement, with the **method** that will check it
(test, inspection, measurement). Method is a plan, not a result — observed
outcomes are recorded elsewhere by the verification stage, never here.

- **AC1 (checks R1):** Given … when … then … — method: …

## Constraints

| Constraint | Mandatory / preference | Source | Applies to |
|---|---|---|---|
| … | mandatory | wiki/<concept>.md, spec, or decision link | R1, R2 |

## Open questions

| ID | Question | Blocks | Owner | Resolution path |
|----|----------|--------|-------|-----------------|
| Q1 | … | R2, AC2 | <who> | spike / human decision / evidence source |

Questions are deliverables. None of them may be silently resolved to make
the spec look finished.

## Assumptions

| ID | Assumption | Blast radius | Validation trigger |
|----|-----------|--------------|--------------------|
| A1 | … | R3 + AC3 | when X happens / before milestone Y |

## Decisions made here

| Decision | Alternatives considered | Door (two-way / one-way) | Resolves |
|----------|------------------------|--------------------------|----------|
| D1 | … | two-way | Q1 |

Only record decisions the evidence supports; otherwise the question stays
open. One-way doors get extra scrutiny and name their reversibility cost.

## Evidence index

| Claim | Source | Status |
|-------|--------|--------|
| … | path:line or wiki cid | implementation-supported |

## Handoff

- **Ready now:** <slices with no blocking unknowns> → `plan` / `implement`
- **Blocked on:** Q1 (owner, path), spike-n, D-needed
- **Next step:** <the single next skill invocation and its input>
