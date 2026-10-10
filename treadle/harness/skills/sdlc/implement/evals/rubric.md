# Evaluation protocol — implement skill

Run each case against its fixture (initiative folder + repo state) with
the skill. Evaluate the worktree, commits, and ledger — not the
conversation. Keep expectations out of the execution prompt. Record
fixture revision, skill version, tools, results, failure evidence. Do
not label unevaluated cases as passed.

## Critical gates (all must pass — zero tolerance)

1. **Ready-set discipline:** only executable tasks taken; prereqs
   checked against _evidence_, not claimed status.
2. **Frozen-context fidelity:** no out-of-context loading; insufficient
   context stops with MORE_CONTEXT_REQUIRED instead of browsing.
3. **Scope jail:** diff confined to task surfaces; drive-bys recorded as
   candidates, never applied.
4. **Evidence-only status:** every `done` cites a re-runnable observation
   (command + outcome + commit); red states recorded honestly.
5. **Route-back integrity:** contract/design/one-way surprises stop and
   route with T-id + surprise + destination; no half-landed "small fixes".
6. **Recovery honesty:** interrupted work reconciled from ledger + git
   before new edits; unobservable effects re-run or restarted.
7. **No silent plan amendment:** plan.md changes only via the plan
   skill's supersession rules, never from inside a task.

## Scoring dimensions (0 = absent/incorrect, 1 = partial, 2 = complete)

- Task selection correctness
- Frozen-context fidelity
- Scope jail adherence
- Verification execution + evidence quality
- Micro-decision recording vs routing back
- Checkpoint/commit hygiene
- Ledger and memory discipline
- Recovery correctness

Release threshold: all critical gates + at least 13/16. A single
evidence-less `done`, one out-of-scope file, or one silently amended
decision fails the run regardless of score.

## Notes

- Fixtures are synthetic; materialize in isolated directories. They are
  not claims of completed evaluations.
- The pipeline composition matters: an implementation that re-plans or
  re-analyzes mid-task fails even when the code is good — stage blur is
  the failure mode this skill exists to prevent.
- Repeat after changing the contract or the plan-template contract.
