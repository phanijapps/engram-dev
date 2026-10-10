---
kind: review
slug: <kebab-slug>
title: <slice under review, plainly>
review: <n>
status: draft
created: YYYY-MM-DD
diff_base: <plan's repo_head pin>
diff_head: <HEAD at review>
tasks_in_scope: [T1, T2, …]
commits: [<refs under review>]
related: [plan.md, design.md, gap-1.md]
---

# Review <n> — <title>

> Re-run, don't trust. Every verdict below stands on a re-executed
> expectation and a checked diff, named precisely enough to replay.

## Verdict summary

| Task | Verdict                     | Re-run result       | Evidence ref                  |
| ---- | --------------------------- | ------------------- | ----------------------------- |
| T1   | pass / fail / cannot-verify | <command → outcome> | commit <ref>, output <pinned> |
| T2   | …                           | …                   | …                             |

**Slice verdict:** pass requires all pass + zero open blocker/major +
traceability closed. Partial is per-task, never averaged.

## Re-run log

Verbatim commands and outcomes, one block per task — the replay record.

```
$ <expectation as written>
<output tail>
→ <pass/fail>
```

## Findings

| ID  | Severity                      | Finding | Evidence                   | Route                   |
| --- | ----------------------------- | ------- | -------------------------- | ----------------------- |
| F1  | blocker / major / minor / nit | …       | file:line / command output | T-next / plan / analyze |

Severity contract: blocker = fabricated evidence, broken contract,
out-of-scope effect; major = failed expectation, traceability hole;
minor/nit = polish. Routed blockers/majors gate the slice verdict.

## Scope audit

Diff vs union of frozen contexts: creep found (file → owning task or
"none"), implied-but-untouched surfaces ("none" must be credible).

## Traceability audit

| R/G | Landed by | Deferred? | Check |
| --- | --------- | --------- | ----- |

Every in-scope row landed or explicitly deferred with artifact ref.
Orphans = findings.

## Conformance audit

- Decisions D<n>: spot-check result per decision (honored / violated → F-id).
- Carried Q/A: still open unless an artifact resolved them — silent
  resolutions are major findings.
- Normative writes: went through findings propose, none written as
  settled truth.
- Wiki honesty: content matches landed code; freshness re-anchored or
  staleness noted in the ledger.

## Handoff

- **All pass:** slice complete, evidence current through `<HEAD ref>`.
- **Routed fixes:** T-next rows appended to plan.md (ready set updated).
- **Next step:** `implement` the routed tasks / next slice.
