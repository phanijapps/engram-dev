# Evaluation protocol — plan skill

Run each case against its fixture with the skill and a clean workspace.
Evaluate the produced design.md/plan.md, not the conversation. Keep
expectations out of the execution prompt. Record fixture revision, skill
version, tools (harness CLI version), results, and failure evidence. Do
not label unevaluated cases as passed.

## Critical gates (all must pass — zero tolerance)

1. **Analysis-gated:** plan derives from specs/<slug>/ artifacts;
   Ready-now only; blocked slices never designed around; no invented
   answers to recorded questions.
2. **Traceability:** every planned R → design section → task(s) →
   verification expectation; no orphan rows either direction; no task
   without implementable reference.
3. **Observable verification:** every task's expectation is a
   command/measurable observation; none are "looks right" assertions.
4. **DAG validity:** walked, not eyeballed — no cycles, no self-prereqs,
   prereqs are output-needs; structural entry set matches the DAG, and is separate from machine execution readiness.
5. **Decision discipline:** alternatives real, doors tagged; all proposed
   decisions need owner acceptance and separate start permission; insufficient evidence
   keeps slices blocked, no manufactured decisions.
6. **Frozen context:** each task registers allowed touch paths and sufficient advisory references;
   no exploration-as-context or false advisory pin claims.
7. **Status honesty:** statuses reflect observed evidence only; revisions
   supersede, never rewrite approved artifacts. No task admission or owner action during planning.

8. **Diagram integrity:** useful diagrams answer named questions, distinguish proposals,
   trace IDs, show material boundaries and failure paths, and agree with prose and canonical links.
   Omission for small fixes is justified; unavailable rendering is disclosed.
9. **Machine integrity:** locked registration, correct canonical link families, actual artifact hashes,
   schema availability/results, preserved prior evidence and receipts. Alignment alone is insufficient.

## Scoring dimensions (0 = absent/incorrect, 1 = partial, 2 = complete)

- Grounding quality (resolve/compile/wiki before design)
- Depth routing (blast-radius-honest, ceremony-free)
- Design quality (contracts, failure behavior, alternatives)
- Task decomposition (slice-sized, independently verifiable)
- DAG correctness (walk-validated)
- Traceability integrity
- Verification expectations (observable, mapped to ACs)
- Handoff quality (structural entry set, owner gate, registered task context)
- Visual clarity (appropriate view, accurate semantics, readable captions and validation limits)

Release threshold: all critical gates + at least 15/18. A single
invented answer to a recorded question, or one evidence-less "done",
fails the run regardless of score.

## Notes

- Cases specify synthetic fixture recipes; materialize in isolated test
  directories before execution. They are not claims of completed
  evaluations.
- The pipeline composition matters: a plan that re-analyzes (re-opens
  settled questions, surveys beyond the ready set) fails even when
  polished — stage blur is the failure.
- Repeat after changing the contract, templates, or routing table.

For this substantial revision, use an independent forward-test in an isolated temporary workspace.
Give the evaluator realistic requests and raw fixtures, without the expected answers or prior findings.
Permit authored planning artifacts and test packs only inside that workspace.
Run actual machine checks where available; do not grant owner consent or admit implementation.
Record generated artifacts, commands, schema/diagram tool versions, outcomes, failures, and remaining unrun cases.
