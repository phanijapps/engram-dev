# AGENTS.md — working on Wukong

## Project and Phase 2 baseline

Wukong is a spec-driven development harness. Its thesis is **knowledge first,
then a tight loop**. The knowledge plane (`know`) maintains a searchable wiki.
The work plane (`do`) admits specpacks, tasks, evidence, review and owner actions.
The active runtime is one strict-TypeScript pnpm workspace under `treadle/`.
The Python engines are retired at tag `python-final`.

Use `build-kb` to understand an existing repository. The delivery loop is
`analyze` → `plan` → `implement` → `review`, with explicit owner approval gates.
The intended scope is a full-stack repository or a small set of repositories.
Code indexing is delegated to external tools; the engine owns the knowledge bundle.

The Phase 2 baseline includes the completed owner workflow and documentation
migration. New work lives in root `specs/`; current knowledge lives in `wiki/`.
The owner-workflow reference pack is
[specs/spec-completion-handoff](specs/spec-completion-handoff/spec-completion-handoff.json).
Do not turn this baseline into a claim that every historical initiative or gap
is resolved. Phase 2 scope needs its own analysis, decisions and approved plan.

## Authority and repository map

| Location                        | Responsibility                                                                                                          |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `treadle/packages/core/`        | Specpack admission, frozen context, task evidence, owner workflow, locking and audit                                    |
| `treadle/packages/knowledge/`   | OKF bundles, search, links, findings, anchors and freshness                                                             |
| `treadle/packages/web/`         | Local interview room and standing spec library                                                                          |
| `treadle/packages/cli/`         | `do`, `know` and harness installation                                                                                   |
| `treadle/packages/conformance/` | Committed contract witnesses and conformance runner                                                                     |
| `treadle/conformance/`          | TypeScript corpus generator                                                                                             |
| `treadle/packages/brand/`       | Product naming and the white-label fence                                                                                |
| `treadle/packages/cli/harness/` | Authoritative installable skills, agents, hooks and `harness.json`                                                      |
| `wiki/`                         | Current systems, domain rules, decisions, research, project guidance, initiative navigation and observed retrospectives |
| `wiki/assets/contracts/`        | Vendored OKF contract, original specpack schema and separate owner-workflow schema                                      |
| `specs/<slug>/`                 | Canonical executable pack, analysis, design, task plan, review and evidence                                             |
| `specs/archive/`                | Retired code, records and original documentation; historical evidence                                                   |

Start with [the documentation map](wiki/project/documentation-map.md),
[architecture](wiki/systems/sdd-harness-architecture.md) and
[open work](wiki/project/open-work.md). The wiki explains the system; the canonical
specpack owns task state and completion. Do not create a second task ledger in
wiki pages. There is no `docs/` directory or compatibility symlink.
Historical paths resolve through
[the relocation map](specs/docs-root-migration/relocations.json).

## Trust and owner authority

- Find paths, lines and hashes with tools. Cite observed evidence; keep uncertainty explicit.
- Agents propose; humans accept. Never invent an owner answer, approval, identity or timestamp.
- Owner answers, decision acceptance, permission to start and permission to finish are distinct acts.
- Record actual commands and exit codes before advancing task state. An assertion is not evidence.
- Preserve approved artifacts and closed packs. Add dated supplements or superseding artifacts when conclusions change.
- Submit normative discoveries through the findings ledger. Pending proposals are not accepted rules; declined keys cannot be promoted again.

Owner actions require `human:` claims. Task evidence can identify an implementing
agent. These claims record actors; they do not provide authentication.
Do not click owner approval controls or issue owner approval commands on the
owner's behalf merely because implementation checks passed.

## Work and approval gates

New initiatives use `do init --owner-gated`, which creates `specpack/0.4` with
`owner-gated/1`. The bare CLI default remains 0.3 for compatibility.
Formats 0.2 and 0.3 retain their original behavior. Active legacy adoption needs
an explicit owner action and preserves prior JSON; closed packs cannot adopt.
See [the implemented owner workflow](wiki/systems/owner-workflow.md).

For gated work:

1. Read the requirement, brief and relevant wiki evidence before proposing a change.
2. Register spec questions explicitly. Human answers and spec approval are needed when those questions exist; an empty list skips that ceremony.
3. Present design decisions and the complete task plan. Accept each proposed decision before execution; rejected required decisions block their tasks.
4. Get separate permission to start the exact plan. The receipt binds the plan digest, including the agreed artifacts and task definitions.
5. Execute the approved sequence one admitted task at a time. Read the machine handout and frozen context, run the declared check and record its real result.
6. Obtain independent PACK review for the current plan and evidence digests.
7. Open the library at `#/slug/review`. The owner's separate **Finish spec** action completes and freezes the record.

