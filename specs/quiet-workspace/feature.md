# Analysis: apply the approved frontend design

## Purpose and evidence

This feature analysis bounds the implementation of the approved 23-state deck.
Source HEAD: `2d22941c84a1362f5572e461753e29813386aadd`. Observed source hashes are in `authoring/source-pins.json`.
Existing application source files match this HEAD. The deck and planning files are untracked.
The existing dirty `wiki/.okf/last-index.json` must remain separate from the UI change.

| Claim                                                                   | Evidence status          | Observed source                                                         |
| ----------------------------------------------------------------------- | ------------------------ | ----------------------------------------------------------------------- |
| All required actions already exist.                                     | implementation-supported | `library.js:503`, `library.js:631`, `feedback.js:465`, `page.js:294`    |
| Gate eligibility and revision guards come from existing responses.      | implementation-supported | `library.js:643`, `library.js:644`, `library.js:677`, `feedback.js:124` |
| Current typography and decorative styles differ from the approved deck. | implementation-supported | `library.html:22`, `page.html:18`, skin and theme tests                 |
| The change needs no backend or model changes.                           | implementation-supported | Each deck control maps to an existing browser handler.                  |
| The owner selects Quiet Workspace and the frontend-only boundary.       | declared                 | `owner-inputs.md`                                                       |
| Exact spacing and responsive composition improve speed.                 | inferred                 | Approved design; verify in real browser fixtures.                       |

## Impact and boundaries

The affected runtime files are `library.html`, `library.js`, `page.html`, `page.js` and `feedback.js`.
Servers deliver these existing assets. No server implementation or endpoint needs a change.
The upstream providers remain the existing spec, workflow, alignment and feedback responses.
The downstream consumers remain the current event handlers and browser rendering paths.
There are no changed REST contracts, events, database entities or storage formats.
The existing shared `theme` preference remains unchanged.

Skin tests encode serif typography, gradients and specific old palette values.
Replace those visual expectations with the approved system style.
Retain theme persistence, keyboard behavior, owner authority, revision checks and security expectations.
Add interaction regression cases when structure changes affect focus or action reachability.

## Knowledge and uncertainty

The wiki status command reports fresh, 45 concepts, 0 errors, 0 warnings and 0 review anchors.
Freshness uses HEAD and Python fingerprints. It does not prove dirty TypeScript or Markdown freshness.
Direct source hashes support this analysis.

The deck shows illustrative data and static light concepts. It does not establish live browser accessibility or responsiveness.
Implementation verification must inspect rendered pages and exercise existing handlers in disposable fixtures.
It must not perform owner actions on the real initiative or change closed records.

## Questions, assumptions and handoff

There are no unresolved human spec questions. The owner already selected the design and scope.
A-1: existing responses contain enough data for all displayed state. Validate with fixtures before claiming completion.
If missing data requires a new field or endpoint, stop that slice and report it to the owner.
Do not weaken the frontend-only boundary to match an illustration.

Ready for planning: shared styles, library gate hierarchy, feedback and room composition, final verification and documentation.
Exact task admission still needs the plan's separate Start receipt.
