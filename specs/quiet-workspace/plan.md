# Executable frontend plan

This plan applies the approved Quiet Workspace deck without backend changes.
The canonical `quiet-workspace.json` owns task status and evidence.
This document describes the bounded sequence; it is not a second status ledger.

## Authority

The owner approved the visual direction in `owner-inputs.md`.
There are no new design decisions or human spec questions.
A separate Start implementation receipt binds this exact task plan.
One Start receipt covers all 4 tasks. Finish remains a separate owner action after independent PACK review.

## Task sequence

### T-1: Apply shared Quiet Workspace styles

Prerequisites: none. Implements: DES-1. Requirements: FR-1, FR-6.

Allowed changes:

- `treadle/packages/web/src/library.html`
- `treadle/packages/web/src/page.html`
- `treadle/packages/web/test/theme.test.ts`
- `treadle/packages/web/test/library-skin.test.ts`
- `treadle/packages/web/test/room-skin.test.ts`
- `specs/quiet-workspace/execution-log.md`

Declared check from `treadle`:

```sh
pnpm exec vitest run packages/web/test/theme.test.ts packages/web/test/library-skin.test.ts packages/web/test/room-skin.test.ts
```

Expected: Exit 0; visual expectations match the approved design and existing behavior, revisions, owner authority and keyboard expectations remain true.

### T-2: Apply library gate hierarchy and action placement

Prerequisites: T-1. Implements: DES-2. Requirements: FR-2, FR-3, FR-6.

Allowed changes:

- `treadle/packages/web/src/library.html`
- `treadle/packages/web/src/library.js`
- `treadle/packages/web/test/workflow-ui.test.ts`
- `treadle/packages/web/test/inspector.test.ts`
- `treadle/packages/web/test/approval-ux.test.ts`
- `specs/quiet-workspace/execution-log.md`

Declared check from `treadle`:

```sh
pnpm exec vitest run packages/web/test/workflow-ui.test.ts packages/web/test/inspector.test.ts packages/web/test/owner-workflow.test.ts packages/web/test/approval-ux.test.ts
```

Expected: Exit 0; visual expectations match the approved design and existing behavior, revisions, owner authority and keyboard expectations remain true.

### T-3: Apply feedback and interview room composition

Prerequisites: T-2. Implements: DES-3. Requirements: FR-4, FR-5, FR-6.

Allowed changes:

- `treadle/packages/web/src/library.html`
- `treadle/packages/web/src/feedback.js`
- `treadle/packages/web/src/page.html`
- `treadle/packages/web/src/page.js`
- `treadle/packages/web/test/feedback-ui.test.ts`
- `treadle/packages/web/test/room-keyboard.test.ts`
- `treadle/packages/web/test/approval-feedback-ux.test.ts`
- `specs/quiet-workspace/execution-log.md`

Declared check from `treadle`:

```sh
pnpm exec vitest run packages/web/test/feedback-ui.test.ts packages/web/test/room-keyboard.test.ts packages/web/test/approval-feedback-ux.test.ts
```

Expected: Exit 0; visual expectations match the approved design and existing behavior, revisions, owner authority and keyboard expectations remain true.

### T-4: Verify frontend delivery and update affected knowledge

Prerequisites: T-3. Implements: DES-4. Requirements: FR-7.

Allowed changes:

- `wiki/systems/owner-workflow.md`
- `wiki/initiatives/quiet-workspace.md`
- `wiki/initiatives/index.md`
- `wiki/.okf/fingerprints.json`
- `wiki/.okf/last-index.json`
- `specs/quiet-workspace/verify-delivery.mjs`
- `specs/quiet-workspace/frontend-evidence.json`
- `specs/quiet-workspace/execution-log.md`

Declared check from `treadle`:

```sh
node ../specs/quiet-workspace/verify-delivery.mjs
```

Expected: Exit 0; all named behavior expectations pass. For T-4, all six repository gates, coverage floors and five wiki checks pass; frontend evidence records actual rendered-state inspection and zero backend/model changes.

## T-4 verification obligations

The delivery script runs `pnpm check`, `pnpm coverage`, `pnpm corpus:check`, `pnpm brand:check`, `pnpm audit:prod` and `pnpm links`.
Each command records its actual exit and a separate log; any failure fails delivery.
The script runs the repository's 5 wiki maintenance and health commands once.
Coverage floors remain 75% statements, lines and functions, and 65% branches.
Wiki validation needs 0 errors, 0 warnings, 0 review anchors and a fresh stamp.
The current Python-only and HEAD freshness limit remains explicit.

The frontend evidence manifest records actual browser routes, viewports, themes, states, screenshots and observations.
It includes accessibility, performance, console and network results, exceptions and unverified checks.
Use real disposable fixtures for visual and interaction verification.
Do not click the real initiative's Start or Finish controls during verification.
Run 44px primary-target and visible-focus manual checks.
Keep status words, keyboard navigation, narrow scrolling and reduced motion.
Report automated accessibility limits and the remaining WCAG 2.2 criteria explicitly.
No analytics or third-party calls are introduced.

A read-only independent red-foreman reviews the final diff and current evidence.
PACK review must bind current plan and evidence digests before Finish becomes available.

## Handoff and stops

Structural entry set: T-1 only. This is not execution permission.
Proceed through machine handouts after the owner's Start receipt.
Stop for failed checks, insufficient context, source drift or a required backend change.
Record implementation observations in `execution-log.md` and canonical task evidence.
Preserve unrelated user edits and the approved deck.
