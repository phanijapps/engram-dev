---
kind: impact
slug: <kebab-slug-of-the-change>
title: <the change, exactly>
status: draft
created: YYYY-MM-DD
change_pins: <exact revisions / files / contracts under change>
repo_head: <commit pinned at authoring>
wiki_freshness: fresh | stale | unknown
related: []
---

# Impact analysis — <title>

> Candidate effects and their dispositions. An effect without a
> disposition is an unfinished analysis; a disposition without evidence is
> an opinion. Verification obligations drive what evidence must be
> re-established after the change lands.

## The change under analysis

Exactly what changes — surfaces, contracts, data shapes, behavior — pinned
to specific revisions/files. If the change itself is still vague, stop:
frame it first (feature mode), then run this.

## Affected surfaces

From wiki traversal + compile, cited. Include downstream callers found via
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

| ID  | Question | Blocks | Owner | Resolution path |
| --- | -------- | ------ | ----- | --------------- |

## Evidence index

| Claim | Source | Status |
| ----- | ------ | ------ |

## Handoff

- **Ready now:** …
- **Blocked on:** …
- **Next step:** …
