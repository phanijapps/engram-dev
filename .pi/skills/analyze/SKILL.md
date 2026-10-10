---
name: analyze
description: Create bounded, evidence-grounded SDD analysis for a feature, spec, defect, spike, impact question, or knowledge gap. Register the initiative specpack before planning handoff; keep uncertainty explicit. Use for analyzing proposed or broken work, not implementation or review.
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

1. **Bounded artifact.** Produce the _smallest analysis that unblocks the
   next step_. An explicit Out-of-scope register is mandatory; an empty one
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
   must…") route through `know findings propose`, never written as
   settled truth.
6. **Decisions are explicit and reversibility-tagged.** Record choice,
   alternatives, and two-way vs one-way door. Insufficient evidence means
   the question stays open — a DECISION is not manufactured to look done.
7. **Bounded planning.** Analysis can prepare ready slices while unknowns remain.
   Implementation waits for the owner gates of the current plan.
8. **Supersede, don't mutate.** A re-analysis is a new artifact that marks
   the old one `status: superseded`. Never silently rewrite a prior
   analysis to match new conclusions.

## 1. Ground before you ask (every mode, read-only first)

1. **Anchor:** `know validate wiki` (health) and the freshness check —
   compare `wiki/.okf/last-index.json` `repo_head` to `git rev-parse HEAD`.
   Record `repo_head` — it pins every claim in the artifact.
2. **Freshness gate:** if wiki is `stale` and the analysis depends on code
   truth, run refresh fingerprints + stamp (code indexing is delegated — anchors stay honest). If you cannot update, pin all
   code claims as evidence-status `declared` against the stamped revision
   and say so — do not present stale extractions as current.
3. **Compile context:** `know search "<mode question>"` then
   `know read <cid>` (plus one query per affected subsystem).
   Search results are pointers, not proof — open the cited files for
   anything load-bearing.
4. **Residual questions:** what evidence still cannot supply goes to the
   user in ONE batched round, straight into the artifact's question
   register.

## 2. Route the mode

### Register the initiative

For an SDD initiative that will hand off to planning or implementation, create
`specs/<slug>/<slug>.json` with `do init <packDir> --owner-gated --title "…" --why "…"`
if it does not exist. Load and reuse an existing active pack. A completed pack
is frozen; a new change needs a new initiative. Ordinary repository questions
do not require creating work records.

The JSON pack is the machine work record; the mode's Markdown artifact supplies
its reasoning. Reference that artifact in the pack. Carry candidate requirements,
questions, and proposed decisions into the pack before the planning handoff.
New initiatives use root `specs`. Locate existing records with `do where` and
reuse their reported path; never create the same initiative in both roots.
Creation does not authorize implementation, accept decisions, or approve the spec.
Use the installed harness CLI or the documented direct CLI invocation.
Never invent human approval or closure fields.

| The ask is…                                  | Mode        | Artifact (under `specs/<slug>/`) | Question it answers                                          |
| -------------------------------------------- | ----------- | -------------------------------- | ------------------------------------------------------------ |
| "add / change a capability" — what & why     | **feature** | `feature.md`                     | What should change, and why is that justified?               |
| "make it a testable contract"                | **spec**    | `spec.md`                        | What exactly must be true, and how would we check?           |
| "this is broken / reproducible"              | **bug**     | `bug-<short>.md`                 | Why does this fail?                                          |
| "we don't know if X works / is right"        | **spike**   | `spike-<n>-<topic>.md`           | What did the bounded investigation learn?                    |
| "what breaks if we change X"                 | **impact**  | `impact-<change>.md`             | Which effects need dispositions?                             |
| "what are we missing / why did context fail" | **gap**     | `gap-<n>.md`                     | What don't we know, where might it live, how do we close it? |

Routing rules: one artifact per analysis, not per conversation. If a
feature analysis reveals shared-contract blast radius, the impact mode runs
as a _separate_ artifact it links to — modes never blur into each other.
If mode is genuinely ambiguous, pick by the question column, state the
choice in the artifact header.

## Owner handoff

Write a brief before planning. State the requirement, purpose, scope and open questions.
Use the writer skill for documents and owner questions.
The spec states the intended behavior and observable checks.

Ask only questions that the repository and wiki cannot answer.
Register required spec questions with `do add question --phase spec`.
Design choices belong to the later decision review, not this question ceremony.
Keep `workflow.phase_questions.spec` empty when no spec questions are needed.
Do not ask the owner to approve an empty question ceremony.
When questions exist, open `do interview <packDir>` or the spec library.
The owner answers and then approves those spec questions.
Record the actual answer and approval; silence and defaults are not consent.
Pass the brief, spec, question state and pack revision to plan.

New packs use specpack/0.4. Existing legacy packs keep their legacy contract.
Do not silently adopt them or invent earlier start permission.
Adoption needs a concrete owner-approved migration and preserves the original JSON.

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
  declared _before_ work, method, findings (evidence-statused), outcome
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

Include the pack path and revision in a planning handoff. A prose-only
initiative is not a machine handoff.

Then:

1. Note the milestone in the initiative folder and commit — the git
   history is the durable record (project memory is back-burnered;
   knowledge-engine decision D5).
2. Normative claims discovered along the way → `know findings propose
wiki <evidence> wiki/<concept>.md <kind> --rationale "…"`.
   Never written directly as settled truth.
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

## The ask-first rule (the hard gate's human contract)

When the session opens with a recall block showing MORE THAN ONE spec
in flight, and the user says "continue" (or go on / resume / pick up),
you do not choose. You list the open specs and ask which one. The
recall block is the source of truth (`do where <workspace>`); never
memory. On pi and Claude Code a hard gate enforces this; on you it is
discipline — the same rule either way.
