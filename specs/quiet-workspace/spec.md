# Frontend requirements

These requirements implement the approved deck. They propose no new product behavior.

## FR-1

Both existing browser surfaces MUST use the approved Quiet Workspace hierarchy, system typography, neutral surfaces and prominent primary actions.

Verification: targeted browser DOM tests and rendered fixture inspection.

## FR-2

The library MUST show the current workflow gate and the next eligible action without inventing readiness from task counts or historical stage labels.

Verification: targeted browser DOM tests and rendered fixture inspection.

## FR-3

Existing owner acts MUST retain separate handlers, server eligibility, revision checks, confirmations, focus feedback and truthful recovery states.

Verification: targeted browser DOM tests and rendered fixture inspection.

## FR-4

The existing Feedback tab MUST place selected source and discussion together and retain separate Save, Submit, Resolve and Reattach actions with draft and conflict recovery.

Verification: targeted browser DOM tests and rendered fixture inspection.

## FR-5

The existing interview room MUST retain two panes, choice and free-text input, unknown answers, Back, Submit and keyboard behavior with the same clear hierarchy.

Verification: targeted browser DOM tests and rendered fixture inspection.

## FR-6

The UI MUST retain light and dark preference, visible keyboard focus, usable primary targets, responsive scrolling and access to all existing secondary content.

Verification: targeted browser DOM tests and rendered fixture inspection.

## FR-7

Verification MUST prove the change remains frontend-only and preserves contracts, repository gates and current knowledge documentation.

Verification: source diff and full repository gates.

## Constraints

CON-1: Use only existing screens, routes, UI data and actions.
CON-2: Do not change servers, APIs, backend logic, core logic, models, schemas or dependency declarations.
CON-3: Preserve approved and closed packs. Never perform their real owner actions during UI tests.
CON-4: Preserve the approved deck bytes. Implementations can adapt responsive composition without adding a screen or capability.

## State coverage

| Existing state                    | Visible result                               | Supported action                             |
| --------------------------------- | -------------------------------------------- | -------------------------------------------- |
| Plan incomplete                   | Specific missing plan information            | Read existing documents                      |
| Open or unknown question          | Question and recorded answer state           | Answer, unknown, separate spec approval      |
| Proposed decision                 | Rationale and decision status                | Accept or reveal rejection reason            |
| Start eligible                    | Current gate and full task plan              | Start implementation                         |
| Task active or blocked            | Existing task state and check evidence       | Inspect evidence                             |
| Review pending or ready to finish | Current review state                         | Inspect review, separate Finish confirmation |
| Delivered or archived             | Complete or read-only status                 | Inspect record                               |
| Draft or submitted feedback       | Scope, source, draft and thread state        | Save, separate Submit, per-thread Resolve    |
| Stale anchor                      | Original anchor and current selection        | Explicit Reattach, separate Submit           |
| Revision conflict                 | Retained input and precise recovery text     | Refresh and deliberate retry                 |
| Audit pending                     | Receipt recorded and audit outstanding       | Read or refresh after recovery               |
| Workflow unavailable              | Owner actions unavailable                    | Refresh spec                                 |
| No session or sealed round        | Existing empty or read-only feedback message | Refresh or ask agent outside browser         |
| Interview choice or free text     | One question beside dossier                  | Existing options, Back, unknown and Submit   |

## Acceptance limits

No analytics are added to this local tool. No performance claim substitutes for a measurement.
Accessibility checks must distinguish automated coverage from manual checks and unverified WCAG criteria.
Final evidence must describe desktop, narrow layout, both themes, keyboard paths and recovery states.
