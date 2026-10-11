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

## Final independent PACK review — 2026-10-11T18:48:58Z

**Verdict: PASS** for the approved frontend slice at `3b4f6aeb90e2851ebb962275b323695df2329b70`, held canonical revision17. Zero unresolved BLOCKER/DEFECT findings. Reviewer `agent:/root/roadmap_eval_revision` is independent of implementing `agent:codex`. This current verdict supersedes interim dispositions only; all historical failures remain preserved. No owner Finish, canonical write or implementation edit was performed by this reviewer.

```json
{
  "target": "PACK",
  "verdict": "PASS",
  "by": "agent:/root/roadmap_eval_revision",
  "at": "2026-10-11T18:48:58Z",
  "source_commit": "3b4f6aeb90e2851ebb962275b323695df2329b70",
  "held_revision": 17,
  "plan_digest": "e09ea3bb11d7b8d9708ec9913cfc462729ee57eb40043d7d6bd4747d363d2e55",
  "evidence_digest": "74b7695d5e7aa2f9e89e77f270337676e9fc1633b695379e919125972ca774b7",
  "artifact": "checks/implementation-red-foreman.md"
}
```

Both digests were independently recomputed with core functions. Actual `do check` exit0: alignment0violations/0gaps. Actual `do status` exit0: review/in_review, four tasks, revision17, not approved. All seven registered artifact hashes match. Actual Start act `e0cc43c2-0e38-4edd-b49a-dfaf8476075d`, `human:owner`, `2026-10-11T17:56:40Z`, revision9 binds the same plan digest. No Finish act is present. Claims record actors, not authentication.

### Additional historical defects, now resolved

| Severity                                      | Location at observation                                                                         | Actual failure and repair                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DEFECT                                        | `treadle/packages/web/src/library.js:1005–1036` at `cba9e0a`; historical capture7               | Failed new-selection fetch retained “Loading spec…” and the previous spec's approval inspector. A read-only JSDOM probe reproduced that state. Current source clears previous spec/workflow/docs, ends failed loading, removes old inspector and gives Refresh. Current capture42 shows unavailable state;43 shows recovery. Regression checks retained. Resolved.                                                                                                                                                              |
| DEFECT — verification and pending-state truth | `treadle/packages/web/test/workflow-ui.test.ts:105–112` before `3b4f6ae`; `library.js:656,1013` | Independent T4 at11d703f exit1: check passed, coverage failed expected “Implementation in progress”, actual “Owner actions unavailable.” Persisted receipt plus absent Start also matched a pending browser refresh. Current test waits for returned heading **and focus**, retaining authority/receipt/Finish assertions. Runtime truthfully says “Updating approval state…” and removes eligible actions while retaining content. New delayed-response regression checks pending and final state. Final T2/T4 pass. Resolved. |

Producer's first full delivery check/coverage also failed when the existing telemetry fact “no live socket in v1” disappeared. It was restored inside existing disclosure, preserving the test. First run records actual failures, second producer run passes, third independent run retains coverage failure above, fourth independent run is current success. No failed result was discarded or converted.

### Final exact reruns and audit

Sequentially from `treadle/`, at the final source revision:

| Task | Actual exit | Result                                                       |
| ---- | ----------- | ------------------------------------------------------------ |
| T-1  | 0           | 12 tests/3files,1.87s                                        |
| T-2  | 0           | 24 tests/4files,4.77s                                        |
| T-3  | 0           | 11 tests/3files,2.65s                                        |
| T-4  | 0           | All11commands exit0; check and coverage249tests/51files each |

Full T4 command logs are in `../frontend-evidence.json`, `runs[3]`, actual start `2026-10-11T18:46:32.062Z`, HEAD3b4f6ae. Their hashes were independently recomputed. Coverage88.50%statements/lines,78.41%branches,95.39%functions exceeds unchanged floors. Corpus90goldenfiles compared without contract changes; production audit no known vulnerabilities. Wiki0errors/0warnings,167anchors/0review,fresh; existing single pending finding remains pending. Expected refusal/non-Git disposable-fixture diagnostics remain visible. No remote CI pass is claimed.

