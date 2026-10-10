# Semantic extraction — turning rule-shaped code into wiki knowledge

The pipeline: `know code rules <workspace> <bundle>` writes
`<bundle>/.okf/candidates.json` — a deterministic manifest of rule-shaped
code (raise-guards, assertions, permission/requirement calls, state enums,
schema validators) with exact `path:line` locations and content hashes.
The scanner makes **no semantic claims**; you decide what each candidate
means, and the wiki records your decision with anchors.

## Procedure

1. **Scan:** `know code rules . wiki`, then read
   `wiki/.okf/candidates.json`. Group candidates by symbol/module — rules
   cluster.
2. **Classify** each cluster into one of the four semantic types:
   - **BusinessRule** — a constraint the business imposes, encoded in
     code ("declined findings are never re-proposed").
   - **EncapsulatedLogic** — an algorithm/invariant hidden in a function
     or class (guarantees, invariants).
   - **Pattern** — a recurring structural solution (instances across
     files).
   - **Policy** — what code or contributors MUST do (forward-binding).
3. **Author one page per rule/logic/pattern/policy** in `wiki/domain/`
   using the matching type template (`know new wiki BusinessRule "t"`).
   Non-negotiables:
   - `sources: [{ id, resource: <path> }]` pins the primary file.
   - Body `# Anchors` footnotes cite exact `path:line[-line]` locations
     you actually read.
   - Every claim about behavior cites a location. No location, no claim.
4. **Route normativity:** pages that describe what IS (existing enforced
   behavior) → `status: stable`, written directly. Pages that prescribe
   what MUST be (policies, golden rules) → `status: draft` AND
   `know findings propose wiki --source <evidence> --destination
wiki/<page>.md --kind <kind> --rationale "…"`. Never write normative
   content as settled truth.
5. **Verify:** `know validate wiki` (0 errors), `know search "<rule term>"`
   finds the page, anchors resolve (`path:line` exists at the current
   stamp).

## Worked example (this repo, 2026-10-07)

The manifest surfaced 37 raise-guards. Three clusters became pages:
`wiki/domain/rule-declined-findings-immutable.md` (BusinessRule,
descriptive — the ledger enforces it in code), `wiki/domain/
rule-concept-paths-stay-in-bundle.md` (BusinessRule, descriptive —
containment raises at 6 boundaries), `wiki/domain/
pattern-content-hash-change-detection.md` (Pattern, descriptive — sha256
at extraction/candidate time). One Policy
(`policy-no-session-capture-in-engine.md`) was drafted and proposed
through the findings ledger because it binds the future, not the past.

## Limits

- The scanner is syntax-only: a raise is not always a business rule —
  classification is the gardener's judgment, cited per anchor.
- Staleness: candidates carry `source_hash`; enforcement of NEEDS_REVIEW
  lands with wave U2 (fingerprints). Until then, re-run `know code rules`
  and re-verify anchors after big changes.
