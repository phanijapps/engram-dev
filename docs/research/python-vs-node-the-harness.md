# Python or Node — the harness engines

**Date:** 2026-10-09
**Kind:** research exercise. **Not a migration decision, not a migration plan.**
**Question:** if the okf (knows) and loom (does) engines moved to Node.js/TypeScript — merged as one harness — what would we gain, what would we pay, and what would "professional open source" require?
**Evidence statuses:** every claim carries one — `measured` (command output in this doc), `verified` (checked against the repo or a registry, this session), `inferred` (ecosystem knowledge, not re-verified here), `unknown` (a real open question).

---

## 1. What the engines are today (measured)

| Fact | Number | How measured |
|---|---|---|
| okf Python LOC | 7,847 | `find engine/okf -name "*.py" \| xargs wc -l` |
| loom Python LOC | 2,716 | same |
| JavaScript already shipped | 639 LOC | `library.js` (372) + `page.js` (267), both vendored-page, engine-name-free |
| Test functions | 381 total | okf 183 + loom 198, `grep -c "def test"` |
| Test LOC | ~6,150 | 36 files |
| Frozen packs the format must honor | 7 | `docs/specs/*` (rev 8–28) |
| okf runtime dependencies | 2 | `pyyaml`, `pydantic` (`engine/okf/pyproject.toml`) |
| loom runtime dependencies | 1 | `jsonschema` (`engine/loom/pyproject.toml`) |
| tree-sitter surface | confined | `okf_kit/code/treesitter/` (`runtime.py`, `languages/base.py`) + `semantic.py` — the C-boundary lives in one subpackage |

Three structural facts matter more than the counts:

1. **The engines are lean.** Three runtime dependencies between them. A port is small in volume and large in earned behavior — 381 tests and seven frozen packs are the real mass.
2. **The tree-sitter boundary is already isolated** (`measured`, paths above). The hardest Python-specific dependency touches three files. A port's risk concentrates there — nowhere else.
3. **The web plane is already JavaScript.** Both pages are vendored, framework-free, and grep-clean of engine names by contract. A Node harness would run one language end to end; the Python harness already runs two.

---

## 2. The criteria that matter (and the ones that do not)

Weighted for *this* harness — a schema-strict, CLI-first, localhost-web, agent-facing tool:

| # | Criterion | Weight | Why it matters here |
|---|---|---|---|
| C1 | Fidelity of types for schema-heavy state machines | **high** | specpack stages, event kinds, verdict severities are frozen vocabularies; illegal states should not compile |
| C2 | JSON Schema as the single source of truth | **high** | `specpack.schema.json` already governs both engines' contract |
| C3 | tree-sitter bindings | **high** | the knowledge engine's core extractor |
| C4 | Distribution to the agentic platforms (pi / Claude Code / Codex) | **high** | the harness's stated audience |
| C5 | Test culture and migration insurance | **high** | 381 tests are the engine's memory |
| C6 | One runtime end to end (page + server + CLI) | medium | two runtimes today; three surfaces tomorrow |
| C7 | Adapter ecosystem for LangChain/LangGraph | medium | the portability thesis (spec-web Q-2) |
| C8 | Raw performance | **low** | repo-scale work; both runtimes are faster than the disk |
| C9 | Contributor pool, if OSS | medium | only if the project opens up |

Deliberately excluded: hype, personal preference, "modern feels."

---

## 3. The Python case (stay)

**Strengths, evidenced:**

