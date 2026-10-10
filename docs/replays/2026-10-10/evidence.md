# Repository replay: 2026-10-10

This record supports `index.html`. It describes the repository at
`b4dd870` on `main`. It does not approve a new product decision.

## Surface contract

| Field | Contract |
| --- | --- |
| Target user | The repository owner and an engineer who needs an accurate introduction. |
| Primary job | Review the current system and identify gaps. |
| Primary action | Advance through the HTML slides. |
| Expected result | Understand the two planes, packages, workflow, trust limits, and observed gaps. |
| Next action | Select a bounded follow-up from the final slide. |
| First screen | The thesis, date, source revision, and slide controls. |
| Product proof | Source references on each slide and results from checks run in this session. |
| Read/write consequence | Navigation changes the local URL fragment. The deck does not change repository or application data. |
| Critical states | Content, first-run, disabled controls, long content, keyboard access, high zoom, reduced motion, and offline. |
| Responsive behavior | Columns collapse below 900 CSS pixels. Text and controls reflow below 600 CSS pixels. No minimum width is declared. |
| Accessibility | Native buttons and select; visible focus; inactive slides hidden; a live slide count; no motion. |
| Measurement event | Local `replay:slide` event. No telemetry or persistent storage. |

Risk tier: explore. Genre: informational slide deck.
Aesthetic reference: Notion editorial typography, with warm paper, ink, and a restrained orange accent.
Design handoff: no `[design]` section configured. The repository and user-profile layout files are absent.
XD genre routing: skipped (experience-design pack absent).
No reusable `graphify-out/graph.json` exists. The graphify Python module is absent.
This replay uses the current wiki, deterministic file searches, manifests, and source reads.
No graph was generated. Code indexing remains delegated, as AGENTS.md requires.
The active harness skill takes precedence over the installed Python-era build-kb copy for runtime commands.
The writer skill supplies plain technical prose. Technical paths and format names retain their exact spelling.
This record makes no claim of full ASD-STE100 dictionary conformance.

## Semantic token seed

```css
:root {
  --ds-color-surface: var(--paper);
  --ds-color-surface-alt: var(--paper-dark);
  --ds-color-on-surface: var(--ink);
  --ds-color-on-surface-2: var(--muted);
  --ds-color-primary: var(--rust);
  --ds-color-on-primary: var(--white);
  --ds-color-outline: var(--line);
  --ds-color-error: var(--red);
}
```

## State coverage

| State | Treatment |
| --- | --- |
| content and first-run | All content is embedded. The first slide explains the replay. |
| disabled | Previous is disabled on slide 1. Next is disabled on the final slide. |
| success | The slide count announces navigation. |
| long-content | Sources use native disclosure. All-slides mode supports continuous reading. |
| offline | The HTML has no network dependency. Local source links need the repository. |
| high-zoom | Reflow, vertical scroll, and wrapping controls. |
| reduced-motion | No animation or automatic advance. |
| keyboard-only | Native controls, arrow keys, Page Up, Page Down, Home, and End. |
| loading, empty, error, partial, no-results, blocked, large-data-set | No async data component, query, or external prerequisite exists. JavaScript absence leaves all slides readable. |
| permission/denied and destructive-confirmation | No authentication or destructive action exists. |

## Initial observations

- Wiki validation: 0 errors, 0 warnings, 38 informational entries.
- Wiki status: stale; 17 concepts; 19 anchors checked; 1 needs review; 0 pending findings.
- The broken source is `wiki/domain/pattern-anti-waterfall-loop.md:8`.
- `computeFingerprints()` selects only `.py` files at `treadle/packages/knowledge/src/fingerprints.ts:54`.
  TypeScript and Markdown source anchors therefore lack a stored fingerprint.
- `readFreshness()` compares Git HEAD at `treadle/packages/knowledge/src/stamp.ts:77`.
  It does not compare worktree content. A fresh stamp does not prove source or prose accuracy.
- All 4 current specpacks are complete and delivered. Their 29 tasks are marked done.
  This inventory does not re-verify their historical evidence.
- The corpus contains 44 case directories with inputs and 78 expected files.
  The TypeScript generator reproduced all 78 expected files with zero diff.

## Repository verification

| Command | Observed result |
| --- | --- |
| `pnpm check` | FAIL, exit 1. Types, lint, and formatting pass. Tests: 110 pass, 1 fail, 24 files. Duration: 4.82 seconds for Vitest. |
| `pnpm coverage` | FAIL, exit 1. The same test fails. Current coverage floors are unverified. |
| `pnpm corpus:check` | PASS, exit 0. Generator emits 78 golden files; committed corpus diff is zero. |
| `pnpm brand:check` | PASS, exit 0. The brand fence is clean. |

The failing test is `treadle/packages/cli/test/where.test.ts:180`.
It expects an open initiative and then expects `install-paths` among the open packs.
That initiative is delivered. No test or engine behavior was changed for this replay.

