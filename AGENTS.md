# AGENTS.md — the SDD harness (treadle era)

## Overview

We are building an **SDD harness**: a knowledge engine and a loop engine plus a few basic skills that make spec-driven development simple.

**The thesis: knowledge first, then a tight loop.**

1. **Gather knowledge.** The engine reads a repository and builds a searchable wiki — every page anchored to `path:line`, a freshness stamp telling you when the wiki is out of date.
2. **Run the loop.** Five basic skills carry work from idea to done: `build-kb` → `analyze` → `plan` → `implement` → `review`.

**The engines:**

- **treadle** — the ACTIVE harness. Both planes in one strict-TypeScript workspace (`treadle/`): the loop plane (`treadle do`) and the knowledge plane (`treadle know`), the room and the library (localhost surfaces), and the golden conformance corpus. White-label by design: the name lives only in `@treadle/brand`.
- **okf / loom (python, `engine/`)** — the TEACHERS, now the frozen witness. The corpus was generated from them; the TS engines reproduce those goldens byte-for-byte (`pnpm corpus:check`, no python at the gate). They still drive the wiki's code-index ritual until the cutover completes. Retirement path: `wiki/systems/treadle.md`.

**Trust rules — the whole point:**

- **Deterministic tools find and anchor.** Paths, line numbers, content hashes — never memory, never vibes.
- **Agents propose.** Pages, designs, plans, code — all proposals.
- **Humans accept.** Normative content goes through the findings ledger; every write path demands a `human:` claim.
- **Evidence or it didn't happen.** Statuses change only on recorded, observable evidence.

**Scope:** full-stack microservices projects, single repo or a small set. Tree-sitter code indexing is deliberately NOT in the engines (delegated to graphify-class tools).

## Repository Map

| Path | What it is |
|---|---|
| `treadle/` | **The harness.** pnpm workspace: `packages/core` (specpack admission), `packages/knowledge` (bundle: parse/links/validate/read/search/findings/fingerprints/stamp), `packages/web` (room + library), `packages/cli` (`do` + `know`), `packages/conformance` (the golden corpus + runner), `packages/brand` (the white-label fence). Generators in `conformance/generators/`. |
| `engine/okf/` | The python knowledge engine — witness + wiki-ritual driver. |
| `engine/loom/` | The python loop engine — witness. |
| `wiki/` | The repo's own knowledge base, built by the engines' own skills. Curated pages in `systems/`, `domain/`, `decisions/`; `wiki/code/**` is machine-managed. |
| `skills/sdlc/` | The five SDD skills (source of truth). `skills/node/` — the Node craft skills (`nodejs-craft`, `nodejs-architecture`, `boy-scout`). Installed copies in `.pi/skills/` — sync after editing. |
| `docs/specs/<slug>/` | SDD artifacts from real work — one folder per initiative. |
| `docs/research/` | The port research: python-vs-node, naming (treadle), Node standards (40 rules), the corpus design. |
| `docs/product/` | The vendored OKF 0.2 spec (canonical page format). |

## Build & Verify

```bash
# ── treadle (the active harness) ──────────────────────────────
corepack enable && pnpm install          # once, in treadle/
pnpm check                               # tsc → eslint → prettier → 51 tests
pnpm coverage                            # floors: 75 lines / 65 branches
pnpm brand:check                         # the white-label fence
pnpm corpus:check                        # TS regenerates the corpus; diff must be zero
pnpm audit:prod                          # runtime chain: zero known vulns
pnpm exec tsx packages/cli/src/main.ts … # run the CLI directly (alpha)

# ── python (the witness + ritual, until retirement) ───────────
uv sync
cd engine/okf && uv run pytest -q        # 185 green
cd engine/loom && uv run pytest -q       # 198 green
```

## The wiki ritual (end every session fresh)

```bash
uv run okf code index . wiki --exclude "docs/**"   # freshness stamp
uv run okf fingerprints update . wiki              # source hashes (scans .py and .ts)
uv run okf anchors wiki                            # pages anchored to changed code
uv run okf validate wiki                           # 0 errors, 0 warnings
treadle know status wiki --workspace .             # the one-screen health (cutover preview)
```

Wiki discipline: every load-bearing claim cites a location; pages carry frontmatter (`title`, `type`, `description` minimum); decisions record alternatives and consequences; supersede, never rewrite.

## Guidelines

**Writing.** Use the `writer` skill for documents and user-facing artifacts.

**Context before questions.** The wiki and the code answer most questions. Ask the owner only what evidence cannot supply — once, batched, recorded.

**Bounded work.** One analysis per question, one design per change, one task at a time. Every task carries an observable verification expectation; statuses change only when that evidence exists. Uncertainty is a deliverable.

**The corpus is truth.** Behavior changes regenerate goldens deliberately (`pnpm corpus:regen`), the diff reviewed in the commit. Golden changes are contract changes.

**Security posture.** Read `treadle/SECURITY.md` before touching servers: localhost-only by design, CSP-pinned pages, trusted-on-disk markdown (documented, not folklore), `human:` claims on every write.

**Boy-scout every diff.** Stale comments are defects; dead code is deleted; exit codes are verified, never piped away.

**Red-foreman review** before declaring done: engine changes, schema changes, artifact shapes, anything claiming "finished." Read-only, severity-tagged findings with evidence; the verdict is a defect list or the rare `PASS — nothing to fix`. Record the review next to the work.

**Supersede, don't rewrite.** New conclusions create new artifacts and mark old ones superseded. History is evidence.

## Verification (before declaring any work done)

- **treadle:** `pnpm check` + `pnpm corpus:check` + `pnpm brand:check` green; coverage floors met.
- **python (while it lives):** both suites green.
- **Wiki:** validate 0/0, anchors 0 need review, status fresh.
- **Never claim a check you did not run.** A passing claim without the command behind it is a defect.
