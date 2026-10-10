---
title: "Owner decision gates and completion: approved implementation"
type: Initiative
description: "Observed execution before decision acceptance, recorded approval without closure, and the approved versioned implementation and owner completion handoff."
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

# Approved implementation

The owner accepted D-1 through D-4 and separately authorized Plan 1.
The actual browser answers and dates remain preserved.
The start receipt binds the approved scope and keeps the original owner date.
Sources: `specs/spec-completion-handoff/interview.jsonl:1`;
`specs/spec-completion-handoff/bootstrap-authorization.json:1`.

The implementation adds the versioned engine gates, command-line actions,
browser admission and UI, and aligned SDD skills.
Task evidence resides in the canonical JSON. Progress resides in execution-log.md.
Approved brief, spec, design and plan artifacts remain unchanged.
Sources: `specs/spec-completion-handoff/execution-log.md:1`;
`specs/spec-completion-handoff/spec-completion-handoff.json:1`.

The dated analysis, plan review and planning checks remain historical evidence.
Their original pending state is not the current execution state.
This repair does not infer completion of an earlier initiative.
The owner later completed the earlier migration through its separate library action.
No past-session retrospective was reconstructed.
Sources: `specs/spec-completion-handoff/plan-review.md:1`;
`specs/spec-completion-handoff/plan-verification.json:1`;
`specs/spec-completion-handoff/design.md:1`.

The new flow is documented in [owner workflow](/systems/owner-workflow.md).
Read [status rules](/domain/specpack-status-vocabulary.md),
[the affected migration](/initiatives/docs-root-migration.md), and
[open work](/project/open-work.md).


# Delivery review and owner handoff

All 7 approved tasks now have passing evidence.
The independent delivery review passed with no findings after the first review repairs.
The report records the real reviewer, source revision and digest checks.
Source: `specs/spec-completion-handoff/delivery-review.md:1`.

At revision 40, the canonical pack awaits the owner's separate Finish spec action.
The engine does not infer final consent from task completion or review.
The canonical pack records any later owner action.
Sources: `specs/spec-completion-handoff/T-7-verification.log:1`;
`specs/spec-completion-handoff/spec-completion-handoff.json:1`.

The current-session [retrospective](/retrospectives/2026-10-10-owner-gates.md)
records the observed failure, repair, review and remaining completion step.
