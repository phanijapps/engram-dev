# Analyze skill evaluation and enhancement proposal

Evaluation recorded on 2026-10-11 UTC, against repository HEAD
`ec337605f0aac3e6fde1225cd4842d88111c969e` and the working-tree skill bytes.
This is an independent evaluation report, not an executable specpack or owner
approval. The user selected **Evaluate first**. No skill, template, evaluation
case, installer, hook, runtime, or real specpack was changed for this evaluation.

**Verdict: revise before promoting the skill.** The independent red-foreman
review found **2 BLOCKER, 7 DEFECT, and 1 SMELL** in the current skill and its
supporting assets. The two blockers concern freshness evidence and preservation
of previous artifacts. Focused trials also exposed an unsafe registration
workaround and insufficient trace chronology. Green repository checks do not
resolve these skill defects.

The useful parts should remain: six distinct modes, bounded scope, questions
after evidence, explicit uncertainty, hypothesis-led bug investigation, bounded
spikes, and separate owner gates. A dirty-source bug trial used those parts well.
The main weakness is the operational contract between that reasoning and the
machine record.

## Evidence and evaluation limits

I inspected the authoritative [skill](../treadle/packages/cli/harness/skills/sdlc/analyze/SKILL.md),
all six templates, the nine existing case recipes, the rubric, CLI commands,
core persistence and workflow code, active manifest wiring, and historical
analysis/JSON packs. Two independent evaluators received the unchanged skill,
isolated product fixtures, a raw request, and the actual CLI entry point.
Expected answers were withheld. They could write fixture analysis records and
run local probes; they could not alter product inputs, perform owner actions,
commit, install, or contact external services.

The [evidence snapshot](analyze-skill-evaluation-evidence.json) retains source
hashes, actual CLI probe results, repository gate results, preservation checks,
and reviewer verdicts. Detailed local traces and fixture artifacts are under
`/tmp/analyze-eval-wmzn47n2`; those temporary paths are not durable records.

This was **not a full execution of the nine existing recipes**, a repeated
benchmark, or a cross-host UI test. Feature and bug were exercised naturally;
other integration risks were checked with deterministic probes and source
inspection. No numerical release score is justified: the current rubric's
authority prohibition conflicts with truthful observations, and the feature
trace cannot establish execution order.

## Findings