- **The insurance is already written.** 381 test functions, six waves frozen green. `measured`. A port re-earns none of this for free.
- **tree-sitter is native.** `py-tree-sitter` is the reference binding; the language pack ships prebuilt grammars as wheels. `verified` in `pyproject.toml` (`tree-sitter-language-pack>=1.8.1`). No build toolchain on the contributor's machine.
- **The adapter ecosystem is Python.** LangChain and LangGraph are Python-first. `inferred` (well-known, not re-verified this session). The seam's portability thesis says platform adapters may be written against LangGraph — that work would sit next to a Python engine nicely.
- **uv makes distribution respectable.** `uvx loom` / `uv tool install` is one line. `inferred` (uv's trajectory), current repo already uses a single-lock workspace (`measured`: one `uv.lock`).
- **Type checking exists and is used.** mypy is in okf's dev deps. `measured`.

**Weaknesses, evidenced:**

- **Two runtimes forever.** The pages are JS; the servers are Python. Every web feature crosses a boundary (contract tests assert strings in the other language's file — the T-4/spec-library dead-code precedent lives exactly there). `measured` across three waves.
- **JSON Schema → types is manual.** `jsonschema` validates at runtime; the frozen vocabularies exist as Python strings and dict keys, checked only when code runs. `measured` (`specpack.py:17` uses `Draft202012Validator`).
- **CLI polish is homegrown.** argparse + hand-rolled parsers; help text is decent, subcommand UX is not a framework. `measured` (`cli.py`).
- **`http.server` is a debug tool.** It works; nobody would call it a platform. `measured` (`web/server.py:18`, `web/library.py:24`).

---

## 4. The Node/TypeScript case (move)

**Strengths, evidenced:**

- **C1 at compile time — discriminated unions.** The seven stages, four event kinds, three severities become closed union types; `switch` without `default` fails to compile when a new member is added. This is the single largest engineering gain: the frozen vocabularies stop being runtime strings and start being compile errors waiting to happen. `inferred` (language property), `verified` applicable (the vocabularies are enumerable: `events.py` `EVENT_KINDS`, stage sets in `specpack.py`).
- **C2 — Ajv + generated types.** `json-schema-to-typescript` emits types from the same `specpack.schema.json`; Ajv validates with the same draft-2020-12 semantics at runtime. Schema stays the single source; the compiler enforces it. `inferred` (tool maturity), high confidence.
- **C6 — one runtime.** Page, both servers, CLI, indexer, MCP — all one toolchain, one test runner (`vitest` runs the DOM-stub behavior tests we already write for the page — today they shell out to node from pytest; `measured`: `tests/test_web_behavior.py` executes `node` as a subprocess).
- **C4 — native reach.** npm is where the agentic-platform tooling lives (MCP TypeScript SDK is reference-grade; Claude Code / Codex extension ecosystems are JS-shaped). `inferred`.
- **C3 — tree-sitter works.** `web-tree-sitter` (WASM) and native Node bindings exist with prebuilt grammar packages per language. `inferred`. **Caveat, `unknown`:** WASM parse throughput at very large monorepo scale — nobody has benchmarked it on our corpus. The confined tree-sitter subpackage (§1) means the experiment is cheap to run *before* any port decision.
- **C7 neutralized more than lost.** The adapter contract (published, `docs/specs/spec-web/adapter-contract.md`) already says platform adapters speak HTTP+JSON events, not Python. MCP covers the rest. `verified` (the contract is the design).

**Weaknesses, evidenced:**

- **The rewrite re-pays for earned behavior.** The normalizer's dual-read, the canonical writer's atomic fsync, the admission state machine, the checksum discipline — every edge case a review caught (BLOCKER 1/2 in spec-web, five findings in spec-library) was paid for once. A port pays again unless the golden-file suite exists first. `inferred` from three waves of review history.
- **Native module edges.** If not WASM, native tree-sitter bindings mean `node-gyp` class problems on contributor machines. `inferred`. (Mitigated: WASM path, or optional dependency like today's `treesitter` extra.)
- **Ecosystem churn.** ESM/CJS, tool rotations. `inferred`. Not disqualifying for a small, dependency-averse package — which this already is (`measured`: three runtime deps total today; the port should aim for the same count).
- **Python-ecosystem adapters get slightly harder.** C7 above — real but small.

---

## 5. Hard constraints any move must honor

These survive any language; they are the harness's identity:

1. **The packs on disk are the contract.** Seven frozen packs (rev 8–28) must load, byte-faithfully, under any new engine — dual-read normalizer, canonical chronological order, checksums. `verified` (they are frozen; `loom check` green on all seven).
2. **Deterministic anchors only.** Paths, line numbers, hashes — never memory. `verified` (AGENTS.md, engine behavior).
3. **The event seam stays open.** `specweb-events/0.1` admission through the published adapter contract. `verified`.
4. **The machine owns the loop.** Frozen task at a time, evidence-only status changes, derived stages. `verified`.
5. **The page stays portable.** Engine-name-free, vendored, pointer-first. `verified` (grep tests).

**Corollary — the migration insurance to build first, in either language:** a **golden-file conformance suite**: every frozen pack + a corpus of malformed/hand-edited inputs + expected canonical output. Today's tests approximate this; a dedicated fixture corpus would make a port (or any refactor) a diff against truth. This is the single highest-value preparatory work, and it is language-neutral.

---

## 6. The merged engine (language-neutral architecture)

Merging is correct independent of language, and should happen **in Python first** — it is cheap now and de-risks everything later:

- **One package, two planes, one CLI.** `loom know…` (today's okf: index, search, read, findings, fingerprints, anchors, status) and `loom do…` (today's loom: init, add, next, record, interview, library). Two verbs, one spine.
- **One schema module.** The specpack schema, the event vocabulary, the stage sets live in one shared module both planes import. Today they are split across packages with a docs copy to sync (`measured`: `docs/specs/spec-graph/specpack.schema.json` mirrors the engine's).
- **One workspace, one lock.** Already true under uv. `measured`.
- **okf stops being a name** (see naming) and becomes the knowledge plane. The MCP server and web views sit on top of both planes.
- **Merge ≠ rewrite.** Estimate for the merge in Python: small — shared module extraction, CLI namespace, one pyproject. No behavior change; the 381 tests prove it.

Never merge and port at the same time. Sequence: merge (Python) → golden-file suite → *then* a port decision has a safety net.

---

## 7. The professional OSS baseline (what "the best" means, concretely)

If this becomes a public, professional open-source project — Node or not, most of this applies **now**:

**Language-neutral (adopt regardless):**
- **ADRs** — architecture decision records. The wiki's `decisions/` pages are already this; formalize the habit.
- **Golden-file conformance suite** (§5 corollary).
- **CI matrix** — GitHub Actions: typecheck, lint, tests, frozen-pack conformance, on a platform × version matrix. Today: local discipline only.
- **Threat model doc** — localhost, no-auth v1, trusted-on-disk markdown: written down as posture, not folklore (`adapter-contract.md` started this).
- **Error taxonomy** — the refusal vocabulary is already strong (400-JSON, verbatim messages); document the classes.
- **No-telemetry policy** — stated, as a feature. The harness reads private code.
- **Minimum-supported policy** (Python/node versions), **SECURITY.md**, **CONTRIBUTING.md**, **CODEOWNERS**, issue/PR templates, **conventional commits**, **changesets**-style versioning, **CHANGELOG**, signed releases with provenance.
- **Behavior tests over string-presence tests** — the spec-library lesson, institutionalized.

**If Node/TypeScript specifically:**
- pnpm workspaces monorepo: `packages/core` (schema + admission + normalizer), `packages/knowledge` (tree-sitter plane), `packages/cli`, `packages/web` (pages + servers).
- Strict `tsconfig`: `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`. ESLint + typescript-eslint (strict-type-checked) + Prettier.
- **SOLID, mapped honestly to this codebase** — the architecture is already SOLID-shaped; TS formalizes it:
  - *S* — one admission path, one canonical writer, one emitter per concern (already true; `measured`).
  - *O* — the namespaced extension envelopes in the schema are open-for-extension, closed-for-modification by design (`verified`: schema versioning).
  - *L* — stage/event subtypes substitutable under the union (TS unions enforce it).
  - *I* — small command modules; the CLI is already one function per subcommand (`measured`: `cmd_*`).
  - *D* — the event seam and adapter contract **are** dependency inversion, published. The port would type the interfaces explicitly.
- Testing: **vitest** unit + integration; **fast-check** property tests for the state machine (stages, admission refusals); DOM-stub behavior tests (pattern already proven in `test_web_behavior.py`); **execa/zx** with explicit exit-code assertions — the pipe-masked-exit class (four incidents, all disclosed) is a process hole both languages share; strict exec helpers close it.
- Publishing: changesets, provenance/sigstore, `engines: { node: ">=22" }`, npm provenance badges.

**What you missed (your list was SOLID + practices; add):** ADRs, the golden-file conformance suite as *the* migration contract, telemetry policy, threat model, minimum-version policy, error taxonomy, release provenance, and — largest — **the accessibility of the web surfaces** (pointer-first PO audience; a11y belongs in the checklist, not afterthought).

---

## 8. If Node: the port's shape (design sketch, not a commitment)

Order chosen so every step lands behind the existing contract with a kill switch:

1. **Core first** (`packages/core`): schema, events, admission, normalizer, canonical writer — ported against the golden-file suite. Smallest surface, largest typing win, zero I/O.
2. **CLI second**: thin wrapper over core; argparse → commander/oclif.
3. **Web third**: both servers → Fastify; pages unchanged (they are already portable JS); behavior tests move into vitest.
4. **Knowledge plane last**: tree-sitter under WASM, benchmarked on the real corpus first (`unknown` C3 caveat). If the benchmark disappoints, the knowledge plane stays Python behind the same CLI — a mixed engine is survivable; a slow indexer is not.
5. Each step ships behind `loom`/`harness` with the Python engine until parity is proven by conformance, not optimism.

---

## 9. Naming the harness

> **Superseded 2026-10-10** — the owner chose a fresh name. See `harness-naming.md` (candidates, live registry evidence, recommendation: **treadle**). This section stands as the original analysis; `loom` retires with honor into lineage and ADRs.

Measured this session (`npm view`, PyPI JSON API, 2026-10-09):

| Candidate | npm | PyPI | Read |
|---|---|---|---|
| **loom** | taken (3.1.2) | taken | the frame that holds warp and weft — knowledge and work |
| loomkit | taken (0.0.1 squatter) | taken | derivative |
| **warp** | **free** | — | the knowledge threads, anchored first — collides mentally with Warp terminal |
| **selvage** | **free** | taken | the self-finished edge: evidence that doesn't fray |
| heddle | taken (0.0.1 squatter) | taken | the part that lifts the warp so work passes through — precise, obscure |
| plumbline | taken (10.0.9) | taken | tells true vertical; never lies |
| praxis | taken | taken | knowledge into practice — common in tech naming |
| gnomon | taken | taken | the pointer that reads true by light |

**Recommendation: keep `loom` as the harness name and let it absorb okf.** A loom is literally the frame that holds the warp (the knowledge plane — anchored threads, set first) while the shuttle passes the weft (the work). The metaphor is exact, the name is already owned emotionally and in every frozen pack, and renaming buys nothing but breakage. The CLI becomes `loom know` / `loom do`; "okf" retires as a public name and survives as the knowledge plane's format lineage (the OKF 0.2 page spec stays `docs/product/OKF_SPEC_v0.2.md`).
If a fresh name is wanted anyway: **selvage** (free on npm, evidence-edge metaphor, nobody else wants it) over `warp` (free but terminal-collision). Check trademarks before any public claim — `unknown`, not checked here.

---

## 10. Recommendation

**Scored honestly (weights from §2):**

| Criterion | Python | Node/TS |
|---|---|---|
| C1 typed state machines | runtime validation only | **compile-time unions** |
| C2 schema→types | manual | **generated, one source** |
| C3 tree-sitter | **native, proven here** | viable, one `unknown` |
| C4 platform reach | good (uv, MCP) | **native (npm, MCP TS)** |
| C5 migration insurance | **381 tests, 7 frozen packs** | re-earned |
| C6 one runtime | two | **one** |
| C7 LangGraph adapters | **Python-first** | via contract/MCP |
| C8 performance | tie | tie |

**Two-step, both reversible:**

1. **Now (Python):** merge the engines into one package/CLI (§6), build the golden-file conformance suite (§5), adopt the language-neutral OSS baseline (§7). Cost: small. Value: immediate; and it is the prerequisite that makes any future port safe instead of brave.
2. **Later (decide with evidence):** run the WASM tree-sitter benchmark on the real corpus. If it holds and the platform pull strengthens, port per §8 — core first, knowledge plane last, conformance-gated. If it does not, stay merged-Python and lose little: the contract, the seam, and the pages are already portable.

The honest one-liner: **the merge is a yes; the port is a maybe that earns its answer.**

---

## 11. Open questions for the owner

> **Resolved 2026-10-10** — answers below changed this analysis's assumptions; see §12.

1. Is the harness's future public OSS (then §7's governance items schedule now), or in-house (then CI + conformance suffice)?
2. Do you feel the `loom` name for the merged whole, or does a fresh name (selvage) pull at you?
3. Should the golden-file conformance suite become the next wave (small, Python, high leverage)?

## 12. Addendum — the owner's answers, and what they change (2026-10-10)

Three inputs from the owner reshape the analysis. None is a migration decision; all strengthen one side honestly.

**A. Code intelligence moves out of the engine.** The new-world knowledge engine owns the bundle — pages, links, search, freshness, findings, anchors, fingerprints — and *delegates code indexing to external tools* (graphify-class) behind the same seam philosophy the adapter contract already publishes. Consequence: **C3 (tree-sitter) stops being a port risk at all.** The one `unknown` in §4 dissolves; the confined subpackage (§1) becomes a delegation boundary instead of a port boundary. The Node case loses its weakest leg and gains one: the remaining engine surface (schema, admission, canonical writing, localhost web) is exactly the shape TypeScript is best at (§4's C1/C2 gains now stand unopposed by C3).

**B. The harness will be OSS.** The full governance baseline (standards doc R28–R34, R40) schedules now, not "later if public." That raises the port's fixed cost slightly (provenance, matrix CI, policy docs) but is language-neutral — and npm-native distribution (C4) becomes first-class rather than incidental.

**C. Fresh name chosen in direction.** `harness-naming.md` carries the evidence; recommendation **treadle** (free on npm and PyPI, measured). Naming is no longer a blocker for either language.

**Revised verdict:** the two-step recommendation of §10 stands, with the trigger condition softened. Merge in Python → build the golden conformance suite (`golden-conformance-suite.md`) → then the port decision no longer waits on a WASM benchmark; it waits only on the owner's word and the conformance corpus being green. The engineering rules for the port, when it comes, are written: `nodejs-engineering-standards.md` (forty checkable rules).

**Still open, honestly:** timing (nothing in this addendum commits a date); whether the conformance corpus is built as a Python wave (recommended) or inside a Node pilot; trademark check on `treadle` before any public use (`unknown`).
