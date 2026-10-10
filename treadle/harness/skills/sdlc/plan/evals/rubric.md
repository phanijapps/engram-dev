# Evaluation protocol — plan skill

Run each case against its fixture with the skill and a clean workspace.
Evaluate the produced design.md/plan.md, not the conversation. Keep
expectations out of the execution prompt. Record fixture revision, skill
version, tools (okf version), results, and failure evidence. Do
not label unevaluated cases as passed.

## Critical gates (all must pass — zero tolerance)

1. **Analysis-gated:** plan derives from docs/specs/<slug>/ artifacts;
   Ready-now only; blocked slices never designed around; no invented
   answers to recorded questions.
2. **Traceability:** every planned R → design section → task(s) →
   verification expectation; no orphan rows either direction; no task
   without implementable reference.
3. **Observable verification:** every task's expectation is a
   command/measurable observation; none are "looks right" assertions.
4. **DAG validity:** walked, not eyeballed — no cycles, no self-prereqs,
   prereqs are output-needs; ready set is the true topological entry set.
5. **Decision discipline:** alternatives real, doors tagged; one-way
   doors gate their tasks on owner acceptance; insufficient evidence
   keeps slices blocked, no manufactured decisions.
6. **Frozen context:** each task names its compile query, wiki cids,
   exact refs; no exploration-as-context.
7. **Status honesty:** statuses reflect observed evidence only; revisions
   supersede, never rewrite.

## Scoring dimensions (0 = absent/incorrect, 1 = partial, 2 = complete)

- Grounding quality (resolve/compile/wiki before design)
- Depth routing (blast-radius-honest, ceremony-free)
- Design quality (contracts, failure behavior, alternatives)
- Task decomposition (slice-sized, independently verifiable)
- DAG correctness (walk-validated)
- Traceability integrity
- Verification expectations (observable, mapped to ACs)
- Handoff quality (ready set + per-task context implement can execute)

Release threshold: all critical gates + at least 13/16. A single
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
