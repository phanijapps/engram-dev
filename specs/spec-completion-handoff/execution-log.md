# Execution of approved Plan 1

The owner accepted the 4 design choices and gave permission to start Plan 1.
The browser records each answer in interview.jsonl.
The plan documents stay unchanged. This log records actual progress.

## Bootstrap

The engine accepted D-1 through D-4 from the actual Q-2 through Q-5 answers.
Q-6 gives permission to start the exact plan in plan-scope.json.
The prior record is pre-execution-revision-12.json.
bootstrap-authorization.json preserves the owner, dates, answers and approved scope.
No permission to finish the spec exists.

## T-1

The core now supports the owner approval rules in the new format.
It checks decisions, permission to start, changed plans, task evidence and independent review.
Old formats keep their original behavior and byte order.
The new schema is separate from the original schema.

The exact task command passed 14 tests. See T-1-verification.log.
Type checks, core lint and corpus checks also passed.
The engine recorded the result through do record.
These checks prove the task result. They do not replace the final independent review.

## T-2

The CLI now has separate decision, start and final completion actions.
Owner actions check the revision before they change the record.
The CLI uses an exclusive lock that the web server will share.
Lock recovery needs explicit owner action and proof that the old process stopped.
The core public exports connect these checks to the CLI.

The exact task command passed 7 tests. See T-2-verification.log.
A later check adds the changed-document bootstrap case. See T-2-bootstrap-verification.log.
The existing CLI tests, type checks and lint also passed.

This initiative adopted the new format through the CLI.
legacy-revision-22.json preserves the exact prior file.
The start receipt keeps the actual owner date, 2026-10-10T21:57:36Z.
The approved plan digest still matches. No start permission was backdated or invented.

## T-3

The browser now has separate decision, start and finish actions.
Each action checks the held revision and uses the same lock as the CLI.
The pack saves the owner receipt before the separate audit journal.
A failed or partial audit append leaves the receipt in a queue.
Recovery preserves complete events and does not repeat approval.
The writer also flushes pending CLI receipts and reports the actual audit state.
Generic legacy adoption keeps its spec questions in the spec approval phase.

The exact task command passed 10 tests. See T-3-verification.log.
The existing server and CLI suites passed with the new suite: 23 tests total.
Type checks and lint passed.
Tests cover concurrent actions, lock recovery, audit faults, current review,
explicit legacy closure, wrong origins and symlink escapes.
The engine recorded the task result. Final review and owner closure remain separate.

## T-4

The library now shows the nine owner steps in order.
Accepting a decision does not start implementation.
Start implementation grants permission for the current plan.
Finish spec appears only after task checks and current independent review.
A separate confirmation freezes the record.
Failed saves retain the content and provide a refresh action.
The room now sends its held revision when it saves an answer.
This required connection keeps the approved spec question flow usable.

The exact task command passed five tests. See T-4-verification.log.
The real browser checks passed in light and dark themes.
See ui-evidence.md and ui-browser-results.json for results and limits.
The legacy inspector still uses its original five phases.

## T-5

The four SDD skills now describe the approved owner workflow.
They keep spec questions, decision acceptance, start permission and final closure separate.
Implementation continues through the approved sequence one task at a time.
A new design choice cannot skip approval because it is reversible.
Progress does not rewrite the approved plan.

The installer copied the same skill trees to Pi, Codex and Claude.
The exact check compares their complete inventories and bytes.
It also runs the real engine and CLI approval scenarios: 16 tests passed.
The skill frontmatter validator passed for all four skills.
See T-5-verification.log. Independent review still checks the model behavior cases.

## T-6

The integration test executes two dependent tasks through the CLI under one browser start receipt.
Independent review and owner closure remain separate in that disposable fixture.
The corpus adds six owner phase cases. All 78 old goldens remain unchanged.
The separate schema validates this adopted pack and the six new inputs.
It refuses wrong versions, policies and agent approval claims.
The wiki now explains the implemented flow, accepted contract change and this observed repair.
It preserves the prior analysis and avoids historical retrospective backfill.

The exact command passed all repository gates: check, coverage, corpus, brand and links.
There are 144 passing tests. Coverage is 85.92 percent lines and 75.82 percent branches.
See T-6-verification.log and T-6-contract-verification.json.
A later rerun confirms the final fixture metadata correction.
The engine refused a duplicate done record; no second completion state was invented.
T-6-first-verification.log preserves the first run.
The room dossier's section list now includes the additive workflow section.
Wiki validation has zero errors and warnings. Anchors need no review.
The freshness tool still leaves TypeScript sources unbaselined; this is recorded as a limit.

## Verification follow-up before delivery review

An additional at-rest probe found insufficient dark primary-button text contrast.
The automated audit did not identify it. The fix uses the existing theme tokens.
The browser proof now checks actual text and focus contrast in both themes.
The exact T-4 command passed five tests again.
The independent reviewer includes this within-scope correction and current evidence.

The owner independently completed the earlier docs-root-migration record through the library.
Its revision 23 contains the real owner acceptance and closure fields.
The wiki adds a dated supplement; this initiative did not infer that closure.


## Delivery review 1 and repair

The independent reviewer found 2 blockers and 1 defect at HEAD 797bf408.
The report remains in delivery-review-1.md. No PACK PASS was recorded.
The late contrast fix removed a gradient that the skin test requires.
The repair restores that gradient and keeps text contrast above 4.5 in both themes.
The schema verifier now uses declared Ajv 8.17.1 from the repository.
Two new conformance tests check the schema during pnpm check.
The skill eval now describes supported owner acts instead of an absent flag.
All installed copies match the shipped skill trees.

The first new schema test assumed an act in a fixture that has none.
The corrected test adds a valid human act before it checks an invalid agent act.
The browser audit briefly measured labels during a theme transition.
It now waits for active transitions. The stable audit reports no violations.
The complete capture matrix was viewed again.
HTML validation passes with the standard and accessibility presets.
The recommended preset adds style rules that conflict with the existing formatter.
Those style rules are not part of the declared HTML check.

The exact T-6 command passed again after these repairs: exit 0.
It passed 146 tests, coverage floors, corpus, brand and links.
Coverage is 85.92 percent lines and 75.78 percent branches in this run.
The plain schema command and exact T-5 command also passed: exit 0.
The completed task evidence remains unchanged. These are supplemental checks.
A second independent review must pass before the owner completion handoff.
