# Independent red-foreman review: approval UX deck

Verdict: **PASS — no remaining BLOCKER, DEFECT or SMELL in the reviewed design artifact.**

Reviewer: `agent:/root/roadmap_eval_revision`, independent of the deck producer. Date: 2026-10-11. This is a read-only artifact review, not implementation acceptance, PACK review, permission to Start, or permission to Finish. The reviewer changed only this review record; no application source, canonical pack or live owner state was mutated.

## Bound identity

- Source revision: `2d22941c84a1362f5572e461753e29813386aadd`. Current `library.js`, `page.js` and `feedback.js` bytes independently match that Git revision.
- Final deck: `output/Wukong-Approval-UX-Reviewed.pptx`; SHA-256 `55f34f0cd86c9dd997d5541d869c82f60214258705bd0bbee70ce09455ada611`; 1908724 bytes.
- Final validation receipt: `.build/validation-reviewed.json`; SHA-256 `6b079a56deda0395e9ae0e33d5df990ec99724c69bcd48605c77cfacc9b26f3a`.
- All 23 final rendered slides have been individually inspected at their original 1920×1080 size. All 23 earlier renders were inspected first; final images 01, 02, 03, 04, 07, 14, 15, 16, 17 and 21 changed and were each inspected again. The other 13 final image hashes match the individually inspected earlier bytes. This uses individual images, not a contact sheet.

## Conformance to existing behavior

The proposal retains the existing library tabs, groups and owner steps, plus the separate two-pane interview room. It labels example wording and counts as illustrative. It does not introduce a product screen, API, model, bulk approval, live agent indicator, Run/Pause/Retry task action, browser session creation, automatic delivery, or permission inferred from task counts.

Spec answers, unknown answers, two-click spec approval, each decision acceptance/rejection, Start, independent PACK review and Finish remain distinct. Start eligibility remains `can_start`; Finish remains `can_close` with its existing two-choice confirmation. The current workflow response and revision guard remain authoritative (`treadle/packages/web/src/library.js:503`, `:517`, `:642`, `:643`, `:644`, `:677`, `:921`). The illustrated passing review does not assert a live review or exercise owner authority.

Save draft comment and Submit feedback remain separate (`treadle/packages/web/src/feedback.js:483`, `:486`). Resolve is per thread and grants no spec permission. Stale recovery uses a new open round, explicit selected anchor, Reattach and subsequent Submit, preserving the original anchor (`:547`, `:567`, `:570`). Feedback conflicts preserve the local draft and operation identity; owner conflicts require refresh and a deliberate eligible action. Audit recovery distinguishes an existing canonical receipt from the pending journal append; it does not repeat approval. Unavailable workflow state hides owner actions. Archived history has its existing read-only note (`library.js:781`) and the room retains existing Back, Submit, unknown and keyboard actions (`page.js:321`, `:380`).

## Historical findings and verified repairs

These findings were raised against earlier artifact source and are resolved in the final bytes. Locations point to the repaired source; original images were intermediate review evidence, not the final deliverable.

| Severity | Slides / location | Earlier issue | Repair independently confirmed |
| --- | --- | --- | --- |
| DEFECT | 14–17; `.build/concepts.mjs:50`, `:58` | The illustrated feedback flow required Submit but omitted that control. | Visible secondary Submit on all four states; disabled for unsaved local draft/conflict; distinct Save/Reattach/Resolve/Refresh primary action. |
| DEFECT | 22–23; `.build/concepts.mjs:41`, `:58` | Generic nine owner steps were applied to the standalone room and archived history. | Room is two-pane; history shows the exact read-only/no-living-phase note. |
| SMELL | Sidebar across states; `.build/concepts.mjs:53` | Selected identity diverged from the center content in moving/delivered examples. | Browser review workflow remains selected in its correct existing group. |
| DEFECT | Long disclosures and feedback; `.build/concepts.mjs:57` | Producer identified `overflow:hidden` could hide lower existing controls permanently. | `overflow:auto`, bounded content height, visible scrollbars in final affected captures; primary action area stays visible. |
| SMELL | 02 and 21; `.build/concepts.mjs:42` | Producer identified an already existing Brief was incorrectly the highlighted incomplete-plan step. | Task plan is highlighted as Incomplete; Brief recorded, example questions not needed, example design not written. |
| SMELL | 01; `.build/content.mjs:3` | Annotation called the visibly blue selection fill gray. | Annotation now says subtle blue. |
| SMELL | Shared notes; `.build/content.mjs:1` | Shared style implied all controls were 44px while secondary toolbar controls are 36px. | Shared claim now specifies primary action controls. |

