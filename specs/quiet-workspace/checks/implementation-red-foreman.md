# Quiet Workspace — independent implementation review

Initial verdict: **CHANGES REQUIRED** (historical; repaired disposition below). This is a bounded T-1–T-3 review; no PACK PASS, T-4 completion or owner Finish claim.

Reviewer: `agent:/root/roadmap_eval_revision`, independent of the implementing agent. Date: 2026-10-11. Reviewed baseline `2d22941c84a1362f5572e461753e29813386aadd` through commits `1afa3202db5e7a462f4d16d8074b8675ea701d6a`, `e5c2bb089f2093b8fa8c3c1f7262be4362b9c98f`, `16dec8dd62df943996d5f5b8e8193e657da4a7ec`, with actual current-source probes. The approved plan and 23-state deck remain the reference. T-4 rendering/gates are in progress and have not received final review.

## Findings

| Severity              | Location at observation                                                                          | Finding                                                                                                                                                                                                                                                                       | One-line fix                                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| DEFECT                | `treadle/packages/web/src/feedback.js:146`, `:165`                                               | A failed save leaves the live status saying “Saving draft…” after busy has ended. A real 409 probe returned an error and retained the draft, with `aria-busy` removed but status unchanged. The conflicting message falsely implies ongoing work.                             | Clear or replace the pending status on failure and assert the final failure status alongside draft retention.           |
| DEFECT                | `treadle/packages/web/src/feedback.js:364`, `:425`                                               | Manual range input changes the actual anchor but does not synchronize the new `aria-pressed`/visual line selection. Click line 1 then enter range 2–3: inputs report 2/3, pressed line remains 1. This misidentifies the comment target visually and to assistive technology. | Use one selected-line synchronization function for both line clicks and range input, including clearing an empty range. |
| SMELL                 | `treadle/packages/web/src/library.html:847`, `treadle/packages/web/src/library.js:346`           | Task summaries use `display:flex`, suppressing the native list-item disclosure marker, with no replacement expanded/collapsed cue. Collapsed tasks resemble static rows, making their checks/evidence harder to discover. Native details remains keyboard-operable.           | Add a visible disclosure cue that changes with `details[open]`, preserving native summary semantics.                    |
| DEFECT — verification | `treadle/packages/web/test/library-skin.test.ts:20`, `treadle/packages/web/src/library.html:679` | The initial combined T-1–T-3 rerun failed the earlier no-line assertion on the new composer input border: 44 passed/1 failed. Historical T-1 success cannot satisfy the combined current state.                                                                               | Reconcile the obsolete visual assertion with approved distinguishable inputs and rerun the combined selection.          |

The input-border assertion was already being repaired by the implementing agent when inspected afterward. Its disposition requires an actual rerun. This report preserves the observed failure rather than substituting a later green claim.

## Actual rerun and targeted probes

From `treadle/`:

```sh
pnpm exec vitest run packages/web/test/theme.test.ts packages/web/test/library-skin.test.ts packages/web/test/room-skin.test.ts packages/web/test/workflow-ui.test.ts packages/web/test/inspector.test.ts packages/web/test/owner-workflow.test.ts packages/web/test/approval-ux.test.ts packages/web/test/feedback-ui.test.ts packages/web/test/room-keyboard.test.ts packages/web/test/approval-feedback-ux.test.ts
```

Actual exit 1, 2026-10-11 at 14:16:55 local time; 45 tests, 10 files, 4.90 seconds. Nine files passed; `library-skin.test.ts` had one assertion failure. The new approval suite's six tests and feedback/room suite's four tests passed. Existing owner, workflow, inspector, feedback, keyboard and theme checks passed. These synthetic DOM checks do not establish rendered layout or complete accessibility.

Read-only Node/JSDOM probe loaded actual `feedback.js`, mocked state/snapshot responses and a 409 mutation response, then exercised actual handlers. Exit 0; observations:

```json
{"failureStatus":"Saving draft…","busy":null,"draft":"Keep","error":"Feedback changed or is locked. Refresh before retrying. Revision conflict Your local draft is retained."}
{"range":["2","3"],"pressed":["1"]}
```

