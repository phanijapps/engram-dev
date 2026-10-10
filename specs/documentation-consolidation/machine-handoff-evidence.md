# Machine handoff correction evidence — 2026-10-10

## Cause and repair

The initial repair lacked a JSON specpack. The owner identified the omission.
The agent treated the Markdown handoff as sufficient. Both installed surfaces
and the shipped skills omitted an explicit machine-registration step.
The existing Pi-authored packs do not establish automatic Pi creation.

`do init` created documentation-consolidation.json. The existing core loader and
writer authored seven requirements, four proposed decisions, five dependent tasks,
and artifact references. Original R/D/T identifiers map to FR-/D-/T- IDs.
Human approval and closure remain unset. Pack state is engine-derived.

## Actual task evidence

Each task received a current `do next` handout. Its verification command ran
with exit 0; `do record` admitted the observation as `agent:codex` with the held
revision. `machine-task-admissions.json` records these admissions. The five
`machine-T-*-verification.json` files retain command output.

T-1 through T-4 re-verify the earlier documentation repair. These are not invented
historical machine handouts. T-5 verifies the populated machine record and installed
skill convergence. The review skill received a final clarification after T-5's
first observation: persist actual independent verdicts in the machine record.
The touched analysis and planning skills also had legacy findings flags;
these were corrected to the CLI’s positional arguments. All four skills
were re-synced and re-verified; `machine-final-verification.json` records that
later observation. The original evidence and frozen pins remain historical.

## Skill update and installation

The four shipped SDD skills now connect Markdown artifacts to JSON work state:
analysis creates the pack; planning persists the executable plan; implementation
uses next/record; review checks and records machine evidence and verdicts.
The installer updated the selected Pi/Codex skills. Existing same-agent uninstall
ownership entries were preserved because a subset installer run replaces that
machine-local record. No other components or hook wiring were requested.

All four skill validators passed. Forty-two installed files match the shipped
files byte-for-byte. `machine-skill-validation.json`, `skill-sync.json`, and
`machine-final-verification.json` capture these checks. The added evaluation
case is a future behavioral fixture; it was not executed as an autonomous skill
forward test. Instructions are improved, not automatically enforced by the runtime.

## Gates and limits

- Machine alignment: 0 violations and 0 reported gaps (`machine-alignment.log`).
- Work discovery: this initiative is listed as awaiting_owner (`machine-discovery.log`).
- Corpus, brand, and links: exit 0 (`machine-corpus.log`, `machine-brand.log`, `machine-links.log`).
- Check and coverage: exit 1, 110 tests passed and the existing install-paths
  assumption failed at `where.test.ts:181` (`machine-check.log`, `machine-coverage.log`).
  Current coverage floors remain unverified.

The former no-open-wave assertion now passes because this pack exists. The test's
specific install-paths assertion still fails; that closed pack was not reopened.

## Review

The correction's independent read-only review returned **PASS — nothing to fix**.
The reviewer independently reran machine alignment and both artifact verifiers.
The final syntax check and verdict are preserved in `machine-handoff-review.md`.
The earlier documentation review remains in `review.md`; it does not stand in
for the correction review. The actual verdict is also persisted in the pack.
