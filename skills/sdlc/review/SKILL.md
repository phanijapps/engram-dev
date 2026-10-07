---
name: review
description: Adversarially verify landed work against the plan's contracts — the verification stage of the SDD loop. Re-runs every done task's verification expectation now (never trusts the ledger), cross-checks evidence against git, audits scope jail and traceability (R→D→T→V), checks design-decision conformance and evidence currency (code moved after evidence = re-run; historical success cannot satisfy changed scope), then issues a read-only verdict — fixes become new tasks, never silent self-fixes. Produces review-<n>.md in the initiative folder. Triggers are "review the work", "verify T1-T5", "is this actually done", "check the landed diff against the plan". Not for implementing fixes (implement), planning (plan), or producing analysis (analyze).
---

# review — re-run, don't trust

Verification is observation, not assertion. A `done` in the ledger is a
claim; this skill's job is to convert claims into checked facts — or
findings. Review is read-only over the work: fixes become tasks, never
silent self-fixes (separation of duties: the actor that changed the code
does not certify it).

## 0. The review contract

1. **Re-run, don't trust.** Every `done` task's verification expectation
   is re-executed **now**, as written. The ledger's recorded evidence is
   a claim about the past; only the re-run is a fact about the present.
2. **Evidence currency.** Verification evidence pins to a code revision.
   If any surface moved after the evidence (newer commits touch the
   task's files), the expectation is re-run regardless of its recorded
   pass — historical success cannot satisfy changed scope.
3. **Evidence authenticity.** Ledger rows must cite real, checkable
   things: commit refs that exist (`git show`), commands whose outputs
   are plausible and reproducible. A fabricated or unverifiable evidence
   row is a **blocker** finding, not a nit — the stop criteria have zero
   tolerance for fabricated evidence.
4. **Scope audit.** Diff (task base → HEAD) vs the union of frozen
   contexts: anything touched outside task surfaces is creep (finding +
   task candidate); anything a task's goal implies but the diff doesn't
   touch is an incomplete slice (finding).
5. **Traceability audit.** Walk the plan's matrix: every in-scope R/G
   landed or *explicitly* deferred (with an artifact ref); every task
   implements something; no orphan rows either direction.
6. **Conformance audit.** Design decisions honored in code (spot-check
   each D); carried questions/assumptions still open unless an artifact
   resolved them; normative discoveries went through `findings propose`,
   never written as settled truth; wiki content matches landed code
   (freshness re-anchored or staleness noted).
7. **Read-only verdicts.** Findings route: small two-way fix → new task
   appended to the plan (T-next, prereq-free); contract/design problem →
   route back to `plan`; new unknown → `analyze`. Review never applies
   fixes itself.
8. **Pass is expensive.** The initiative slice passes only when: all
   done tasks re-verified green, zero unresolved blocker/major findings,
   traceability closed, evidence current. Partial passes are recorded
   per-task, never averaged into a vibe.

## 1. Load

1. `memex-core resolve` → freshness gate.
2. Read the initiative folder: plan.md (DAG, ledger, frozen contexts),
   design.md (decisions), analysis artifacts (registers, matrix).
3. Establish the diff base: the plan's `repo_head` pin → HEAD. Commit
   list = the landed work under review.

## 2. Verify tasks (assets/review.tmpl.md)

Per `done` task, in order:

1. Re-run the verification expectation as written; capture output.
2. Check evidence authenticity (rule 3) and currency (rule 2).
3. Scope-audit the task's commits against its frozen context.
4. Verdict per task: **pass** (re-verified, in-scope, evidence current) /
   **fail** (findings, routed) / **cannot-verify** (expectation not
   re-runnable as written — itself a finding: expectations must be
   observable and reproducible).

## 3. Audit the slice

Walk rules 4–6 across the whole diff: creep map, traceability matrix,
decision conformance (one spot-check per D), carried-uncertainty
register (nothing silently resolved), wiki honesty, findings-ledger
discipline for normative writes.

## 4. Verdict & close

1. Write `docs/specs/<slug>/review-<n>.md` from the template: per-task
   verdicts, findings with severity + route, re-run log (verbatim).
2. Append routed fixes as tasks in plan.md (T-next rows, prereqs set) —
   status `todo`, owned by the next `implement` pass.
3. `memex-core record --title "slug: review-<n> — <pass|x/y> verified,
   <k> findings" --body "…verdicts + routes — see review-<n>.md"
   --scope project`.
4. Commit review artifact + plan update. Handoff: all-pass → slice
   complete, evidence current (say until which commit); else → next
   ready set after routed tasks.

## Rules

- Never trust a ledger row you haven't re-run or cross-checked.
- Review changes no code; it changes the plan (routed tasks) and the
  record.
- cannot-verify is a finding about the expectation, and expectations
  come from `plan` — feed it back.
- Severity honestly: blocker (fabricated evidence, broken contract,
  out-of-scope effect), major (expectation fails, traceability hole),
  minor/nit (polish).
- The verdict names the exact commits and re-run outputs it stands on —
  an auditor must be able to replay it.
