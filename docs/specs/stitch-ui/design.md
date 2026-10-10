# Design — the Stitch UI incorporation

**Wave:** stitch-ui · **Ground:** research.md A1–A5, the R1-amended spec (rev 18), the three Stitch artifacts (DES-1..3).

## Approach

A reskin with three additions, not a rewrite: a token layer (two themes, one source of truth), one read route (`/alignment/<name>`), and the inspector pane. The pages stay the portable vanilla-JS assets they are — no frameworks, no build step, no webfonts. Every act still admits through the event seam; nothing engine-side moves.

## The design cards

### DES-4 — The token layer
One `<style>` block of CSS custom properties per page, two theme scopes:

```css
:root, [data-theme="light"] { --bg:#faf9fa; --surface-1:#f5f3f4; --surface-2:#efedee;
  --surface-3:#e9e8e9; --surface-4:#e3e2e3; --ink:#1b1c1d; --ink-2:#434653;
  --primary:#094cb2; --primary-c:#3366cc; --tertiary:#6d5e00;
  --ghost:rgba(195,198,213,.15); --voice-serif:Georgia,'Iowan Old Style',serif;
  --voice-body:system-ui,sans-serif; --voice-mono:ui-monospace,Menlo,monospace; }
[data-theme="dark"] { --bg:#0b0f14; --surface-1:#11161f; --surface-2:#161d27;
  --surface-3:#1e2836; --surface-4:#263447; --ink:#e2e8f0; --ink-2:#94a3b8;
  --primary:#38bdf8; --primary-c:#0ea5e9; --tertiary:#dcc661; --ghost:rgba(148,163,184,.15); }
```

- **Canonical values only** (FR-1's table; decision-studio light, library-review dark).
- **No-flash:** an inline script in `<head>` sets `document.documentElement.dataset.theme` from `localStorage['theme']` before the stylesheet renders; default light.
- **The no-line rule:** structural separation via surface steps only; `--ghost` where an edge is unavoidable; primary CTAs carry the `linear-gradient(135deg, var(--primary), var(--primary-c))`.
- **The toggle:** one control per surface (header icon), persists to the same key both surfaces read.

### DES-5 — The alignment route
`GET /alignment/<name>` — the web server loads the pack through `@treadle/core`, runs `alignment(doc)`, and serves `{ violations, gapCount, sentence }`. Read-only, `no-store`, 404 for ghosts, 400-JSON on a pack that will not load — the same refusal posture as every route. The corpus and core are untouched; this is surface reads composing what core already exports.

### DES-6 — The phase inspector
A third pane (`<aside id="inspector">`), collapsible, 320px, rendered from the already-fetched `/spec` — no new fetches:

| Phase | Maps to | State derivation (FR-4, exact) |
|---|---|---|
| 01 Blueprint Intake | overview tab | `open === 0 ? "completed" : open + " open"` from `spec.clarifications` |
| 02 Canonical Spec | spec tab | `date.approved ? "anchored" : "shaping"` |
| 03 Design Synthesis | design tab | `(decisions?.length ?? designs?.length) ? "synthesized · N" : "not yet"` |
| 04 Assembly | tasks tab | `done + " of " + total + " woven"` from `tasks[].status` |
| 05 Conformance Gate | review tab | `verdicts?.length || stage === "in_review" ? "inspecting" : stage === "delivered" ? "sealed" : "unlit"` |

Click = `location.hash = '#/<name>/<tab>'` (the existing router); the pane holds zero admission controls. Serif phase numerals, mono states.

### DES-7 — Review telemetry + the gate panel
Inside the inspector's conformance phase: findings counted by severity from `review.verdicts[].findings[]` (`BLOCKER/DEFECT/SMELL` chips), the reviewer's claim from `verdict.by` (never hardcoded), a severity filter (client-side, ships per FR-3), and the alignment panel fed by DES-5. Posture note rendered in the panel: *"refreshes on interaction — no live socket in v1"* — honesty in the UI, per AC-6.

### DES-8 — The room in the same dress
`page.html` adopts the same token block and voice stack; the wizard DOM contract is untouched (question card, options, textarea, honest unknown, approve card). The gradient CTA is the approve action; Enter keeps its submit role. Route parity re-asserted by the existing tests.

## Test architecture (T-0's harness)

- `// @vitest-environment jsdom` per-file pragmas on new page tests; `happy-dom`-free (jsdom only, one dependency).
- Pages load their real JS (`<script>` evaluation against the served fixtures); tests dispatch clicks/keys, read `localStorage`, assert DOM.
- `servers.test.ts` gains the headers assertion (all five `SECURITY_HEADERS` on `/` and assets).
- The portability test stays the brand gate; the corpus stays untouched (no engine change — `pnpm corpus:check` must stay green with zero diff, proven per task).

## What this design does not do

No live sockets, no inspector actions, no webfonts, no factory pipeline, no engine change of any kind — each recorded in the pack's `out_of_scope` and DEBT lineage.
