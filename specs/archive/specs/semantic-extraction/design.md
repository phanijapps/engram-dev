---
kind: design
slug: semantic-extraction
title: Tree-sitter-assisted semantic knowledge — rules, logic, patterns, policies
status: draft
created: 2026-10-07
repo_head: ca7de98
analysis_inputs: [../okf-only-engine/feature.md (owner Q3 answer)]
---

# Technical design — wave S: semantic extraction

## The vision (owner's words, made concrete)

Today tree-sitter answers *"what is in this file?"* (symbols, imports).
Wave S makes it answer *"what does this codebase **mean**?"* — capturing:

| Concept type | What it captures | Example |
|---|---|---|
| **BusinessRule** | a constraint the business imposes, encoded in code | "orders over $10k require manager approval" |
| **EncapsulatedLogic** | an algorithm/invariant hidden inside a class or function | "retry with exponential backoff, max 5 attempts" |
| **Pattern** | a recurring structural solution in this codebase | "all CLI verbs return dicts and print at the edge" |
| **Policy** | an enforced rule about how code must behave/be written | "wiki edits route through the findings ledger" |

Every page: **location-anchored** (`sources: [{id, resource: path}]` +
body footnotes citing `path:line`) and **searchable** (existing FTS).

## The honest constraint

Tree-sitter is a *syntax* oracle — it cannot know a guard clause is a
"business rule". So extraction is **hybrid, in two honest stages**:

1. **Deterministic candidate surfacing** (pure tree-sitter + regex on
   syntax shapes): a scanner finds *rule-shaped code* — raise/return
   guards, validation call patterns, permission checks, state enums,
   decorator invariants, schema constraints — and emits a candidates
   manifest with exact locations. No semantics claimed. Fully
   deterministic, fully testable.
2. **Agent gardening** (the analyze/build-kb discipline): the agent
   reads candidates + surrounding code, decides *what kind* of knowledge
   each is, authors the concept page with anchors — and **normative
   content (rules/policies that future code must follow) flows through
   the findings ledger** before it becomes settled truth. Descriptive
   observations go direct as curated concepts.

This mirrors the repo's deepest rule: *deterministic software finds and
anchors; the model proposes; humans accept.*

## Change by surface

| Surface | What changes | Evidence |
|---------|--------------|----------|
| `engine/okf/okf_kit/code/semantic.py` (new) | candidate queries per language (python first, adapter pattern for more): validation-raise guards, assert rules, permission/require calls, state enums, schema validators, decorators | new code |
| `okf code rules <workspace> <bundle>` (new verb) | writes `.okf/candidates.json` — the deterministic manifest (path, lines, snippet, kind hint, enclosing symbol, source_hash) | new code |
| kit type templates | + BusinessRule / EncapsulatedLogic / Pattern / Policy templates (0.2 frontmatter with sources) | `okf_kit/core/templates.py` |
| `skills/sdlc/build-kb/resources/semantic-extraction.md` | the gardening procedure: candidates → pages → ledger routing | new resource |
| wiki curated `domain/**` | where rule/policy pages live (searchable via existing FTS) | existing |

## Decisions

| ID | Decision | Alternatives | Door | Notes |
|----|----------|--------------|------|-------|
| SD1 | Hybrid: deterministic candidates + agent authoring | pure-syntax rules (shallow, wrong); LLM-writes-everything (unanchored, untrustworthy) | two-way | the repo's trust model, applied |
| SD2 | Line anchors in body footnotes keyed to `sources[].id`; `resource` = file path | line numbers inside `resource` (breaks link semantics) | two-way | spec-clean (§5.1/§5.2) |
| SD3 | Normative rules/policies via findings ledger; descriptive logic/patterns direct | everything through ledger (slows descriptive truth) | two-way | matches build-kb discipline |
| SD4 | Python first; language adapter pattern for others | all languages day one | two-way | 83/83 current concepts are python |
| SD5 | Staleness via per-anchor source_hash → NEEDS_REVIEW flow **deferred to wave U2** (fingerprints) | rebuild detection now | two-way | U2 is its own wave; candidates manifest carries hashes so U2 can diff |

## Carried uncertainty

| ID | Open | Blocks |
|----|------|--------|
| SQ1 | Which python patterns matter most in YOUR codebases (validators? permissions? state machines?) — the first query set is a guess until we run it on real code | S1 query priorities — the manifest itself will tell us (dogfood on this repo) |
| SQ2 | Volume: how many candidates a real repo yields per 1k LOC | gardening workflow shape |

## Out of scope

LLM auto-authoring of pages without agent review; non-python adapters;
auto-acceptance of rules; staleness enforcement (U2).
