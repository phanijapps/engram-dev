# Research brief: martinfowler.com, "Understanding Spec-Driven-Development: Kiro, spec-kit, and Tessl"

Source: https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html
Author: Birgitta Böckeler. Date: 2025-10-15. Tool usage dated to 2025-09.
Fetched and read in full by a reviewer agent, 2026-10-09.

## Key facts

- Definition: SDD "means writing a 'spec' before writing code with AI
  ('documentation first'). The spec becomes the source of truth for
  the human and the AI."
- Three maturity levels: spec-first (spec deleted after the work),
  spec-anchored (spec kept and edited during evolution), spec-as-source
  (humans edit only the spec).
- Two-world split: the memory bank (constitution, steering,
  AGENTS.md; spans all sessions) versus the spec (one change).
- Workflows are phase-shaped: Kiro "Requirements -> Design -> Tasks";
  spec-kit "Constitution -> Specify -> Plan -> Tasks" (loop implied,
  never explained).
- Traceability mechanisms in the field: requirement-number
  backreferences (Kiro) and AI-interpreted checklists (spec-kit).
  Spec Kit ties a spec to a branch: a spec lives for a change request,
  not for a feature.

## The documented failure

- spec-kit checklists are "a 'definition of done' for each workflow
  step (though interpreted by AI, so there is no 100% guarantee that
  they will be respected)."
- Observed defect: research notes on existing code "just [taken] as a
  new specification and generated... all over again, creating
  duplicates." A state and traceability failure.

## What is absent

- No status vocabulary: the only state-like words are a Kiro UI label
  ("Task in progress") and a spec-kit screenshot checklist ("execution
  status"), both outside body text.
- No transition rules, exit criteria, or re-entry conditions. No
  cross-artifact state traceability. No enforcement model. Spec
  maintenance over time: "often it's left vague or totally open."

## Verdict (reviewer agent)

Field evidence that current tools run phase-shaped workflows while
leaving statuses implicit and enforcement to AI interpretation. Any
status model with machine-owned transitions and cross-artifact state
links would be new ground, and must survive non-deterministic
executors and small iterative work packages.
