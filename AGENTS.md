# AGENTS.md — the SDD harness (treadle)

## Overview

We are building an **SDD harness**: a knowledge engine and a loop engine plus a few basic skills that make spec-driven development simple.

**The thesis: knowledge first, then a tight loop.**

1. **Gather knowledge.** The engine reads a repository and builds a searchable wiki — every page anchored to `path:line`, a freshness stamp telling you when the wiki is out of date.
2. **Run the loop.** Five basic skills carry work from idea to done: `build-kb` → `analyze` → `plan` → `implement` → `review`.

**The engine is treadle** — one strict-TypeScript workspace holding both planes (`do` and `know`), the two localhost surfaces, and the golden conformance corpus. The python engines that taught it are **retired** (tag `python-final`): the corpus goldens are the frozen witness, and `pnpm corpus:check` proves the TS engines reproduce them byte-for-byte. White-label by design — the name lives only in `@treadle/brand`.

**Trust rules — the whole point:**

- **Deterministic tools find and anchor.** Paths, line numbers, content hashes — never memory, never vibes.
- **Agents propose. Humans accept.** Every write path demands a `human:` claim; normative content goes through the findings ledger; declined keys never rise.
- **Evidence or it didn't happen.** Statuses change only on recorded, observable evidence.
- **Supersede, don't rewrite.** New conclusions create new artifacts; history is evidence.

**Scope:** full-stack microservices projects, single repo or a small set. Tree-sitter code indexing is delegated to external tools (the corpus's K-layer covers the bundle, not the code plane).

## Repository Map

| Path | What it is |
|---|---|
| `treadle/` | **The harness.** pnpm workspace: `core` (specpack admission), `knowledge` (bundle), `web` (room + library), `cli` (`do` + `know`), `conformance` (the golden corpus, self-hosted), `brand` (the fence). |
| `wiki/` | The repo's own knowledge base, built and verified by the engine's own skills. Curated pages in `systems/`, `domain/`, `decisions/`, `research/`. |
| `treadle/harness/` | **The installable harness.** `skills/` (sdlc + node + writer), `agents/` (red-foreman per surface), `hooks/` (JS payloads), `harness.json` (the `harness/0.1` manifest). Installed with `treadle init harness`; the installer keeps `.pi/` and `.codex/` converged. |
| `docs/product/` | Format contracts: the vendored OKF 0.2 spec, the specpack JSON schema. |
| `docs/research/` | Current research: python-vs-node, naming, Node standards, the corpus design. |
| `docs/archive/` | Everything retired: old spec initiatives, pre-pivot history, the python-era code index, superseded plans. New specs start fresh in `docs/specs/` when a wave opens. |

## Build & Verify (one runtime)

```bash
corepack enable && pnpm install        # once, in treadle/
pnpm check                             # tsc → eslint → prettier → tests
pnpm coverage                          # floors: 75 lines / 65 branches
pnpm brand:check                       # the white-label fence
pnpm corpus:check                      # TS regenerates the corpus; diff to zero
pnpm audit:prod                        # runtime chain: zero known vulns
pnpm exec tsx packages/cli/src/main.ts <cmd>   # run the CLI directly
```

## The wiki ritual (end every session fresh)

```bash
cd treadle && ./node_modules/.bin/tsx packages/cli/src/main.ts know fingerprints .. ../wiki    # source hashes
cd treadle && ./node_modules/.bin/tsx packages/cli/src/main.ts know stamp ../wiki --workspace ..  # freshness stamp
cd treadle && ./node_modules/.bin/tsx packages/cli/src/main.ts know anchors ../wiki --workspace ..
cd treadle && ./node_modules/.bin/tsx packages/cli/src/main.ts know validate ../wiki          # 0 errors, 0 warnings
cd treadle && ./node_modules/.bin/tsx packages/cli/src/main.ts know status ../wiki --workspace ..
```

Wiki discipline: every load-bearing claim cites a location; frontmatter carries `title`, `type`, `description`; decisions record alternatives and consequences; `wiki/code/**` pages are machine-managed (currently frozen — code indexing is delegated).

## Guidelines

**Writing.** Use the `writer` skill for documents and user-facing artifacts.

**Context before questions.** The wiki and the code answer most questions. Ask the owner only what evidence cannot supply — once, batched, recorded.

**Bounded work.** One analysis per question, one design per change, one task at a time. Every task carries an observable verification expectation; statuses change only when that evidence exists. Uncertainty is a deliverable.

**The corpus is truth.** Behavior changes regenerate goldens deliberately (`pnpm corpus:regen`), the diff reviewed in the commit. Golden changes are contract changes.

**Security posture.** Read `SECURITY.md` before touching servers: localhost-only by design, CSP-pinned pages, trusted-on-disk markdown, `human:` claims on every write.

**Boy-scout every diff.** Stale comments are defects; dead code is deleted; exit codes are verified, never piped away.

**Red-foreman review** before declaring done: engine changes, schema changes, artifact shapes, anything claiming "finished." Read-only, severity-tagged findings with evidence; the verdict is a defect list or the rare `PASS — nothing to fix`. Record the review next to the work.

## Verification (before declaring any work done)

- `pnpm check` + `pnpm corpus:check` + `pnpm brand:check` green; coverage floors met.
- Wiki: validate 0/0, anchors 0 need review, status fresh.
- **Never claim a check you did not run.**
