# Roadmap output contract

Use this contract when no established roadmap format exists.
Adapt the layout to the product and request. Keep the following information
findable without forcing every field into one wide table.
Treat these fields as information to convey, not a requirement for separate
sections or repeated per-initiative essays. A small roadmap can fit in a table
with short notes and one focused handoff.

## Context and authority

State the product, audience, problem, outcome, planning horizon, and scope.
Record the artifact's observed revision date and whether it is a proposal or an
owner-approved baseline supported by a real decision record.
List the source artifacts and their revisions where available.
Record constraints, existing commitments, available capacity, and exclusions.
Distinguish an owner-assigned role from a proposed owner or an unassigned role.

An objective can have several initiatives. Separate the product outcome from
an implementation output. For example, faster first use is an outcome; an
onboarding screen is one possible output. Do not invent a numeric target to
make an outcome look measurable.

## Sequence and initiative detail

A compact sequence table can use these columns:

| Initiative ID | Horizon | Audience outcome | Smallest useful scope | Why this order | Dependencies | Confidence |
| ------------- | ------- | ---------------- | --------------------- | -------------- | ------------ | ---------- |

Use stable IDs such as RM-1. Add short detail blocks only where needed:

- Success signal, measurement method, baseline, and target. Mark unknowns.
- Exit criterion: what evidence permits continuation, expansion, or stopping.
- Evidence for value and feasibility; assumptions and how to test them.
- Effort range and estimate source, or unknown. Identify shared capacity conflicts.
- Hard dependencies: initiative ID or external provider, required output,
  availability evidence, and consequence if delayed. Name affected consumers.
- Risk, compatibility constraints, exclusions, and scope tradeoffs.
- Proposed or assigned accountable role; leave unassigned when evidence is absent.

For a learning initiative, give one decision question, a bounded method,
a proposed or supplied timebox, and a result that would change the roadmap.
Timeboxes proposed by the agent remain proposals, not delivery commitments.

Define Now, Next, and Later for this roadmap. Where capacity is unverified,
label Now as a candidate near-term slice with explicit conditions.
If dates are useful, label each as a supplied deadline, estimate, or recorded
commitment and give its basis. Never convert a desired date into a promise.

## Decisions, deferrals, and review

Give rejected or deferred candidates a reason and a reconsideration trigger.
An explicit out-of-scope request remains excluded until the user changes it.
List open questions with the affected initiative, impact, and resolution path.
Separate proposals from actual owner decisions with source references.

Set a review trigger that suits the product: new customer evidence, experiment
results, a dependency change, delivery evidence, capacity changes, or a supplied cadence.
A recommended cadence does not create an automation.

For revisions, show old placement or scope, new placement or scope, reason,
evidence, and effect on dependent initiatives. Retain the prior accepted artifact.
Summarize only observed delivery outcomes and link the delivery authority.
Do not build a parallel task status table.

## Handoff

Identify the selected or proposed next initiative by ID. Include its problem,
outcome, evidence, scope, exclusions, dependencies, open questions, and success signal.
State the next action and what blocks it. If no initiative was selected by the
user, offer a recommendation as a proposal without claiming selection or approval.

In an SDD repository, the next action is usually initiative analysis.
The roadmap supplies product priorities; the canonical specpack supplies
executable state, decisions, task evidence, and owner gates.