Scope audit against baseline `2d22941c84a1362f5572e461753e29813386aadd`: exactly five product runtime browser assets changed. Test changes stay in approved contexts; authoring, registration, journal, verifier/evidence, review and named wiki outputs are permitted supporting artifacts. No server/API/backend implementation, entity/model/schema, dependency, CSP or hook change occurred. No new product screen or storage migration. Approved plan/artifacts/deck and unrelated files were preserved.

| Requirement / acceptance | Design / task  | Reviewed proof                                                                                                                                                                       |
| ------------------------ | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| FR-1/AC-1                | DES-1/T1       | Shared system typography, neutral light/dark tokens, blue primary actions; skin/theme suites and rendered views.                                                                     |
| FR-2/AC-2                | DES-2/T2       | Current returned workflow gate drives hierarchy; no readiness inferred from task counts; owner/workflow/inspector and new gate tests.                                                |
| FR-3/AC-3                | DES-2/T2       | Questions, spec approval, decisions, Start and Finish remain separate. Returned eligibility, revision checks, confirmations, pending/error recovery and post-action focus preserved. |
| FR-4/AC-4                | DES-3/T3       | Source/discussion together wide, stacked narrow; explicit Save/Submit/Resolve/Reattach, draft/conflict recovery, paging/range/original history retained.                             |
| FR-5/AC-5                | DES-3/T3       | Two-pane interview, choice/free text/unknown/Back/Submit retained; named controls, explicit button types, radio focus/draft checks; narrow Submit reached.                           |
| FR-6/AC-6                | DES-1/2/3/T1–3 | Existing theme preference, disclosure cues, visible focus,44px primary targets and actual390/1024/1440px scrolling; line113/final paging reached. Limits below.                      |
| FR-7/AC-7                | DES-4/T4       | Actual scope/hash audit, all repository/wiki gates, current evidence and truthful wiki update; no second task ledger.                                                                |

No new decision/question was silently resolved. Historical task rows remain evidence of their recorded moments; independent reruns establish current repair currency. Native disclosures preserve supporting design/requirements/checks/dependencies/evidence; active/blocked task rows open and right/down cues show state. Start explicitly does not wake an idle agent; feedback keeps deliberate idle-host instructions. No invented eligibility or agent presence found.

T4 verifier checks current source/asset hashes, decoded capture bytes and required current repaired-state captures; it appends actual per-command results and rejects failed gates. Disposable fixture receipts are synthetic rendering inputs, not human authority or attestation. The reviewer audited actual bytes, tests, behavior and diff beyond its booleans.

### Rendered inventory

All44 screenshot bytes were individually inspected full-size during this review and current decoded SHA-256 values recomputed. First38 and appended38–43 preserve original image bytes; historical annotations distinguish superseded3/7/8/9/10/32. No frame-replacement claim. Mixed temporary fixture ports are observed routes, not a real owner journey. Routes below omit query/fragment; document scrollability derives from recorded scrollHeight versus CSS viewport and inner scrollers have separate limits.

Capture7 is historical broken loading,42/43 current failure/recovery. Frames38–41 show current readable disclosure cues. Frame1's loading iframe is followed by loaded2. Zoom-distorted32 is historical;33 supplies reset narrow-room proof. Frames34/35 alone do not reach final line;37 visibly reaches113 and disabled Next. No unresolved occlusion, clipped-at-rest, illegible or unreachable-secondary-control finding was identified in current accepted views.

Legacy `png_base64` contains JPEG bytes, now explicitly labeled with encoding and pixel dimensions. CSS390×844 captures can encode375×812 pixels; this distinction is retained. No specific high-zoom percentage is proved.

