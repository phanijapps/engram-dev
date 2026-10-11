---
title: "Quiet Workspace approval interface"
type: Initiative
description: "Frontend presentation of existing owner gates, review feedback and interview controls."
status: stable
created: 2026-10-11
updated: 2026-10-11
sources:
  - {id: library, resource: treadle/packages/web/src/library.js}
  - {id: feedback, resource: treadle/packages/web/src/feedback.js}
  - {id: interview, resource: treadle/packages/web/src/page.js}
---

# Quiet Workspace

The approved design reduces visual noise in the existing library and interview.
System typography, shared light and dark colors, flat blue primary actions and
visible keyboard focus support a scannable current gate. Supporting information
uses native disclosures. Primary actions have a minimum height of 44 CSS pixels.
Sources: `treadle/packages/web/src/library.html:1`;
`treadle/packages/web/src/page.html:1`.

The library queue uses current workflow phases. Start and Finish stay separate
from question answers, decision acceptance and feedback submission. Feedback
source and discussion sit together on wide layouts; smaller layouts stack them.
Unsaved comments, refused writes and stale anchors retain explicit next actions.
Sources: `treadle/packages/web/src/library.js:1`;
`treadle/packages/web/src/feedback.js:1`.

The existing backend, routes, models, payloads and approval rules are unchanged.
The canonical implementation and owner closure state belong to
`specs/quiet-workspace/quiet-workspace.json`; this page is not a task ledger.
The approved design and plan are in `specs/quiet-workspace/design.md` and
`specs/quiet-workspace/plan.md`.

# Verification and limits

`specs/quiet-workspace/frontend-evidence.json` records actual disposable browser
fixtures, inspected screenshots, accessibility results and command outcomes.
Synthetic fixture receipts demonstrate rendering only; they do not establish
human approval. Focus, primary action size, responsive layout, retained drafts
and the separate Finish confirmation have browser observations.
Sources: `treadle/packages/web/test/approval-ux.test.ts:1`;
`treadle/packages/web/test/approval-feedback-ux.test.ts:1`.

Rendered HTML validation and the automated accessibility subset do not establish
full WCAG 2.2 AA conformance. Screen-reader interaction and browser performance
metrics remain unverified. Browser zoom rendering is recorded separately from
CSS viewport checks. Reduced-motion styles suppress optional transitions, but
active environment emulation was unavailable. The wiki fingerprint scanner
covers Python only and its freshness stamp compares Git HEAD, so it does not
prove that dirty TypeScript or Markdown was detected.
Source: `specs/quiet-workspace/frontend-evidence.json`.
