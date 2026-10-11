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
