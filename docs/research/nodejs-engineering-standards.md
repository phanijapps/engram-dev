# Node.js engineering standards — enterprise-ready, OSS-first

**Date:** 2026-10-10
**Kind:** research → rules. The binding checklist for the harness if/when it moves to Node/TypeScript (per `python-vs-node-the-harness.md`, port gated behind the golden conformance suite).
**Form:** imperative rules, each checkable in review or CI. A rule that cannot be checked is a wish; wishes live in ADRs, not here.

---

## 1. Foundations

**R1. TypeScript, strictest.** `strict: true`, plus `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `noPropertyAccessFromIndexSignature`, `verbatimModuleSyntax`, `isolatedModules`. Rationale: the harness's frozen vocabularies (stages, event kinds, severities) become closed unions; adding a member without handling it is a compile error, not a runtime surprise.

**R2. ESM only.** `"type": "module"`, `module: "nodenext"`, explicit `.js` extensions on relative imports. No dual-format packages. `engines: { "node": ">=22" }` and enforce with `engine-strict`.

**R3. No default exports** for modules, types, or constants (components/classes may keep one). Named imports make refactors and API reviews greppable.

**R4. Dependency direction is law:** `core` ← `knowledge`/`web` ← `cli`. Nothing in `core` imports from a package above it. Enforced by `eslint-plugin-boundaries`, not by hope.

**R5. Runtime dependencies: budget of ten.** Today's Python engines run on three. The port keeps the same avarice. Every addition names its replacement of hand-written risk in the PR. Lockfile committed. Renovate with grouped updates.

## 2. Types as the machine's vocabulary

**R6. Discriminated unions for every closed vocabulary.** Stages, event kinds, task statuses, severities: `type Stage = 'drafted' | 'planning' | …`. Exhaustive switches end in `assertNever(x)` — new members break the build until handled.

**R7. Branded IDs.** `type TaskId = string & { readonly __brand: 'Task' }`. A `TaskId` cannot be passed where a `QuestionId` is expected. IDs are this harness's foreign keys; treat them like it.

**R8. Parse, don't validate, at boundaries.** Everything crossing a process edge (HTTP bodies, CLI args, config, files on disk) passes through a schema-typed parser exactly once; internals consume typed values. One source of truth: the JSON Schemas we already own, via generated types + Ajv (draft 2020-12). Never re-validate the same data twice in different shapes.

**R9. `readonly` by default** on data that has landed (packs, events, verdicts). Mutation happens in the one admission path, on explicit copies, never in place on loaded documents.

**R10. `any` is a build failure.** `as` casts require a comment naming the invariant. Non-null `!` only where a parse (R8) already proved the shape.

## 3. Errors and refusals

**R11. Two error classes, never mixed.**
- *Programmer errors* (invariant violated): throw `Error` subclasses; they are bugs; the process may die loudly.
- *Domain refusals* (expected, user-facing: "already resolved", "not one of the options", "the pack refused to load"): typed result values (`type Refusal = { ok: false; code: RefusalCode; message: string }`), returned, never thrown. The refusal vocabulary is a contract — golden-tested (see the conformance suite doc).

**R12. Wrap, never swallow.** Every catch either handles specifically or rethrows with `new Error("context", { cause })`. A bare `catch {}` fails review.

**R13. Error serialization is part of the API.** Our HTTP refusals are 400-JSON with the message verbatim. Any new surface defines its error shape in the same contract doc, and tests assert exact refusal texts.

## 4. Async discipline

**R14. No floating promises.** `@typescript-eslint/no-floating-promises` on; every await or deliberate fire-and-forget is explicit (`.then(void` never; use named void functions for deliberate detach).

**R15. One async shape per operation.** An API is all-async or all-sync; never both for the same operation.

**R16. AbortSignal into every long operation** (indexing, search, waits). The interview's Ctrl-C escape and the library's shutdown paths are designed behavior, not accidents.

**R17. No unbounded concurrency.** `p-limit` (or the pool pattern) for any fan-out; limits named and configurable.

**R18. Sync I/O only in one-shot CLI paths,** never inside request handlers. Streams for anything that can exceed memory.

## 5. Testing

**R19. The pyramid, with teeth:** vitest unit + integration; **behavior tests over string tests** (the spec-library lesson: string-presence blessed dead code — DOM-stub tests execute real functions); **property tests (fast-check) for every state machine** — admission, stage derivation, normalizer round-trips; **golden conformance** for format contracts (its own doc); coverage thresholds on changed lines, honest and enforced in CI.

**R20. Exit codes are asserted explicitly** in every test or script that spawns a process. Four pipe-masked-exit incidents in this repo's history; the rule is institutionalized here: helpers return `{ code, stdout, stderr }` and the code is checked before any output claim.

**R21. Flaky tests are quarantined the same day, fixed before the next release.** Retries are for networks, not for bugs.

**R22. Web surfaces get smoke tests** (Playwright, one happy path per surface) and accessibility assertions (axe) — the audience is non-technical product owners; a11y is a release gate, not a garnish.

## 6. Security posture (documented, then enforced)

**R23. Bind localhost by default; document the no-auth v1 posture** as a threat-model note, and mean it. Auth is a platform-adapter concern — the adapter contract says so.

**R24. Path handling: allow-list regex + `resolve()` containment** on every file route (the symlink lesson is already paid for; keep the test that proves it).

**R25. No `eval`, no `new Function`, no dynamic `require`.** CSP headers on served pages. Markdown posture stays trusted-on-disk and *written down* (it is, in the adapter contract).

**R26. Supply chain:** lockfile committed; `npm audit` gate in CI; provenance-enabled publishing (sigstore); maintainers publish only from CI, never laptops; no postinstall scripts from dependencies (audit gate + `--ignore-scripts` in CI).

**R27. No telemetry, ever, by default.** The harness reads private code. State it in the README as a feature.

## 7. Project shape and process

**R28. pnpm monorepo:** `packages/core` (schema, admission, normalizer, events), `packages/knowledge` (bundle: pages, links, search, freshness, findings), `packages/cli`, `packages/web` (pages + localhost servers). Public surface: `exports` maps; no deep imports into `src/`.

**R29. Lint/format/check pipeline in one command** (`pnpm check`: typecheck → lint → format-check → test), wired as a git pre-push hook (lefthook) and as the CI gate. Prettier ends style debates; typescript-eslint `strict-type-checked` config.

**R30. Conventional commits, changesets versioning,** CHANGELOG generated, semver with a written deprecation policy (two minor releases of warnings before a removal).

**R31. CI (GitHub Actions):** matrix node 22/24 × linux/macos/windows; gate order: check → conformance → build → smoke; PR previews via `pkg-pr-new`; provenance-signed releases.

**R32. ADRs for every architectural decision,** in `docs/adr/NNNN-title.md`, numbered, immutable once accepted (superseded, never edited — same rule as the packs). The wiki's decisions pages are the prototype; port the habit.

**R33. Governance files:** CONTRIBUTING (with the check pipeline), SECURITY (coordinated disclosure), CODEOWNERS, issue/PR templates with the checklist from R20/R21, maintainership and funding docs if the project grows them.

**R34. Docs are release artifacts:** typedoc API reference; a quickstart that works from a clean clone in under five minutes; every code example in docs is executed by CI (or deleted).

## 8. SOLID, in Node terms (the short form)

- **S** — one admission path, one canonical writer, one emitter per concern (already the architecture; the packages enforce it).
- **O** — the schema's namespaced extension envelopes: extend by adding envelope kinds, never by editing frozen ones.
- **L** — unions and branded types make substitution a compile question.
- **I** — commands and handlers implement small explicit interfaces (`Admitter`, `Emitter`, `PackStore`); no god-modules.
- **D** — the event seam *is* dependency inversion, published; in TS it gains a named interface both the harness adapter and any platform adapter implement, with contract tests shared between them.

## 9. Enterprise-readiness extras (the checklist owners forget)

**R35.** Graceful shutdown: SIGTERM/SIGINT handlers complete in-flight admissions, then exit — the interrupt pattern is designed behavior.

**R36.** Timeouts on every outbound wait; health endpoint on every server; structured logging (pino) with a stable field set; log level configurable, secrets never logged.

**R37.** Config: environment + explicit flags only; no config files that outrank the command line; document every variable.

**R38.** Benchmarks (tinybench) for the hot paths — normalizer, canonical emit, search — run in CI against budgets; regressions fail the build like tests do.

**R39.** Release provenance badges, minimum-support policy (node LTS policy), and a stated policy for the frozen formats (`specpack/0.x` compatibility is a contract, per the conformance suite).

**R40.** The conformance suite runs against every published artifact (not just the repo tree) before the release tag.

---

*Forty rules. Each maps to a CI check or an explicit review item. When two rules conflict, the stricter wins, and the conflict becomes an ADR.*
