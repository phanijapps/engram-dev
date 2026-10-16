---
name: analyze
description: Create bounded, evidence-grounded analysis of a feature, spec, defect, spike, impact question, or knowledge gap. Register initiative requirements and artifacts before planning handoff. Use for investigation and proposed work, not implementation or independent review.
---

When repository knowledge is needed for this step, use the installed `search-kb` skill for read-only OKF retrieval and source checks.
If that skill is unavailable, use the existing wiki/source procedure below. Retrieval does not grant task admission or owner permission.

# Analyze

Produce the smallest analysis that resolves the next decision or enables planning.
Keep uncertainty explicit. An analysis proposes work; it grants no owner authority.

## Resolve the request

Read the request, repository instructions, relevant knowledge, and existing work records.
Reuse product context from `new-project` or `roadmap` when supplied.
Distinguish current behavior, historical observations, proposed behavior, and unknowns.
Do not turn an ordinary repository question into an executable initiative.

For initiative work, locate the canonical pack with `do where <workspace> --json`.
Reuse its exact path and held revision. Create a new gated pack only when needed.
Preserve legacy formats and closed records. Never silently adopt or reopen them.

If an ambiguous continuation has multiple open initiatives, ask which one to continue.
An explicit new request does not require selection of an unrelated open initiative.
Treat hook context as orientation. Verify refused or outdated entries through current commands.
Lifecycle hooks supply context; core commands enforce admission. Candidates are not admitted tasks.
Read [operations](resources/operations.md) before pack mutations or a machine handoff.

## Ground before questions

1. Record the repository HEAD and relevant staged, unstaged, and untracked inputs.
   Pin cited dirty files with observed hashes. HEAD alone does not identify their bytes.
2. If knowledge exists, check health, status, and affected anchors before refreshing anything.
   Use `know search <bundle> <query>` and `know read <bundle> <cid>` to locate context.
   Open cited source files and related documents for load-bearing claims.
3. Record stale, conflicting, absent, or unbaselined knowledge explicitly.
   Current freshness uses HEAD and Python fingerprints. It does not establish dirty TypeScript or Markdown freshness.
   Do not reset fingerprints or stamp to make an analysis appear current.
   Use direct source evidence when knowledge is incomplete. Delegate bounded knowledge maintenance to `build-kb` when needed.
4. Ask only what the evidence cannot resolve. Batch residual owner questions where possible.
   Reuse recorded answers. New evidence that invalidates an answer needs an explicit follow-up, not silent reuse.

For affected boundaries, inspect the relevant product purpose, components, and dependency direction.
Where touched, identify API operations, event producers and consumers, database entities, migrations,
external providers, authorization rules, compatibility constraints, and failure paths.
Record upstream assumptions and downstream consequences with evidence.
Keep the investigation proportional to the change. A local change does not need a complete repository inventory.

## Choose a mode

| Question                                | Mode    | Initiative artifact    | Deciding output                                               |
| --------------------------------------- | ------- | ---------------------- | ------------------------------------------------------------- |
| What capability should change, and why? | feature | `feature.md`           | Sourced problem, current behavior, proposed outcome and scope |
| What exactly must be true?              | spec    | `spec.md`              | Candidate requirements and observable checks                  |
| Why does this fail?                     | bug     | `bug-<short>.md`       | Causal hypotheses and deciding evidence                       |
| Can this approach answer a decision?    | spike   | `spike-<n>-<topic>.md` | A bounded experiment and qualified outcome                    |
| What breaks if this changes?            | impact  | `impact-<change>.md`   | Effects, dispositions and verification consequences           |
| What knowledge is missing?              | gap     | `gap-<n>.md`           | Gaps and concrete resolution paths                            |

Use the matching `assets/*.tmpl.md`. For gap mode use `assets/gapanalysis.tmpl.md`.
Adapt the template to the evidence; state why an empty mandatory register is credible.
For an initiative, store artifacts under its existing pack directory.
For an ordinary question, answer in chat or the requested report location.
Do not create a prose-only directory under live `specs` for an ordinary answer.

A mode answers one primary question. Link a separate impact or spike artifact when it adds useful evidence.
Do not generate every mode automatically. Shared-contract consequences can remain a concise table for a small change.

- **Feature:** connect the problem to the product outcome and affected boundaries.
  Separate sourced needs from proposed behavior. Name the next analysis or planning step.