## Open questions

These questions are outputs of the review, not requests that block the deck.

1. What measured result will prove that a team benefits from the harness?
2. Who owns source indexing for a new installation, and what is the handoff contract?
3. Is the next surface scope still a trusted, single-user localhost tool?
4. When should execution receipts and attesters become executable capabilities?
5. Which license applies before publication?

## Wiki state after the source correction

The initial observations above describe the repository before this session's repair.
The only curated wiki change corrects source paths and the update date in
`wiki/domain/pattern-anti-waterfall-loop.md`. It does not change the rule.

The full closing ritual ran: fingerprints, stamp, anchors, validate, and status.
All commands exited 0. Status reports fresh, 17 concepts, 0 errors, 0 warnings,
19 anchors checked, 0 need review, and 0 pending findings.
The anchor report still lists 17 sources as untracked. The fingerprint scan
has no TypeScript or Markdown coverage. The final deck reports this limit.

## Frontend evidence manifest

| Field | Observed evidence |
| --- | --- |
| Routes | `index.html`, all 14 slides, sources, controls, and URL fragments. All 43 distinct source files exist. `sources.json` records their SHA-256 hashes. `browser-verification.json` preserves the browser results. |
| Viewports | Declared channels: `<600`, `>=600 <900`, `>=900`. Tested 320×800, 375×812, 768×1024, 1280×720, 1440×900, and 360×225. Supported minimum: none-declared. Discarded breakpoints: none. The 360×225 case approximates the reflow viewport of 400% desktop zoom. |
| Browsers | Chrome 151.0.7922.108. Other rendering engines were not tested. |
| States | Content, disabled controls, first-run, success announcements, long content, keyboard, reduced motion, high-zoom reflow, offline, and no-JavaScript fallback. |
| Screenshots | `screenshots/desktop-slide-1.png`, `desktop-slide-3.png`, `desktop-slide-10.png`, `desktop-slide-11.png`, and `mobile-slide-11.png`. |
| Inspection observations | Completed/pass for the inspected title, architecture, verification, and gap slides. Text is legible; the mobile gap slide stacks vertically; controls wrap; focus is visible. A package-name overflow at 320 pixels was corrected. |
| A11y result | html-validate 11.16.2: exit 0, no errors or warnings. axe-core: 0 violations on all 14 slides using `wcag2a`, `wcag2aa`, `wcag21a`, and `wcag21aa`. Target Size 2.5.8: control and disclosure rectangles exceed 24×24 CSS pixels; source text links use the inline-text exception. Focus Appearance 2.4.13: a visible 3-pixel ink outline was inspected; this is an AAA enhancement. These checks do not establish full WCAG 2.2 AA conformance. The stated gaps are 2.4.11, 2.5.7, 3.2.6, 3.3.7, and 3.3.8. |
| Perf result | The standalone HTML is about 46 KB. No fonts, framework, CDN, or image payloads are required by the deck. Field CWV, Lighthouse, INP, and p75 measurements were not collected. |
| Console/network result | No page or console errors. No failed requests. Browser requests were local `file:` URLs, with no third-party calls. |
| Analytics events | `replay:slide` is a local document event. Navigation updates the visible count and URL fragment. No telemetry or storage exists. |
| Known exceptions | Repository check and coverage fail the existing live-wave test. Local source links need this repository. A fresh wiki stamp has the source-coverage limits stated above. These are disclosed gaps, not new accepted product decisions. |
| Unverified items | Safari and Firefox; screen-reader behavior; actual browser zoom and OS text scaling; remote install; the CI platform matrix; current coverage floors; field performance. |
| Security/privacy review status | Not applicable at this explore tier. The standalone deck has no data input or outbound calls. This statement is not a review of the product servers. |
| Reliability/recovery status | Not applicable at this explore tier. Content remains readable without JavaScript. Fullscreen failure leaves the slide controls available. |

The browser verification exercised 84 slide-and-viewport combinations.
It checked previous and next, keyboard navigation, selection, deep links,
all-slides mode, source disclosure, fullscreen, print restoration,
no-JavaScript fallback, offline access, and reduced motion.
The print export uses one widescreen page per slide.

## Red-foreman review

The read-only reviewer initially returned `FIX BEFORE COMMIT`.
The reviewer requested the final wiki result beside the initial finding and a
current update date on the repaired wiki concept. Both changes were applied.
The final read-only review returned `PASS — nothing to fix`.
The reviewer checked the deck, this evidence record, the source snapshot,
and the wiki source-path correction. Sampled claims match the cited sources.
The reviewer independently re-ran wiki status: fresh, 0 errors, 0 warnings,
19 anchors checked, and 0 need review. No BLOCKER, DEFECT, or SMELL remains
in the replay artifacts. The existing repository test failure remains disclosed.

The desktop opener ran for `index.html` and exited 0.
