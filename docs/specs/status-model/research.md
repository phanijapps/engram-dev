# Research: the status model and the entity levels

Owner question, 2026-10-09: "Pack -> Task -> Decision -> what is this?"
The vocabulary page lists six "families" in one table. The owner could
not read it. This research asks what the model should be. It changes
no code.

Sources: two briefs in this folder, fetched and read in full by
reviewer agents on 2026-10-09. Microsoft Developer Blog: "From
Spec-First to Enterprise-Ready: Extending GitHub Spec Kit" (Apoorv
Gupta, 2026-10-07). martinfowler.com: "Understanding
Spec-Driven-Development: Kiro, spec-kit, and Tessl" (Birgitta
Böckeler, 2025-10-15).

## 1. What the field says

**The artifact chain.** The Microsoft article names one chain:
"project principles and feature specifications to plans, tasks, code,
and tests." It never says what contains what. Plans and tasks get no
definition. Checklists get one sentence.

**The field has no status vocabulary.** Neither article names a status
for any spec, plan, or task. The Microsoft article defers "the
built-in lifecycle" to a prior text and never lists it. The only state
machinery it names is workflow `pause` and `resume` at a human
checkpoint. The Fowler article finds statuses only in a UI label
("Task in progress") and a screenshot checklist ("execution status").
Both are decorations, not models.

**The field has levels, not states.** Fowler names three maturity
levels: spec-first (spec written, then deleted), spec-anchored (spec
kept and edited during evolution), spec-as-source (humans edit only
specs). Fowler splits the world in two: the memory bank (constitution,
steering, AGENTS.md; context that spans all sessions) and the spec
(context for one change). Spec Kit ties a spec to a branch, so a spec
lives for a change request, not for a feature. The Microsoft article
adds governance by layered precedence: organization baseline, domain
overlay, team customization. Precedence, not state machines.

**The field's honest failure.** Fowler documents the failure mode:
checklists are "interpreted by AI, so there is no 100% guarantee that
they will be respected." The observed defect: research notes taken as
new specs, code generated "all over again, creating duplicates." That
is a state and traceability failure. No tool in the field models state
transitions or cross-artifact state links.

## 2. Devil's advocate: what our model gets wrong

Attack our own table, line by line.

**The category error is real.** The page lists Pack, Task, Decision,
Question, Verdict, Handout as six parallel "families". They are not
the same kind of thing. The Pack is a container. Tasks, Decisions, and
Questions are node kinds inside the pack's graph. A Verdict is a
record attached to review activity. A Handout is not an entity at all:
it is output that lives for one command run. One table flattened an
ontology into a list. The owner's reaction was the correct review
finding. The word "family" is internal code jargon (`_families()` in
`specpack.py`) that leaked onto a contract page.

**Three success words look like drift.** `done` on a task, `DONE` from
`loom next`, `complete` on a pack. The page explains none of the
layering. The defense: task `done` is an observed fact (evidence
exists); pack `complete` is an owner verdict (frozen); the handout
statuses are transient reports. The defense holds only if the page
separates the layers. It did not.

**The bridge to the field is missing.** A reader with Spec Kit priors
sees "spec, plan, tasks" as three artifacts. We merged them into one
file with three sections. That merge is a deliberate divergence: one
JSON, one schema, one loop. But the page never says this. Our wiki is
the memory bank (Fowler's constitution seat). Our pack is the spec.
The page never says that either. A reader must guess.

**What the field says we lack.** Spec Kit's branch-per-spec implies a
spec outlives nothing: a change ends, the spec dies. Fowler calls the
kept-spec alternative "spec-anchored". We are spec-anchored in effect
(complete packs are frozen reference), but we have no `supersedes`
link between packs. Evolution opens a new pack that points at nothing.
The chain of custody breaks at exactly the point the field says
matters most over time.

**Devil's advocate against this research too.** Is this one complaint
being over-rotated into a project? In part, yes: the machine is sound
and the failure is a page. But the page is a contract, the owner could
not read it, and the field evidence says the model underneath it was
never articulated. One honest pass at the ontology is cheaper than
forever explaining a bad table.

## 3. What survives the attack

1. Machine-owned states. Every stored status moves only through loom
   commands. The field's AI-interpreted checklists fail exactly here.
   Fowler's evidence is our justification. Keep.
2. One small state machine per stored entity kind. Pack, task,
   decision, question: each has few states and one owner. Keep.
3. Reports are not entities. Handout statuses are transient. They
   belong in a CLI contract, not in a data model. Move, keep the
   distinction loud.
4. The guard: schema enums, code constants, documented table, one
   test. Keep, extend to the new tables.

## 4. The model to propose (for the pack, not for today)

Three tables, not one:

| Table | Answers | Rows |
|---|---|---|
| Entity kinds | What exists; what contains what | pack, node kinds (US, FR, CON, Q, D, DES, T, DG), evidence, verdict |
| State machines | Which kinds have states; who moves them | pack, task, decision, question |
| Reports | What the machine prints, transient | handout statuses |

Plus one bridge table to the field's words (memory bank, spec, plan,
tasks, constitution), and one open question the owner must answer:
should packs carry a `supersedes` link, making the spec-anchored
chain of custody explicit?

## 5. Handoff

The specpack in this folder codifies this research as spec, plan, and
tasks. No task is started. Decisions stay proposed: the owner reads,
then accepts or rejects. The frozen `status-vocabulary` pack is the
reference this initiative would supersede.