| Index / state                              | Route                                                             | CSS viewport / theme | Document X,Y / scrollable | Inner scrollers: top / maximum            | Pixel SHA-256                                                      |
| ------------------------------------------ | ----------------------------------------------------------------- | -------------------- | ------------------------- | ----------------------------------------- | ------------------------------------------------------------------ |
| 0: library                                 | http://127.0.0.1:45697/projects/bbbbbbbbbbbbbbbbbbbbbbbb/library/ | 1440×900 / light     | 0,0 / no                  | pane 0/691; detail 0/0                    | `d3cd56854745617cb2dc0dd3ce3840b985b112b798c93bcfd50bfe17ca0c03a0` |
| 1: start                                   | http://127.0.0.1:45697/projects/bbbbbbbbbbbbbbbbbbbbbbbb/library/ | 1440×900 / light     | 0,0 / no                  | pane 493/691; detail 0/0; tabbody 0/289   | `2d9fc840ce18b0fd6b61a96641188ef1243ac2b61e8b0d4d1848c469467d1399` |
| 2: start                                   | http://127.0.0.1:45697/projects/bbbbbbbbbbbbbbbbbbbbbbbb/library/ | 1440×900 / light     | 0,0 / no                  | pane 493/691; detail 0/0; tabbody 0/289   | `6ebcf606c0191e4e046e0f0403e7fd654492a90483ec759677410fc189993d30` |
| 3: plan (historical)                       | http://127.0.0.1:45697/projects/bbbbbbbbbbbbbbbbbbbbbbbb/library/ | 1440×900 / light     | 0,0 / no                  | pane 538/691; detail 0/0; tabbody 0/0     | `98fb9a3981d984f0ca286daf13d93f5ade2650b368586e1c666645a078bcae14` |
| 4: spec                                    | http://127.0.0.1:45697/projects/bbbbbbbbbbbbbbbbbbbbbbbb/library/ | 1440×900 / light     | 0,0 / no                  | pane 583/691; detail 0/0; tabbody 0/0     | `76db936dd4d8a4e1173d3645f061a57096e4f5fd2118c6d284fe387dce306ac6` |
| 5: decisions                               | http://127.0.0.1:45697/projects/bbbbbbbbbbbbbbbbbbbbbbbb/library/ | 1440×900 / light     | 0,0 / no                  | pane 628/691; detail 0/0; tabbody 0/0     | `62736f7dc2fa089bb4f817436f93d56ac767e56d9f9a43953a9f032df9b43c85` |
| 6: rejected                                | http://127.0.0.1:45697/projects/bbbbbbbbbbbbbbbbbbbbbbbb/library/ | 1440×900 / light     | 0,0 / no                  | pane 673/691; detail 0/0; tabbody 0/0     | `b7d97473270275743b28ce4fbcccddba1516b0fa389045cef2e4a79e2dce3f5a` |
| 7: unavailable (historical)                | http://127.0.0.1:45697/projects/bbbbbbbbbbbbbbbbbbbbbbbb/library/ | 1440×900 / light     | 0,0 / no                  | pane 718/774; detail 0/0                  | `b96a870dcad27ce53b82dc74ffffaac38785f1249573e38ba8c148f450fffcec` |
| 8: implementation (historical)             | http://127.0.0.1:37001/projects/bbbbbbbbbbbbbbbbbbbbbbbb/library/ | 1440×900 / light     | 0,0 / no                  | pane 0/691; detail 0/0; tabbody 0/0       | `4f046f21a2fe14a8d0e7c4796241945b1af6434bb65d8ce81ed97afdf2d5a982` |
| 9: blocked (historical)                    | http://127.0.0.1:37001/projects/bbbbbbbbbbbbbbbbbbbbbbbb/library/ | 1440×900 / light     | 0,0 / no                  | pane 0/691; detail 0/0; tabbody 0/0       | `b98c41d5d8f2a9081746151c2acec9b5094e5dce78d6b6811ca1909277d096da` |
| 10: review (historical)                    | http://127.0.0.1:37001/projects/bbbbbbbbbbbbbbbbbbbbbbbb/library/ | 1440×900 / light     | 0,0 / no                  | pane 0/691; detail 0/0; tabbody 0/0       | `5c8ab9bfbc860cd2142d6dff2a87db9a1f445edd5e3e9bcbe6f5e6bf9ab796fe` |
| 11: closure                                | http://127.0.0.1:37001/projects/bbbbbbbbbbbbbbbbbbbbbbbb/library/ | 1440×900 / light     | 0,0 / no                  | pane 0/691; detail 0/0; tabbody 0/0       | `41ef39d62c578bc7b27b4db1456dc5a9332fc53b43f8ce29565e00f5117dfd51` |
| 12: finish-confirmation                    | http://127.0.0.1:37001/projects/bbbbbbbbbbbbbbbbbbbbbbbb/library/ | 1440×900 / light     | 0,0 / no                  | pane 0/691; detail 0/0; tabbody 0/0       | `415f9cd04eb11e70a35a35918d05538e17a838188153e44e38d6d54f1a58c8b0` |
| 13: delivered                              | http://127.0.0.1:37001/projects/bbbbbbbbbbbbbbbbbbbbbbbb/library/ | 1440×900 / light     | 0,0 / no                  | pane 0/691; detail 0/0; tabbody 0/0       | `838481badbce287adb6089a481424bdc8eeb9f63f74b125f232dcb9bda80fa2d` |
| 14: feedback                               | http://127.0.0.1:37001/projects/bbbbbbbbbbbbbbbbbbbbbbbb/library/ | 1440×900 / light     | 0,0 / no                  | pane 0/691; detail 0/0; tabbody 0/4071    | `681835f31b6e52546a6873c386cc4650edc9c67b68c5a665d855b4c58674b8f0` |
| 15: feedback-stale                         | http://127.0.0.1:37001/projects/bbbbbbbbbbbbbbbbbbbbbbbb/library/ | 1440×900 / light     | 0,0 / no                  | pane 0/691; detail 0/0; tabbody 900/4071  | `dfded4cea82acb41674e4e5cf4f7861847521d0165ce17ec293b795ff8fa6e7a` |
| 16: feedback-draft                         | http://127.0.0.1:37001/projects/bbbbbbbbbbbbbbbbbbbbbbbb/library/ | 1440×900 / light     | 0,0 / no                  | pane 0/691; detail 0/0; tabbody 209/4071  | `ed1fc6e21d8956536bb8d7be005463646dcf22bb63e6c4cb22a371f472a03be9` |
| 17: feedback-conflict                      | http://127.0.0.1:37001/projects/bbbbbbbbbbbbbbbbbbbbbbbb/library/ | 1440×900 / light     | 0,0 / no                  | pane 0/691; detail 0/0; tabbody 0/4108    | `3d3dc91ac2a2f960dcfd31a5e8a33395a7e836ff5afa6937431cf7c9edb97202` |
| 18: audit                                  | http://127.0.0.1:37001/projects/bbbbbbbbbbbbbbbbbbbbbbbb/library/ | 1440×900 / light     | 0,0 / no                  | pane 0/691; detail 0/0; tabbody 0/0       | `97000ffa595154e1f08902b8861c410fee36b3ec6351611ecda93634d77389d4` |
| 19: empty-feedback                         | http://127.0.0.1:37001/projects/bbbbbbbbbbbbbbbbbbbbbbbb/library/ | 1440×900 / light     | 0,0 / no                  | pane 0/691; detail 0/0; tabbody 0/0       | `f6f7a1dd8f8cf268f831d5da952c5bc258c2bddaa010204f564b80147a83c2b1` |
| 20: keyboard-focus                         | http://127.0.0.1:37001/projects/bbbbbbbbbbbbbbbbbbbbbbbb/library/ | 1440×900 / light     | 0,0 / no                  | pane 0/691; detail 0/0; tabbody 0/0       | `50846690e29648a36cbebf19dd28c55c9ff779cd803ec50480d0ed496eae8c35` |
| 21: owner-conflict                         | http://127.0.0.1:37001/projects/bbbbbbbbbbbbbbbbbbbbbbbb/library/ | 1440×900 / light     | 0,0 / no                  | pane 0/855; detail 0/0; tabbody 0/0       | `a65b49bb1cd9fb09e499ed7dc050a1877ba5b7a8b96c0bd351cd61503cec911b` |
| 22: no-results                             | http://127.0.0.1:37001/projects/bbbbbbbbbbbbbbbbbbbbbbbb/library/ | 1440×900 / light     | 0,0 / no                  | pane 0/0; detail 0/0; tabbody 0/0         | `9762c7d1dc87e3ad04588ff01c5fc873b60355987815df59469ee5a8020ad335` |
| 23: archived-history                       | http://127.0.0.1:37001/projects/bbbbbbbbbbbbbbbbbbbbbbbb/library/ | 1440×900 / light     | 0,0 / no                  | pane 0/772; detail 0/0; tabbody 0/0       | `c873e3a7b11faabf83699979fb42cfdf3b8a703dc4aa3215ece325a3d3b311f9` |
| 24: narrow-library                         | http://127.0.0.1:37001/projects/bbbbbbbbbbbbbbbbbbbbbbbb/library/ | 390×844 / light      | 0,470 / yes               | pane 0/997; detail 0/0; tabbody 0/0       | `a695d8f0862ad206e79b5aaf8b4a9ea42b889e935327c3ca3056232296dfac47` |
| 25: interview                              | http://127.0.0.1:34605/                                           | 390×844 / light      | 0,125 / yes               |                                           | `253255eaec556b84070060b7bf4a7debaa4eaeaa0e4383dc8551f0d5c6932650` |
| 26: wide-interview                         | http://127.0.0.1:34605/                                           | 1440×900 / light     | 0,0 / no                  |                                           | `126bc2831e1a4b4b2350c6b36a2c2f3a355d675633269ef6556e8c7c00061f94` |
| 27: dark-interview                         | http://127.0.0.1:34605/                                           | 1440×900 / dark      | 0,0 / no                  |                                           | `7dd8c4e8836017dfbd9f1ce3a08055c883a2c1ad72c385f199788705ee0ebd57` |
| 28: dark-library                           | http://127.0.0.1:37001/projects/bbbbbbbbbbbbbbbbbbbbbbbb/library/ | 1440×900 / dark      | 0,0 / no                  | pane 0/798; detail 0/0; tabbody 0/0       | `11a869467c04a47cf4f0c7266f9e59f3b136a0a8f62504bb359d2662a4caa8e6` |
| 29: middle-library                         | http://127.0.0.1:37001/projects/bbbbbbbbbbbbbbbbbbbbbbbb/library/ | 1024×768 / dark      | 0,0 / no                  | pane 0/930; detail 0/0; tabbody 0/0       | `361f92e454e8d99a7f89bddfb127f2e218f5cda1b6a18511003a74ff06840b3b` |
| 30: narrow-feedback                        | http://127.0.0.1:37001/projects/bbbbbbbbbbbbbbbbbbbbbbbb/library/ | 390×844 / dark       | 0,5331 / yes              | pane 0/997; detail 0/0; tabbody 0/0       | `02a3fa93f466cb4ae1fc714ad5b6933c92da4dae952af27cb40876ef0b43de87` |
| 31: zoom-library                           | http://127.0.0.1:37001/projects/bbbbbbbbbbbbbbbbbbbbbbbb/library/ | 1440×900 / dark      | 0,0 / no                  | pane 0/798; detail 0/0; tabbody 0/0       | `d4a41f06315a21d61c1d5ef989508ad5ce28c81e498ddb9bd5d75e72169fc3e5` |
| 32: narrow-interview-controls (historical) | http://127.0.0.1:34605/                                           | 390×844 / dark       | 0,347 / yes               |                                           | `0540942d970db5d4049aba845b89a57ed3b9bbdad911c0d91788e9f6ec5f486b` |
| 33: narrow-interview-controls              | http://127.0.0.1:34605/                                           | 390×844 / dark       | 0,347 / yes               |                                           | `9b5e493d4001057ba41ea85e1e06df1cff2499a8765a679d2eafd4b4d80a3dcc` |
| 34: feedback-final-lines                   | http://127.0.0.1:37001/projects/bbbbbbbbbbbbbbbbbbbbbbbb/library/ | 1440×900 / dark      | 0,0 / no                  | pane 0/798; detail 0/0; tabbody 0/1288    | `a56debcbe360558940e16949ceb46b518083d76c8be85b18837a077d34bbdc13` |
| 35: feedback-final-lines-visible           | http://127.0.0.1:37001/projects/bbbbbbbbbbbbbbbbbbbbbbbb/library/ | 1440×900 / dark      | 0,0 / no                  | pane 0/798; detail 0/0; tabbody 58/1288   | `84edfccb97ef8ed3042b78938a57f3e3c53eeea0f67b78c23bd4eae7e9186229` |
| 36: feedback-scroll-bottom                 | http://127.0.0.1:37001/projects/bbbbbbbbbbbbbbbbbbbbbbbb/library/ | 1440×900 / dark      | 0,0 / no                  | pane 0/798; detail 0/0; tabbody 1288/1288 | `65d048f3f09f7d3a766012e8d9e40ffbc8e79a2217ad9ac15cd14eec20ded975` |
| 37: feedback-last-source                   | http://127.0.0.1:37001/projects/bbbbbbbbbbbbbbbbbbbbbbbb/library/ | 1440×900 / dark      | 0,0 / no                  | pane 0/798; detail 0/0; tabbody 750/1288  | `378e99c14bea4d1179aea69b23c5145f0d4a4d6efea508c3628979c07f4803b7` |
| 38: implementation-current                 | http://127.0.0.1:37001/projects/bbbbbbbbbbbbbbbbbbbbbbbb/library/ | 1440×900 / dark      | 0,0 / no                  | pane 0/798; detail 0/0; tabbody 0/0       | `c3cba366524a3a572b0e1b80003e9e3a0ebb0726eef8fe4f2893527559508efd` |
| 39: plan-current                           | http://127.0.0.1:37001/projects/bbbbbbbbbbbbbbbbbbbbbbbb/library/ | 1440×900 / dark      | 0,0 / no                  | pane 0/798; detail 0/0; tabbody 0/0       | `f6bcd1dd79b59796f8a6e273132ebde127857884378aae2d8aad00e29a87f39e` |
| 40: blocked-current                        | http://127.0.0.1:37001/projects/bbbbbbbbbbbbbbbbbbbbbbbb/library/ | 1440×900 / dark      | 0,0 / no                  | pane 0/798; detail 0/0; tabbody 0/0       | `5a5915df5ccaee20823d9959643e65a871265eee885d1594abbd6888c9e0e9e0` |
| 41: review-current                         | http://127.0.0.1:37001/projects/bbbbbbbbbbbbbbbbbbbbbbbb/library/ | 1440×900 / dark      | 0,0 / no                  | pane 0/798; detail 0/0; tabbody 0/0       | `090607f5eadd36685c8acda7e00abe83b6ef6d97f74a3ac4a13868c86e0e8d08` |
| 42: unavailable-current                    | http://127.0.0.1:37001/projects/bbbbbbbbbbbbbbbbbbbbbbbb/library/ | 1440×900 / dark      | 0,0 / no                  | pane 783/933; detail 0/0                  | `52caedfb250d4a89f59ad07aa54aa1d5718f90862890c0f0963af66153b46c06` |
| 43: unavailable-recovered                  | http://127.0.0.1:37001/projects/bbbbbbbbbbbbbbbbbbbbbbbb/library/ | 1440×900 / dark      | 0,0 / no                  | pane 798/798; detail 0/0; tabbody 0/193   | `610b077593e01c2a78461b0cb6a70546a6e1ea26441f96d638cadd22d4f17c4c` |

