---
kind: design
slug: <kebab-slug>
title: <approach, plainly>
status: draft
created: YYYY-MM-DD
repo_head: <commit pinned at authoring>
wiki_freshness: fresh | stale | unknown
analysis_inputs: [feature.md, spec.md, impact-<change>.md, spike-n-<topic>.md]
related: []
---

# Technical design — <title>

> Bounded to the Ready-now slices of the analysis Handoff. Every choice
> traces to an R/Q/A/D id from `specs/<slug>/`. Evidence status on
> load-bearing claims: declared / implementation-supported / inferred /
> conflicting / unknown.

## Approach

The selected way the system changes, in 1–3 paragraphs — enough for a
reviewer to check the reasoning, not a manual.

**Options considered** (from analysis + grounding; alternatives are real,
not strawmen):

| Option       | Meets constraints? | Cost / risk | Verdict        |
| ------------ | ------------------ | ----------- | -------------- |
| A (selected) | …                  | …           | chosen — D<n>  |
| B            | …                  | …           | rejected — why |

## Change by surface

| Surface (wiki cid / path) | What changes | Contracts touched | Evidence                 |
| ------------------------- | ------------ | ----------------- | ------------------------ |
| …                         | …            | …                 | implementation-supported |

From the analysis's affected-surfaces table + fresh grounding, not
memory. Surfaces not touched: one line saying so, or they appear here.

## Contracts & data

External interfaces, data shapes, file formats, CLI/API — before/after.
Compatibility posture for anything shared (this is what the impact
artifact's dispositions constrain): retain / revise / replace, and what
migrates.

## Failure behavior

New failure modes the change introduces, error handling posture, rollback
story. "None" must be credible, not assumed.

## Decisions

Continues the analysis's D-numbering. Each: choice · alternatives ·
two-way/one-way door · evidence status · resolves/defers.

| ID   | Decision | Alternatives | Door    | Resolves | Status                             |
| ---- | -------- | ------------ | ------- | -------- | ---------------------------------- |
| D<n> | …        | …            | one-way | Q<m>     | proposed — owner sign-off required |

**One-way doors:** tasks depending on these stay `blocked-on: D<n>
acceptance` until the owner accepts, recorded here with date and actor.

## Carried uncertainty

Questions/assumptions this design leaves open — verbatim ids from the
analysis, plus any new ones discovered here (registered back in the
owning artifact, never orphaned in this file).

| ID  | Carried question / assumption | Blocks | Path |
| --- | ----------------------------- | ------ | ---- |

## Out of scope

Explicit, mandatory. Includes everything the analysis excluded plus what
this design deliberately declines. Empty register must state why that is
credible.

## Evidence index

| Claim | Source | Status |
| ----- | ------ | ------ |
