# Research brief — codifying Spec, Design, Tasks, Review on the Harness schema

- **Status:** PLANNED — phases tracked as tasks in the spine
  (`docs/specs/spec-graph/sdd.json`).
- **Origin (owner, 2026-10-08):** "Harness schema is where I want to
  start. Codify Spec, Design, tasks, review so I can progressively load
  context as needed or spawn subagents. Treat Spec as a deterministic
  structure with clear demarcation — no loading the entire crap into
  context. It is JSON, so semantic algos back and forth: linked lists,
  doubly linked lists. The schema is a starting point. I want a well
  planned research."

## Goal

Turn the four SDD artifacts into schema-backed, traversable structure
so that context is **selected**, never dumped: a spec slice, a task's
frozen neighborhood, a review's evidence chain — each loadable within a
budget, each spawnable as a subagent brief, each verifiable by digest.

## Working hypothesis (to be tested, not assumed)

The Harness schema already anticipates this. Evidence:

- `context` def carries `budget`, `used_input_tokens`, `selections`,
  `omissions`, `outcome` — progressive loading with recorded omissions
  is designed in, not invented.
- `task_ref`/NodeRef everywhere — exact node + revision targeting.
- Four artifact families map onto existing kinds:

| Artifact | Content nodes | Runtime plane |
|---|---|---|
| Spec | GOAL, REQUIREMENT, ACCEPTANCE, CONSTRAINT, QUESTION, ASSUMPTION, SOURCE | node_states (validity), authority_records |
| Design | DESIGN, DECISION | authority_records (accepted), change_dispositions |
| Tasks | TASK | task_states, attempts, contexts |
| Review | VERIFICATION, review-request, verification-result | verification_results, change_dispositions |

- Doubly-linked navigation = two adjacency indexes over ONE relations
  array (forward: requires/implements/checks; backward: computed
  reverse map). Stored once, derived in memory — never written twice.

## Research questions

- **RQ1 — Codification.** What is the exact mapping of Spec/Design/
  Tasks/Review onto the schema's defs? Which defs are missing for the
  file plane, and where do loom-specific needs ride extensions vs new
  defs (the schema is "a starting point" — what is the disciplined way
  to extend it)?
- **RQ2 — Progressive loading.** How is a slice selected under a token
  budget, deterministically? What gets recorded (selections, omissions)
  so a loaded context is auditable (MGD's M_run = M applied to loading)?
- **RQ3 — Traversal algorithms.** Forward/backward adjacency,
  topological scheduling (loom L0 has it), impact analysis (change one
  requirement → every affected task/verification), diff between two
  revisions, cycle policy. Which structures: in-memory maps, a derived
  index sidecar with its own digest, or sharded files?
- **RQ4 — Subagent spawning.** How do the three surfaces accept a
  scoped brief? What is the minimal brief (subgraph render + budget +
  fence token + expected evidence path)? How do parallel workers on
  disjoint subgraphs avoid collisions (MGD's aggregate-parallelism
  lesson)?

## Method and sources

**Phase 1 — in-repo archaeology (primary, cheap, first).**
- `docs/product/Structured_Brief.md`, `Technical_Spec.md` (the context
  algorithm, readiness/scheduling, change impact, effect ledger — the
  owner's prior thinking IS the first primary source),
  `Lean_Control_Plane_Review.md` (8-op contract).
- okf's progressive read (`okf read --depth`) — a working progressive
  loader; extract its selection and depth rules.
- The three digested papers (MGD, EPIC, SpecAgent) — already in
  `docs/specs/sdd-research/analysis.md`.
- loom L0 code — what exists, what is ad-hoc.

**Phase 2 — external scan (2024–2026, bounded).**
Graph-based context selection (GraphRAG lineage), repo-map techniques
(aider), agent context strategies (Claude Code / Codex / Cursor),
structured tool feeds (MCP), specification slicing and program
dependence graphs, JSON graph representation practice (JSON:API,
hypermedia, JSON-LD framing) — for the doubly-linked index question.
Each source: what it does, what transfers, what does not.

**Phase 3 — synthesis.**
Produce: (a) the codification mapping (frozen table, schema diffs as
extension namespaces or proposed defs), (b) the file strategy decision
(one spine vs sharded per artifact + index sidecar), (c) the selection
algorithm spec with complexity + determinism argument, (d) the subagent
brief format (validated against all three surfaces).

**Phase 4 — decision + plan.**
Feed loom L1/L2 (or a new initiative) with a design doc and task DAG.
No code before this gate.

## Acceptance criteria

1. The mapping table (artifact → defs → runtime plane) is complete and
   every cell cites a def name or names the gap.
2. A selection algorithm spec exists with: determinism argument, budget
   accounting, omissions recording, complexity bounds.
3. A worked example: one requirement's full chain (spec → design →
   task → verification) loads as a slice ≤ a stated budget, from real
   files in this repo.
4. The subagent brief format round-trips: spawnable on pi, Claude,
   Codex; returns evidence locatable by the spine.
5. Every load-bearing claim carries an evidence status and a source.

## Out of scope

- Rewriting Harness.schema.json (immutable $id; extensions/proposals
  only).
- Building the loader/selector before Phase 4's gate.
- Server-plane machinery (tenants, operations, policies-as-services).

## Questions

| # | Question | Owner | Path |
|---|---|---|---|
| Q1 | File strategy: one spine per initiative vs sharded per artifact + digest-addressed index sidecar? | owner | Phase 3 |
| Q2 | Budget currency: tokens (which tokenizer) or structural units (nodes/depth)? Both? | owner | RQ2 |
| Q3 | Does the review artifact get its own node kinds, or is review purely runtime (verification_results + change_dispositions)? | owner | RQ1 |
