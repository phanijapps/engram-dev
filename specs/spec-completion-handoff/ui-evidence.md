# Browser evidence for the owner workflow

This is a retrofit of the local spec library at pilot tier.
The existing Alexandria light and dark tokens provide the design reference.
Design handoff: no layout configuration exists in the repository or user profile.
The experience-design pack is absent. The approved owner-flow.md supplies the journey.

| Field | Observed result |
| --- | --- |
| routes | Seeded local library, path /; p is a disposable fixture. No live owner acts occurred. |
| viewports | Declared breakpoint channels: <601, >=601 <901, >=901. Captures at 600, 601 and 901 CSS pixels; heights 600 and 900. No minimum declared; no breakpoints discarded. Reflow also checked at 320. |
| browsers | Headless Chromium through Playwright 1.57.0. Other engines not tested. |
| states | Loading, content, partial, error, disabled, success, keyboard-only, reduced-motion, high-zoom reflow, first-run, blocked and destructive-confirmation. DOM tests exercise stale writes and retry. Permission denial appears as an error. |
| screenshots | Twelve captures in ui-captures; the five required metadata fields are in ui-browser-results.json. |
| inspection observations | completed / pass. All twelve captures were viewed. The owner control remains readable at rest. The phase list remains readable after scrolling. A sticky list covered the phase labels at 601 pixels; removing sticky positioning in the two-column layout fixed it. Captures wait for document loading and two animation frames. No unresolved occlusion or top clipping was seen. |
| a11y result | axe-core: zero WCAG 2.0 and 2.1 A/AA violations in light and dark themes. Target Size 2.5.8: owner controls have at least 32px CSS height; the Start button measures 178.25 by 34.5px. Focus Appearance 2.4.13 AAA enhancement: a 3px primary outline; keyboard Start returns focus to the updated heading. Primary outline contrast against the local surfaces exceeds 3:1 in both themes. This is not a complete WCAG 2.2 AA audit. The remaining AA gap is 2.4.11, 2.5.7, 3.2.6, 3.3.7 and 3.3.8. |
| perf result | Existing local assets retained; no new runtime dependency. Field CWV and Lighthouse not measured. |
| console/network result | No page errors. Recorded requests are local library routes and assets. No third-party calls. |
| analytics events | The disposable fixture records the keyboard Start act in the pack and workflow journal. No remote analytics. |
| known exceptions | No accepted exceptions added. Existing legacy inspector labels remain unchanged. |
| unverified items | Screen-reader speech, Firefox, Safari, field performance, exhaustive large-data and offline behavior were not tested. Native roles, live messages, focus return and error retry were checked. |
| security/privacy review status | Not applicable at this tier; existing localhost and origin checks remain covered by server tests. |
| reliability/recovery status | Not applicable at this tier; stale writes and recoverable audit failures are covered by server tests. |

The brownfield inspection found existing tokens and no second theme system.
The changes use those tokens. Two existing accessibility faults beside the new
controls were fixed: label contrast and focus on scrollable documents.
The owner panel explains each wait state. Missing approval data hides owner actions.
The static HTML passes html-validate 11.16.2 with standard and a11y presets.
The behavioral proof is workflow-ui.test.ts and the browser result file.
Use ui-fixture.mts with tsx to start a fresh disposable library.
verify-ui.cjs takes its URL and requires PLAYWRIGHT_MODULE, CHROMIUM_PATH and AXE_SCRIPT.
