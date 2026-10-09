# Brief — the spec library

**Wave:** spec-library
**Date:** 2026-10-09
**Author:** agent, from the owner's commission and the research register
**Status:** brief — questions open, answered in the room

## The promise

Every spec — past and current — visible in one place, readable end to end by the people who own them. A product owner with no engineering background opens one page, sees what needs them, reads any spec like a document, and understands where every piece of work stands. No JSON. No CLI. No guessing.

## Who it serves

Product owners first (little to no technical knowledge — the owner's constraint, not an assumption). Engineers second: the same screen must stay precise, showing real evidence and real statuses without dumbing anything down.

## Jobs to be done

1. **Find** — "which spec needs me right now?" (one glance).
2. **Read** — "show me this spec end to end: what it is, what it asks, how it was designed, what was built, what the reviewer said."
3. **Understand health** — "is this moving, stuck, waiting, or done?"
4. **Act** *(pending Q-1)* — "answer its open questions right here."
5. **Share** — "send my teammate a link to exactly this tab."

## Shape (from the owner's commission)

- **Left pane:** the specs list, filterable. Groups by need, free-text search, counts.
- **Right side:** the selected spec in tabs —
  - **Overview** — title, stage, dates, and every adjacent artifact (brief, research, contracts) **rendered as markdown**.
  - **Spec** — stories with acceptance criteria, requirements, open questions.
  - **Design** — approach, stack, decisions with their status and reasoning.
  - **Tasks** — every task, its verification expectation, its evidence receipts.
  - **Review** — verdicts and findings.

Traceability (owner flagged as open): the links between requirements, stories, tasks, decisions, and acceptance already live in the packs. The library draws them — ID chips that jump to cards, coverage shown per requirement. The matrix view is an interview-ranked extra.

## In scope (v1)

List + filter + tabs + markdown rendering + traceability links + PO vocabulary layer + deep links. Interaction depth per Q-1.

## Out of scope (v1)

Editing anything beyond answering questions (if Q-1 allows that); auth (platform-adapter concern); multi-repo roots (single repo scope); diffing history.

## Draft requirements (firm up after the interview)

- FR-1 List every loadable pack with stage, revision, title.
- FR-2 Filter by need-group and free text.
- FR-3 Select a pack → five tabs, deep-linkable.
- FR-4 Overview renders adjacent `.md` artifacts as markdown (tables included), discovered not assumed.
- FR-5 Spec tab: stories → acceptance, requirements, questions with honest statuses.
- FR-6 Design tab: approach, stack, decisions + reasoning + status.
- FR-7 Tasks tab: status, verify, evidence rows.
- FR-8 Review tab: verdicts by severity.
- FR-9 Traceability: every ID mention is a link; every requirement shows its covering tasks.
- FR-10 PO layer: plain stage words, tooltips, plain dates, friendly empty states.
- FR-11 Legacy folders handled gracefully (shown or hidden per Q-9) — never a crash.
- FR-12 Keyboard and pointer both work (pointer-first for this audience).

## Constraints (carried from the house)

- localhost, no auth, no CDN at runtime — vendor what we need (D-2).
- The page stays engine-name-free; events only at the seam; portability survives extraction.
- Normative content (this brief's answers) lands through the machine — the interview room.

## The interview register (10 questions)

Rigorous, product-shaped, none answerable from evidence. Each choice carries a recommended default the owner may override.

| # | Question | Kind |
|---|---|---|
| Q-1 | May the library only *look*, or also *answer* open questions inline (look+answer recommended)? | choice |
| Q-2 | List order: needs-you first (rec) / newest / A–Z? | choice |
| Q-3 | Stage words: PO set with engineer tooltips (rec) / engineer only / toggle both? | choice |
| Q-4 | "Waiting on you" inbox as the landing screen (rec yes)? | choice |
| Q-5 | Top creative extra: matrix / journey strip / PDF / diff / search-across? | choice, no default |
| Q-6 | Anything else you want in v1? (or "none") | open |
| Q-7 | Overview shows every `.md` artifact (rec) or brief only? | choice |
| Q-8 | Empty tabs: friendly "not written yet" (rec) or hidden? | choice |
| Q-9 | Legacy spec folders: listed read-only (rec) or hidden in v1? | choice |
| Q-10 | Who besides you will read this screen, and what will they want? | open |

## Adapter model

Same seam as the interview room: the page consumes GETs (/specs, /spec/:name, artifacts) and — if Q-1 allows — emits `specweb-events/0.1` through the published admission contract. A platform adapter can host this page on its own stack: receive events, apply admission, report state. Nothing in the page knows the engine's name.

## Handoff

Research done (`research.md`, this folder). Interview next — in the room. Answers become the spec: born, decided, approved, through the machine.
