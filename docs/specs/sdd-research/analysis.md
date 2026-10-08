# SDD research digest — three papers

- **Date:** 2026-10-08
- **Mode:** research digest (read → extract → map to our loop)
- **Status:** complete
- **Sources:** arXiv 2610.01372 (PDF), 2610.07534v1 (HTML), 2610.05132v1 (HTML). Full text cached at `/tmp/sdd-papers/` on the session machine; key claims cited by paper section below.

## Purpose

Arm the loop redesign. The harness's purpose is ratified: a packagable
harness that fast-tracks graph engineering without the waterfall trap
(`golden-path-8481ab73`, accepted). These three papers describe, from
three directions, what a specification-driven loop must contain. This
digest extracts their concepts and maps them onto our five-skill loop
and the okf engine.

## Out of scope

- Implementing any proposal from §6. Proposals become a separate
  initiative with its own analysis → plan.
- Re-deriving the papers' formal apparatus (MGD's misfit calculus,
  SpecAgent's completeness probe math). We cite, we do not reproduce.
- Tool choices (verifiers, model vendors).

---

## 1. Misfit-Governed Development (arXiv 2610.01372)

Chen & Cheng, October 2026. A design theory for AI-assisted
development, derived from Christopher Alexander's theory of form.

### Problem

Generated code cannot be assumed correct. Reviews, tests, and static
analysis still apply, but which measures make a verification harness
*sufficient*? The paper derives the answer from one kernel theory
instead of assembling ad hoc techniques.

### Core concepts

**Fit is negative.** Alexander: good fit between a form (the software)
and its context (the demands on it) can never be seen directly. Only
misfits — specific, enumerable failures — can be seen. So fit = the
absence of every misfit in an explicit enumeration. The central
engineering question is the completeness of that enumeration, never the
capability of the generator.

**The non-native vernacular builder.** The LLM is a builder trained in
many traditions, native to none. It has a *bias current*: a persistent
pull toward mainstream idiom. Context can shift behavior but cannot
prove the learned defaults are gone. Hence three obligations:
*enforced tradition* (gates, not prose), *manufactured manifestation*
(detectors where misfits do not reveal themselves), *severed backflow*
(the builder may never amend the tradition).

**Law versus harness.** The law is every representation with normative
authority: specifications, the pattern language, the misfit list. The
harness is every mechanism that renders a verdict: gates, fix loops,
reconciliation checks. A gate's *rule* belongs to the law; its
*checker* belongs to the harness.

**Four-form pattern language.** Each pattern exists only when it has
all four coupled forms: doctrine (when and why), template (positive
skeleton), prohibition (banned and required constructs), gate
(deterministic checker with fixtures proving it fires and invocation
evidence proving it is reached). A pattern with a missing form "does
not exist."

**The dual loop and S = P = T = W.** The inner loop is machine-paced:
the specification is provisionally correct, a failed verdict blames the
candidate, repair retries automatically. The outer loop is human-paced:
it judges S = W — whether the specification fits the world — and it
alone may amend the law and the harness. Machines check three families
of relations (spec=program, spec=tests, tests pass). Humans own the
fourth. Machines may remind, gather, and record; they may never
substitute the judgment.

**The fix loop** (five properties): batch violations; anchor repair in
the violated pattern (re-read it before fixing); re-run prior gates
every round (regression guarding); halt and escalate after three rounds
without progress (stall valve); freeze the context for the window
(specification and framework pinned; the law cannot change mid-window).

