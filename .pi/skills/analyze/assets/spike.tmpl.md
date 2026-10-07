---
kind: spike
slug: <kebab-slug>
title: <the question, verbatim>
status: draft
created: YYYY-MM-DD
repo_head: <commit pinned at authoring>
timebox: <hours or sessions>
decision_blocks: <which decision/spec question waits on this>
related: []
---

# Spike — <title>

> ONE decision-relevant question, timebox and kill conditions declared
> BEFORE work begins. A spike that ends "inconclusive, here's exactly what
> would settle it" succeeded; a spike that ships feature code failed.
> Spike code is throwaway and lives clearly marked (or outside the repo).

## The question

Singular. If there are two questions, there are two spikes. State which
decision or spec question (Q-id) this unblocks.

## Timebox & stop conditions

- **Timebox:** …
- **Stop when:** the question is answered / the timebox expires —
  whichever first. Expiry is a valid, recorded outcome.
- **Kill conditions:** evidence that would end the spike early because the
  answer is already determined (either way).

## Method

What will be examined, built, or measured — and what will NOT be. Probe
code is throwaway: label it, or keep it out of the repo.

## Findings

Evidence-statused. `unknown` findings that survive the timebox go to the
outcome as residual uncertainty, not to the memory hole.

| Finding | Evidence | Status |
|---------|----------|--------|

## Outcome

- **Answer:** <direct answer to the question, or "not established within
  timebox">.
- **Confidence:** high / medium / low — and what would raise it.
- **Decision unlocked:** what can now be decided/specced, citing Q-ids.

## Follow-ups

| Type | Entry |
|------|-------|
| New question | Q… (blocks …, path …) |
| New assumption | A… (blast radius …, trigger …) |
| Decision enabled | D… |
| Task candidate | … |

## Artifacts

Where the throwaway probe code / scripts / notes live, so they can be
found and deleted. "None" is fine — say so.

## Handoff

- **Ready now:** …
- **Blocked on:** …
- **Next step:** …
