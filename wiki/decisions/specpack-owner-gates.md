---
title: "Contract change: owner gates in specpack 0.4"
type: Decision
description: "Accepted versioned owner gates, separate start and finish acts, and preserved legacy contracts."
status: stable
created: 2026-10-10
updated: 2026-10-10
decided_by: human:owner
sources:
  - {id: consent, resource: specs/spec-completion-handoff/bootstrap-authorization.json}
  - {id: design, resource: specs/spec-completion-handoff/design.md}
  - {id: runtime, resource: treadle/packages/core/src/specpack/workflow.ts}
---

# Decision and authority

The owner accepted D-1 through D-4 and separately gave permission to start Plan 1.
The actual answers preserve the owner, date and agreed scope.
Source: `specs/spec-completion-handoff/bootstrap-authorization.json:1`.

Format 0.4 adds a whole-plan decision barrier and per-task decision links.
Spec question approval, decision acceptance, start permission and final completion
are separate acts. Start permission binds the current plan digest.
The owner finishes the spec after task checks and current independent review.
Sources: `specs/spec-completion-handoff/design.md:1`;
`treadle/packages/core/src/specpack/workflow.ts:1`.

# Alternatives

Scoped-only decision gates could start an unrelated slice sooner.
They conflict with the owner's requested whole-plan barrier.
Automatic closure would hide the owner's final completion action.
Reusing spec approval for start would combine two different decisions.
Extending format 0.3 would let older engines ignore the new owner fields.
Source: `specs/spec-completion-handoff/design.md:1`.

# Consequences

New SDD work opts into format 0.4. Older engines refuse it.
Formats 0.2 and 0.3 retain their original behavior and golden bytes.
An active legacy pack needs explicit adoption and a preserved original snapshot.
A closed pack remains frozen.
Sources: `treadle/packages/core/src/specpack/loader.ts:1`;
`treadle/packages/cli/src/commands/do.ts:1`.

The corpus adds six owner phase cases with twelve new golden outputs.
The original 78 golden outputs remain unchanged.
The separate 0.4 schema preserves the original schema.
Sources: `treadle/conformance/generators/gen_corpus.ts:1`;
`specs/spec-completion-handoff/T-6-contract-verification.json:1`.

Read [the implemented owner workflow](/systems/owner-workflow.md).