- **Spec:** write testable requirements for the bounded slice.
  Give each criterion a verification method. Separate mandatory constraints from preferences and cite their sources.
- **Bug:** record causal hypotheses before suggesting repairs.
  Keep evidence for and against each hypothesis. State root cause only when deciding evidence confirms it.
  An unresolved ledger is a valid result. Propose a regression test tied to the observed failure.
- **Spike:** record one decision-relevant question, timebox, stop conditions, and method before exploration.
  Reading a supplied probe is grounding; running it is an experiment and needs the declaration first.
  Record the observed start and elapsed time. Do not invent or backdate them.
  Mark probe code as throwaway. Stop when the question resolves or the timebox expires.
  State confidence and limits. An inconclusive result names the evidence still needed.
- **Impact:** trace providers and consumers through code and contracts.
  Give each effect a disposition: retain, revise, replace, or defer.
  A defer names its consequence and due point. Identify prior checks that need renewed evidence.
- **Gap:** state what is unknown, why it matters, and where the answer might exist.
  Map each gap to a source read, knowledge update, experiment, or residual owner question.
  Preserve grounded areas instead of repeating the entire investigation.

## Shared artifact contract

Every artifact contains:

- Purpose, mode, relevant source pins, knowledge limits, and explicit Out-of-scope.
- Evidence status on load-bearing claims: `declared`, `implementation-supported`, `inferred`, `conflicting`, or `unknown`.
- Questions with what they block, owner, and resolution path.
  Classify them as source, experiment, human spec, or design questions.
- Assumptions with blast radius and validation trigger.
- Mode findings, proposed choices where needed, and a concrete handoff.

Report actual commands, exits, and observations separately from planned checks.
A failed assertion does not establish the proposition it asserts.
Distinguish expected falsification from probe errors. Either conclusion needs captured deciding evidence.
Bind observed claims to commands or sources in the current workspace.
Do not copy another case's results into its check report.
A local probe can establish a local fact; it does not establish production success.
Cite existing accepted decisions or human receipts without granting new authority.
Never invent an answer, identity, acceptance, permission, review verdict, or consent timestamp.
Candidate feature requirements belong in the initiative.
Record a proposed decision's alternatives, evidence, reversibility, and blocked slices.
If evidence cannot support a choice, keep it open.
Repository-wide normative discoveries use findings proposals; pending proposals are not accepted rules.

## Register and hand off

When session context tells you to arm `do wait` (a host that wakes on background command exit), do so after handing off an owner gate. The exit is a notification only; run `do status` and obey the gate.

For an initiative, write a brief and a candidate spec before planning.
Use the writer skill when available. Preserve technical meaning if style guidance conflicts.

Register the artifacts, candidate requirements, required spec questions, and proposed decisions in the pack.
Use the procedure in [operations](resources/operations.md); an empty initialized pack is insufficient.
Required human spec questions enter `workflow.phase_questions.spec` through the question command.
Source gaps, experiments, and later design choices do not justify fictional human spec questions.
An empty spec-question list skips that ceremony, not decisions or start permission.
When required questions exist, the owner supplies actual answers and separate spec approval.

Verify the machine record and artifact references before handoff.
Explain expected alignment gaps when requirements have no planned tasks yet.
Analysis readiness means readiness for planning. Implementation still requires the current plan's owner gates.

End with:

- **Pack:** canonical path, held revision, format, and question state; or why no initiative is needed.
- **Artifacts and requirements:** concrete references and registered candidate IDs.
- **Ready for planning:** bounded slices and evidence that supports them.
- **Blocked on:** unresolved IDs, affected slices, owners, and resolution paths.
- **Next step:** one next action or skill invocation with its inputs.
- **Checks and limits:** actual outcomes, expected gaps, and unrun checks.

## Preserve the record

Re-analysis creates a new dated supplement or successor with a link to the prior artifact.
Record what changed and why. Preserve the old artifact's bytes, including its status.
Approved documents can participate in the plan digest. Do not repin or mutate them to bypass review.
Changes to an approved plan need owner review and new start permission.
Do not reconstruct past sessions from commits or task state.

Keep a reviewable repository artifact when requested. Commit according to repository instructions and user scope.
Do not automatically commit unrelated changes or publish anything.
For skill evaluation, read [the evaluation protocol](evals/rubric.md); recipes are not completed runs.
