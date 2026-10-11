# Copilot hooks execution observations

The owner accepted D-1/D-2 and started plan digest `cec6d1dcad85ee74b4b48070da21c63fb1feccb761a1afbc8ababf6ddcc31194` at canonical revision 7.
T-1 was admitted through `do next --expected-revision 7`, producing revision 8.

T-1 implementation detail: a separate wrapper reuses bounded stdin and eventContext, and keeps Copilot output separate from existing hosts.
The first file-write attempt used repository-prefixed paths from `treadle` and failed; its subsequent empty test selection exited 1.
No task pass was recorded for that failure; the retained log is `checks/T-1-path-failure.log`.
The corrected T-1 expectation exited 0 with 11 fixtures, including the actual 20-second child timeout. Canonical evidence records the pass at revision 9. Commit: `55f6c4c`.
Approved proposal documents remain unchanged.


T-2 was admitted at revision 10. Its exact expectation exited 0 with 63 tests in 7 files.
The installer now handles direct Copilot event arrays and preflights malformed configuration, payload conflicts, and pointer conflicts before writes.
Ownership records distinguish installed definitions from identical foreign definitions.
Removal preserves foreign keys, edited entries and sibling files, and refuses malformed configuration before deleting payloads.
Unix commands were executed after checkout relocation; native Windows host execution remains unverified.
A preliminary brand gate exited 1 because the JSON filename contained a literal product name in source/tests.
The implementation now derives that filename from `brand.binName`; the repaired brand check exits 0.
Checks: `checks/T-2-pass.log`, `checks/T-2-brand.log`. Source typecheck and scoped ESLint exited 0.


T-3 was admitted at revision 12. `node specs/copilot-hooks/verify-delivery.mjs` exited 0.
The temporary CLI dry-run, install, repeated install, real isolated service callback, and recorded removal all passed.
All 6 repository gates passed. Wiki validation returned 0 errors and warnings, 0 anchors needing review, and a fresh stamp.
The verifier stopped its isolated service and removed its temporary project.
Actual subprocess receipts: `checks/delivery-22950332-7cf1-4f7c-8d83-0f93c9914ae2/results.json`.
Current docs explain local hooks and Z.ai BYOK for CLI and VS Code. No API key was obtained or provider request sent.
The approved analysis/design/plan remain unchanged; their historical proposed status stays preserved.
All 3 tasks now have actual evidence; independent current-plan PACK review and owner Finish remain separate.


Independent implementation review reproduced 2 installer defects despite green checks: omitted pointer conflicts in dry-run and dangling-config removal.
The first findings and raw probes are retained in `implementation-review-first.md` and `checks/implementation-review-probes.log`.
Repairs share the pointer preflight between compile and apply, and preflight recorded configuration before removal regardless of existsSync.
Regression checks now cover matching force semantics, nonregular pointers, and dangling links.
The exact T-2 check exited 0 with 65 tests; `checks/T-2-review-repair.log`.
The exact T-3 verifier exited 0 after repair; `checks/delivery-1272f7f6-9f65-4f55-9217-eb8781693452/results.json`.
The verifier also clears inherited runtime overrides and retains receipts if isolated-service cleanup fails.
Actual repair evidence was appended through the supported shared locked writer to completed tasks, at revisions 14 and 15.
The CLI has no completed-task evidence-append operation. This supplement changes no task state, definition, owner act, or context pin.
The writer verified the current plan digest still matches the original Start receipt before each supplement.
The independent reviewer separately rechecked T-1 and T-2 after repair, with 27 and 65 passing tests respectively.


Final independent PACK PASS was supplied by `agent:copilot_correction_review` for source `e300144` and canonical revision 15.
All 3 exact task commands were rerun after repair; all 18 delivery subprocess receipts passed.
The actual review was recorded through the shared locked core writer at revision 16, bound to current plan and evidence digests.
`do status` now reports `workflow: closure — Finish spec`.
The library review page was queued in Codex. Only the owner may perform Finish; no agent performed it.
See `implementation-review.md` and its retained source/digest and command logs.