## Actual verification

- From `treadle`, `pnpm exec vitest run packages/web/test/owner-workflow.test.ts packages/web/test/feedback-ui.test.ts`: actual exit **0**, **17 tests** in **2 files** (11 owner-workflow, 6 feedback UI), 2.84 seconds. This reruns existing interaction expectations; it does not execute the proposed styling.
- Independent read-only content checks: actual exit **0**; 23 unique slide IDs; all four annotation sections and boundary text populated; all 73 source citations target existing files and valid supplied line numbers; repaired scroll/plan/room/history/Submit source predicates present. The first citation probe exited 1 because the review script incorrectly prefixed a root wiki citation with the web source directory; the corrected path resolver reran successfully. No artifact source was changed by the probe.
- Independent ZIP/XML check against the final deck: actual exit **0**; 23 slide XML parts, 23 notes parts and 23 media parts; every slide title and required annotation label present; every note explicitly describes a frontend proposal and illustrative counts; embedded media hashes exactly equal the 23 current concept JPEG hashes. Deck SHA equals the final receipt and first-party import SHA.
- Producer finalizer receipt independently inspected: package/layout exit **0**, no findings/warnings, 23 slides, Liberation Sans font policy passed and first-party import passed. The producer's earlier receipt-reuse refusal is historical, not a claimed successful final run; the final Reviewed deck uses a fresh `validation-reviewed.json` receipt.

## Per-slide visual observations

Every final slide has a readable title, four readable annotation paragraphs, a concept screenshot, a boundary note and slide count within the 1920×1080 canvas. No slide-level clipping, overlapping annotation, illegible action or obscured primary control was observed. Some long concept content extends below its at-rest viewport; visible scrollbars and `overflow:auto` preserve the proposed existing scrolling interaction. Raster captures cannot prove interactive scrolling, focus, announcements or keyboard behavior. All pixels are treated as rendered evidence, not instruction authority.