## Current complete command log identities

| Check        | Actual command                                                               | Exit | Actual log SHA-256                                                 |
| ------------ | ---------------------------------------------------------------------------- | ---- | ------------------------------------------------------------------ |
| check        | `pnpm check`                                                                 | 0    | `9aa11c8dbd51f034828696a7d13fe02c667b94d5614bb3928576a0c3cb04841b` |
| coverage     | `pnpm coverage`                                                              | 0    | `69fc93e8079bdf05ec6471cb82688f06f381054e42180cbde601ea251c54f76c` |
| corpus       | `pnpm corpus:check`                                                          | 0    | `1a413e8ea2eca93926bfcae1333174b3e1f37edf05c05ed38afe8571b454aff7` |
| brand        | `pnpm brand:check`                                                           | 0    | `9d479cb7941e5319984fe1f850d96e81d327cbcb93f600f3d92bb5541d63bb1f` |
| audit        | `pnpm audit:prod`                                                            | 0    | `e0a9cb70744d318c489edec8c4da9593cd861cc083641d47d83ec8bbec56da4d` |
| links        | `pnpm links`                                                                 | 0    | `03bb52654d96d401086fca3bf297c55bce74515e6bdf78cfc62d540814fada4d` |
| fingerprints | `pnpm exec tsx packages/cli/src/main.ts know fingerprints .. ../wiki`        | 0    | `ff80ff400f28f189be79d6817232654fa07b33511e7374a2ad363176f08aea41` |
| stamp        | `pnpm exec tsx packages/cli/src/main.ts know stamp ../wiki --workspace ..`   | 0    | `5691e029395e4e1ad8e29277d42c584e7921cbfff363611d50168e77411c6b59` |
| anchors      | `pnpm exec tsx packages/cli/src/main.ts know anchors ../wiki --workspace ..` | 0    | `97ddb24d66d988b3899b7b3d373cd16d09c612774179c3f1a09e000b74e28432` |
| validate     | `pnpm exec tsx packages/cli/src/main.ts know validate ../wiki`               | 0    | `76c3e9eb9c9419b6e299273c4b49c3ffe34555eb3437cf0b3e7292a254f9e761` |
| status       | `pnpm exec tsx packages/cli/src/main.ts know status ../wiki --workspace ..`  | 0    | `210be5a6d7f501490c2651537604769163ae125f46356b6a0662b51212665080` |

