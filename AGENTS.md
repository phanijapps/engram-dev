# Graph Engineering (memex_beta)

An agent harness for spec-driven development that ships on any coding agent — pi, Claude Code, Codex, Cursor, Kiro — packaged with Microsoft APM.

**The problem we solve:** Spec-driven development is a pain because specs arrive without context, and agents replace missing context with repetitive questions that annoy the user. **The fix is shift-left:** build a rich context layer from code and docs first, then help the user frame briefs that teams or agents can directly convert to shippable products.

**How it works:** The harness is built around a **versioned solution graph** — one logical package connecting PRD sources, goals, requirements, acceptance criteria, constraints, questions, assumptions, decisions, design, tasks, and verification. Deterministic software owns persistence, context compilation, scheduling, permissions, and evidence checks. Model reasoning supplies proposals and implementation work — never authority. Two components carry the strategy:

1. **Context layer (shift-left).** The `build-repo-knowledge` skill extracts evidence-backed knowledge from repositories (taxonomy, ontology, reproducible knowledge graphs, searchable wikis) so agents start with grounding instead of questions.
2. **Delivery loop (graph engineering).** The Versioned Solution Graph Harness compiles per-task frozen context, schedules work deterministically over the prerequisite DAG, tracks change impact, and admits only observed verification evidence.

This repository currently holds the **proposed build contract** (brief, spec, executable schemas, reference skill package). It is not yet an implemented production harness.

---

## Repository Map

| Path | Contents |
|---|---|
| `AGENTS.md` | This file — orientation for any coding agent working here |
| `docs/product/Structured_Brief.md` | The decision brief: problem, desired behavior, scope, architecture, skills to author, milestones M0–M5, evaluation/stop criteria |
| `docs/product/Merger_Brief.md` | Draft merger brief: memex (memory layer) + Graph Engineering → context engine with knowledge wiki; flaws→fixes map, tensions, sequencing, open decisions |
| `docs/product/Repo_Knowledge_Skill.md` | Draft v2 design combining build-repo-knowledge (spine) with adapt-to-project's bindingness ladder, normative tier, findings ledger, and safety rails |
| `docs/product/Engine_Conformance_Strategy.md` | Strategy transforming `engine/` into the knowledge-first context engine: store split, domain additions, pipeline/compiler services, index evolution, UI reorientation, APM packaging, workstreams WS1–WS6 |
| `docs/product/Technical_Spec.md` | Normative spec: identity/revisions, node/relation semantics, persistence model, API contracts, readiness/scheduling, context algorithm, change impact, effect ledger, verification, acceptance backlog C01–C20 |
| `docs/product/Harness.schema.json` | Derived single-file bundle embedding all 18 schema resources (JSON Schema Draft 2020-12); validates unified packages |
| `docs/product/build-repo-knowledge.zip` | Reference APM skill package for the repository-knowledge context layer (see Packaging) |
| `engine/` | **The one-engine umbrella** — all code lives here now. `engine/memex/` = memory plane (absorbed phanijapps/memex v0.5.0), `engine/okf/` = knowledge plane (absorbed phanijapps/okf-kit), `engine/core/` = **memex-core, the one-engine seed and CLI front face** (see below). Docs written before 2026-10-07 say `engine/`, `kit/`, `core/` — map them to `engine/memex/`, `engine/okf/`, `engine/core/`. History: `git log memex/engine-line`, `git log okfkit/main` |
| `engine/okf/` | **Knowledge-plane codebase** — full source from `phanijapps/okf-kit@main`: OKF bundle machinery (parse/model/links/index/search/validate/context), tree-sitter code→concept indexer with managed human sections, web graph UI, MCP, agent skills. OKF 0.1beta today → 0.2 per `Kit_Wiki_Engine_Plan.md`. Browse with `git log okfkit/main` |
| `docs/product/OKF_SPEC_v0.2.md` | Vendored frozen reference copy of the OKF v0.2 spec (Apache-2.0, source: GoogleCloudPlatform/knowledge-catalog) — the canonical concept format for project wikis |
| `docs/product/Engine_Conformance_Strategy.md` | Strategy for the merged product: memory plane (`engine/`) + knowledge plane (`kit/`), in-repo OKF-bundle wiki, domain extensions, UI reorientation, workstreams WS1–WS6 |
| `docs/product/Kit_Wiki_Engine_Plan.md` | okf-kit 0.1beta→0.2 upgrade table (U1) + wiki-engine improvements U2–U6 (fingerprints, findings, bindingness, typed relations, context compiler, federation) |
| `docs/product/Lean_Control_Plane_Review.md` | Subagent code-review synthesis: the 8-op control-plane contract, dispositioned findings, phased lean-down P1–P4 awaiting owner approval, invariants, decisions requested |

