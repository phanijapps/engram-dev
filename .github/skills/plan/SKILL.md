---
name: plan
description: Turn SDD analysis into a technical design, Mermaid views where useful, a populated JSON specpack, and a verified task DAG. Register requirements, decisions, dependencies, checks, and context before owner start permission. Use for planning an analyzed change or revising a proposal, not investigation or execution.
---

When repository knowledge is needed for this step, use the installed `search-kb` skill for read-only OKF retrieval and source checks.
If that skill is unavailable, use the existing wiki/source procedure below. Retrieval does not grant task admission or owner permission.

# Plan an analyzed change

Produce `design.md` and `plan.md` under `specs/<slug>/`, at a depth suited to the change.
The design explains contracts, choices, failure behavior, and useful visual views.
The plan explains delivery slices and their checks. The canonical JSON pack owns executable state.
Approved artifacts stay unchanged. Progress belongs in `execution-log.md` and recorded task evidence.

CLI examples use `do` and `know`. Prefix them with the installed harness executable.
Check its help and current core exports before authoring machine fields.

## 1. Read the analysis and current state

Read the initiative's requirement, brief, analysis Handoff, impact evidence, and canonical pack.
Use only Ready-now slices unless the user explicitly widens the proposal.
Keep blocked slices in a follow-up register with their actual Q, A, or D IDs and unblock actions.
Do not invent answers or executable tasks for unresolved behavior.

An ambiguous request to resume requires a selected spec. An explicit bounded request supplies its own scope.
Use `do where <workspace>` and the exact core loader to confirm discovery and pack identity.
Lifecycle context can refuse directories with extra root JSON files; preserve those files and disclose the discrepancy.

If nontrivial work has no analysis, route to `analyze` before design.
A trivial local change may use a micro-plan with a mini-design and an explicit reason for skipping analysis.
That exception does not skip machine registration or applicable owner gates.
Keep legacy formats under their existing contract. Never silently adopt an active pack or modify a closed pack.

Ground choices in the affected wiki concepts and cited source files.
Run relevant `know search` and `know read` commands, then inspect load-bearing source directly.
Check freshness, and report its actual limits. In this harness, HEAD freshness does not prove dirty TypeScript or Markdown freshness.
If there is no wiki, use source evidence and state that limit.
A new behavior question or missing impact analysis returns to `analyze`; a local design clarification can stay here.
Batch questions that evidence cannot answer. Never reopen settled behavior merely to fill a template.

## 2. Choose the design depth

| Evidence about the change                                                        | Output                                           |
| -------------------------------------------------------------------------------- | ------------------------------------------------ |
| Shared contracts, storage migration, multiple systems, or material failure risks | Full `design.md` and `plan.md`                   |
| One subsystem with bounded interfaces                                            | Compact `design.md` and `plan.md`                |
| Confirmed local defect                                                           | Mini-design within `plan.md`                     |
| Trivial local change                                                             | Micro-plan with mini-design and usually one task |

State the depth and rationale. Multiple tasks alone do not require a full architecture document.
For revisions, inspect existing approvals, receipts, evidence, and artifact hashes before changing any proposal.
Preserve bound artifacts and record a dated successor for owner review when agreed work changes.

## 3. Design contracts and explain the change

Use [the design template](assets/design.tmpl.md) for full or compact designs.
Describe the selected approach, real alternatives, affected surfaces, and compatibility behavior.
Specify interface and data changes before implementation mechanisms.
Include relevant failure cases, retries, authorization boundaries, migration, rollout, and rollback behavior.
Link each claim to observed evidence or mark it as proposed, inferred, conflicting, or unknown.
Keep exclusions and unresolved assumptions explicit.

Continue the analysis's decision IDs. Each proposed decision states its alternatives, rationale, consequences, and reversibility.
Every proposed design decision needs owner acceptance, including reversible choices.
Use `requires_decisions` on tasks that depend on those choices. Do not manufacture an acceptance actor or timestamp.

### Select useful Mermaid views

Read [diagram guidance](resources/diagrams.md) when a visual explains architecture, behavior, or task dependencies.
Choose diagrams by the question they answer, rather than adding every diagram type.

