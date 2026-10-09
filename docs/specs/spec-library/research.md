# Research — the spec library

Wave: spec-library. Question: how does an owner *see* every spec — past and current — without reading JSON?
Audience: product owners with little to no technical knowledge (owner's words, 2026-10-09).
Method: inventory of the real corpus, options with trade-offs, a creative bank ranked for the interview. No question below is answerable by evidence alone — that is why it goes to the owner.

## 1. What exists (the corpus, counted)

13 folders under `docs/specs/`. Two shapes:

**Modern packs (5)** — load through `load_specpack`, canonical layout, dual-read normalizer:

| Pack | Stage | Questions | Decisions | Tasks |
|---|---|---|---|---|
| specpack-context | delivered | 0 | 12+ | many |
| status-vocabulary | delivered | 0 | 8ish | many |
| status-model | delivered | 0 | 23ish | many |
| spec-layout | delivered | 0 | 14ish | many |
| spec-web | delivered | 0 | 14 | 6 |

**Legacy folders (8)** — pre-pack SDD shapes (`sdd.json`, `plan.md`, `spec.md`, `analysis.md`): loom, loom-engine, loom-l1, okf-only-engine, okf-wiki-audit, sdd-research, semantic-extraction, spec-graph. They do not load as packs. They still hold real history (the record is evidence).

**Adjacent artifacts** — every folder carries `.md` files of varying names: `brief.md`, `research.md`, `design.md`, `plan.md`, `adapter-contract.md`, `schema-primer.md`, `interview.md`… No uniform naming. The overview tab must discover, not assume.

## 2. The data the page can render (all of it already machine-owned)

Top-level of a born pack: `name, title/description, date {created, updated, closed, approved}, status {lifecycle, deliverable}, revision, spec {stories[→acceptance], requirements[→serves], clarifications, out_of_scope}, design {approach, designs, stack, decisions}, tasks [status, evidence, verify, satisfies, implements, accepts], review {verdicts}, metadata {pins}, env`.

Tab mapping falls out naturally:
- **Overview** — title, description, stage, revision, dates, adjacent `.md` artifacts rendered as markdown.
- **Spec** — stories with acceptance, requirements, clarifications with their honest statuses.
- **Design** — approach, stack, decisions with status + because.
- **Tasks** — tasks with status, verify, evidence rows (the receipts).
- **Review** — verdicts, findings by severity.

## 3. Markdown rendering (the owner named it)

The briefs, research, and decisions documents are markdown with tables, code fences, and links.

| Option | Size | Trade-off |
|---|---|---|
| **Vendored marked.min.js (MIT)** | ~39 KB fetched and verified (`/tmp/marked.min.js`) | Full subset: tables, code, links. One vendored file, no CDN at runtime (CON carried from spec-web). License MIT, vendoring legal with header kept. |
| Hand-rolled mini renderer | ~150 lines | No dependency, but tables and nested lists are real work to get right; our briefs use tables. |
| Server-side render | n/a | Couples the server to markdown shape; the page stays dumber but the endpoint grows. |

Recommendation: **vendored marked**, rendering only files from the spec folder (on-disk, owner-authored — trusted input), with raw HTML in markdown disabled in the renderer options where possible. Final posture is a design decision (D-2).

## 4. The PO translation layer (the audience is the constraint)

The engine's words are ours, not the owner's. The page needs a vocabulary map — engine terms untouched, presentation translated:

| Engine stage | PO words |
|---|---|
| awaiting_owner | **Waiting on you** |
| planning | Being shaped |
| in_progress | In progress |
| blocked | Stuck — needs attention |
| in_review | In review |
| delivered | Done |
| drafted | Just started |

Same for jargon: *revision* → "how many times it changed", *evidence* → "the receipt", *verdict* → "the reviewer's call", *clarification* → "questions to answer". Tooltips carry the engineer term for the bilingual. Plain dates ("3 days ago") over ISO stamps. Whether the PO set replaces or sits beside the engineer set is an interview question (Q-3) — both is the default.

## 5. Filtering and the list pane

Evidence: 5 packs now, growing one per wave; 8 legacy folders. Small numbers, but the pane earns its keep at 15+.

- **Group by need**: "Waiting on you" → "Moving" → "Done". The owner's eyes go where their action is.
- **Free-text search** over title + name + description.
- Counts per group in the pane header.

Default order is an owner call (Q-2), not evidence.

## 6. Traceability — the links already exist (owner flagged this as open)

The pack *is* a graph; nothing must be invented, only drawn:

- `requirements[].serves → stories[]` (why each rule exists)
- `tasks[].satisfies → requirements[]` (what each task delivers)
- `tasks[].implements → design.decisions[]` (which decision it honors)
- `tasks[].accepts → acceptance[]` (proof per story)
- `tasks[].honors → decisions[]` (conformance)

UI model: every ID mention (FR-1, US-1, D-3, T-2, AC-4) inside any tab becomes a chip that jumps to its card. Each requirement card shows "covered by T-1, T-2". The **traceability matrix** (requirements × tasks grid, coverage at a glance) is a candidate v1 extra (Q-5).

## 7. Interaction model — read-only vs. the room

spec-web built the admission seam: `specweb-events/0.1`, POST /event, machine rules. The library can:

1. **Look only** — GET /specs, GET /spec/:name, GET artifacts. Zero new admission surface.
2. **Look + answer** — open questions answerable inline through the same event admission; the room and the library share the seam. The "Waiting on you" inbox then becomes actionable in place.
3. Look + answer + approve — the full ceremony from the library.

This is the owner's product call (Q-1), not mine to assume. The adapter contract publishes whichever.

## 8. Creative bank (ranked by my judgment — the owner ranks for real)

1. **"Waiting on you" inbox as the landing screen** — every pack needing answers or approval, one glance, the PO's actual job. My top pick.
2. **Traceability matrix** — requirements × tasks grid; gaps visible as holes.
3. **Stage journey strip** — the seven stages as a lit path; the PO sees where a spec is and what's next.
4. **Search across all specs** — one box, whole library.
5. **Print / PDF export** — a stakeholder-friendly one-page digest per spec.
6. **Revision diff** — what changed between revisions 12 and 13.
7. **Plain-English overlay toggle** — engineer words ↔ PO words, one switch.
8. **Spec health chip** — gaps/violations count from `loom check` surfaced per pack.

## 9. Constraints carried forward

- localhost, no auth, no CDN (CON-1..CON-3 pattern from spec-web; auth stays a platform-adapter concern).
- Keyboard-first *and* pointer-complete (FR-8 precedent — but this audience is pointer-first; keyboard stays for power users).
- Page greps clean of engine names; events only at the seam; portability survives extraction (Q-2 of spec-web, still binding).
- Legacy folders must never crash the page — grace or hiding, owner's call (Q-9).

## 10. Risks, named

- **Legacy shape drift** — 8 folders, several formats; the loader must fail soft per folder.
- **Markdown posture** — marked renders raw HTML by default; our files are trusted, but the design pins the posture explicitly (D-2).
- **Mutation while browsing** — a pack can be answered/approved elsewhere while open; the page re-reads on every fetch (stateless GETs), so staleness is one refresh deep. Acceptable; noted.
- **Jargon leakage** — the PO audience makes every untranslated term a defect; the vocabulary map is a contract, not decoration.

## Handoff

Research done. The brief follows with the question register: 10 questions, each product-shaped, each with options and a recommended default where choice applies. The spec is born after the owner answers — through the interview room, which this wave makes unnecessary for the *next* waves. First spec born in its own successor.