## Current source identities

| Approved browser source                 | Actual SHA-256                                                     |
| --------------------------------------- | ------------------------------------------------------------------ |
| `treadle/packages/web/src/library.html` | `090e007f83be1b68ca6eee283d350c8e4ae026d009bcbfd7e9d90aee0f62246f` |
| `treadle/packages/web/src/library.js`   | `d9beab26cd3ea593bf4511e9e6ef96f098b8a57532d1279ab7eb417c3574e10d` |
| `treadle/packages/web/src/page.html`    | `ecd7b09903a868fdff0d8ae4b2de055cd13059b16525d862c773261a14fd9ae5` |
| `treadle/packages/web/src/page.js`      | `c82e9a47fdca38f786d10e32ab45ee35a5ff845efb5acbc8a2298440572fce68` |
| `treadle/packages/web/src/feedback.js`  | `a0082831bc1d13f2f843d987b552004007007f995c5f2563da39426b5e3ebc71` |

### Delivery and verification limits

All five source hashes match current manifest; fixture-served three JS assets match. Independently read-only GET after existing build: actual app `http://127.0.0.1:8788/projects/f69b47a23566ae2a3e86acb0/library/app.js` HTTP200,43793bytes,SHA`d9beab26cd3ea593bf4511e9e6ef96f098b8a57532d1279ab7eb417c3574e10d`; feedback.js HTTP200,24632bytes,SHA`a0082831bc1d13f2f843d987b552004007007f995c5f2563da39426b5e3ebc71`. Both match sources. Served HTML rewrites project asset URLs, so raw source equality is not asserted. Reviewer GETs performed no mutation.

