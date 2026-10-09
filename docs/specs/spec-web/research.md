# Research — presenting the Spec on the web (pre-brief)

Status: analysis (evidence-grounded, read-only)
Date: 2026-10-10
Initiative: spec-web (slug provisional, see Q-1)
repo_head pinned at commit time (see git log).

## 1. What crit.md does and how (fetched 2026-10-10)

Source: https://crit.md/ (landing page, fetched via curl, 107 KB HTML).
Evidence status: implementation-supported (their public description; their
code not audited).

- Crit is a browser review surface for AI agent output. Terminal diffs
  do not scale; the browser does. "Point at the line. Tell the agent."
- Five modes: plans & docs (markdown rendered, section comments),
  code diffs (line comments), story mode (diff grouped into thematic
  chapters, important first), live app (proxy a dev server, comment on
  DOM elements), static HTML preview (iframe, click to comment).
- The protocol is a file, not an API: "Crit writes a structured review
  file. Any agent that can read a file and run a command can use it."
  No SDK, no lock-in. Installers exist per agent (including pi).
- Rounds are first-class: the reviewer sees what changed round by round.
- Local-first; hosted sign-in exists for teams; self-hosting supported.

Transferable mechanics, not domain: file-based protocol, precise anchors
(line, section, DOM element), rounds with diffs, browser as the review
surface, agent reads the structured artifact afterward.

## 2. What exists in this repo today

### The reference render (docs/specs/spec-graph/example-add-todo-specpack.html)

Evidence status: implementation-supported (read in full, 683 lines).

- Single static HTML file. No server. The spec JSON is embedded in a
  `<script type="application/json" id="pack">` block; JS renders cards.
- Tabs: Spec, Plan + Design, Tasks, Alignment, Review, Artifacts, Raw JSON.
- Question cards render open/resolved chips, owner, and resolved-by lines.
- Status vocabulary is styled as chips (todo/doing/done/blocked, verdict
  colors). Jump buttons navigate task chains (needs, satisfies).
- Read-only. There is no input anywhere. Answers do not flow back.

### The loop engine (loom) state

Evidence status: implementation-supported (code read at pinned HEAD).

- Clarifications live in `spec.clarifications[]`: id, question, owner,
  status (open/resolved), answer, resolved_by (specpack.py).
- Open questions gate work: alignment reports them (open_questions) and
  `closure_gaps` blocks close. Open questions surface in `loom next` and
  `loom status`.
- There is NO command that answers a question. Today answers land by
  hand-editing the JSON, or indirectly: `loom accept` resolves questions
  bound to a decision via resolved_by/resolves (accept_decision).
- `loom accept` requires a human: claim (A7 shape check). Decisions get
  accepted/rejected; the spec as a whole never gets an acceptance moment.
- The deliverable stage (drafted ... delivered) is DERIVED from content,
  never hand-set. Lifecycle is active -> complete (frozen at close).
- The canonical file layout (spec-layout, frozen rev 14) reads
  chronologically: id, name, description, date, status, metadata, spec,
  design, tasks, review + tail. A web render can mirror it one-to-one.
- Engine has no server, no HTML rendering. okf renders markdown only.

### The artifact chain (settled decisions)

Evidence status: declared (status-model.json D-... comfortable terms).

- Chain: Feature Brief (markdown input; the Card) -> Spec (the JSON, born
  from Q&A on the brief; the Conversation) -> Design -> Tasks.
- The Feature Brief registers in specpack `metadata` (spec-layout D-5:
  the generic external-reference registry).

## 3. The gap this feature fills

1. No web surface exists; the reference HTML proves the render, not the
   loop.
2. The Q&A ("the Conversation") has no first-class ceremony: answers are
   hand-edits; a question has no dedicated admission path the way
   decisions do (accept/reject).
3. Phase advancement is implicit: stages derive from content; the owner
   has no explicit "the spec is good, proceed" moment.
4. The brief exists as a concept with a registered home but no flow.

## Out of scope of this research

- crit.md source code audit (their repo not read; the landing page is the
  evidence).
- Multi-user, remote, hosted anything.
- okf changes (this feature lives in loom).