| ID  | Severity | Observed problem and consequence                                                                                                                                                                                                                                                                                                                                                            | Proposed correction                                                                                                                                                                                                                                              |
| --- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1  | BLOCKER  | Skill lines 51–57 tell the agent to reset fingerprints and stamp before reconciling source-dependent knowledge. A fixture source changed from limit `10` to `20`; the wiki still said `10`. Resetting the baseline changed stale/one anchor needing review into fresh/zero needing review without changing that page. Git HEAD also cannot pin staged, unstaged, or untracked source bytes. | Inspect anchors and cited sources before refreshing knowledge. Record HEAD plus relevant dirty-state evidence and observed file hashes. Use source evidence when knowledge conflicts; refresh through a bounded knowledge maintenance step after reconciliation. |
| A2  | BLOCKER  | Skill lines 45–47 instruct re-analysis to mark the old artifact superseded, which edits the artifact it promises to preserve. If that artifact is registered as a digest-bound spec document, the edit changes the plan digest. A disposable probe demonstrated the digest change.                                                                                                          | Put the supersession link and rationale in a new dated supplement or successor. Preserve prior bytes and closed packs. Changes to an active approved plan follow its owner workflow; do not silently repin documents.                                            |
| A3  | DEFECT   | Skill lines 58–59 omit the bundle argument from search/read. Both commands failed with exit 1. Gap template line 43 invokes retired `know code index`; it failed with unknown-command exit 1.                                                                                                                                                                                               | Provide current, complete commands in one operational reference; distinguish supported context retrieval from external indexing.                                                                                                                                 |
| A4  | DEFECT   | Skill line 107 gives incomplete question registration guidance. A valid question command without a held revision failed on a new 0.4 pack. A current revision succeeded; stale and duplicate writes were refused.                                                                                                                                                                           | Include pack directory, question ID/text, phase, and `--expected-revision`. Re-read after refusal; never retry by overwriting newer state.                                                                                                                       |
| A5  | DEFECT   | Skill lines 188–195 claim Pi and Claude enforce a hard gate on ambiguous continuation. Active Pi lifecycle handlers provide context. Active Claude wiring invokes the context handler, whose output supplies additional context. The compatibility `--claude-gate` branch is not the active manifest route.                                                                                 | State the actual enforcement boundary: lifecycle context guides selection, core commands enforce admission, and the agent must resolve an ambiguous continuation. An explicit new request does not become a request to resume an unrelated pack.                 |
| A6  | DEFECT   | Five templates omit mandatory Out-of-scope; bug/impact lack explicit assumptions. All six omit the required pack path/revision in their handoff. “Templates are contracts” therefore conflicts with the skill's own spine.                                                                                                                                                                  | Add a shared minimum across the six assets, with mode-specific detail only where needed. Require a concrete planning handoff with canonical path, held revision, artifact references and blockers.                                                               |
| A7  | DEFECT   | Skill lines 36–39 and 181–182, case `no-authority-claims`, and rubric gate 5 prohibit success/verified/permission claims indiscriminately. This forbids reporting actual probe outcomes or citing existing human receipts, and makes spike/bug findings difficult to state honestly.                                                                                                        | Prohibit granting authority and forecasting implementation success. Allow accurately sourced observed command results and existing receipts, clearly attributed. Keep proposals, local observations, independent review, and human consent distinct.             |
| A8  | DEFECT   | Skill lines 76–78 require machine registration but omit the field mapping and safe writer procedure. `do init` creates an empty shell that passes `do check` with zero violations and zero gaps. The feature evaluator populated raw JSON with a direct write before a later CLI mutation normalized it. Its valid final pack concealed an unsafe intermediate write.                       | Explain normalized versus on-disk fields and the supported writer path. Verify populated requirements and artifact references in addition to loader/alignment success. Record the write procedure, revision transition, and post-write checks.                   |
| A9  | DEFECT   | Rubric line 4 restricts evaluation to the artifact but asks it to prove grounding order, ask-once behavior, and pre-work spike declarations. The feature command log grouped shell and CLI records without sequence/time fields; its array order was not chronology. A polished artifact cannot prove those process properties.                                                             | Score content, execution trace, and filesystem/pack deltas separately. Preserve command order and actual results. Mark missing process evidence unestablished.                                                                                                   |
| A10 | SMELL    | Ordinary repository questions need no work record, but the routing table sends every mode artifact to `specs/<slug>/`. A prose-only directory appears as refused work in current lifecycle context.                                                                                                                                                                                         | Choose the destination by whether the request creates an initiative. For an ordinary answer, use chat or an explicitly requested report location without a new live pack directory.                                                                              |

Relevant runtime sources are [know commands](../treadle/packages/cli/src/commands/know.ts),
lines 30/57/145; [do commands](../treadle/packages/cli/src/commands/do.ts),
lines 50–72 and 483–533; [plan digest](../treadle/packages/core/src/specpack/workflow.ts),
lines 119–138; and the [manifest](../treadle/packages/cli/harness/harness.json),
lines 161–217. The [rubric](../treadle/packages/cli/harness/skills/sdlc/analyze/evals/rubric.md)
and [case recipes](../treadle/packages/cli/harness/skills/sdlc/analyze/evals/cases.json)
are part of the required revision, not merely the main Markdown file.

### Separate runtime finding

Lifecycle [context discovery](../treadle/packages/cli/src/harness/context.ts),
lines 19–26, refuses any live directory with more than one root JSON file.
The [core loader](../treadle/packages/core/src/specpack/loader.ts), lines 66–110,
prefers the canonical filename and can load the same directory with a JSON
snapshot beside it. A fixture reproduced core success and context refusal.
Refused entries also count toward `selectionRequired` in context lines 76–90.

This inconsistency is a runtime enhancement candidate. The skill can describe
how to verify the exact pack and report context errors, but should not instruct
agents to delete historical JSON, rename snapshots, or bypass admission. A
future runtime change should share canonical discovery rules while retaining
path containment, size limits and refusal behavior. That requires its own
analysis and approved plan; it was not implemented here.

## Focused behavioral trials