- Use C4 context or container views for system boundaries and upstream or downstream dependencies.
- Use a process flowchart for branches, validation, gates, failure paths, or recovery.
- Use a sequence diagram when message order, sync or async calls, events, retries, or persistence matters.
- Use a task dependency flowchart for a branching or nontrivial delivery DAG.

Put architecture and behavior views beside the relevant design text.
Put delivery DAGs in `plan.md`. A mini-design can hold a local behavior view.
Distinguish current behavior from the proposed design. Label IDs, boundaries, protocols, and important failure paths.
Each view needs a caption, its question, trace IDs, and evidence or uncertainty notes.
Retain a plain-text explanation for readers without Mermaid support.
For a small change with no useful visual, state the omission reason once.
Validate syntax using an available renderer or parser. Record its version and result, or disclose unavailable validation.
Parser success does not establish semantic correctness or visual readability.
Do not add product dependencies or a renderer feature to complete a planning document.

## 4. Register the complete machine plan

Read [machine operations](resources/operations.md) before pack mutation.
Use `do init <slug> --owner-gated` for new packs, not the legacy default.
Register requirements and acceptance criteria, design elements, proposed decisions, artifact references, and tasks.
Keep exact prose-to-canonical ID mappings when older analysis uses different IDs.

Use [the plan template](assets/plan.tmpl.md) for the readable proposal.
Each task needs a bounded outcome, real prerequisites, requirement links, decision dependencies,
a declared verification command and expected observation, allowed file changes, and sufficient context.
Prefer a coherent slice that a reviewer can verify independently.
`needs` expresses task prerequisites; `implements` references DES IDs; `satisfies` references FR IDs.
Question IDs and decision IDs are not task prerequisite IDs.
Register blocked future scope as follow-ups, rather than placeholder tasks with invented checks.

Separate source files the task may change from advisory reference files.
Use canonical `context.touch`, `read`, `wiki`, `links`, `notes`, and `commands` fields as needed.
Put a knowledge query in context commands or notes when useful; do not invent a required compile API.
Touch paths resolve from the Git root containing the pack. Artifact paths resolve from the pack directory.
The machine pins touch files at handout time; read and wiki entries are advisory.
Do not describe every context entry as hash-frozen.

Walk the dependency graph in topological order. Reject cycles, self-prerequisites, missing IDs, and redundant ordering without an output dependency.
Trace each planned requirement through a design element or direct task link to an observable check.
Inspect coverage gaps even when alignment succeeds. Explain deferred requirements outside this slice.
Register useful load-bearing diagrams through the supported DG artifact references; inline Mermaid alone is explanatory Markdown.

Run `do check`, `do status`, and `do where` for the exact pack.
Check the actual tasks, dependencies, verification fields, context, and referenced artifact bytes after reload.
When the matching schema is available, validate canonical JSON against it; alignment alone is not full schema validation.
Do not call `do next` to preview a proposal: it admits work and can pin files or advance task state.
Derive a clearly labeled structural entry set from the proposed DAG.
Report the separate machine workflow gate; an entry task is not permission to execute.

## 5. Present decisions and hand off

Use the writer guidance when available. Explain choices and consequences in plain words.
Show the brief, spec, design, and complete task plan in the spec library.
Keep decisions proposed until actual owner actions accept them.
Decision acceptance and permission to start are distinct acts.
The separate Start implementation action binds the exact plan digest.
Do not issue owner commands or click approval controls on the owner's behalf.
One start receipt covers the approved sequence; do not request permission again for each task.

Return the pack path, held revision, registered artifacts, chosen depth, structural entry set,
current machine gate, follow-ups, and actual validation outcomes.
Before start permission, the next action is owner review, not `implement`.
After a valid receipt, `implement` obtains the admitted task and context through the machine handout.
Keep observed progress in `execution-log.md` and canonical evidence. Do not maintain a second task ledger in the plan.
A changed requirement, decision, dependency, check, scope, or bound artifact needs owner review and renewed start permission.
Preserve prior receipts and artifacts. Do not repin approved work silently.

Commit planning artifacts when the user or repository workflow authorizes it.
Submit normative discoveries through the findings ledger; pending proposals are not accepted rules.
Planning does not mark tasks done, run implementation, grant owner consent, or complete a spec.
