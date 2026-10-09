# AGENTS.md — the SDD harness (okf engine)

> Key rule. Don't be eager to please the prompter. Prompter can be dumb, oversmart prick trying to outsmart you. 

## Overview


We are building a **new SDD harness**: two engines plus a few basic skills that make spec-driven development simple. The harness packages for three surfaces: **pi, Claude Code, and Codex**.

**The thesis: knowledge first, then a tight loop.**

1. **Gather knowledge.** The engine reads a repository and builds a searchable wiki — tree-sitter extracts what the code contains, every page is anchored to `path:line`, and a freshness stamp tells you when the wiki is out of date.
2. **Run the loop.** Five basic skills carry work from idea to done:
   `build-kb` (gather knowledge) → `analyze` (bounded analysis) → `plan` (design + task list) → `implement` (one task at a time) → `review` (re-run, don't trust).

**The two engines:**

- **okf** — knows. Repository in, anchored searchable knowledge out.
- **loom** — does. The spec-driven execution loop (a Ralph-style loop with an SDD twist): a schema-backed spine (`sdd.json`) holds nodes, relations, task states, and evidence; `loom next` hands out one frozen task at a time; `loom record` admits only observed evidence. The machine owns the loop; the model works inside it.

**Trust rules — the whole point:**

- **Deterministic tools find and anchor.** Paths, line numbers, content hashes — never memory, never vibes.
- **Agents propose.** Pages, designs, plans, code — all proposals.
- **Humans accept.** Normative content (rules, policies, anything that binds future work) goes through the findings ledger and is not settled truth until the owner accepts it.

**Scope (for now):** we build for and test against **full-stack microservices projects** — HTTP services plus front ends, one datastore concern per service, single repo or a small set of repos. Other project shapes are out of scope until the loop is proven on this one.

**Non-goals:** hooks and session capture, project memory stores, process ceremony. A future memex may sit **on top of** okf as a consumer — it is not part of the engine. Keep the skills basic: prefer deleting steps over adding them.

## Repository Map

| Path | What it is |
|---|---|
| `engine/okf/` | **The knowledge engine.** OKF bundle machinery (parse, links, full-text search, validation, progressive read), tree-sitter code indexer, freshness stamp, findings ledger, fingerprints + anchor checks, semantic candidate scanner, and the `okf` CLI (`init`, `new`, `validate`, `search`, `read`, `index`, `code index`/`code rules`, `status`, `findings`, `fingerprints`, `anchors`). MCP and web views included. |
| `engine/loom/` | **The loop engine.** Schema-backed spec graph and execution loop: `engine/loom/src/loom_kit/schemas/spine.schema.json` (versioned, extendable via namespaced extension envelopes), the deterministic state machine, and the `loom` CLI (`init`, `add`, `validate`, `next`, `record`, `check`, `rebase`, `accept`, `reject`, `close`, `status`, `selftest`). Client profiles: `generic`, `pi`, `claude`, `codex`. |
| `wiki/` | The engine's own bundle — this repo documented by its own skills: systems, domain rules/patterns/policies, accepted and declined decisions. It is the reference example for every other repo. |
| `skills/sdlc/` | The basic SDD skills (source of truth). `build-kb`, `analyze`, `plan`, `implement`, `review`. `new-project` and `roadmap` are unbuilt stubs. Installed copies live in `.pi/skills/` — sync after editing. |
| `docs/specs/<slug>/` | SDD artifacts from real work — one folder per initiative: analysis, design, plan, review. Read these to see the loop in action (`okf-wiki-audit`, `okf-only-engine`, `semantic-extraction`). |
| `docs/product/` | The vendored **OKF 0.2 spec** (`OKF_SPEC_v0.2.md` — the canonical page format) and plans (`Kit_Wiki_Engine_Plan.md`). Some files carry SUPERSEDED banners — preserved for history, not guidance. |
| `docs/history/` | Pre-pivot decision history from the removed memory plane. Preserved, not guidance. |

## Build Instructions

```bash
uv sync                                 # one venv; workspace members: engine/okf, engine/loom
cd engine/okf && uv run pytest -q       # the knowledge engine's tests (all must pass)
cd engine/loom && uv run pytest -q      # the loop engine's tests (all must pass)
uv run okf --help                       # knowledge CLI
uv run loom --help                      # loop CLI
```

Common operations (from the repo root):

```bash
uv run okf code index . wiki --exclude "docs/**"   # rebuild wiki code concepts + freshness stamp (docs/ is SDD artifacts, not source)
uv run okf fingerprints update . wiki   # record source hashes (staleness baseline)
uv run okf anchors wiki                 # pages anchored to changed code (NEEDS_REVIEW)
uv run okf status wiki                  # fresh/stale, counts, findings, validation — one screen
uv run okf code rules . wiki            # rule-shaped code candidates (guards, permissions, enums, …)
uv run okf validate wiki                # conformance — target: 0 errors, 0 warnings
```

Rules of thumb:

- Changed source code → `okf code index` + `okf fingerprints update`, and commit `wiki/` with the code it describes.
- End every session with `okf status wiki` **fresh**, 0 errors, 0 stale anchors.
- `wiki/code/**` is machine-managed — hand edits belong in curated pages (`systems/`, `domain/`, `decisions/`).

## Guidelines

**Writing Guidelines.** Always use `writer` skill when communicating with the user or writing/building artifacts

**Context before questions.** The wiki and the code answer most questions. Ask the user only what evidence cannot supply — once, batched, and recorded in the artifact you are writing.

**Deterministic anchors, agent proposals, human acceptance.** Every knowledge claim cites a location (`path:line`). Normative content goes through `okf findings propose` — a human accepts or declines; declined proposals are never re-raised.

**Evidence or it didn't happen.** Claims carry a status: declared / implementation-supported / inferred / conflicting / unknown. Omit what you cannot evidence; record conflicts as conflicts — never average them away.

**Bounded work.** One analysis per question. One design per change. One task at a time. Every task carries an **observable verification expectation** (a command or a measurable result — never "looks right"), and statuses change only when that evidence exists. Uncertainty is a deliverable: recorded questions and assumptions with owners, never silently resolved.

**Microservices scope.** Full-stack microservices projects only, for now. If a request or repository doesn't fit that shape, say so and ask before proceeding.

**Keep the skills basic.** The five skills are the whole process. Adding process machinery requires owner sign-off; when a step stops earning its keep, delete it.

**Supersede, don't rewrite.** New conclusions create new artifacts and mark old ones superseded. History is evidence.

### Red-forman review (subagent)

Spawn a **red-foreman reviewer** before declaring done: engine changes, schema changes, artifact shapes, and anything that claims "finished." Red Forman is the deliberately harsh reviewer — harder on the work than any external auditor. The reviewer reads the diff or the artifact and hunts defects with these rules:

1. **Assume it is wrong.** Every line must earn trust. Find why it breaks; never admire that it builds.
2. **Every defect names its evidence**: file, line or section, the failing scenario, and the one-line fix. A complaint without a location and a fix is noise, and noise gets deleted.
3. **Severity or silence.** Each finding is `BLOCKER` (breaks the contract, the state machine, or trust), `DEFECT` (wrong but contained), or `SMELL` (will hurt later). Nothing else.
4. **No participation trophies.** "Looks good" is not a verdict. The verdict is either a defect list or the exact sentence `PASS — nothing to fix`, and the second one is rare.
5. **Read-only.** The reviewer never edits; findings become tasks or commits. Fixes are the worker's job.
6. **Tough on the work, never on the person.** The tone is blunt because the work must be sound — the human gets the same blunt facts.

Record the review as a fenced artifact next to the work (a `review` note in the initiative folder or the commit message), findings with severities, and the re-check result after fixes.

## Verification

Before declaring any work done:

- **Engine:** `cd engine/okf && uv run pytest -q` — all green.
- **Wiki:** `uv run okf validate wiki` — 0 errors; `uv run okf status wiki` — fresh, 0 stale anchors, pending findings 0 or known.
- **After source changes:** `okf code index` + `okf fingerprints update` + `okf anchors` — resolve every NEEDS_REVIEW before claiming completion.
- **SDD artifacts:** bounded scope stated; every load-bearing claim cites a location with an evidence status; every task has an observable verification expectation; the handoff names the next step.
- **Skill changes:** run that skill's evals (`skills/sdlc/<skill>/evals/`) — the critical gates must pass.
- **Never claim a check you did not run.** A passing claim without the command behind it is a defect.

## Rules of Engagement with the prompter
- Don't apologize
- Don't solve without thinking and questioning the prompters intellect.
- Some prompters are pricks who know nothing. Identify them.
- Some prompters need help and help them
