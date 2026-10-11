---
name: roadmap
description: Create, revise, or audit an outcome-based product roadmap for a new or existing product. Use independently or with product context from new-project to prioritize initiatives, dependencies, learning, and capacity. Executable task plans belong to plan.
---

# Roadmap

Turn product intent into an evidence-grounded sequence of outcomes and initiatives.
Make tradeoffs visible: why this work, why this order, and what waits.
Work with an idea, product brief, existing repository, or prior roadmap.
The harness, a repository, and other skills are optional for standalone use.

## Establish context

Read the user's request and available artifacts before asking questions.
Locate the existing roadmap and documentation conventions before choosing a destination.
Use its format where practical; otherwise follow [the output contract](resources/output-contract.md).
Do not create a second backlog, task ledger, or roadmap with competing authority.
With no repository, produce the roadmap directly or save it at the requested destination.

Choose the mode: **create**, **revise**, or **audit**.
For a revision, read the current roadmap, decision history, and actual delivery evidence.
For an audit, report findings and proposed corrections without applying them.

Establish the audience, problem, desired outcomes, product stage, scope, constraints,
capacity, and planning horizon. Include existing commitments and dependencies.
Reuse context supplied by `new-project` through [the handoff guide](resources/new-project-handoff.md).
For an existing product, inspect relevant docs and source evidence.
Use `build-kb` if missing codebase knowledge prevents sound sequencing; avoid unrelated documentation work.

Label material claims as user-declared, observed, inferred, conflicting, or unknown.
Cite their source or identify the supplied conversation statement.
Do not infer product demand from implemented features or completion from a status label alone.
Do not treat a gap register as an approved backlog.

Ask only unresolved questions that change priority, scope, feasibility, or commitments.
Batch them and explain what each answer changes.
If answers are unavailable, produce a provisional roadmap with explicit assumptions.
Keep affected commitments conditional; preserve conflicting evidence instead of inventing a resolution.

## Shape and sequence the work

1. Connect each candidate initiative to an audience problem and product outcome.
   Define the smallest useful scope, exclusions, and an observable success signal.
   Preserve supplied targets; mark missing baselines and targets as unknown or proposed.
2. Compare value, urgency, evidence confidence, effort, risk, and dependencies.
   Explain the main tradeoff in plain words. Honor explicit owner priorities.
   Use quantitative scoring only when its inputs and scales have evidence.
   Do not manufacture reach, effort, revenue, or numerical precision.
3. Sequence prerequisites before dependent initiatives.
   Name the required output and its provider, including upstream services and downstream consumers.
   Distinguish hard dependencies from preferences; detect cycles and unresolved external commitments.
   Use a bounded experiment first when uncertainty could invalidate substantial work.
4. Fit the near-term slice to known capacity and existing obligations.
   Consider shared specialists, maintenance, and external lead times.
   If effort or capacity is unknown, give a conditional order and state what needs an estimate.
   Do not claim that the work fits or assign delivery dates without a basis.
5. Prefer **Now / Next / Later** when dates lack support.
   These express sequence and uncertainty; Now does not grant permission to implement.
   Record supplied deadlines separately from estimates and commitments.
   If a deadline is infeasible or unverified, show the scope or capacity tradeoff for owner decision.
6. Show what is deferred, excluded, or stopped and why.
   Give each near-term initiative an exit criterion and a review trigger.
   Keep distant work coarse; avoid designing the whole product upfront.

## Deliver and maintain

Produce a readable roadmap with stable initiative IDs, evidence, dependencies,
assumptions, and the next decision. Use the output contract for the required content.
Keep detail proportionate to the input and decision. For a small product, prefer
a compact sequence table and brief supporting notes. Expand only details that
change priority, feasibility, or the next action; avoid repeating context and guardrails.
Separate prioritization proposals from recorded owner decisions and delivery evidence.
Do not invent owners, acceptance, approval dates, or implementation permission.

On revision, keep IDs for the same initiatives and record the reason and evidence
for moves, scope changes, additions, or cancellations.
Preserve accepted baselines and completed records through a dated supplement or new revision.
Use an observed date for the revision; never reconstruct historical decisions or sessions.
Link canonical delivery records instead of duplicating task status.

End with the next useful action and its inputs.
For SDD delivery, pass the selected initiative to `analyze`, then `plan` after analysis.
Roadmap selection does not satisfy spec, design, start, or finish gates.
Creating a roadmap alone does not create specpacks, tasks, scaffolding, or owner actions.
If the user also requests those actions, follow the receiving skill and repository rules.

Check before return: outcomes are traceable, success signals are observable,
dependencies resolve or remain explicit blockers, and capacity claims have evidence.
Check that exclusions, uncertainty, revision history, and handoff are clear.
Disclose missing evidence that materially limits the recommendation.
