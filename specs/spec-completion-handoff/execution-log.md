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
