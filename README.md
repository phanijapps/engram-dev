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

## Run the shared background app

Build once with `pnpm --dir treadle build`. A source installation (`./install.sh`,
or `./install.ps1` on Windows) exposes the `treadle` command. Then:

```text
treadle start serve
treadle project connect /absolute/path/to/project
treadle status serve
treadle context --workspace /absolute/path/to/project --json
treadle stop serve
```

`start serve` returns the browser address and detaches the server. It reuses one
healthy service per operating-system user. The preferred browser port is 8788;
an occupied port gets a reported alternative. Project cards lead to that
workspace's wiki/search and spec library, including existing owner actions.
Enrollment persists across server restarts. An empty canonical `specs/` takes
precedence over legacy `docs/specs/`.

Install project hooks with `treadle init harness --agent codex --scope project
--root /absolute/path/to/project` (replace `codex` with `claude` or `pi`).
Successful wiring starts the server if needed and connects that explicit
workspace. Reload the host and complete its own trust/activation steps.
Installation does not assert that hooks have actually run. Use `--hooks-only`
to update adapters without copying skills or agents. `--dry-run` and
`--no-hooks` do not connect a project; global installs do not enroll a workspace.

Startup and prompt callbacks reconnect from the event workspace, read current
wiki/spec context, and report approval gates without advancing tasks. Closing
an agent session leaves the server running. After `stop serve`, the **next
session event** starts it again; there is no polling watchdog. Multiple projects
and sessions share the service. `project disconnect <id>` removes enrollment
without deleting files or stopping another session's service.

## Native host packages and fallback

Generate a fresh local artifact from the authoritative harness tree:

```text
treadle package harness --agent claude --out /absolute/path/to/new-plugin
treadle package harness --agent codex --out /absolute/path/to/new-plugin
treadle package harness --agent pi --out /absolute/path/to/new-package
```

The Claude artifact contains its plugin manifest, skills, agents and hooks;
Codex contains a plugin manifest, local marketplace, skills and hooks; pi
contains its package manifest, skills and extensions. Native custom agents for
Codex and pi are not asserted by this generator. Use either the native artifact
or compatibility installation for a host to avoid loading both callbacks.
These local artifacts include a machine-local Node/runtime pointer; regenerate
when the runtime moves. Missing runtime produces bootstrap guidance. Nothing
is published to a registry.

Codex hooks require the host's explicit trust of the current hook file. Codex
IDE plugin availability differs from CLI/desktop: if hooks are unavailable or
inactive, use `project connect` and `context --workspace` explicitly. The source
installation remains available for host-specific configuration. Runtime,
packaging and lifecycle checks passed in native CI on Linux, macOS and Windows
with Node 22 and 24. Full host activation journeys remain pending,
including Codex desktop/IDE and human hook trust. See the
[compatibility record](specs/background-harness/compatibility.md). The owner
deferred those unrun journeys to the
[host acceptance backlog](specs/harness-host-acceptance/harness-host-acceptance.json)
so the runtime implementation spec can finish without claiming host acceptance.

For a portable production runtime, run `pnpm --dir treadle package:runtime
/absolute/path/to/new-runtime`, then invoke `node <runtime>/dist/src/main.js`.
Node >=22 is required; this artifact includes dependencies and browser assets.
The older `do library <specsRoot>` and `do interview <packDir>` foreground
commands remain available. All listeners bind `127.0.0.1`; read
[SECURITY.md](SECURITY.md) before serving workspace content.

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
remaining native host/platform witnesses and automatic documentation upkeep. License and
legacy integration choices remain owner decisions. Retrospectives must come
from actual session evidence; past sessions cannot be reconstructed from a
completed pack. Read [open work](wiki/project/open-work.md) before choosing the
next Phase 2 scope.

Continue with [architecture](wiki/systems/sdd-harness-architecture.md),
[engineering controls](wiki/project/engineering-controls.md),
[initiatives](wiki/initiatives/index.md) and
[retrospectives](wiki/retrospectives/index.md).