Producer's unexpected disposable interview answer is not reviewer activity or genuine human acceptance proof. Reviewer used own disposable fixtures/mock DOM only and never touched shared fixture `/tmp/quiet-workspace-58DF8D` or a real owner control.

Existing selector limit: `treadle/packages/cli/src/harness/context.ts:26–32` refuses multiple root JSON; approved frontend-evidence.json exposes it. Own disposable fixture with actual canonical/artifact/evidence bytes independently returned inventory/spec/workflow HTTP200/revision17/review, while harness context refused “Missing, ambiguous or oversized spec JSON.” Core `specpack/loader.ts:66–85,102` prefers canonical slug, and actual CLI check/status remain usable. This is disclosed, not repaired outside frontend scope or claimed as working hook inventory.

Three rendered HTML audits valid and axe4.14 subset0violations; each still has incomplete label-content-name-mismatch. JSDOM contrast disabled. Screenshots show visible focus/44px primary actions and recorded token contrast supports measured combinations; not every possible interaction. Full WCAG2.2AA, Focus Not Obscured, screen-reader/AT behavior, all-browser coverage and LCP/INP/CLS are unverified. Localhost fetch is not CWV. Reduced-motion CSS retained; actual OS emulation unavailable. No specified200/400% zoom proof. Wiki fingerprints cover Python only, stamp compares HEAD; fresh does not prove dirty TypeScript/Markdown detection.

