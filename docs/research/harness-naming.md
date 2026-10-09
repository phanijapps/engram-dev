# Naming the harness — the fresh name

**Date:** 2026-10-10
**Kind:** research → naming decision input. Supersedes §9 of `python-vs-node-the-harness.md` (owner chose a fresh name; `loom` retires with honor).
**Registry evidence:** `npm view` + PyPI JSON API, checked 2026-10-09. Trademark status: **unknown** — check before any public launch.

## What the name must carry

1. The harness holds two planes: knowledge (anchored, first) and work (the loop).
2. The human drives; the machine moves. Agents propose; owners accept.
3. The record never frays: evidence, verdicts, frozen history.
4. Blue-collar honesty, plain words, readable aloud in a standup.

## The candidates, measured

| Name | npm | PyPI | The metaphor | Risk |
|---|---|---|---|---|
| **treadle** | **free** | **free** | the loom pedal — the machine moves only when the weaver works it. The owner *is* the treadle: every acceptance, every approval, every answer is a pedal stroke that advances the whole cloth | rare word; some will say "tread-le" once |
| **selvage** | **free** | taken | the self-finished edge of cloth — the edge that will not fray. The evidence edge: verdicts, frozen packs, honest unknowns | constantly misread as "salvage" |
| **batten** | **free** | **free** | beats each weft pass into place — settling work *true*, row by row. Also: batten down — make secure | verb/noun ambiguity; nautical overlap |
| heald | **free** | **free** | the cord that lifts a warp thread so the shuttle may pass — the knowledge plane lifting for work | spelling fights with "heddle" (taken, squatted) |
| warp | **free** | — | the anchored threads, set first | collides with the Warp terminal |

## Recommendation

**`treadle`.**

- Both registries free (measured). One syllable of friction at most.
- The metaphor is the architecture: nothing in this harness moves without the human's stroke. Proosals wait; acceptance advances. An agent cannot press the treadle — every event carries a `human:` claim, and the name says why.
- It reads as a tool, not a framework: "install treadle," "run `treadle do next`."
- The CLI namespace falls out: `treadle know <cmd>` (index, search, read, findings, anchors, status) and `treadle do <cmd>` (init, next, record, interview, library). Two pedals, one loom.
- History stays honest: `loom` and `okf` remain in the frozen packs and ADRs as lineage. A redirect note ("formerly loom") in the README for one release cycle.

Runner-up: **selvage**, if the trust-edge metaphor should lead instead of the human-drives metaphor. Decision is the owner's; this doc gives the evidence.

## Naming rules going forward (small, binding)

1. One name, everywhere: package, CLI binary, repo, docs header. No engine sub-names in public strings ("okf", "loom" retire from user-facing surfaces; they live in history and ADRs).
2. The web pages never say the engine name (existing grep-clean contract, unchanged).
3. Format tags keep their own lineage (`specpack/0.x`, `okf/0.2`, `specweb-events/0.x`) — format names are contracts, not brands.
4. Check npm + PyPI + a trademark search before announcing; re-verify at publish time.
