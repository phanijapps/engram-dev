# Feature Brief — the Spec interview page (`loom interview`)

Status: brief accepted input (Q&A resolved 2026-10-09)
Date: 2026-10-09
Chain position: Feature Brief (this file, markdown) -> Spec (JSON, born
next from this brief) -> Design -> Tasks.

## Why (the problem)

The loop has a front door problem. The Spec file is the machine's
authority, and it now reads like a dossier (spec-layout). But the
human's ceremony runs through a terminal and JSON hand-edits:

- Open questions gate the work, but no command answers them. Answers
  land as hand-edits. Decisions get `loom accept` with a human claim;
  questions get nothing (research.md, section 2).
- The owner never gets a moment that says "the spec is good; proceed."
  Decisions are accepted one by one. The spec as a whole never is.
- The reference render (example-add-todo-specpack.html) proves the page
  is buildable: tabs, chips, jump chains, question cards. It is static.
  It is a picture of a spec, not a conversation with one.

The Conversation (the Q&A that births a spec) deserves a room.

## The journey (happy path, as the owner stated it)

1. A Feature Brief is finalized (a markdown file, the Card).
2. `analyze` converts the brief into a Spec. Open questions are the
   interview.
3. `loom interview <slug>` opens a URL. The page shows the spec as a
   dossier, reading top-down in the canonical layout, plus the open
   questions.
4. The owner answers each question on the page (or answers "I don't
   know", recorded honestly). Answers land in the spec through machine
   admission, never raw file writes.
5. When the questions are resolved, the acceptance moment appears: the
   owner approves the spec. The phase advances and the next stage of
   work unlocks.

## What this is

- A local web surface (`loom interview`) that renders the spec and
  collects the owner's answers, choices, and approval.
- A new admission command (`loom answer`) that lands a question's
  answer in the spec with a human claim and a timestamp, mirroring
  `loom accept`.
- One explicit owner gate: spec approval (Q-6c). Derived deliverable
  stages stay machine-owned. The approval is the new normative moment.
- Rounds (Q-7): the page shows what changed since the last visit.
- v1 creative cuts (Q-9): a keyboard-first Q&A wizard and a progress
  ring showing the derived deliverable stage. Point-at-line comments
  (click any requirement, spawn a clarification) are the v2 headline.

## The adapter model (Q-2 + Q-3, the architectural seed)

The page never talks to loom. The page emits **events**; an **adapter**
consumes them. This is the open seam:

- Events are first-class data: `answer` (question, text, by), `unknown`
  (question, by), `choice` (question, option, by), `approve` (by).
  The event stream is also written as a durable file (the crit.md
  lesson: the file is the protocol; any agent can read it).
- v1 ships one adapter: the **harness adapter**. `loom interview` runs
  a local server (localhost bind, no auth, disclosed: Q-8), serves the
  page, receives events, routes each through loom's own admission
  functions (`loom answer`, the approval gate), and writes the event
  file. The command blocks like an interrupt (hook semantics): the
  harness session waits while the owner interviews, then resumes with
  the updated spec.
- The **platform adapter** is not built and not solved here. The event
  schema and the adapter contract (receive events, apply admission,
  report state) are documented so a LangChain/LangGraph/custom platform
  can implement its own interrupt on the same seam. The page is
  portable because it binds to events, not to loom.
- Auth is a platform-adapter concern (Q-8). Local v1: none, localhost
  only.

## Scope

- In: the page (render + interview + approval), `loom answer`, spec
  approval gate, rounds, event schema + event file, harness adapter,
  keyboard wizard, progress ring.
- The brief input: a finalized markdown file, registered in the spec's
  `metadata` (spec-layout D-5) when the spec is born.

## Non-goals (v1)

- Solving the platform interrupt (adapter contract only).
- Remote, multi-user, hosted, auth.
- Brief authoring UI (the brief is a file).
- Point-at-line comments (v2 headline), design/task tabs (later waves,
  same page).
- okf changes.

## Open questions carried into the spec's Q&A

- Q-A: How does approval live in the specpack vocabulary? Additive
  lifecycle value, sub-state, or a first-class `accepted_by` field?
  The state machine is frozen at rev 8 (status-vocabulary); this must
  be additive or versioned.
- Q-B: Event file shape and home (name, format tag, per-initiative).
- Q-C: Interrupt semantics for the waiting CLI: block until complete,
  timeout, or detach-and-resume?
- Q-D: Question kinds beyond open/choice needed in v1 (yes/no, number,
  date), or strictly the two accepted in the interview?

## Handoff

Next: the `analyze` skill, spec mode — birth `docs/specs/spec-web/`
spec JSON from this brief; the interview answers (interview.md) are
accepted input; the open questions above become clarifications Q-A..Q-D
plus whatever the spec's own Q&A surfaces. The brief registers in the
new spec's metadata.