These limits are explicit and do not waive failed checks. No authentication, normative rule acceptance, new workflow exception or owner Finish is asserted. Ready for independent PACK recording and the separate owner closure decision.

### Verbatim final focused command output

`T-1`: `pnpm exec vitest run packages/web/test/theme.test.ts packages/web/test/library-skin.test.ts packages/web/test/room-skin.test.ts`, exit0

```text
RUN  v3.2.7 /home/videogamer/code/memex_beta/treadle

 ✓ packages/web/test/room-skin.test.ts (3 tests) 43ms
 ✓ packages/web/test/library-skin.test.ts (4 tests) 219ms
 ✓ packages/web/test/theme.test.ts (5 tests) 317ms

 Test Files  3 passed (3)
      Tests  12 passed (12)
   Start at  14:46:15
   Duration  1.87s (transform 347ms, setup 0ms, collect 1.01s, tests 579ms, environment 2.04s, prepare 324ms)
```

`T-2`: `pnpm exec vitest run packages/web/test/workflow-ui.test.ts packages/web/test/inspector.test.ts packages/web/test/owner-workflow.test.ts packages/web/test/approval-ux.test.ts`, exit0

```text
RUN  v3.2.7 /home/videogamer/code/memex_beta/treadle

 ✓ packages/web/test/approval-ux.test.ts (8 tests) 992ms
 ✓ packages/web/test/workflow-ui.test.ts (4 tests) 847ms
   ✓ owner workflow UI > shows the ordered flow; decision approval does not start implementation  389ms
 ✓ packages/web/test/owner-workflow.test.ts (11 tests) 1984ms
   ✓ owner sequence across CLI and browser > executes two checked tasks under one start receipt, then requires independent review and human closure  1897ms
 ✓ packages/web/test/inspector.test.ts (1 test) 3290ms
   ✓ the phase inspector (T-3) > renders the five phases with the exact FR-4 derivation states; click focuses the tab; read-only  3288ms

 Test Files  4 passed (4)
      Tests  24 passed (24)
   Start at  14:46:18
   Duration  4.77s (transform 538ms, setup 0ms, collect 936ms, tests 7.11s, environment 1.97s, prepare 445ms)
```