| Trial                   | Actual result                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Assessment                                                                                                                                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Small CSV feature       | Produced bounded feature/brief/spec documents, a 0.4 pack at revision 3, three candidate requirements, one proposed decision, no tasks or owner acts, and an empty spec-question ceremony. `do check` exited 0 with three expected unplanned gaps.                                                                                                                                                                                                            | Useful content and honest uncertainty. **Procedure failed:** raw JSON write bypassed the shared writer. **Process evidence incomplete:** consolidated log does not prove chronology. No overall PASS.                  |
| Dirty event payload bug | Wiki stamp reported fresh despite staged producer changes, an unstaged consumer change and an untracked consumer. Analysis pinned these states and hashes, reproduced the email regression (test exit 1), and ran a controlled hypothesis probe (exit 0). It preserved wiki/source bytes, used the locked core writer, and produced a revision 2 pack with two candidate requirements and no tasks or owner acts. `do check` exited 0 with two expected gaps. | Focused strengths: causal investigation, explicit source/wiki conflict, upstream/downstream effects, design questions deferred, readiness for planning only. This single trial does not establish general reliability. |

All 21 initial fixture input files matched their starting hashes after the runs.
The feature's inferred CSV header remained an explicit assumption; its missing
CLI entry point remained a source/design question. Neither warranted a fictional
human spec answer. No actual concurrent overwrite was observed; the unsafe
writer finding concerns the procedure and its failure window.

Independent red-foreman reran the feature's read-only pack check/status and
input/artifact verification successfully, then retained **FIX BEFORE COMMIT**
for the writer and chronology findings. The valid end state did not cure them.

## Historical contracts to preserve

These artifacts establish recorded behavior and constraints, not proof that
today's skill produced them or that all historical work is resolved.

| Artifact                                                                                    | Recorded lesson                                                                                                                                                                                     |
| ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Missing-specpack correction](documentation-consolidation/bug-missing-specpack.md)          | A prose handoff omitted machine state. The correction registered requirements, proposed decisions and task references. “Pi did it before” was not evidence of automatic registration.               |
| [Owner-gate analysis review](spec-completion-handoff/review.md) and its revision-4 snapshot | An ANALYSIS PASS was explicitly separate from PACK review and delivery. Five alignment gaps were expected before tasks existed. Analysis should not force task planning merely to obtain zero gaps. |
| [Completed owner-workflow pack](spec-completion-handoff/spec-completion-handoff.json)       | Questions, decisions, start consent, evidence, independent PACK review and finish are separate records. New analysis must neither manufacture these nor rewrite the frozen pack.                    |
| [Rename pack](wukong-rename/wukong-rename.json)                                             | A compact 0.4 initiative can have no required spec questions while still needing decisions, start permission and finish. Empty ceremony is useful, not an approval shortcut.                        |
| [Legacy harness pack](fresh-harness/fresh-harness.json)                                     | Existing 0.3 records retain their contract. They are historical evidence, not a template for silently adopting owner-gated policy.                                                                  |

## Proposed skill design

The following is a proposal for a later revision, not an installed policy.

1. **Resolve the request and its work context.** Determine the repository,
   selected initiative if any, mode, decision to unblock, and bounded output.
   Reuse roadmap/new-project context when supplied. Inspect existing brief,
   questions and history before interviewing. Ask for pack selection only when
   an actual continuation is ambiguous. Preserve legacy and closed records.
2. **Ground without destroying freshness evidence.** Record HEAD, relevant
   staged/unstaged/untracked inputs and file hashes. Read wiki health/status and
   affected anchors, then inspect cited code and documents. Distinguish absent,
   stale, conflicting and unbaselined knowledge. Missing wiki is a knowledge gap,
   not a reason to invent context or automatically index the entire repository.
3. **Analyze the affected boundary.** Connect product purpose and current versus
   proposed behavior to relevant components, upstream providers and downstream
   consumers. Where touched, identify REST interfaces, event producers/consumers,
   database entities and migrations, external services, authorization rules,
   compatibility and failure paths. Use evidence and explicit unknowns; do not
   require a complete architecture inventory for a local change. Delegate broad
   knowledge upkeep to build-kb with a named gap or affected surface.
4. **Use the mode's deciding evidence.** Feature/spec separates sourced needs
   from proposed requirements. Bug uses competing causal hypotheses and a
   deciding probe before repair suggestions. Spike declares its question,
   timebox and stop conditions before exploration. Impact names consumer and
   verification consequences. Gap names concrete closure paths. Record dated
   observations and supersession links without reconstructing session history.
5. **Classify uncertainty by who can resolve it.** Separate source gaps,
   experimental questions, assumptions, required human spec questions and later
   design decisions. State what each blocks, owner/path, and validation trigger.
   Use one batch of unresolved owner questions where possible; do not turn
   source investigation or a design choice into unnecessary spec ceremony.
