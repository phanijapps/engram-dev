---
kind: spike
slug: <kebab-slug>
title: <the question, verbatim>
status: draft
created: YYYY-MM-DD
repo_head: <commit pinned at authoring>
wiki_freshness: fresh | stale | absent | unknown
timebox: <hours or sessions>
decision_blocks: <which decision/spec question waits on this>
source_state: <relevant staged, unstaged, untracked, or clean inputs>
source_hashes: {}
supersedes: []
related: []
---

# Spike — <title>

> ONE decision-relevant question, timebox and kill conditions declared
> BEFORE work begins. A spike that ends "inconclusive, here's exactly what
> would settle it" succeeded; a spike that ships feature code failed.
> Spike code is throwaway and lives clearly marked (or outside the repo).

## Source pins and limits

Record HEAD, relevant dirty state, observed source hashes, and knowledge limits.
Cite actual files and documents. A fresh stamp does not verify dirty source bytes.
Separate current observations from historical evidence and proposed checks.

## Scope and Out-of-scope

State the bounded question and included slice. List exclusions explicitly.
If no exclusions exist, explain why the boundary is complete.

## The question

Singular. If there are two questions, there are two spikes. State which
decision or spec question (Q-id) this unblocks.

## Timebox & stop conditions

Declare this before running any experiment, including a supplied diagnostic.
Reading existing probe code can inform the method; executing it starts the experiment.
Capture the actual clock when declaring the start, then record observed elapsed time.
Do not invent or backdate timing to make an earlier run appear bounded.

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
| ------- | -------- | ------ |

## Outcome

Choose the outcome after inspecting captured outputs, exits, and deciding assertions.
Do not prefill a finding. A failed assertion does not prove the proposition it asserts.
An expected counterexample can decide against that proposition.
Separate an experiment error from captured evidence about the subject.

- **Answer:** <direct answer to the question, or "not established within
  timebox">.
- **Confidence:** high / medium / low — and what would raise it.
- **Decision unlocked:** what can now be decided/specced, citing Q-ids.

## Follow-ups

| Type             | Entry                          |
| ---------------- | ------------------------------ |
| New question     | Q… (blocks …, path …)          |
| New assumption   | A… (blast radius …, trigger …) |
| Decision enabled | D…                             |
| Task candidate   | …                              |

## Artifacts

Where the throwaway probe code / scripts / notes live, so they can be
found and deleted. "None" is fine — say so.

## Assumptions

| ID  | Assumption | Blast radius | Validation trigger |
| --- | ---------- | ------------ | ------------------ |

## Open questions

Classify each question as source, experiment, human spec, or design.

| ID  | Question | Kind | Blocks | Owner | Resolution path |
| --- | -------- | ---- | ------ | ----- | --------------- |

## Handoff

- **Pack:** canonical path, held revision, format and spec-question state; or why no initiative is needed.
- **Artifacts and requirements:** references and registered candidate IDs.
- **Ready for planning:** bounded slices supported by evidence.
- **Blocked on:** unresolved IDs, slices, owners and resolution paths.
- **Next step:** one next skill or action with its inputs.
- **Checks and limits:** actual command exits, expected alignment gaps and unrun checks.

Read `resources/operations.md` from the skill before machine registration.
Analysis grants no implementation permission or owner approval.
