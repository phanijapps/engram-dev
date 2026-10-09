# Design — the spec library

**Wave:** spec-library · **Approved spec:** rev 12 → decisions accepted same day · **Ground:** research.md, interview.md (10/10 answered in the room)

## Approach

A second page joins the room. The interview page stays what it is — the born-spec ceremony. The **library** is the standing surface: every pack, past and current, readable and actionable. One new server (`loom library`), one new page, one vendored dependency, zero engine changes. The vocabulary stays frozen; the page translates.

## The design cards

### DES-1 — A page of its own
`web/library.html` + `web/library.js` + `web/marked.min.js`, served by `loom library [specs-dir]` (default `docs/specs`) on 127.0.0.1:8788. The interview room (8765) is untouched. Grep-clean of engine names; events only at the seam (CON-3).

### DES-2 — The endpoints (all JSON, all stateless per D-6)
| Route | Serves |
|---|---|
| `GET /` | the library page |
| `GET /app.js` · `GET /marked.min.js` | the vendored assets |
| `GET /specs` | every folder: loadable packs (name, title, stage, revision, counts, open questions, updated) + legacy folders (name, .md files), fail-soft per folder (D-5) |
| `GET /spec/<name>` | the canonical emitted pack |
| `GET /artifact/<name>/<file>` | a `.md` file from that spec's folder — `text/markdown`; path-guarded (no traversal, `.md` only) |
| `POST /event/<name>` | admission: `answer` / `unknown` / `choice` / `approve` — the same machine rules and 400-JSON refusals as the room (D-4) |

### DES-3 — The pane (Q-2: needs you first)
Three groups, counted: **Waiting on you** (stage `awaiting_owner`, or any open question), **Moving** (planning, in_progress, in_review, blocked), **Done** (delivered). Free-text search over name + title + description. Group order fixed; within a group, most recently updated first.

### DES-4 — The detail (Q-7, Q-8)
Hash router: `#/<name>/<tab>` — deep-linkable (D-3), no server routing. Five tabs:
- **Overview** — title, stage chip, journey strip (DES-6), plain dates, every discovered `.md` document rendered as markdown (Q-7: every document), friendly empty states elsewhere (Q-8).
- **Spec** — stories with given/when/then acceptance; requirements each showing its covering tasks; questions with honest statuses — open ones get the answer UI (DES-7).
- **Design** — approach, stack, decisions with status, because, and who accepted.
- **Tasks** — status, phase, verify command + expectation, evidence receipts (cmd, exit, at, by).
- **Review** — verdicts with severity badges.

Markdown posture: the files come from the repo's own spec folders — trusted on-disk input, owner-authored; raw HTML in markdown is permitted and documented in the adapter contract. Rendering is client-side via vendored marked (D-1).

**Traceability (FR-9):** every ID token (`US-|AC-|FR-|CON-|Q-|D-|DES-|T-`\d+) rendered anywhere becomes a jump-link to its card; the target card flashes. Requirements show "covered by T-1, T-2" computed from `satisfies`.

### DES-5 — The words layer (Q-3, Q-10)
| Engine | Screen | Tooltip (the engineers' on-ramp) |
|---|---|---|
| awaiting_owner | Waiting on you | awaiting_owner |
| planning | Being shaped | planning |
| in_progress | In progress | in_progress |
| blocked | Stuck — needs attention | blocked |
| in_review | In review | in_review |
| delivered | Done | delivered |
| drafted | Just started | drafted |

Plain dates ("today", "3 days ago", "on Oct 3"); the ISO stamp rides in the tooltip. Legacy folders list read-only (Q-9): their `.md` files render; no admission buttons ever.

### DES-6 — The journey strip (Q-5: the chosen extra)
Five lit nodes on a path — **Just started → Being shaped → In progress → In review → Done** — with two flags that can rise above any node: **Waiting on you** (awaiting_owner) and **Stuck** (blocked). The mapping is presentation, not vocabulary: the seven engine stages stay what they are (D-2); the strip draws the journey a PO can read. Each node's tooltip carries the engine terms it covers. The current position pulses; done nodes stay lit.

### DES-7 — Acting in place (Q-1: look + answer + approve; D-4)
Open question cards (Spec tab) get the act UI:
- **choice** — option buttons (the default preselected, AC-13's pattern) + submit; custom text is refused by the machine, so the UI offers options only.
- **open** — a textarea + **I don't know** (the honest amber unknown).
Admission posts to `/event/<name>`; the 400-JSON refusal message shows inline, verbatim. On success: re-fetch, re-render (D-6 — one refresh deep, no cache).

**Approve** appears on Overview and Spec when it is legal (no open questions, not approved, the pack still mutable) — one click, one inline confirm ("This freezes nothing — it approves the spec"), the event lands with claim and timestamp, the stage releases from Waiting on you. The room's block-until-approved interrupt stays the interview's; the library never blocks.

## What this design does not do

Editing tasks or decisions from the page (out of scope, v1), multi-repo roots, auth, revision diffs. The adapter contract gains the library's read model + the two acts.

## Task flow (firmed)

T-1 markdown pipeline (vendor + artifact route + guards) → T-2 `/specs` fail-soft + legacy (server skeleton lands here) → T-3 page shell: pane, tabs, router, traceability → T-4 words layer → T-5 the acts → T-6 the strip → T-7 contract, red-forman, freeze.