Planned layout (per the brief's deliverable boundaries): `schemas/` (modular source schemas), `examples/` (synthetic fixtures incl. unified package + registered extension), `tools/` and `tests/` (reference checker, adversarial contract tests), `skills/` (the skill suite). When those directories land, update this map.

## Build Instructions

The engine (Plane 1) is now live at `engine/`; the harness planes (2–3) are still contract-only. Until that code lands:

- **Core (the one-engine seed and CLI front face):** `cd engine/core && uv sync --extra dev`; `uv run memex-core --help` (resolve · wiki · search · compile · record · findings · status); tests `uv run pytest`. New control-plane work lands HERE, not in engine/memex/ or engine/okf/.
- **Planes:** `engine/memex` (memory CLI `memex` — hook/capture surface + plane internals) and `engine/okf` (bundle plumbing CLI `okf` — validate/serve/read). Agents and skills target `memex-core`; the plane CLIs are plumbing during the migration.

- Treat `docs/product/Technical_Spec.md` and the 18 schemas as the source of truth. Do not edit spec semantics casually; changes are compatibility events (see Guidelines).
- Validation tooling: JSON Schema Draft 2020-12 with **format checking explicitly enabled** (e.g. python-jsonschema — format keywords are informational by default). `common.schema.json` and `api.schema.json` are definition libraries; validate concrete documents or named definitions, never those library roots. Schema refs resolve through a frozen local registry, never by fetching a URI.
- Production stack decided by the brief: modular service + isolated workers; PostgreSQL (normalized identities/references + JSONB content) as initial authoritative store; object storage for artifacts; a durable orchestrator (Temporal is a candidate, not a requirement). Implementation language is not yet pinned — decide at M0.
- Follow the implementation order from the spec: (1) adopt schemas/namespace + tenant/policy identity, (2) safe parser + offline registry + immutable storage + optimistic transactions + outbox, (3) authority processing + import policy + impact candidates + projections, (4) context compiler + real tokenizer + artifact ingest, (5) readiness + worker dispatch + verification through existing CI, (6) durable orchestration + fencing + budgets + cancellation, (7) author skill packages, (8) multi-worker/multi-repo only after the isolated pilot.

## Guidelines

**Context before questions (the product thesis).** Never substitute user interrogation for missing context. Ground every artifact in evidence extracted from code and docs; ask only for what evidence cannot supply. Questions the harness does ask must be recorded as `QUESTION` nodes with resolution paths — not repeated ad hoc in chat.

**Deterministic core, model edges.** The runtime (not a model) owns the state machine, leases, authorization, canonicalization, and success declarations. Skills and models propose; configured authority accepts. A model output is data, never permission.

**Key contracts to honor in any code you write here:**

- Stable identities (`node_id`) are distinct from immutable integer `revision`s. Exact `NodeRef`s only — no implicit latest-version references in accepted relations, contexts, or evidence.
- `node_states` / `task_states` / `relation_heads` are runtime projections; they never appear in model-proposable node content. Proposals are atomic, carry `expected_package_revision`, and cannot set acceptance, actors, timestamps, execution success, or permissions.
- Imported JSON is untrusted: it enters as a draft proposal; its authority and success claims are never adopted. Same for skill results — validate against the declared schema, then bind provenance to the recorded invocation.
- Node kinds: SOURCE, GOAL, METRIC, REQUIREMENT, ACCEPTANCE, CONSTRAINT, QUESTION, ASSUMPTION, DECISION, DESIGN, TASK, VERIFICATION, EXTENSION. Relation kinds: `derived_from`, `addresses`, `implements`, `requires`, `checks`, `resolves`, `supersedes`, `conflicts_with`, `extension`. Active `requires` must be acyclic; v1 prerequisites are AND-only.
- Extension payloads ride namespaced versioned envelopes validated by a trusted registry; core envelopes reject unknown properties. Never execute anything implied by payload data.
- Context compilation is deterministic: RFC 8785 canonical JSON, SHA-256 digests, stable `(kind, node_id, revision)` ordering, budgets counted with the real tokenizer. Mandatory material exceeding budget returns `CONTEXT_INSUFFICIENT` — never silently dropped.
- Verification results are observed facts from authenticated runners pinned to criteria/code/environment; a model-generated PASS string is not proof.
- Timestamps are UTC RFC 3339 with `Z`; money/metrics are non-negative decimal strings; core integers stay in the safe-integer range; reject duplicate JSON keys and non-finite numbers before schema validation.

**Evidence discipline (from `build-repo-knowledge`).** Every factual assertion and graph edge carries evidence with status: declared / implementation-supported / inferred / conflicting / unknown. Inferences stay proposals until an explicit acceptance decision. Never invent descriptions to fill template sections; omit unsupported sections instead.

**Schema immutability.** Every schema has an immutable `$id`; never replace schema bytes at an existing `$id` — release a new versioned bundle. `https://schemas.example.org/vsg/1.0.0/` is a reserved example namespace; adopt an organization-owned namespace before shipping and regenerate all references/digests together.

**Honesty about limits.** Determinism holds for frozen inputs only; fresh model output and changing external systems are not deterministic. Do not claim checks passed unless executed. Graph coverage is reported separately from semantic correctness.

## Verification

- **Contract tests:** the acceptance backlog C01–C20 in the Technical Spec is the definition of done for harness behavior (parse rejection, atomicity, revision conflicts, idempotency, context sufficiency, canonical determinism, fencing, crash reconciliation, evidence currency, import untrust, tenant isolation, budget enforcement, restore barriers, semantic-eval gap). Included tests cover C01–C04 and C07–C10 plus reference checks — extend toward the full backlog as code lands.
- **Adversarial examples:** representative good cases validate; unsafe counterexamples (self-accepting proposals, dangling refs, cycles, imported authority claims) are rejected. Test both directions.
- **Reproducibility:** compile twice from the same frozen bundle and compare bytes/hashes; shuffle semantically unordered inputs and verify equivalent output.
- **Skill evaluation:** use `evals/cases.json` + `evals/rubric.md` from the build-repo-knowledge package when validating the context-layer skill.
- **Stop criteria (from the brief):** zero tolerance in the evaluated workload for unauthorized effects, overwritten accepted revisions, unresolvable references, fabricated evidence, silent mandatory-context omission, or unbounded retries. Narrow or stop rollout if graph maintenance exceeds its rework reduction.

## Packaging

**Microsoft APM** is the packaging and distribution mechanism for agents, skills, and hooks. The canonical example in this repo is `docs/product/build-repo-knowledge.zip`:

```
build-repo-knowledge/
  SKILL.md              # workflow + evidence discipline contract
  agents/openai.yaml    # APM interface manifest (display name, default prompt, icons, product policy)
  references/           # discovery, knowledge-model, reconciliation, compilation, wiki
  assets/               # run-config.json, knowledge.schema.json, page-template.md, icon.svg
  evals/                # cases.json, rubric.md
```

Rules for packages authored here:

- Every skill ships a `SKILL.md` (workflow + contracts), an `agents/openai.yaml` APM manifest, reference docs, asset contracts, and evals. Assets define output contracts, not bundled engines — implement or reuse deterministic tooling in the target project and record its version.
- Target surfaces: pi, Claude Code, Codex, Cursor, Kiro. Keep skill logic harness-agnostic (plain Markdown + JSON contracts); platform-specific behavior belongs in per-platform manifests/hooks, not in the workflow prose.
- The skill suite to author (brief §7), staged with the milestones: `delivery-workflow`, `requirement-discovery`, `requirement-modeling`, `feasibility-investigation`, `solution-design`, `task-planning`, `task-implementation`, `solution-verification`, `adversarial-review`, `change-impact-analysis`, `context-gap-investigation` (pilot), `execution-recovery-triage` (hardening). Skills guide reasoning only — they never implement the state machine, acquire leases, validate authorization, or declare authoritative success.
- Map `build-repo-knowledge` output onto the harness contracts (SOURCE nodes, evidence records, derived_from edges) and evaluate that mapping before making it a default pipeline stage.