`T-3`: `pnpm exec vitest run packages/web/test/feedback-ui.test.ts packages/web/test/room-keyboard.test.ts packages/web/test/approval-feedback-ux.test.ts`, exit0

```text
RUN  v3.2.7 /home/videogamer/code/memex_beta/treadle

 ✓ packages/web/test/approval-feedback-ux.test.ts (4 tests) 519ms
 ✓ packages/web/test/room-keyboard.test.ts (1 test) 1442ms
   ✓ the room keyboard (standalone harness) > drives the ceremony: Enter submits, approve card reached  1439ms
 ✓ packages/web/test/feedback-ui.test.ts (6 tests) 1105ms
   ✓ renders inert source, keyboard line selection, draft save and explicit Submit without owner writes  492ms

 Test Files  3 passed (3)
      Tests  11 passed (11)
   Start at  14:46:24
   Duration  2.65s (transform 431ms, setup 0ms, collect 1.72s, tests 3.07s, environment 1ms, prepare 342ms)
```

T4: `node ../specs/quiet-workspace/verify-delivery.mjs`, exit0.

```text
Running check
check exit 0
Running coverage
coverage exit 0
Running corpus
corpus exit 0
Running brand
brand exit 0
Running audit
audit exit 0
Running links
links exit 0
Running fingerprints
fingerprints exit 0
Running stamp
stamp exit 0
Running anchors
anchors exit 0
Running validate
validate exit 0
Running status
status exit 0
```

Current full manifest SHA after independent run: `e15710cb9935f034c65163601a5085094a0c01303957289655e55f08cac492b1`. Recompute after later appends; canonical evidence digest is the distinct core task-row digest above.
