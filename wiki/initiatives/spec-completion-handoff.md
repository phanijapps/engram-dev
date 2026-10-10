---
title: "Owner decision gates and completion: analysis and proposed plan"
type: Initiative
description: "Observed execution before decision acceptance, recorded approval without closure, and owner-directed flow and a proposed implementation plan awaiting consent."
status: draft
created: 2026-10-10
updated: 2026-10-10
sources:
  - { id: analysis, resource: specs/spec-completion-handoff/bug-owner-gates.md }
  - { id: probe, resource: specs/spec-completion-handoff/probe.json }
  - {
      id: record,
      resource: specs/spec-completion-handoff/spec-completion-handoff.json,
    }
  - { id: readiness, resource: treadle/packages/core/src/specpack/next.ts }
  - { id: closure, resource: treadle/packages/core/src/specpack/close.ts }
---

# Observed failure and accountability

The owner challenged implementation before design decision approval. The agent
implemented the root migration's D-2 and D-3 while both remained proposed.
Reversibility did not replace the owner's decision authority.
Source: `specs/spec-completion-handoff/bug-owner-gates.md:1`.

A disposable-fixture probe confirms that proposed decisions do not gate task
handouts. The actual migration approval is recorded at revision 20, but 2
proposed decisions still block closure. Browser events expose approval without
decision resolution or final closure.
Source: `specs/spec-completion-handoff/probe.json:1`.

# Dated analysis and owner-directed plan

The analysis records candidate requirements and proposed correction options.
It implements no runtime fix, accepts no decision, and closes no prior pack.
The owner subsequently answered Q-1 with the required workflow. The concrete
brief, spec, design and seven-task plan now follow that answer. Four design
decisions remain proposed; all tasks are blocked until decision acceptance and
separate permission to start the exact plan.
Source: `specs/spec-completion-handoff/spec-completion-handoff.json:1`.

The proposed flow is requirement → brief → spec question gate → design decision
gate → tasks and start gate → approved implementation sequence → independent
review. A separate final owner closure is still a proposed decision.
Sources: `specs/spec-completion-handoff/owner-flow.md:1`;
`specs/spec-completion-handoff/design.md:1`; `specs/spec-completion-handoff/plan.md:1`.

Independent PLAN review passed. The exact proposed scope is captured separately;
Q-2 through Q-5 request decision consent and Q-6 requests permission to start
that scope. These are still pending owner acts. Planning verification confirms
an empty ready set, and is not implementation evidence or a PACK verdict.
Sources: `specs/spec-completion-handoff/plan-review.md:1`;
`specs/spec-completion-handoff/plan-scope.json:1`;
`specs/spec-completion-handoff/plan-verification.json:1`.

The owner asked for simpler questions. The current questions describe each
choice and its effect in plain language. The plan scope, original owner answer,
proposed decisions and blocked tasks remain unchanged.
Sources: `specs/spec-completion-handoff/spec-completion-handoff.json:1`;
`specs/spec-completion-handoff/question-wording-revision-6.json:1`.

Read [status rules](/domain/specpack-status-vocabulary.md),
[the affected migration](/initiatives/docs-root-migration.md), and
[open work](/project/open-work.md).
