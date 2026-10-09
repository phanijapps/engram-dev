# Interview — spec-library

**Format:** live, in the room (`loom interview`), 2026-10-09
**Claimant:** human:owner (every event admitted with claim + timestamp; journal: `interview.jsonl`)
**Result:** 10/10 resolved, none unknown. The approval act landed at 19:54:14Z — the first spec born through the room its predecessor built.

## The register, resolved

| # | Question | Answer | Note |
|---|---|---|---|
| Q-1 | Look only, or act? | **look + answer + approve** | Beyond the recommended default — the library is a full room: questions answered AND specs approved in place. Admission reuses the event seam. |
| Q-2 | List order | needs you first | The pane leads with whatever waits on the owner. |
| Q-3 | Stage words | plain words + tooltips | PO words on screen; engineer term one hover away. |
| Q-4 | "Waiting on you" inbox as landing | yes, it is the landing | The home screen is the owner's actual job. |
| Q-5 | One extra for v1 | **stage journey strip** | The seven stages as a lit path — where this spec is, what's next. |
| Q-6 | Anything else in v1? | none | ("non" — recorded as answered; intent: nothing to add.) |
| Q-7 | Overview shows | every document | Brief, research, contracts — all discovered, all rendered. |
| Q-8 | Empty tabs | show it, friendly | "Not written yet" — never a mystery. |
| Q-9 | Legacy folders | list them read-only | History stays visible; it never blocks the page. |
| Q-10 | Who else reads this? | POs first, next technical teams | Design PO-first, but do not paint into a corner: engineers arrive later. |

## What the answers change

- **D-4 amended**: inline *answers and approvals* — both admission paths (`answer`/`unknown`/`choice` + `approve`) ship through `specweb-events/0.1`. The room's interrupt pattern (block-until-approved) stays the interview's; the library is the standing surface.
- **FR-12 firms up**: not conditional anymore — answer + approve in place is required (AC-10 extends to approval).
- **T-6 firms up**: the journey strip is the chosen extra (FR-13); its design lands in design.md.
- **Q-10 shapes the words layer**: PO words default, engineer words one hover away — the tooltips are the technical teams' on-ramp, not a second mode.

## Open items

- D-1..D-6 await the owner's acceptance (the approval act approved the *spec*; decisions are accepted on their own, per the trust rules).
