---
kind: impact
slug: <kebab-slug-of-the-change>
title: <the change, exactly>
status: draft
created: YYYY-MM-DD
change_pins: <exact revisions / files / contracts under change>
repo_head: <commit pinned at authoring>
wiki_freshness: fresh | stale | absent | unknown
source_state: <relevant staged, unstaged, untracked, or clean inputs>
source_hashes: {}
supersedes: []
related: []
---

# Impact analysis — <title>

> Candidate effects and their dispositions. An effect without a
> disposition is an unfinished analysis; a disposition without evidence is
> an opinion. Verification obligations drive what evidence must be
> re-established after the change lands.

## Source pins and limits

Record HEAD, relevant dirty state, observed source hashes, and knowledge limits.
Cite actual files and documents. A fresh stamp does not verify dirty source bytes.
Separate current observations from historical evidence and proposed checks.

## Scope and Out-of-scope

State the bounded question and included slice. List exclusions explicitly.
If no exclusions exist, explain why the boundary is complete.

## The change under analysis

Exactly what changes — surfaces, contracts, data shapes, behavior — pinned
to specific revisions/files. If the change itself is still vague, stop:
frame it first (feature mode), then run this.

## Affected surfaces

From knowledge traversal and actual source reads, cited. Include downstream callers found via
`wiki/code/**` relationship sections; unknown reachability is listed with
status `unknown` — that is a finding.

| Surface | Reach mechanism | Evidence (wiki cid / path) | Status |
| ------- | --------------- | -------------------------- | ------ |

## Candidate effects

| #   | Effect (surface → consequence) | Confidence          | Disposition                       | Evidence |
| --- | ------------------------------ | ------------------- | --------------------------------- | -------- |
| E1  | …                              | high / medium / low | retain / revise / replace / defer | …        |

- **retain** — surface is unaffected as-is (needs evidence, not optimism).
- **revise** — surface must change with this work.
- **replace** — surface is superseded; successor named.
- **defer** — consciously left; **must name the consequence** and when it
  comes due. A defer without a consequence is a silent break.

## Verification obligations

Which existing evidence/test/verification plans this change invalidates
and which must be re-established (cite suites, wiki concepts, prior
verifications). Historical passing evidence no longer counts here — say
which passes go stale.

## Blocked work

Tasks/slices blocked until dispositions above are accepted (with owners).
Empty is fine — say why credible.

## Open questions

Classify each question as source, experiment, human spec, or design.

| ID  | Question | Kind | Blocks | Owner | Resolution path |
| --- | -------- | ---- | ------ | ----- | --------------- |

## Evidence index

| Claim | Source | Status |
| ----- | ------ | ------ |

## Assumptions

| ID  | Assumption | Blast radius | Validation trigger |
| --- | ---------- | ------------ | ------------------ |

## Handoff

- **Pack:** canonical path, held revision, format and spec-question state; or why no initiative is needed.
- **Artifacts and requirements:** references and registered candidate IDs.
- **Ready for planning:** bounded slices supported by evidence.
- **Blocked on:** unresolved IDs, slices, owners and resolution paths.
- **Next step:** one next skill or action with its inputs.
- **Checks and limits:** actual command exits, expected alignment gaps and unrun checks.

Read `resources/operations.md` from the skill before machine registration.
Analysis grants no implementation permission or owner approval.
