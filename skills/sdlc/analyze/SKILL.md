---
name: analyze
description: Analysis-stage skill of the SDD loop — turn a change request, defect, uncertainty, impact question, or knowledge gap into ONE bounded, evidence-grounded artifact before implementation. Grounds in the project wiki and memory (memex-core) before any question reaches the user; records open questions and assumptions as first-class outputs; hands off to plan/implement with explicit blockers. Six modes — feature brief, testable spec, bug hypothesis ledger, timeboxed spike, impact dispositions, gap register. Triggers are "analyze/spec this feature", "write the spec for X", "investigate this bug", "run a spike on X", "what breaks if we change X", "what are we missing here", "gap analysis". Not for building the knowledge base (build-kb), greenfield scaffolding (new-project), roadmaps (roadmap), task planning (plan), or writing code (implement).
---

# analyze — bounded analysis for spec-driven delivery

One skill, six modes, **one spine**. The modes differ in the artifact they
produce and the question they answer — never in discipline. Every mode
grounds in evidence first, stays bounded, preserves uncertainty, and hands
off explicitly. Analysis that tries to "complete" before any work begins is
waterfall with AI narration; this skill exists to prevent exactly that.

## 0. The anti-waterfall contract

These rules bind every mode. Violating any of them is a defect in the
analysis, not a style choice.

1. **Bounded artifact.** Produce the *smallest analysis that unblocks the
   next step*. An explicit Out-of-scope register is mandatory; an empty one
   must say why completeness is credible.
2. **Ground before you ask.** The repo, wiki, and memory answer most
   questions. Ask the user only what evidence cannot supply — once, batched,
   and recorded in the artifact as questions with owners and resolution
   paths. Never re-ask what is already recorded.
3. **Uncertainty is an output.** Open questions and assumptions are
   deliverables, not embarrassments. Every question states what it blocks
   and its resolution path; every assumption states its blast radius and
   validation trigger. Nothing is silently resolved by vibes.
4. **Evidence status on every load-bearing claim.** declared /
   implementation-supported / inferred / conflicting / unknown. Omit
   sections you cannot evidence; never invent content to fill a template.
5. **Propose, never authorize.** Analyses are data. They never mark
   anything accepted, verified, or successful. Normative claims ("new code
   must…") route through `memex-core findings propose`, never written as
   settled truth.
6. **Decisions are explicit and reversibility-tagged.** Record choice,
   alternatives, and two-way vs one-way door. Insufficient evidence means
   the question stays open — a DECISION is not manufactured to look done.
7. **Interleaving is the point.** Analysis hands off slice-shaped work:
   unblocked slices proceed while spikes and questions run. Nobody waits
   for a complete spec.
8. **Supersede, don't mutate.** A re-analysis is a new artifact that marks
   the old one `status: superseded`. Never silently rewrite a prior
   analysis to match new conclusions.

## 1. Ground before you ask (every mode, read-only first)

1. **Anchor:** `memex-core resolve` → project identity, wiki freshness,
   memory counts. Record `repo_head` — it pins every claim in the artifact.
2. **Freshness gate:** if wiki is `stale` and the analysis depends on code
   truth, run `memex-core wiki update` first. If you cannot update, pin all
   code claims as evidence-status `declared` against the stamped revision
   and say so — do not present stale extractions as current.
3. **Compile context:** `memex-core compile "<mode question>" --budget 4000`
   (plus one query per affected subsystem). Search results are pointers,
   not proof — open the cited files for anything load-bearing.
4. **Residual questions:** what evidence still cannot supply goes to the
   user in ONE batched round, straight into the artifact's question
   register.

## 2. Route the mode

| The ask is… | Mode | Artifact (under `docs/specs/<slug>/`) | Question it answers |
|---|---|---|---|
| "add / change a capability" — what & why | **feature** | `feature.md` | What should change, and why is that justified? |
| "make it a testable contract" | **spec** | `spec.md` | What exactly must be true, and how would we check? |
| "this is broken / reproducible" | **bug** | `bug-<short>.md` | Why does this fail? |
| "we don't know if X works / is right" | **spike** | `spike-<n>-<topic>.md` | What did the bounded investigation learn? |
| "what breaks if we change X" | **impact** | `impact-<change>.md` | Which effects need dispositions? |
| "what are we missing / why did context fail" | **gap** | `gap-<n>.md` | What don't we know, where might it live, how do we close it? |

Routing rules: one artifact per analysis, not per conversation. If a
feature analysis reveals shared-contract blast radius, the impact mode runs
as a *separate* artifact it links to — modes never blur into each other.
If mode is genuinely ambiguous, pick by the question column, state the
choice in the artifact header.

## 3. Mode playbooks

Each artifact is a copy of the matching `assets/*.tmpl.md`, filled
honestly — every template section either carries content or a stated
"none identified + why credible". Mode essentials:

- **feature** — problem + pinned current behavior + proposed behavior +
  affected surfaces (from wiki traversal, cite concept paths). Decide the
  handoff: needs spec? needs spike first? straight to plan? Record which
  questions block which part.
- **spec** — requirements only for in-scope slices, each testable
  (MUST/SHOULD) with acceptance criteria (given/when/then + method).
  Constraints separated into mandatory vs preference with sources. Never
  spec out-of-scope behavior "while we're here".
- **bug** — hypothesis ledger before any fix talk. Each hypothesis carries
  evidence-for / evidence-against and status (open / confirmed /
  eliminated). Root cause is written only from a confirmed hypothesis;
  otherwise the artifact ends at the ledger + what evidence would decide
  it. Verification plan is regression-test-first.
- **spike** — ONE decision-relevant question, timebox and kill conditions
  declared *before* work, method, findings (evidence-statused), outcome
  with confidence, follow-ups. Spike code is throwaway and marked so; a
  spike that "finishes the feature" has failed.
- **impact** — candidate effects table: surface → mechanism → confidence →
  disposition (retain / revise / replace / defer) → evidence. Every defer
  names its consequence. Verification obligations list which existing
  evidence is invalidated and must be re-established. Blocked work is
  named explicitly.
- **gap** — gap register: what we don't know × why it matters × where the
  answer might live × how to close (repo source / wiki update / human /
  experiment). Trigger context recorded (what failed — a compile miss, a
  review finding, a blocked task). Ends in a close plan, not a shrug.

## 4. Close: record, hand off

Every artifact ends with a **Handoff** block:

- **Ready now** — slices with no blocking unknowns (→ `plan` / `implement`).
- **Blocked on** — question IDs, spikes, decisions (each with owner/path).
- **Next step** — the single next skill invocation and its input.

Then:

1. `memex-core record --title "<slug>: <mode> analysis" --body "…found X,
   open questions Y — see docs/specs/<slug>/…" --scope project` — one
   durable memory so future sessions recall the analysis exists.
2. Normative claims discovered along the way → `memex-core findings
   propose --source <evidence> --destination wiki/<concept>.md --kind
   <kind> --rationale "…"`. Never written directly as settled truth.
3. Commit the artifact (with any wiki changes) — analysis travels with
   the repo.

## Rules

- The spine is not optional: no mode skips grounding, bounding, or handoff.
- Templates are contracts — sections carry content or a stated "none".
- Evidence statuses are mandatory on load-bearing claims; conflicts are
  recorded as `conflicting`, never averaged away.
- Artifacts never contain acceptance, success, timestamps-of-truth, or
  permission claims — those belong to authority, not analysis.
- Ask-once: a question already recorded in any artifact or finding is
  never asked again.
- A stale wiki is a warning label, not a blocker: pin, mark, and proceed
  honestly.