**Primary versus proxy.** A primary context holds a demand's authority
(compiler, runtime, human ruling). A proxy restates it (specs, pattern
documents, rule catalogs). Proxies drift silently → the *false-green*
condition: all checks green, form still wrong. Remedy: reconciliation
checks against the primary where possible; one designated original per
rule, restatements linked and re-checked at session start; retired
doctrine hunted by a scanner ("deletion happens once; forgetting must
be enforced continuously").

**The permanent novice.** Observed compliance never proves
internalization. Gates never retire on statistical grounds. A gate
that cannot run counts as *skipped*, never *passed* (M_run = M).

**Every escape is answered exactly two ways:** extend or correct the
enumeration (new or fixed gate), or an explicit ruling that places the
failure class outside the enumeration and names the mechanism that
covers it. Quietly fixing the defect and moving on is not permitted.

### Evidence (declared by authors; single case)

One Scrum system (DDD, Clean Architecture, event sourcing, CQRS).
64 problem-frame specifications, ≈40,000 lines of YAML generating
≈24,000 lines of code. ≈1,300 generated tests × 2 infrastructure
profiles. 28 blocking gates, 188 deterministic-review rules. Repeated
rebuilds from empty directories. Three observations: boundary escapes
between locally-correct artifacts; proxy *and detector* drift;
prompt-carried rules violated repeatedly while the corresponding gates
caught the violations.

### Limits (declared)

One project, one architecture, one legislator. Feasibility shown, not
portability. S = T is the least-verified leg: a test can assert the
wrong business rule and pass. The frontend/backend HTTP contract had
two proxies of one truth with no blocking detector across them.

### Relevance to us

- Our findings ledger **is** the legislative circuit (model drafts,
  human approves, declined keys never re-proposed).
- Our fingerprints + anchors **are** proxy reconciliation for wiki
  pages anchored to code.
- Our evidence-gated statuses and "never claim a check you did not
  run" **are** M_run = M.
- Our bounded-artifact, piecemeal-growth rule **is** Alexander's
  one-at-a-time correction; the analysis skill already forbids
  complete-up-front specs.

---

## 2. The EPIC framework (arXiv 2610.07534)

Claudino, Xing, Zuo, Menezes, Sarma, Damevski, Feng. October 2026.
An empirical study of what good SDD artifacts contain.

### Problem

Templates show where information belongs, not whether the artifact says
enough. Agents fill gaps with their own assumptions — "making a
decision even if I don't" (practitioner P10). The specification is the
one artifact a developer can review before any code exists.

### Method (grounds the claims)

Quality lens from ISO/IEC/IEEE 29148 plus 9 SDD-tool guides → 10
dimensions. 850 candidate GitHub repos → 114 with real SDD artifacts,
scored 0–3 per dimension (inter-rater κw ≈ 0.8). Exemplar artifacts
(5675 coded segments) → 40 practices. 30 grey-literature sources
checked for misses — added none. 15 practitioners rated all 40.

### The framework: 4 categories × 10 dimensions × 40 practices

**E — Expressive** (the agent must know what is required and how work
is checked):
- **E1 Unambiguous** — unresolved decisions get a visible marker
  (`[NEEDS CLARIFICATION]`); settled decisions get measurable bounds
  ("within 5 seconds for networks up to 500 devices"); normative
  wording (MUST / MUST NOT, not *should*); explicit exclusions.
- **E2 Singular** — one capability, property, or constraint per
  statement; details of the same capability stay together; risks,
  edge cases, definitions, scenarios, and security properties each get
  their own entries.
- **E3 Verifiable** — a measurable target, the command that checks it,
  the scenarios checks must cover, and the condition called
  "verification complete."

**P — Precise** (the agent must know the conditions and the scope):
- **P1 Dependency control** — declare assumptions and dependencies;
  state constraints and scope boundaries; link them to the affected
  tasks; say how dependencies are verified and what happens on failure.
- **P2 Completeness** — cover functional and exceptional behavior;
  record technical/operational/quality constraints; plan delivery;
  **track unresolved items** so open decisions stay visible.

**I — Interpretable** (the agent must see how artifacts fit together):
- **I1 Conformance** — standard structures, stable unique identifiers,
  declared template/schema conventions.
- **I2 Consistency** — shared terminology, uniform notation, identical
  names for the same thing across spec/plan/tasks, same section
  organization.
- **I3 Comprehensibility** — purpose-ordered sections, cross-document
  links, one-line orientation ("This is a prompt flow editor, not a
  chat app").

**C — Compartmentalized** (the agent must separate product from
project):
- **C1 Scope discipline** — the specification states required behavior
  from the user's perspective; design decisions, stacks, and task
  lists live in plan/task artifacts; genuine interface constraints may
  stay in the spec.
- **C2 Implementation-planning information** — technical context, what
  each task produces, typed data structures and interface contracts,
  requirement-to-task traceability.

### Evidence

Observational, hypothesis-generating (top vs bottom spec-quality
third): bug-fix commits 11.8% vs 20.4% (−42%); code complexity −15%;
vulnerability density roughly half; median contributors 12.5 vs 3.

### Practitioner findings we should bank

- Teams write **"must" not "should"** — agents treat *should* as
  optional.
- "The checks that you mechanize and make blockers on your process are
  the ones that actually get followed" (P7).
- Measurable outcomes are what let an agent **stop the harness loop**
  ("if it doesn't know it's done, it's impossible for it to stop").
- Completion conditions + a "go / no-go signal" counter agents that
  declare done while work remains.
- One dissenting practitioner trusted agents on consistency
  ("in the AI world, it doesn't matter") — the authors explain this as
  automation-trust calibration, and the violation evidence elsewhere
  contradicts it.

### Relevance to us

EPIC is a ready-made **review checklist** for our analyze and plan
artifacts. Our recorded questions ≈ `[NEEDS CLARIFICATION]`; our
observable verification expectations ≈ E3; our
requirements-vs-design separation ≈ C1. The association evidence
justifies spending effort on artifact quality.

---

## 3. SpecAgent (arXiv 2610.05132)

October 2026. Agentic synthesis of formal ACSL specifications for
verifying real-world C programs with Frama-C/WP.

### Problem

Existing spec synthesis is **forward-only** (a finished spec is never
revisited) with **localized repair** (fix only at the reported failure
site). But specs depend on specs: a weak upstream postcondition causes
cascading downstream verification failures. Repair loops then patch the
failure site forever while the root cause sits upstream.

### The workflow (four stages + two gates)

1. **Planning agent** — from a *deterministic* program context
   (signatures, caller/callee relations, loop positions), it outputs a
   natural-language plan: spec targets, intended semantics,
   dependencies, processing order. Spec-level reasoning is separated
   from annotation writing.
2. **Generation agent** — retrieval-augmented from a knowledge base of
   184 verified ACSL examples. Examples carry 32-bit **structural
   fingerprints**; retrieval = coarse filter (loop structure, return
   type) then Jaccard similarity, top 3 into the prompt. The agent is
   **constrained to specification-level edits only** — it may never
   touch the implementation.
3. **Verification gate** — Frama-C/WP wraps every candidate. Verdicts
   become a **structured JSON report**; failures are mapped back to
   source with caller/callee/line provenance. "Provenance-aware repair
   evidence."
4. **Repairing agent** — diagnoses the root cause and may **revisit
   upstream specifications** when the evidence points there. Iterates
   until the gate passes or the invocation budget runs out.
5. **Quality gate + critique agent** — proof success is not strength:
   weak or vacuous specs verify easily. The critique returns one of
   three verdicts: **ACCEPT** (done), **IMPROVE** (local weakness →
   regenerate), **REPLAN** (structural, interprocedural weakness →
   restart from planning). A static **Postcondition Completeness
   Probe** (over-approximation analysis) gives the critique stable
   evidence instead of pure LLM opinion.

### Evidence

96.82% precision / 88.95% recall on 50 programs from 14 real repos
(DeepSeek-V4), beating all baselines including Codex with GPT-5.6.
Discharged 604 of 811 real verification targets (best baseline: 523).

### Relevance to us

- **Root-cause rule:** a failure's cause may live upstream of the
  failure site. Our loop must trace across the artifact chain
  (analysis → design → task → code → test), not patch where it hurts.
- **ACCEPT / IMPROVE / REPLAN** is a clean verdict taxonomy for our
  review skill: local fix task / regenerate a design slice / re-open
  the analysis.
- **Strength critique:** a test or task that passes but constrains
  nothing is a defect (same gap as MGD's S = T weakness).
- **Verified-example knowledge base with structural retrieval:** our
  wiki + scanner + search already form this; the papers validate the
  design and suggest retrieval by structural similarity.
- **Scope jail:** the repairer edits one artifact class, never the
  neighboring one — our implement skill already freezes context the
  same way.

---

## 4. Cross-paper synthesis

### Convergences (independent lines, same conclusion)

1. **Distrust the generator, trust the stack.** MGD: enforcement over
   guidance. EPIC: agents fill gaps with assumptions. SpecAgent: the
   repairer may not touch code.
2. **Artifacts are the control surface.** EPIC defines what good
   artifacts contain; MGD defines how artifacts govern; SpecAgent
   shows artifact weakness propagating through dependency chains.
3. **Determinism where decidable; structure everywhere.** Gates,
   linters, verifiers render verdicts; structured reports feed repair;
   LLM judgment stays advisory or is checked by static probes.
4. **Human authority is non-delegable for the world-judgment.** MGD's
   S = W; EPIC's "making a decision even if I don't"; SpecAgent's
   REPLAN escalation to planning.
5. **Loop state must persist.** Amendment records (MGD), unresolved
   item tracking (EPIC P2.5), revisitable spec sets (SpecAgent). A
   loop with no memory re-makes the same decisions.

### Tensions (and our resolution)

- **Who owns the spec?** MGD: humans own it; the builder may not amend.
  SpecAgent: the agent authors and revises specs. Resolution: different
  authority directions — SpecAgent specs verify *fixed* code; MGD specs
  generate *new* code. In our harness the spec's authority stays human
  (the ledger); agents propose.
- **How much process, how early?** EPIC practitioners neutral on early
  delivery planning ("you just want to run it right now"); MGD carries
  heavy machinery from day one. Resolution: the MGD economics argument
  itself — artifacts regenerated endlessly need machinery; artifacts
  produced once can afford human-priced validation. Adopt machinery
  per artifact class as reuse grows (EPIC: "adopt practices as a
  project grows").
- **Heaviness.** MGD's harness is enormous (28 gates, ≈130,000 lines of
  gate scripts for one system). Our loop must stay lean; adopt the
  *obligations*, not the *mechanism sizes* — the paper itself says
  obligations are fixed, mechanisms are choices.

## 5. What our loop already has (mapped)

| Research concept | Our asset today |
|---|---|
| Legislative circuit (severed backflow) | findings ledger: propose → human accepts; declined keys refuse re-proposals |
| Proxy reconciliation | fingerprints + `okf anchors`; stamp freshness |
| M_run = M (skipped ≠ passed) | "never claim a check you did not run"; evidence-gated statuses |
| Piecemeal growth | bounded artifacts; smallest-next analysis; no up-front specs |
| Verifiable requirements (E3) | observable verification expectations on every task |
| Recorded unresolved decisions | questions with owners; assumptions with blast radius |
| Scope jail | implement skill's frozen context, one task at a time |
| Verified-example knowledge base | wiki concepts with anchors, verified events, scanner, search |
| Spec-only repair constraints | review is read-only; fixes become routed tasks |

## 6. Proposals for the loop redesign (not yet built)

Each needs its own initiative before implementation. Ordered by
expected leverage.

1. **P-1 — Make checks first-class and unrunnable-is-fail.** Every task
   in a plan names its check and its command. A check that cannot run
   is FAIL, never PASS. (MGD M_run = M; EPIC E3; already half-true in
   our implement skill — make it structural.)
2. **P-2 — Adopt EPIC as the artifact review checklist.** analyze and
   plan templates gain the EPIC dimension names; the review skill
   scores artifacts against them. `[NEEDS CLARIFICATION]` becomes a
   standard inline marker that maps to recorded questions.
3. **P-3 — Adopt ACCEPT / IMPROVE / REPLAN as review verdict routing.**
   Local fix → task; design-slice weakness → regenerate that slice;
   structural weakness → re-open the analysis. Plus the root-cause
   rule: a task whose fix fails twice escalates upstream, with the
   failure chain named.
4. **P-4 — Four-form wiki patterns.** Our Pattern pages gain
   *prohibition* (the banned idiom) and *gate* (the okf command that
   detects violation) sections alongside doctrine and examples. Then a
   wiki pattern is checkable, not just readable.
5. **P-5 — Retrieval for implement.** When implementing a task, retrieve
   the wiki's verified patterns by structural similarity to the task's
   target files (scanner kinds + search), mirroring SpecAgent's
   knowledge-base retrieval.

## 7. Questions

| # | Question | Owner | Path |
|---|---|---|---|
| Q1 | Do we adopt proposals P-1..P-5 for the loop, and in what order? | owner | this digest → loop-redesign initiative |
| Q2 | Should the harness's own wiki patterns gain prohibition+gate sections (P-4) before or with the loop redesign? | owner | P-4 |

## 8. Assumptions

| # | Assumption | Blast radius if wrong |
|---|---|---|
| A1 | The three papers are representative of current SDD research directions (2026); no fourth major line is missed. | The synthesis under-covers; the loop design inherits the gap. Mitigation: this digest stays open for additions. |
| A2 | arXiv preprints are citable evidence at `declared` status for concepts, `unknown` for unreplicated results. | Claims may weaken on peer review; the digest marks observational results as hypothesis-generating already. |
