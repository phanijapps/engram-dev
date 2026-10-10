# treadle

A local spec-driven development harness: build repository knowledge, agree the
work, implement checked tasks, and finish with independent review and owner approval.
The active runtime is strict TypeScript in `treadle/`.

The project is entering Phase 2. The baseline includes a searchable wiki,
executable specpacks, a local interview room and spec library, a contract corpus,
and the completed owner approval workflow. See the
[project overview](wiki/project/overview.md) and
[owner workflow](wiki/systems/owner-workflow.md).

## What the harness does

| Plane        | Responsibility                                                                                              |
| ------------ | ----------------------------------------------------------------------------------------------------------- |
| `know`       | Search and read wiki concepts, manage findings, validate links and anchors, and record freshness            |
| `do`         | Create and inspect specpacks, admit tasks, record evidence, and enforce owner approval and completion gates |
| Local web UI | Answer questions in the room; inspect work and perform separate owner actions in the library                |

The working model is knowledge first, then `analyze` → `plan` → `implement` →
`review`. Code indexing uses external tools; the engine owns the wiki bundle
and work records. The installable harness supplies the agent instructions,
reviewers and hooks. Product naming is isolated in `@treadle/brand`.

## Run from this checkout

Use Node >=22 and the pnpm version pinned in `treadle/package.json`.
From the repository root:

```bash
cd treadle
corepack enable
pnpm install --frozen-lockfile
pnpm check
```

Read [the installation walkthrough](wiki/assets/guide/index.html) for installation
outside this checkout. To preview a project installation for Codex, while still
in `treadle/`:

```bash
pnpm exec tsx packages/cli/src/main.ts init harness --agent codex --scope project --root .. --dry-run
```

For a clean destination, remove `--dry-run` to install. Existing modified files
can cause a refusal; inspect those differences before choosing an overwrite.
The manifest also targets Pi, Claude and Copilot; hook support differs by agent.
The source of installed components is `treadle/packages/cli/harness/`.

## Open and inspect work

Run these commands from `treadle/`:

```bash
pnpm exec tsx packages/cli/src/main.ts do where ..
pnpm exec tsx packages/cli/src/main.ts know search ../wiki "owner workflow"
pnpm exec tsx packages/cli/src/main.ts do library ../specs
```

The library opens in the browser at `http://127.0.0.1:8788` by default.
It serves the explicit specs root and stays running until stopped.
Use `do interview <packDir>` for a single pack's question room.
Both servers are localhost-only. Serve trusted workspace content; Markdown is
not sanitized for untrusted input. Read [SECURITY.md](SECURITY.md).

## Approval and completion

New work uses `do init <packDir> --owner-gated --title "..." --why "..."`,
which creates specpack 0.4. The intended sequence is:

1. Record the requirement and brief.
2. Answer and approve spec questions when needed.
3. Accept design decisions and review the complete task plan.
4. Give separate permission to start that exact plan.
5. Implement one admitted task at a time and record its actual check.
6. Obtain independent review for the current plan and evidence.
7. Use **Finish spec** in the library to complete and freeze the record.

Decision acceptance does not authorize implementation. Successful tasks and
review do not supply final owner consent. One start approval covers the agreed
task sequence; a changed plan needs new permission.

The bare CLI still defaults to specpack 0.3. Existing 0.2 and 0.3 records retain
their contracts; active adoption into the new workflow is explicit. Closed
records stay frozen. The completed
[owner-workflow initiative](wiki/initiatives/spec-completion-handoff.md) and its
[retrospective](wiki/retrospectives/2026-10-10-owner-gates.md) record the repair
and actual owner completion.

## Where documentation and specs live

| Location               | Authority                                                                      |
| ---------------------- | ------------------------------------------------------------------------------ |
| `wiki/`                | Current architecture, domain rules, decisions, research and operating guidance |
| `specs/<slug>/`        | Canonical specpack, analysis, design, task plan and evidence                   |
| `wiki/initiatives/`    | Dated navigation to executable records                                         |
| `wiki/retrospectives/` | Observed-session reports and participant accounts                              |
| `wiki/assets/`         | Format contracts, installation guide and replay assets                         |
| `specs/archive/`       | Retired records and original documentation preserved as evidence               |

There is no `docs/` directory. The wiki consolidates knowledge without duplicating
the executable task ledger. Historical paths resolve through the
[relocation map](specs/docs-root-migration/relocations.json). Python engines are
retired at tag `python-final`; the TypeScript generator checks the committed
contract witnesses. See [the documentation map](wiki/project/documentation-map.md).

## Verify changes

From `treadle/`:

```bash
pnpm check
pnpm coverage
pnpm corpus:check
pnpm brand:check
pnpm audit:prod
pnpm links
```

Coverage floors are 75% statements, lines and functions, and 65% branches.
Corpus changes are contract changes and need deliberate review. Current test
counts, coverage results and CI runs belong in dated evidence.
See [CONTRIBUTING.md](CONTRIBUTING.md) and [AGENTS.md](AGENTS.md) for work rules
and the wiki maintenance commands.

## Phase 2 starting point

The principal knowledge gap is source freshness: the fingerprint scanner tracks
Python only, while the runtime is TypeScript. The stamp compares Git HEAD;
it does not establish that dirty TypeScript or Markdown changes were detected.
Source citations still need direct inspection. Reliable freshness is a proposed
next slice, not an already approved implementation plan.

Other recorded gaps include test-file typechecking, remote CI evidence,
multi-root library navigation and automatic documentation upkeep. License and
legacy integration choices remain owner decisions. Retrospectives must come
from actual session evidence; past sessions cannot be reconstructed from a
completed pack. Read [open work](wiki/project/open-work.md) before choosing the
next Phase 2 scope.

Continue with [architecture](wiki/systems/sdd-harness-architecture.md),
[engineering controls](wiki/project/engineering-controls.md),
[initiatives](wiki/initiatives/index.md) and
[retrospectives](wiki/retrospectives/index.md).
