---
title: Repo-Knowledge Skill v2 — build-repo-knowledge × adapt-to-project
document_type: skill_design
status: draft_for_discussion
version: 0.1.0
date: 2026-10-05
---

# Repo-Knowledge Skill v2: combination design

Combine the best of `build-repo-knowledge` (memex_beta — the descriptive,
deterministic whole-repo knowledge engine) and `adapt-to-project`
(~/projects/memex — the normative guidance-diagnosis and safe-adaptation
skill). `build-repo-knowledge` is the spine and keeps its name; adapt-to-
project's mechanisms fold in as one new phase, one new output tier, and
three cross-cutting contracts.

## 1. What each side contributes

| Mechanism | Source | Disposition |
|---|---|---|
| 7-phase pipeline (discovery → knowledge model → taxonomy/ontology → reconciliation → deterministic compilation → wiki → validation) | build-repo-knowledge | Spine, unchanged |
| Evidence statuses (declared / implementation-supported / inferred / conflicting / unknown) + evidence records pinned to revision/path/locator/hash | build-repo-knowledge | Keep — the *fact* axis |
| Deterministic compilation (frozen inputs → identical canonical bytes), stable IDs, fingerprint incremental updates | build-repo-knowledge | Keep |
| Wiki discipline (managed sections, human notes preserved, staging + validate before replace, JSON search index, YAML front matter contract) | build-repo-knowledge | Keep |
| Repository anchoring: AGENTS.md chain, verified commands, bounded archaeology, purpose-driven search | adapt-to-project | **New Phase 0** |
| Bindingness ladder: Explicit / Framework-owned / Convergent / Tentative / Contradictory / Absent; only the first two bind | adapt-to-project | **New normative axis** |
| Describes-vs-prescribes split; arc42 golden-path `reference.md` (stereotypes, building blocks, crosscutting standards) | adapt-to-project | **New normative tier** |
| Findings ledger: accepted/declined, dedupe by (source, destination, kind), never re-propose declined | adapt-to-project | **Cross-cutting contract** |
| Per-finding accept/edit/decline; never batch-apply | adapt-to-project | **Cross-cutting contract** |
| Path jail, scope discipline, cross-scope split, never invent top-level dirs, smallest-useful topics | adapt-to-project | **Cross-cutting contract** |
| Idempotence: re-run against same state = zero diff | adapt-to-project | Merge with determinism contract |
| Markers, `.upstream` companions, discovery/state TOML, Claude/APM cache scans, `agentbundle adapt` CLI | adapt-to-project | **Drop** — install/distribution plumbing; belongs to the APM layer, which calls the engine's contract (manifest in, findings out) |

## 2. Pipeline (v2)

0. **Anchor & diagnose** (read-only): resolve root; read effective AGENTS.md
   chain + architecture/convention/workflow sources; verify build/test/lint
   commands from manifests (never preserve plausible guesses); classify
   guidance findings on the bindingness ladder; report chain, sources,
   evidence labels, gaps, conflicts. Guidance files become SOURCE artifacts.
1. **Discovery** — purpose-driven inventory (state/structure, interfaces,
   messages, rules, relationships, boundaries), exclusions, checkpointing.
2. **Knowledge model** — normalized facts with evidence; repository and
   system boundaries preserved.
3. **Taxonomy / ontology** — versioned type/property/relationship
   definitions; unsupported interpretations stay proposals.
4. **Reconciliation** — identity registry, explicit mappings, no name-match
   merges; fingerprint-based incremental updates.
5. **Compilation** — deterministic canonical graph from frozen facts;
   byte-identical on re-run.
6. **Composition** — descriptive wiki (deterministic render) + normative
   articles (authority-gated, per-finding acceptance) + AGENTS.md router
   diagnosis (smallest useful, links into wiki, no duplication).
7. **Validate & report** — schema, provenance, IDs, endpoints, retrieval,
   reproducibility, findings ledger state, coverage gaps; never claim checks
   that were not executed.

## 3. Two output tiers

| | Descriptive | Normative |
|---|---|---|
| Question | what is true here? | what must work conform to? |
| Sources | whole repo + docs | binding evidence + accepted decisions only |
| Evidence axis | fact statuses | bindingness ladder |
| VSG mapping | SOURCE-derived nodes | CONSTRAINT / DECISION / DESIGN nodes |
| Entry | deterministic compilation | authority-gated proposal |
| Binding without human | n/a (data) | Explicit + Framework-owned only |
| Flagship artifact | system/concept/interface articles + search index | golden-path reference (arc42 shape) |

Bindingness ladder = acceptance policy: Explicit/Framework-owned acceptable
directly; Convergent = proposal labeled inference; Tentative never binding;
Contradictory/Absent surfaced for human decision.

## 4. Cross-cutting contracts

- **Findings ledger** applies to every proposal the engine makes (guidance,
  restructuring, normative articles): dedupe key
  `(source-path, destination-path, kind)`; declined findings are never
  re-proposed at the scope observed; ledger is durable across sessions.
- **Interaction granularity**: per-finding accept / edit / decline for all
  normative and restructuring writes; descriptive regeneration needs none
  (deterministic).
- **Safety rails**: writes confined to the scope jail; resolved paths checked
  against root; no new top-level directories; cross-scope operations always
  split into same-scope pairs; smallest-useful guidance (topics, not
  headings; no empty sections); adopter locations preserved.

## 5. Relationship to the merged product

- This skill is the **Plane 1b wiki engine** of the merger brief
  (Merger_Brief.md §2–3): the LLM-as-wiki gardener, now producing both the
  descriptive knowledge layer and the normative golden path.
- Its update triggers (on-change diff hook, on-task stale refresh,
  on-consolidate pass) drive Phase 4 fingerprint updates and Phase 6
  normative proposals.
- Packaged via APM as the flagship memex skill; install/update flows (the
  dropped adapt machinery) live in the APM layer and consume the engine's
  manifest/findings contract.
- Eval triggers merge both sets: "build the knowledge wiki for this repo",
  "diagnose whether this repo gives agents enough context" positive;
  greenfield init, feature spec authoring, regression investigation negative.
