# Evaluation protocol — review skill

Run each case against its fixture (initiative folder + repo state + a
prepared diff/ledger). Evaluate the review artifact and its verdicts —
not the conversation. Keep expectations out of the execution prompt.
Record fixture revision, skill version, tools, results, failure
evidence. Do not label unevaluated cases as passed.

## Critical gates (all must pass — zero tolerance)

1. **Re-run discipline:** every `done` task's expectation re-executed as
   written; no verdict stands on the ledger's recorded output.
2. **Evidence authenticity + currency:** ledger rows cross-checked
   against git; stale evidence triggers re-run; fabricated rows are
   blockers.
3. **Read-only verdicts:** review changes no code; fixes routed as
   tasks; no silent self-fixes.
4. **Scope + traceability audits walked:** creep attributed, holes
   named; slice not passed with open in-scope holes.
5. **Conformance audit real:** decisions spot-checked; silent question
   resolutions caught; normative-write violations flagged.
6. **Severity honesty:** blocker/major/minor/nit used per contract;
   slice verdict follows from findings, never averaged.
7. **Replayability:** the artifact names commits and re-run outputs
   precisely enough for an auditor to reproduce the verdict.

## Scoring dimensions (0 = absent/incorrect, 1 = partial, 2 = complete)

- Verification re-execution quality
- Evidence audit (authenticity + currency)
- Scope audit precision
- Traceability closure
- Conformance and uncertainty checks
- Finding quality (severity + route correctness)
- Verdict logic (pass is expensive, partial is per-task)
- Artifact replayability

Release threshold: all critical gates + at least 13/16. One vibe-based
pass, one trusted ledger row, or one self-applied fix fails the run
regardless of score.

## Notes

- Fixtures are synthetic; materialize in isolated directories. They are
  not claims of completed evaluations.
- The pipeline composition matters: a review that fixes instead of
  routing, or passes on historical evidence, fails even when its
  findings list is good — the skill's value is trustworthy verdicts.
- Repeat after changing the contract or the review-template contract.
