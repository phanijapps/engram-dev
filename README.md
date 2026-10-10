# treadle

**The human drives; the machine moves.** *(formerly `loom`)*

A spec-driven development harness in two planes: a **knowledge engine** that turns a repository into anchored, searchable truth, and a **loop engine** that runs work as evidence-gated tasks — one at a time, never on vibes.

Agents propose. **Humans accept.** That single rule is the architecture.

```
treadle do    init · add · next · record · answer · approve · close · check · status
treadle know  search · read · validate · links · findings · fingerprints · anchors · status
```

---

## Why

Most agent harnesses forget. They read your codebase fresh every session, trust their own summaries, and mark work done because it *looks* done. Treadle refuses all three:

| Principle | Mechanism |
|---|---|
| **Deterministic anchors** | Every knowledge claim cites `path:line` with a content hash. Never memory. |
| **Evidence or it didn't happen** | A task is done only when its verification command ran and the exit code is recorded. |
| **Humans accept** | Every write path demands a `human:` claim. An agent cannot approve, close, or accept — the name says why: the treadle is the pedal *the weaver* works. |
| **The record is frozen** | Work lands in versioned specpacks; new conclusions supersede, they never rewrite history. |

## The loop

```
build-kb → analyze → plan → implement → review
   │          │        │         │         │
 knowledge  bounded   task DAG  one task  re-run,
 gathered    analysis            at a     never trust
                                                │
                     ┌──────────────────────────┘
                     ▸ the interview room: answer questions and approve specs
                       in a browser, admitted through the machine
```

A spec is born through Q&A (`treadle do interview`), work is handed out one frozen slice at a time (`do next` — with drift guards that refuse the handout if the code moved), evidence lands through admission (`do record`), and the reviewer re-runs everything (`do check`). Nothing is hand-set; stages are derived like checksums.

## The knowledge plane

`treadle know` speaks [OKF 0.2](docs/product/OKF_SPEC_v0.2.md): a wiki of markdown pages with frontmatter, wiki-links resolved and containment-guarded, full-text search with weighted ranking, a findings ledger for normative proposals (declined keys are never re-raised), fingerprints and anchors that flag every page whose code moved, and a freshness stamp that says when the whole wiki is stale.

## Proven, not hoped: the golden corpus

The harness was born in Python, then ported to strict TypeScript — and the python engines are now **retired** (tag `python-final`). The port's equality is a permanent, byte-for-byte fact: a corpus of 42 golden cases — canonical emissions, refusal vocabularies, event sequences, search results, validation reports — regenerates from the TypeScript engines and diffs to zero against the frozen python-witnessed originals. The goldens are the witness; no python exists at any gate.

```bash
pnpm corpus:check   # TS regenerates; git diff gates to zero. No python at the gate.
```

## Quick start

```bash
corepack enable
pnpm install
pnpm check           # types → lint → format → tests, exits verified

# drive a spec through the room (localhost only, no auth by design)
pnpm exec tsx packages/cli/src/main.ts do init ./my-spec --title "My spec" --why "…"
pnpm exec tsx packages/cli/src/main.ts do add question ./my-spec --id Q-1 --question "Ship when?" --kind choice --options now later --default later
pnpm exec tsx packages/cli/src/main.ts do interview ./my-spec    # opens the room, exits on approval

# read a codebase's wiki
pnpm exec tsx packages/cli/src/main.ts know search ./wiki "freshness"
pnpm exec tsx packages/cli/src/main.ts know status ./wiki --workspace .
```

Node ≥ 22. Strict TypeScript (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`).

## Repository layout

```
treadle/                 the harness (pnpm workspace)
  packages/core          specpack: normalize, canonical emit, admission, drift pins
  packages/knowledge     bundle: parse, links, validate, read, search, findings, fingerprints
  packages/web           the room + the library (portable pages, CSP-pinned)
  packages/cli           do + know
  packages/conformance   the golden corpus + the self-hosting generator
  packages/brand         the white-label fence — rebrand in one command
docs/archive/            the retired record: old spec initiatives, history, the python era
wiki/                    this repo documented by its own engine
skills/                  the five SDD skills + the Node craft skills
docs/research/           the port decisions: python-vs-node, naming, standards
docs/specs/              SDD artifacts from real initiatives (the record)
```

## White-label

Every user-facing name lives in `packages/brand/src/brand.ts`. Rebrand:

```bash
pnpm brand:set -- --name Acme --bin acme --tagline "Your words"
pnpm brand:check   # proves the old name leaked nowhere
```

Format tags (`specpack/0.x`, `specweb-events/0.1`, OKF `0.2`) are contracts, not brands — they never change on rebrand.

## Security posture

Localhost-only surfaces, CSP-pinned pages, no telemetry, no CDN (assets vendored), runtime dependency chain at zero known vulnerabilities, path/symlink/decode guards under test. The full threat model: [`SECURITY.md`](SECURITY.md).

## Status

**Alpha with beta bones** — corpus-proven, coverage floored (≈86% lines), the debt ledger honest ([`treadle/DEBT.md`](treadle/DEBT.md)): SPEC-level decisions pending (trust tiers, Attested Computation), license choice open. The record of how it got here lives in `docs/archive/` — the python era, seven frozen initiatives, evidence and all. New specs start fresh.
