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
  --error:#ba1a1a; --error-bg:#ffdad6;            /* decision-studio, verbatim */
  --pass:#15803d; --warn:#b45309; --smell:#6d28d9; /* declared derived shades (R2) */
  --focus:rgba(9,76,178,.35); --ghost:rgba(195,198,213,.15);
  --voice-serif:Georgia,'Iowan Old Style',serif;
  --voice-body:system-ui,sans-serif; --voice-mono:ui-monospace,Menlo,monospace; }
[data-theme="dark"] { --bg:#0b0f14; --surface-1:#11161f; --surface-2:#161d27;
  --surface-3:#1e2836; --surface-4:#232d3d; --ink:#e2e8f0; --ink-2:#94a3b8;
  --primary:#38bdf8; --primary-c:#0284c7; --tertiary:#f9e37a;  /* surface-4 verbatim; primary-c/tertiary declared derived */
  --error:#f87171; --error-bg:#3a1a20; --pass:#10b981; --warn:#f59e0b; --smell:#a855f7;
  --focus:rgba(56,189,248,.40); --ghost:rgba(148,163,184,.15); }
```

- **Canonical values only** (FR-1's table; decision-studio light, library-review dark). State roles (error/pass/warn/smell, focus rings) are pinned per R2: light error verbatim from decision-studio, dark severity verbatim from library-review's badges; light pass/warn/smell and dark primary-c/tertiary are DECLARED DERIVED SHADES — named in FR-1, not invented by implementers.
- **No-flash:** an inline script in `<head>` sets `document.documentElement.dataset.theme` from `localStorage['theme']` before the stylesheet renders; default light.
- **The no-line rule:** structural separation via surface steps only; `--ghost` where an edge is unavoidable; primary CTAs carry the `linear-gradient(135deg, var(--primary), var(--primary-c))`. **Markdown tables are the carve-out**: rendered table edges are ghost borders or surface stripes — exempt from the no-line assertion (briefs carry tables; legibility wins).
- **The toggle:** one control per surface (header icon), persists to the same key both surfaces read.

### DES-5 — The alignment route
`GET /alignment/<name>` — the web server loads the pack through `@treadle/core`, unwraps `alignment(doc).value`, computes `gapCount(value)`, and serves `{ violations, gapCount, sentence }` where **sentence is pinned exactly**: `` `alignment: ${violations.length} violation(s), ${gapCount} gap(s) — gaps are reported, never guessed` `` — composed only from the two exported functions, no invented wording. Read-only, `no-store`, 404 for ghosts, 400-JSON on a pack that will not load — the same refusal posture as every route. The corpus and core are untouched; this is surface reads composing what core already exports.

### DES-6 — The phase inspector
A third pane (`<aside id="inspector">`), collapsible, 320px, rendered from the already-fetched `/spec` — no new fetches for the five phase rows (the gate panel's alignment fetch is DES-7's, and is expected):

| Phase | Maps to | State derivation (FR-4, exact) |
|---|---|---|
| 01 Blueprint Intake | overview tab | `open === 0 ? "completed" : open + " open"` from `spec.clarifications` |
| 02 Canonical Spec | spec tab | `date.approved ? "anchored" : "shaping"` |
| 03 Design Synthesis | design tab | `(decisions?.length || designs?.length) ? "synthesized · N" : "not yet"` (`||`: present-but-empty decisions must fall through to designs) |
| 04 Assembly | tasks tab | `done + " of " + total + " woven"` from `tasks[].status` |
| 05 Conformance Gate | review tab | `verdicts?.length || status?.deliverable === 'in_review' ? "inspecting" : status?.deliverable === 'delivered' ? "sealed" : "unlit"` (the `/spec` payload field is `status.deliverable`, not a `stage`) |

Click = `location.hash = '#/<name>/<tab>'` (the existing router); the pane holds zero admission controls. Serif phase numerals, mono states.

### DES-7 — Review telemetry + the gate panel
Inside the inspector's conformance phase: findings counted by severity from `review.verdicts[].findings[]` (`BLOCKER/DEFECT/SMELL` chips), the reviewer's claim from `verdict.by` (never hardcoded), a severity filter (client-side, ships per FR-3), and the alignment panel fed by DES-5. Refresh triggers named (R2): spec re-select, gate panel open, window focus — the refetch moments. Posture note rendered in the panel: *"refreshes on interaction — no live socket in v1"* — honesty in the UI, per AC-6.

### DES-8 — The room in the same dress
`page.html` adopts the same token block and voice stack; the wizard DOM contract is untouched (question card, options, textarea, honest unknown, approve card). The gradient CTA is the approve action; Enter keeps its submit role. Route parity re-asserted by the existing tests.

## Test architecture (T-0's harness)

- `// @vitest-environment jsdom` per-file pragmas on new page tests; **jsdom installed in root devDependencies** (T-0's first act — it is not currently a dependency).
- Pages load their real JS (classic scripts, `runScripts:'dangerously'`); **jsdom ships no fetch** — the harness injects a `window.fetch` shim rebasing relative URLs against the live server URL; **persistence = write→read-back plus a seeded fresh DOM** (jsdom reload is not implemented).
- `servers.test.ts` gains the headers assertion (all five `SECURITY_HEADERS` on `/` and assets).
- The portability test stays the brand gate; the corpus stays untouched (no engine change — `pnpm corpus:check` must stay green with zero diff, proven per task).

## What this design does not do

No live sockets, no inspector actions, no webfonts, no factory pipeline, no engine change of any kind — each recorded in the pack's `out_of_scope` and DEBT lineage.