One start receipt covers the approved sequence. Do not ask again at every task.
Stop for failed checks, source drift, missing context or a new design decision.
Repairs within approved scope can proceed and return to review. A changed plan
needs owner review and new start permission. Do not silently repin or unblock
work to bypass a refusal. Check the held revision and use the shared writer lock.
If audit recovery is pending, preserve the canonical receipt; do not repeat consent.

## Agent practice

**Context before questions.** Read the wiki and code first. Ask only what evidence
cannot supply, in plain language, once and in a batch where possible.

**Writing and skills.** Use the writer skill for documents when applicable.
Honor an explicit user request to work without skills. Such a request does not
authorize invented evidence or approval. For direct documentation edits, keep
the change bounded to the requested files and necessary verification.

**Harness changes.** Edit the authoritative tree in
`treadle/packages/cli/harness/`, then use the installer to update the requested
agent surfaces. Do not patch installed copies independently. The manifest targets
Pi, Claude, Codex and Copilot; hook support differs by surface.

**History and retrospectives.** Record observed sessions or participant accounts.
Do not reconstruct past sessions from task statuses or commits. Retrospective
creation and documentation upkeep are not automatic closure hooks today.
The [documentation lifecycle proposal](wiki/project/documentation-lifecycle.md)
remains draft; do not present it as enforced policy.

**Security.** Read [SECURITY.md](SECURITY.md) before changing servers. Both surfaces
bind `127.0.0.1`, use CSP and trust on-disk Markdown. They are not remote services
and do not sanitize untrusted repository content. Follow the existing path,
origin, revision and write guards.

**Review.** Require a read-only red-foreman review before claiming work finished.
The reviewer must be independent of implementation, cite findings with severity
and locations, and rerun relevant expectations. Record the verdict beside the
work. Fix findings within approved scope; return new scope to owner review.

**Diff discipline.** Preserve unrelated user edits. Remove dead code and stale
comments in touched surfaces. Verify exit codes; do not hide failures in pipelines.

## Build and verification

Run from the repository root with Node >=22. pnpm 9.15.9 is pinned in
[treadle/package.json](treadle/package.json).

```bash
cd treadle
corepack enable
pnpm install --frozen-lockfile
pnpm check
pnpm coverage
pnpm corpus:check
pnpm brand:check
pnpm audit:prod
pnpm links
```

`pnpm check` runs the composite source typecheck, ESLint, Prettier and tests.
Coverage floors are 75% statements, lines and functions, and 65% branches.
`audit:prod` checks production dependencies at high severity and above.
Report actual outcomes; do not carry an old green claim into a new change.
A CI matrix declaration does not establish a successful remote run.

The corpus is the contract witness for covered cases. `corpus:check` regenerates
and compares committed bytes. Change goldens deliberately with `corpus:regen`
and review the diff; a golden change is a contract change. Put user-facing
product naming in `@treadle/brand`; do not scatter it through engine packages.

Before declaring work done, check the repository gates and coverage floors,
then require wiki validation with 0 errors and 0 warnings, 0 anchors needing
review, and a fresh stamp. Never claim an unrun check.

## Wiki maintenance and freshness limits

Run this block once from the repository root:

```bash
cd treadle
pnpm exec tsx packages/cli/src/main.ts know fingerprints .. ../wiki
pnpm exec tsx packages/cli/src/main.ts know stamp ../wiki --workspace ..
pnpm exec tsx packages/cli/src/main.ts know anchors ../wiki --workspace ..
pnpm exec tsx packages/cli/src/main.ts know validate ../wiki
pnpm exec tsx packages/cli/src/main.ts know status ../wiki --workspace ..
```

Wiki concepts need `title`, `type` and `description`. Their load-bearing claims
cite repository locations. Page status is `draft`, `stable` or `deprecated`;
it is not the executable spec lifecycle. Decisions record alternatives and
consequences. Machine-managed `wiki/code/**` pages remain frozen.

The current fingerprint scanner tracks Python files only. TypeScript and
Markdown sources can remain unbaselined, and the freshness stamp compares Git
HEAD rather than content. A fresh stamp is not proof that dirty source changes
were detected. Inspect cited sources and disclose this limit. Refresh the stamp
after the final commit when needed; do not create an endless stamp-only commit cycle.

## Phase 2 candidates

[Open work](wiki/project/open-work.md) is the gap register, not an approved backlog.
The strongest next candidate is reliable TypeScript and Markdown freshness,
including dirty changes and affected wiki concepts. Other candidates include
test-file typechecking, CI evidence, multi-root navigation, documentation upkeep
and attested-computation execution. License and legacy integration choices need
owner decisions. Analyze the chosen slice and agree its checks before building it.
