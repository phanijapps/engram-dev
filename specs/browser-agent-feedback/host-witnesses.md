# Browser and native host witnesses

## UI verification (T-4)

The packaged web application was rendered in Chromium against a seeded temporary project. These automated fixture actions do not establish human/native-host delivery witnesses.

| Manifest field | Observed evidence |
| --- | --- |
| Routes | Project-qualified library Feedback view; recorded routes omit session query and fragment. |
| Viewports | Declared layout breaks at 601/901 CSS pixels (CSS max-width 600/900); channels <601, >=601 <901, >=901. Supported minimum: none-declared; discarded breaks: none. Captures at 600, 601, 901 and extra375/1280, with heights 600/900 and both attained scroll states. |
| Browsers | Chromium; exact version in checks/rendered-captures.json. Other engines unverified. |
| States | UI tests exercise first-run, draft, submitted/sealed, closed, unsupported, conflict, stale, reattachment, agent reply, long source/pagination, inert text. Rendered seeded document content and keyboard submission at all recorded sizes. |
| Screenshots | 20 images under checks/rendered; each capture records width, height, actual scroll and page-scrollable. |
| Inspection observations | Independent judgement: completed/pass for all20 repaired captures; original header occlusion and crowding resolved. Original failures retained in implementation-review-ui.md and checks/rendered-attempt-1. |
| Accessibility result | Static HTML validation exited 0. Axe subset:0 violations/0 incomplete. Enabled controls meet24x24; keyboard selection/Save/Submit works, focus outline3px with3px offset. Actual records in checks/ui-witness.json. Declared target: WCAG 2.2 AA; subset does not cover 2.4.11, 2.5.7, 3.2.6, 3.3.7 or 3.3.8. Focus Appearance 2.4.13 is an AAA enhancement. |
| Performance result | No field CWV or Lighthouse claim. Source pagination caps each side to 100 lines; no new external assets. |
| Console/network result | Capture run reports zero page errors and only the fixture loopback origin. |
| Analytics events | No telemetry; keyboard Submit resulted in a persisted batch and visible success. |
| Known exceptions | No accepted UI exception. |
| Unverified items | Complete WCAG 2.2 AA audit, other browsers, field CWV, native human host loops. |
| Security/privacy review status | Pilot tier; independent red-foreman API/boundary review, with original defects and repairs retained in implementation-review.md. |
| Reliability/recovery status | Pilot tier; unit/API cases cover conflicts, lost acknowledgements, stale rounds and immutable history. No SLO/alerting claim. |

## Native host verification (T-6)

Pending: real Claude, Codex and Pi runs must each receive a human-submitted document and code-diff review, reply and publish revisions, and observe human resolution. CLI availability or synthetic tests do not substitute for those six journeys. The verifier refuses absent evidence.

## Native preparation — 2026-10-11

Six actual review sessions (one Markdown and one selected Git diff per Claude/Codex/Pi) are recorded in checks/native-preparation.json. The coordinator opened them against isolated fixtures under checks/native-sources; no unrelated dirty files are selected. Human browser comments, Submit, revised rounds and Resolve remain pending. Auth readiness is not delivery proof. The actual Codex process returned pending for both bounded waits and made no edits. Checks/native-availability.json retains scoped command/exit observations; no native transcript is exported to engine/wiki/repository. The combined task verifier refuses the missing matrix. Automated loop/recovery fixtures are explicitly synthetic and cannot replace these witnesses.

## Native progress checkpoint — 2026-10-11T13:56:24.740509+00:00

Actual Claude, Codex and Pi runs have received the six human-submitted test sessions and published fixture revisions. The second Codex document batch was a new comment, not a reattachment; the native Codex follow-up appended the predeclared sentence once and published round 3. All seven threads remain unresolved. The original `fadsf` thread still awaits actual human Reattach and Submit, followed by native redelivery and human inspection/resolution. The browser has been refreshed and displays round 3; no human mutation was performed by the coordinator.

The independent native audit found an equals-form session override in the scoped command observer. A phase-specific option/value allowlist now rejects overrides before child execution. The reviewer independently observed twelve refused probes and preserved fixed identity on valid forms; its repaired supplement is bounded PASS in implementation-review-loop.md. Six command histories are aggregated in checks/native-commands-*.json. Two historical unavailable child outputs with nominal exit 0 are explicitly excluded from success proof. The draft native witness lists its missing human actions and independent final review; it is not an admitted completion witness. Canonical task revision remains 40, T-6 doing. T-7 and final PACK review have not begun.

## T-6 reattachment witnessed — 2026-10-11T14:57:36.051810+00:00

The next user confirmation corresponded to a new `Approved` comment at cursor3, not a reattachment. Actual native Codex acknowledged it without source edits or owner-state changes and published round4. After the coordinator displayed the current open round and selected line7 without saving any comment, the actual human clicked original-thread Reattach and Submit. Batch30fb0850-7729-4248-97fd-430cc2e52990 cursor4 contains kindreattach, original thread5c92a460-6998-4071-a24f-108e0dc1ee94, original round1 anchor and human event49da1592-8cd9-4e8f-85ef-aeb13aed19b5. Native Codex wait/read delivered that exact batch, fixture verification exited0, a reply retained the original history, and round5 (2ba041b5-66bf-4c9e-b09b-bc8388aeebab) published without duplicate source edits. The actual native process exited0; scoped process metadata, prompts and command observations remain separate from host transcripts.

User inspection and Resolve of eight threads across six sessions are requested and pending. The admission verifier now links exact native wait/read reattachment delivery to the preserved original event, later original-thread reply and human resolution. Every thread in the native test matrix must resolve after the witnessed revised round. No final native witness or PACK verdict is claimed. Canonical revision40/T-6doing remains unchanged. Usability follow-up candidate for a future plan: make stale-thread recovery easier to distinguish from saving a new comment; repeated actual submissions exercised that confusion. No UI scope expansion is applied here.

## Owner manual-test exception — 2026-10-11T16:34:57.478843+00:00

Actual browser history records seven of eight Resolve events. Claude diff thread00a777c0-3e7e-4b55-97b0-40af05f068f9 remains open. The actual owner instructed: “I think I finished all take them as trouth. if anything is remaining let us ignore”. The coordinator stops further browser requests and records this as a narrow exception for the remaining manual Resolve witness, not as an observed Resolve. checks/native-owner-test-waiver.json binds the actual instruction, remaining session/thread, ledger revision49/hash and existing Start receipt digest. The runtime ledger and canonical owner acts remain intact.

The independent reviewer assessed that the direct owner instruction permits this manual-test exception while requiring honest qualified reporting. All six real native submissions/revisions, source snapshots, commands/exits, restart/lost-ack checks and actual stale reattachment/redelivery remain mandatory. The verifier accepts only the pinned actual single-thread exception and reports the missing human resolution as waived/unverified. It requires a separate qualified independent native verdict. This cannot establish six completed human-resolution journeys or substitute an owner Finish/PACK action. Final native review and the exact combined T-6 command remain pending. Approved documents are preserved.
