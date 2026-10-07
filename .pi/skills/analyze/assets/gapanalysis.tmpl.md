---
kind: gap
slug: <kebab-slug>
title: <what knowledge was missing, plainly>
status: draft
created: YYYY-MM-DD
repo_head: <commit pinned at authoring>
trigger: <compile miss / search miss / review finding / blocked task / stale wiki>
related: []
---

# Gap analysis — <title>

> The register of what we do not know, why it matters, where the answer
> might live, and how to close it. Ends in a close plan — never a shrug.
> This mode fixes the *context layer*; it does not spec or fix anything
> itself.

## Trigger

What failed or felt missing, concretely: the compile that came back
insufficient, the search that missed, the review that found us guessing,
the task that stalled. Quote the moment — it is the evidence this gap is
real.

## Gap register

| ID | What we don't know | Why it matters (what it blocks) | Where the answer might live | How to close |
|----|--------------------|---------------------------------|----------------------------|--------------|
| G1 | … | … | repo path / wiki area / a person / an experiment | build-kb update / read source / spike / ask-once |

## Coverage & confidence

What IS grounded (and its evidence status) vs what rests on `unknown`.
Note stale pins: claims pinned to an older revision than `repo_head`.
Honest coverage here is the deliverable — "we know A, B solidly; C is
inferred from …; D is pure unknown."

## Close plan

Concrete next moves, each mapped to its owner/tool:

- `memex-core wiki update` / build-kb pass for …
- spike for … (experiment-sized unknowns)
- ask-once human list for … (only what no artifact can answer)
- new wiki concepts worth authoring (curated, evidence-cited) for …

## Assumptions adopted meanwhile

What we will proceed on while gaps stay open — each with blast radius and
the gap ID that closes it:

| ID | Assumption | Blast radius | Closed by |
|----|-----------|--------------|-----------|

## Handoff

- **Ready now:** …
- **Blocked on:** G-ids with owners
- **Next step:** …
