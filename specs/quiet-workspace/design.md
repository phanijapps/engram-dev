# Quiet Workspace design

## Selected approach and scope

Use the approved 23-slide design as the visual handoff.
Deck: `../../artifacts/wukong-approval-ux/output/Wukong-Approval-UX-Reviewed.pptx`.
The owner approved this direction before this executable plan existed.
No new design decision is proposed. `owner-inputs.md` records the actual statement.

This compact design covers one browser subsystem with fixed upstream contracts.
An architecture diagram adds no useful information because the service boundary does not change.

## DES-1: shared visual hierarchy

Replace serif headings, gradient actions and decorative panels with system typography and neutral surfaces.
Use white content and soft gray navigation in light appearance.
Use dark neutral surfaces and readable text in dark appearance.
Use one blue primary action per action group. Keep existing distinct actions explicit.
Primary action targets are at least 44 CSS pixels high.
Use written status with color, visible focus and reduced-motion support.
Reuse existing token names and the `theme` key; do not add a preference model.
Define token values consistently in both existing HTML assets.

## DES-2: library gate and evidence

Keep the current library panes, groups, tabs and hash navigation.
Make the returned current gate more prominent than stored deliverable metadata.
Show concise phase-specific text rather than repeating the entire approval sequence.
Keep revision, dates and evidence available through existing disclosures.
Use native disclosures for task checks, dependencies, traces and long secondary details.
Keep active owner actions in a stable visible area inside the existing content column.
Preserve separate Finish confirmation, rejection reason and spec approval confirmation.
Highlight the current owner step using existing workflow data; archived history remains read-only.
Do not claim Start wakes an idle agent or that a client-side count grants eligibility.

## DES-3: feedback and room

Keep session, round, file and side selection available in a compact toolbar.
Place selected source and related comment or threads beside each other on wide layouts.
Stack them in a readable order on narrow layouts.
Keep secondary original-anchor, paging, range, drafts and batch content reachable.
Saving a draft, submitting it, resolving a thread and reattaching are distinct existing requests.
An unsaved local comment prevents Submit through the existing validation rule.
Do not auto-submit, auto-reattach or infer agent presence.
Keep conflict drafts and require deliberate retry after refresh.
The interview room retains two panes and all its existing question and keyboard controls.

## DES-4: verification and documentation

Use existing DOM fixtures and disposable packs for owner actions.
Add regression tests for current-gate truth, action separation, focus and reachable controls.
Keep original security, revision and keyboard assertions.
Inspect actual rendered light and dark views at wide and narrow sizes.
Record screenshots, routes, viewport dimensions, scroll state and observations.
Run repository gates and wiki checks. Report limitations accurately.
Update only affected knowledge claims and an initiative navigation entry.

## Contracts, rollout and rollback

No endpoint, request payload, response field, stored entity or event changes.
All existing fetch wrappers, expected revisions and mutation operation identities remain intact.
Failure recovery must preserve inputs and use the supported refresh path.
The service continues to deliver the same assets under its current CSP.
No remote asset, web font, telemetry or new runtime dependency is added.

Rollout uses the existing asset build and local service lifecycle.
Rollback reverts the frontend asset and visual-test changes only.
Existing packs and feedback ledgers need no migration.

## Delivery sequence

T-1 → T-2 → T-3 → T-4.
The order prevents concurrent edits to shared HTML and preserves one admitted task at a time.
No branching dependency needs a separate Mermaid artifact.