6. **Register through the machine contract.** For an initiative, create/reuse the
   exact pack, attach analysis/brief/spec, populate candidate requirements, and
   register required questions/proposed decisions. Use the shared lock, core
   loader, held-revision check and core writer for fields without a CLI command.
   Check durability outcomes and reload after writing. Preserve existing tasks,
   receipts and unrelated fields; never use ordinary JSON writes as a fallback.
7. **Verify and hand off to planning.** Check loadability, populated machine
   fields, live artifact paths/hashes, question membership, current revision,
   alignment and discovery. Explain expected unplanned gaps. Include ready
   slices, blockers and the next skill input. New analysis authorizes no
   implementation. An already approved execution has its own unchanged admission
   requirements; analysis does not create a new shortcut to implement.

### Supporting assets

Keep the main skill short. Add one operational reference for tested commands,
read-only versus mutating operations, normalized/on-disk field mapping,
safe authoring, host context behavior, and verification. Use explicit bundle and
pack directory variables rather than assuming the shell is at the workspace root.

The tested forms include `know search <bundle> <query>`,
`know read <bundle> <cid>` and
`do add question <packDir> --id <id> --question <text> --phase spec --expected-revision <held>`.
`do status`, `do check` and `do where` are read-only; `do next` creates a task
handout and mutates state. A final green check alone is insufficient registration
evidence. Core authoring should use exported `withPackLock`, `loadPackWithMeta`
and `savePack`; copying internal raw JSON shapes is not a stable contract.

Give every mode template the same minimum: purpose/mode, source pins and evidence
status, explicit scope exclusions, assumptions and questions, mode findings,
proposed decisions where applicable, and handoff. Omit inapplicable detail with
a credible explanation instead of inventing content to fill headings. Link a
shared minimum rather than duplicating operational instructions six times.

## Evaluation changes needed before promotion

Retain the useful existing recipes, but correct freshness and authority
expectations. Materialize fixtures and evaluate three separate surfaces:

- **Content:** bounded claims, real citations, competing hypotheses, classified
  uncertainty, mode-specific outputs and planning readiness.
- **Trace:** monotonic command sequence, arguments/cwd, exit code and captured
  output, question events, predeclared spike limits, writer method and revision
  transitions. Do not expose expected answers to the executing evaluator.
- **Delta:** product inputs, prior artifacts and receipts preserved; intended
  artifacts/requirements actually registered; no unauthorized owner acts,
  implementation, baseline reset or installation.

Add regression cases for dirty TypeScript/Markdown despite a fresh HEAD stamp;
baseline reset hiding stale claims; immutable supersession and digest effects;
missing/stale revision and competing writers; empty-shell versus populated
handoff; current hook wiring and ambiguous continuation; ordinary report mode;
canonical JSON plus snapshots; missing wiki; and legacy/closed-pack preservation.
After a revision, run all nine corrected recipes plus these integration cases,
with an independent read-only review. Only then install authoritative changes
through the installer into the requested agent surfaces.

## Verification recorded in this pass

All six repository gates ran and exited 0: `pnpm check`, `pnpm coverage`,
`pnpm corpus:check`, `pnpm brand:check`, `pnpm audit:prod`, and `pnpm links`.
Check/coverage each reported 172 tests across 39 files. Coverage was 86.22%
statements/lines, 94.71% functions and 76.08% branches, above the required floors.
The skill's structural validator also exited 0; that does not prove behavior.

Read-only real-wiki checks exited 0: validation had zero errors and warnings;
anchors checked 153 references with zero needing review; status reported fresh.
Python-only fingerprints and HEAD-based stamping do not establish dirty
TypeScript/Markdown freshness. The real wiki was not rebaselined or restamped
during this evaluation.

Of 1,287 baseline workspace files, only the pre-existing untracked
`.codex/hooks.json` differed at the preservation check. Its changing content was
observed; the actor was not established. No evaluation command intentionally
edited it, and it was preserved. Authoritative/installed analyze files, runtime
sources, historical packs, other prior user edits and the wiki stamp matched
their baseline bytes. This report and its evidence snapshot are the intended
additions from this pass.

Independent red-foreman review of this report and retained evidence returned
**PASS — nothing to fix** after checking claims, hashes, probes, gate logs,
fixture preservation and the hook-file exception. That verdict covers the
accuracy of this evaluation report. The current skill retains **FIX BEFORE
COMMIT**.
