# Interview register — spec-web brief (pre-brief Q&A)

Status: resolved (one batched round, 2026-10-10)
Date: 2026-10-10

Rules: each question is decision-shaped. Options carry a recommendation
and a door rating (one-way doors need more care than two-way). Answers
land in the brief as accepted input, quoted with owner attribution.

| Q | Question | Blocks | Door |
|---|---|---|---|
| Q-1 | Scope: full chain or interview only? | brief shape | two-way |
| Q-2 | Command name for the surface | CLI contract | one-way (public) |
| Q-3 | Transport: local server vs static file protocol | architecture | one-way |
| Q-4 | Write path: `loom answer` admission command | engine contract | two-way |
| Q-5 | Question vocabulary: kinds, options, "I don't know" | schema | two-way |
| Q-6 | Phase advancement: derived stages vs explicit owner gate | state machine | one-way |
| Q-7 | Rounds: diff since last visit on the page | page design | two-way |
| Q-8 | Auth model for the local surface | security posture | one-way |
| Q-9 | Creative cuts for v1 (ranked list) | v1 size | two-way |
| Q-10 | Surface lifespan: spec ceremony only, or whole initiative | scope | two-way |

## Answers (owner, 2026-10-10)

- Q-1: **a** — full chain; the brief is a finalized markdown input in v1.
- Q-2: **accepts `loom interview`**, with a condition: the surface must
  survive extraction from the harness into an agentic platform
  (LangChain / LangGraph / custom). Not married to loom.
- Q-3: **local callback, designer's choice** — shape it like a
  hook/interrupt so coding harnesses work locally; in a custom platform
  it works differently. Do NOT solve the platform interrupt. Build an
  open adapter.
- Q-4: **yes** — `loom answer` admission command.
- Q-5: **yes** — kinds, options, and honest "I don't know".
- Q-6: **c** — derived stages stay, plus one explicit owner gate
  (spec approval).
- Q-7: **yes** — rounds.
- Q-8: **local for now** — platform auth comes with the platform,
  through the adapter seam.
- Q-9: **rec picks** — keyboard-first wizard + progress ring in v1;
  point-at-line comments are the v2 headline.
- Q-10: **rec** — v1 is the spec ceremony; the page architecture leaves
  room for the whole initiative, and plugs into a future platform.