No real feedback ledger or owner action was used.

## Bounded source observations

The runtime diff is limited to the five approved browser HTML/JS files; committed test changes are within T-1/T-2/T-3 touch sets. No server, API, backend, core/model/schema or dependency implementation changed in these commits. Authoring and canonical bookkeeping are visible in the commit range and are not mistaken for product backend changes.

Owner actions still use returned eligibility and revision checks. Start and Finish remain separate controls with Finish confirmation; decision acceptance and spec answers remain distinct. The current-phase label/grouping now prioritizes returned workflow state. Native details retains supporting requirements/design, record metadata, task checks and feedback history rather than deleting that information. Source/discussion are colocated; explicit Save/Submit, Resolve/Reattach and original history remain. The room retains two panes and adds named input/radio relationships, delayed-request guard and local draft recovery. No false browser-to-idle-agent wake claim was identified.

The new regression suites exercise duplicate-request refusal, server eligibility, owner action separation, unavailable workflow, retained feedback/interview drafts and choice focus. They do not cover the two reproduced feedback failures above. Final review still needs current exact task reruns, full gates, renderer state evidence, visual target/focus/scroll observations and honest accessibility/performance limits. The disclosure finding is source-based pending rendered confirmation. This review does not mutate source, canonical pack or owner records.

## Repaired bounded review — 2026-10-11

Current verdict: **PASS for the reviewed T-1–T-3 source/DOM slice**. All four findings above are resolved in the current reviewed bytes. This remains a bounded interim result; T-4 rendered-state evidence, complete gates and independent PACK review are pending.

The implementing agent changed only the original approved frontend/test contexts for these repairs. No reviewer implementation edit occurred. The original failure observations remain historical above.

| Finding                     | Independently observed repair                                                                                                                                                                         |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Failed feedback live status | `showError` now replaces the pending text with “Action not completed. Your local draft is retained.” The 409 probe preserves the draft and error focus while ending busy state.                       |
| Typed-range selection       | One `syncSelection` function now serves range input and line clicks. The original 1 → typed 2–3 probe produces pressed lines 2 and 3; clearing both inputs clears all pressed lines.                  |
| Task disclosure cue         | Current CSS supplies a visible `▸` before the summary and `▾` for `details[open]`; the native summary/details interaction remains. Final browser captures must confirm its reader-visible appearance. |
| Obsolete skin expectation   | The visual check now permits a distinguishable composer input while retaining unboxed workspace panes. The exact combined command above now passes.                                                   |

Independent rerun of the same combined command: **exit 0**, 2026-10-11 at 14:20:00 local time, **45 tests in 10 files passed**, 4.82 seconds. This includes both new regression suites and all named existing suites. It does not establish live rendering or complete accessibility.

Independent read-only JSDOM repair probe: **exit 0**, using the same state/409 responses and actual runtime handlers:

```json
{"failureStatus":"Action not completed. Your local draft is retained.","busy":null,"draft":"Keep","errorFocus":"feedback-error"}
{"range":["2","3"],"pressed":["2","3"]}
{"clearedPressed":[]}
```

Current reviewed repair SHA-256 identities:

| File                                                     | SHA-256                                                            |
| -------------------------------------------------------- | ------------------------------------------------------------------ |
| `treadle/packages/web/src/library.html`                  | `090e007f83be1b68ca6eee283d350c8e4ae026d009bcbfd7e9d90aee0f62246f` |
| `treadle/packages/web/src/feedback.js`                   | `a0082831bc1d13f2f843d987b552004007007f995c5f2563da39426b5e3ebc71` |
| `treadle/packages/web/test/library-skin.test.ts`         | `9f2a08fa30664c5054905198320010e29e9f96b868b845954d22da85ffe06d23` |
| `treadle/packages/web/test/approval-feedback-ux.test.ts` | `5d0b7d5cc5d87dd3485822b3f0696cbe3caf28f49738eca7447045ac64014dc7` |

No unresolved defect was found in these repairs. No PACK verdict, canonical review record or owner Finish act is issued here.
