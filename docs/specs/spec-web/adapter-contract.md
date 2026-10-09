# The adapter contract — the open seam

Status: published contract (spec-web DES-3, FR-9; D-3, D-8)
Date: 2026-10-09

The interview page binds to the event vocabulary and nothing else. Any
system that can serve two HTTP routes can host it. loom ships one
adapter (the harness adapter); a platform (LangChain, LangGraph,
custom) implements the same contract on its own interrupt, with its own
auth. That work is deliberately not done here.

## The surfaces

The page loads exactly two endpoints from its host:

```
GET  /spec   → the spec, canonical layout, as a JSON object
POST /event  → one interview event; admission happens host-side
```

The page never stamps time and never writes the spec. The host is the
authority. Every admission the host accepts is the page's new truth:
after each event the page refetches `/spec`.

## The event vocabulary (specweb-events/0.1)

```
answer  {q, text, by}     an open-text answer
choice  {q, option, text, by}  a choice answer (option + its text)
unknown {q, by}           the honest unknown: recorded, still gating
approve {by}              the approval act, pack-scoped
```

All events carry `by` (a human claim, `human:<owner>`) and are stamped
`at` by the host at admission. The durable form is
`docs/specs/<slug>/interview.jsonl`: first line
`{"format": "specweb-events/0.1"}`, then one JSON event per line,
append-only (D-12).

## The host's three duties

1. **Receive events.** Validate shape: kind known, human claim present,
   question-scoped kinds name a question, `approve` does not.
2. **Apply admission.** Answers land through your state machine with
   machine rules — human claims, stamps, refusal semantics. In the
   harness adapter this is `loom answer` / `loom approve`. Refusals
   (bad claims, open-question approval, a pack that will not load)
   reach the page as 400 JSON carrying the message; only true internal
   faults are 500.
3. **Report state.** `/spec` always returns current truth; the page
   derives everything else (ring, rounds, approval view) from it.

## What a platform adds

- An interrupt shaped like its own runtime (block, timeout, resume):
  the harness adapter blocks until the approval act, Ctrl-C escapes.
- Auth and identity: the harness adapter binds 127.0.0.1 with none,
  disclosed. A platform owns who `human:<owner>` is and injects it
   into the page via `INTERVIEW_CONFIG` at serve time.
- Persistence: write the event stream somewhere durable; the file
  format above is deliberately plain so anything can replay it.

## Portability proof, in the repo

- `engine/loom/src/loom_kit/events.py` imports nothing from the engine
  (AST-checked in `test_events.py::test_module_is_portable`).
- The page assets contain no engine name (grep-checked in
  `test_web_page.py::test_page_never_binds_the_engine`).
- The order, kinds, and stages the page renders are contract-tested
  against the engine constants — one vocabulary, two sides.
