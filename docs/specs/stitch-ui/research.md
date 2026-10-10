# Research — the Stitch UI incorporation

**Wave:** stitch-ui · **Opened:** 2026-10-10 · **First spec of the post-retirement era**
**Commission:** incorporate the "Interactive Spec Harness UI" designs (Google Stitch, project 10538831468902869999) over the current room + library. The owner likes the color scheme and direction.
**Rigor bar (owner's words):** ≥5 rounds of analysis, ≥5 rounds of red-forman, then a spec.
**Method:** the designs are pulled LIVE from Stitch via MCP into `designs/` — the analysis grounds in the actual artifacts, not memory.

## Round plan (tracked here, each round dated and closed)

| # | Round | Status |
|---|---|---|
| A1 | Design system extraction (DESIGN.md, named colors, typography) | ✓ done below |
| A2 | The screens inventoried (layouts, components, interactions) | ✓ done below |
| A3 | Gap mapping vs the current pages (tokens, layout, behavior) | ✓ done below |
| A4 | Interaction model: what the new screens imply for admission/seams | ✓ done |
| A5 | Spec synthesis: stories, FRs, decisions for the interview | ✓ done (pack rev 18, owner-approved in the room) |
| R1 | red-forman on the spec | ✓ done — build-after-fixes; 4 BLOCKER + 5 DEFECT + 4 SMELL amended into the pack (alignment route named, derivation table pinned, T-0 DOM harness, canonical token table, brand scrub, Ctrl-C rescoped, real fixture counts 2/7/2, grammar adopted, DES-1..3 registered) |
| R2–R5 | red-forman on the design doc, task slices, and implementation diffs | queued |

## A1 — The design system: "Alexandria — High-End Editorial"

Extracted from the Stitch project's DESIGN.md and namedColors (verified live):

- **North star:** "The Digital Curator" — scholarly, premium reading; dense information made effortless through serif authority and generous whitespace.
- **Typography:** headlines **Noto Serif** (large, authoritative), body **Inter**, labels **Public Sans** (archival metadata feel).
- **Color (light, the owner's pick):** primary `#094cb2` (links/primary actions/focus ONLY), primary_container `#3366cc`, tertiary gold `#6d5e00` (highlights, badges), surfaces `#faf9fa → #e3e2e3` tiered.
- **The rules that shape everything:**
  - **No-Line Rule** — never 1px borders; boundaries via surface shifts.
  - **Ghost Border** when needed — `outline_variant` at 15% opacity.
  - **Glassmorphism** for floating menus (80% opacity + 20px backdrop-blur).
  - Gradient CTAs `primary → primary_container`.
  - Depth via **tonal layering**, not shadows; modals get extra-diffused tinted shadows.
  - Serif for narrative, one primary action per view, minimum `sm` roundness.
- The generated HTML confirms fidelity: warm paper `#FAF9F6` bases, slate ink `#0F172A`, serif headline classes, and — a wrinkle — the screens also use classic Tailwind slate borders (`#CBD5E1`) where DESIGN.md says no-lines: the designs drift from their own system in places; the spec must pick the rule, not the drift.

## A2 — The screens (3 of 4 HTML artifacts pulled; factory-pipeline 404s server-side — its theme is covered by the shared system; re-pull next round)

| Screen | File | What it proposes |
|---|---|---|
| **Spec Library + Phase Inspector** | `designs/library-inspector.html` (44KB, 340 classed elements) | The library 2.0: left spec list (warm paper, serif titles), main dossier, and a **right-hand phase inspector** — a third pane the current library lacks. Status chips in emerald mono (`text-[11px] font-mono`), ghost-bordered cards (R1: the breadcrumb claim was mine, not the artifact's). |
| **Spec Library — Review Phase** | `designs/library-review.html` (33KB) | A **dark variant** (obsidian stack `#0b0f14/#11161f/#161d27`, accent `#38bdf8` — corrected in R1; earlier citation was wrong) — evidence rows, verdict panels, review-focused layout. The same library in review posture: the theme question (light editorial vs dark telemetry) is a real decision for the spec. |
| **Spec Decision Studio** | `designs/decision-studio.html` (34KB) | The interview room 2.0: Alexandria tokens exact (`#faf9fa` bg, `#002f7a` deep blue, surface containers) — decision cards with accept/reject posture, question flows, the ceremony as a *studio* rather than a wizard. |
| **Factory — Assembly Pipeline** | (HTML unavailable; screenshot seen) | The loop as a factory line: pipeline stages, assembly + review stations. Ambition marker for the journey-strip successor — likely the v2 "workflow" view. |

## A3 — Gap mapping vs the current pages

| Dimension | Current (page.js/library.js) | Stitch direction | Gap |
|---|---|---|---|
| Tokens | ad-hoc CSS vars, dark-only (`--bg:#101418`) | Alexandria system, light editorial (+ dark review variant) | full token layer rebuild; light-first per owner |
| Typography | system-ui stack | Noto Serif / Inter / Public Sans | webfonts (vendored — no CDN rule holds) |
| Layout (library) | 2-pane (list + tabs) | 3-pane with **phase inspector** | new pane; inspector = per-phase deep view (tasks/evidence for the selected phase) |
| Layout (room) | wizard, single column | **studio**: decisions + questions as cards, accept/reject posture | interaction redesign, same admission seam |
| Components | chips, journey strip, cards | serif cards, ghost borders, glass menus, gradient CTAs, mono status chips | component rebuild inside existing DOM contracts |
| Behavior | hash routes, seam events | same needs + inspector state | extend, not replace — the seam contract (events only, engine-name-free) is frozen and non-negotiable |

**Constraints carried (non-negotiable):** the pages stay portable (grep-clean, no engine names), admission only through `specweb-events`, keyboard AND pointer complete, CSP-pinned, no CDN (fonts vendored), localhost-only.

## Open questions for A4/A5 (the next rounds)

1. Light editorial (Alexandria) as THE theme, with the dark review variant as a mode — or per-surface themes?
2. The phase inspector: which phase states does it show, and does it stay read-only v1?
3. Decision Studio: does the room's wizard contract (Q by Q, Enter submits) survive inside a card-studio layout, or does the studio reshape the ceremony itself?
4. Webfonts: Noto Serif + Inter + Public Sans vendored (~300KB) — acceptable for a localhost tool?
5. Does the Factory pipeline screen become the journey-strip successor now, or stay aspiration?

## Handoff

A4 next: interaction model. Then A5: the spec synthesis — born into this folder through the machine, questions asked in the room once it exists.

---

## Owner directive (2026-10-10, mid-round)

> "I want you to be inspired from library-inspector."

The light editorial 3-pane library is THE primary direction (this answers
Open Question 1: Alexandria light is the theme; the dark review variant
becomes at most a mode, not the identity).

## A4 — The interaction model, read out of library-inspector (✓ done)

Deep-read of `designs/library-inspector.html` found the design populated
with THIS harness's real data — the phases, the findings, the review
state. The screen encodes a complete interaction model:

1. **Three panes:** spec list (340px rail) / dossier / **phase
   inspector** (the new third pane). The inspector is the stage
   vocabulary made visible as a journey: `01. Blueprint Intake →
   02. Canonical Spec → 03. UI/UX Archetype → 04. Assembly Tasks →
   05. Conformance Gate`, each with a state (Completed / Anchored /
   Synthesized / "6 tasks woven" / Currently Inspecting) and a `view`
   affordance — clicking a phase focuses the dossier on that phase's
   content. **Mapping to the frozen stages is presentation** (like the
   words layer): the five phases are views over
   drafted/planning→in_progress→in_review→delivered; no engine stages
   are added or renamed.
2. **Review telemetry, live:** "Review Socket: Live", "Total Findings:
   10 (2 Blocker, 6 Defect, 2 Smell)", "Markdown wrap: active" — the
   inspector surfaces `review.verdicts` and findings by severity in
   real time. Implication: a review-state fetch (poll or socket) joins
   the seam's read model; v1 = poll on refresh, honest about it.
3. **Gate Conformance State panel:** the conformance gate phase carries
   a check-state panel (violations/gaps) — `do check`'s alignment
   report rendered as a first-class citizen.
4. **Component grammar confirmed:** serif card titles, mono status
   chips (11px, emerald for healthy), ghost-bordered cards, warm-paper
   surfaces `#FAF9F6/#F5F2EA`, slate ink — and the known drift (some
   1px slate borders) that the spec will resolve IN FAVOR of the
   no-line rule.
5. **The room inherits the same grammar** (Decision Studio) — one
   system, two surfaces; the wizard contract (Q-by-Q, Enter submits,
   approve-at-end) must survive inside the card layout unchanged
   (A5's stance: the seam contract is frozen; only the skin changes).

**A4 closes with a decision-input, not a question:** the inspector ships
in v1 as read-only phase navigation + review telemetry + conformance
panel. Actions stay in the dossier (answer/approve) — one primary action
per view, per Alexandria's own rule.