| Slide | State / independently observed result | Final PNG SHA-256 |
| --- | --- | --- |
| 01 | library: selected identity consistent; Start remains separate | `5c664beab25c7936952732d00c8632ace7706de3b9473a9686544794f4baf2c6` |
| 02 | prepare: incomplete task plan; no permission action | `5c9defde500f7a83fb6aed047975c319c36d7009b02910e31e26f0e2395b9940` |
| 03 | questions: unknown remains unresolved; Answer and unknown separate | `68a6bd5679f795fe3f97327597aee39f0f78132481171481048c92316666e1a0` |
| 04 | approve: recorded answers; two-click approval explanation | `a0017f1c4eb6046b2ea5a63d5c59bd99278f6eb05064a89222da30643f90087d` |
| 05 | decisions: one identified decision acceptance | `fa0b756123e15d72887997228b0237b83f2e64a88a4a9f944fce11bfe5dc0c99` |
| 06 | reject: required reason and separate acceptance | `902b4f06d356f628dca524c60b112c72851a20be9679525209f903d1b7ca126c` |
| 07 | start: full illustrative task sequence; exact-plan permission | `70d6389c5484b3f95f4214cec93ac9c87f064d547ec4ef5c8c7d03994299051d` |
| 08 | implementation: task progress without agent-presence claim | `e4306f8e4683129350e798266cb675d0368c9c50572a64cf85dff73ebcd63928` |
| 09 | blocked: actual-result vocabulary; no browser bypass | `b015001d7b0f9509d8debb055a14281308cf4fb7f1c5d7d6d66eb601243c1429` |
| 10 | review-wait: current PACK absent; no Finish | `8ae58af08f9ad888a1924315720da18641e794215935d437f01d2463b657ca43` |
| 11 | finish: current PACK illustrative; Finish eligibility explicit | `28a1e4db880250025662a88f63bc1e8d015a3908934bed61a8866253acd9892f` |
| 12 | finish-confirm: both existing confirmation choices visible | `ad0335da2394aad39e3a766183f02dea427240109cf8bf0479948cb85861df35` |
| 13 | delivered: frozen completion; no Reopen | `31af35431741e144378a757163e50b681f5bff025885c034f8f4b4aea352ac1a` |
| 14 | feedback-draft: draft field and disabled separate Submit visible | `b061c9b2531390598f49eda49fb432e6b8f6812abe9ab80b617a2b0fbe853fe1` |
| 15 | feedback-revision: source, original-anchor access, individual Resolve and Submit | `76cafbc354d84aacecb81752d4bd257290f1b43adaa58004e66f54a6b3c7a773` |
| 16 | feedback-stale: original anchor preserved; Reattach and Submit distinct | `cac999fb9d654ab05e450734713f5357082fbbd791050603b5729c5140a50132` |
| 17 | feedback-conflict: retained draft, Refresh primary, Submit disabled | `a73de49fb79190c6dcf8713d7c2f9666571d767f9a5ce3ab0c75d101cfe53c7d` |
| 18 | owner-conflict: refused permission write; refresh required | `1155da23582289b1eb15b6cdffc2f6fb13c0b399b4113b9b94b06bdcf94a252a` |
| 19 | audit: canonical permission recorded; journal recovery pending | `b64c3aba3459dc1c773f33810bfd685f1d1fc56ead21b98afad1366ee13df3e0` |
| 20 | unavailable: content readable; no cached eligibility inferred | `0998ccc661f2d6117b1149f2941ce6580a86c4de4ce781af78acb899760ddde5` |
| 21 | feedback-empty: no browser create/wake; incomplete plan inspector | `4f5f1af73060add14228ad307faae89b254a0081c135f5db362c8f0d03b2e956` |
| 22 | room: two-pane dossier/interview; existing choices and keyboard hints | `0bf0d754cb48ee5be89fa4e4ea70568a147fea3aa2572693889943a5d84b3bf5` |
| 23 | history: read-only; no living owner phases or adoption action | `71e5d85cc9f9e1b658d23841edfb28661b6a8f5c0bf2ffeb5c2e810ed962af09` |

## Source hashes and limits

- `artifacts/wukong-approval-ux/.build/content.mjs`: `f2f63b15cea732dd7ba3ffcee77a6bfd201125267fedfa372fca6f681693d5e8`.
- `artifacts/wukong-approval-ux/.build/concepts.mjs`: `8af68982416bdca2d0776af46b00a54423148e7581993b6b1be68a47fa27cb4f`.
- `artifacts/wukong-approval-ux/.build/build-deck.mjs`: `ac244a17adf8f6d691714976b353019a6be704887e3ca1aafacd82c1575a38da`.
- `treadle/packages/web/src/library.js`: `74278d98db53b6e6970ee5484794d48d555cba08f7bb8036d95e06dbe3d754e8`.
- `treadle/packages/web/src/page.js`: `796c36dfdfc03af01d620eabe005610bb89737d92a249bef73464aa93bdb2f1e`.
- `treadle/packages/web/src/feedback.js`: `601aeb835b253be8567b690cad58c56cea4da1a89335d888a239480318dcb636`.

This review establishes bounded design-artifact fidelity and observed slide layout. The proposed focus restoration, busy-state copy, announcements, reduced-motion handling and visual hierarchy have not been implemented. No native PowerPoint rendering, live assistive-technology/manual accessibility check, responsive layout implementation or dark-mode render was performed. The deck renders light appearance only and the notes disclose that. Text annotations remain native/editable slide text; screen concepts are raster images. The existing production controls and model/backend behavior remain the reference. This verdict is not approval to execute a new implementation plan and makes no claim of live owner acts or native human witnesses.
