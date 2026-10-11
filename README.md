# Wukong

**The human drives; the machine moves.**

A local spec-driven development harness for AI coding agents. Turn a product idea
into an agreed plan, verified tasks, and an owner-approved result—with repository
knowledge available throughout the work.

[Quickstart](#quickstart) · [How it works](#how-it-works) ·
[Agent integrations](#agent-integrations) · [Documentation](#documentation) ·
[Contributing](CONTRIBUTING.md)

## What is Wukong?

Wukong gives product owners, development leads, developers, and QA a shared way
to work with an AI coding agent. The current model is one local machine, with
participants taking turns in the same session.

The harness brings together:

- **Repository knowledge:** a searchable Markdown wiki for architecture, domain
  rules, decisions, and source references.
- **Structured work:** JSON specpacks that connect requirements, design decisions,
  tasks, verification commands, evidence, and review.
- **Human approval:** explicit gates for questions, design acceptance, permission
  to start, and permission to finish.
- **A local web app:** browse enrolled projects, read their wiki and specs, and
  act on owner decisions from the spec library.
- **Agent integration:** install skills, reviewers, and lifecycle hooks from one
  authoritative harness package; reconnect projects on supported session events.

The public command is `wukong`; the source workspace remains `treadle/`.

Knowledge lives in `wiki/`. Executable work lives in `specs/<slug>/`. Both stay
with your repository so another session can read the recorded context.

## How it works

Every initiative follows the same sequence:

```text
Understand the repository → Analyze → Plan → Implement → Review → Finish
```

1. **Understand:** build or consult the wiki before proposing changes. Existing
   repositories use `build-kb`; new projects use `new-project`.
2. **Analyze:** capture the problem, requirements, questions, and relevant knowledge.
3. **Plan:** propose the design and task sequence. The owner accepts decisions
   and separately authorizes the exact plan.
4. **Implement:** execute one admitted task at a time, run its declared check,
   and record the actual result in the specpack.
5. **Review:** independently verify the current plan and evidence. Failed checks
   and unresolved findings need repair.
6. **Finish:** the owner chooses **Finish spec** to complete and freeze the record.

New initiatives use the owner-gated workflow. Spec questions require human
answers and approval when present; an empty question list skips that ceremony.
One start approval covers the agreed task sequence. Changing the plan requires
new permission. Passing tests and review do not supply permission to finish.

See [the owner workflow](wiki/systems/owner-workflow.md) for the full contract.

## Quickstart

### 1. Install the runtime

Wukong currently installs from source. Use **Node.js 22 or newer**, **pnpm
9.15.9**, and Git. From a checkout of this repository:

```sh
cd treadle
pnpm install --frozen-lockfile
pnpm build
pnpm --dir packages/cli link --global
cd ..
wukong --version
```

Ensure pnpm's global binary directory is on your `PATH`; `pnpm setup` can
configure it. Source bootstrap scripts are also available:
[`install.sh`](install.sh) for Linux/macOS and [`install.ps1`](install.ps1) for
Windows. For a runtime with bundled dependencies and assets, see
[portable packaging](#portable-runtime-and-native-packages).

### 2. Connect your project

In the project you want to work on, run:

```sh
wukong init harness
```

The interactive installer asks which agent to use and whether to install hooks
and reviewers. For an explicit project installation, replace the path below
with your workspace; use `claude` or `pi` instead of `codex` as appropriate:

```sh
wukong init harness --agent codex --scope project --root "/path/to/project"
```

Successful project hook installation starts the shared app and enrolls that
workspace. Open the browser address printed by the command, then reload your
agent and complete its trust or activation steps. Installation alone does not
prove that the host has activated its hooks.

Use `--dry-run` to preview an installation. If existing files differ, inspect
the changes before using `--force`. `--hooks-only` installs adapters without
copying skills or agents; `--no-hooks` skips automatic project connection.

### 3. Start or continue work

Ask your agent to understand the project and run the installed workflow:

```text
Build the knowledge base for this repository, then analyze adding email alerts.
```

Review its proposed design and plan before authorizing implementation. Use the
web spec library to inspect the work and perform owner actions.

To create an empty owner-gated specpack directly, run this from your project root:

```sh
wukong do init specs/email-alerts --owner-gated --title "Email alerts" --why "Notify users when work needs attention"
```

This creates the record; requirements, design, and task planning still follow.

## The background app

```sh
wukong start serve
wukong status serve
wukong stop serve
```

One background service runs per operating-system user and can serve multiple
explicitly enrolled projects. `start serve` prints its browser address and
returns. The preferred port is 8788; if occupied, the service reports another.

Closing an agent session leaves the app running. After an explicit stop, the
**next supported session event** starts it again. Project enrollment survives
restarts.

For manual connection and context, including when host hooks are unavailable:

```sh
wukong project connect "/path/to/project"
wukong context --workspace "/path/to/project" --json
```

Context reads knowledge and spec state without admitting tasks or performing
owner actions. Use `wukong project disconnect <id>` to remove enrollment.
All listeners bind to `127.0.0.1`; serve trusted workspaces and keep ports local.
Read [SECURITY.md](SECURITY.md) for the trust boundary and vulnerability reporting.

## Agent integrations

| Agent          | Project installer | Generated native artifact             | Activation notes                                                                                        |
| -------------- | ----------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Claude Code    | `--agent claude`  | Plugin with skills, agents, and hooks | Reload and enable the integration.                                                                      |
| Codex          | `--agent codex`   | Plugin with skills and hooks          | Hooks require explicit trust of the current hook definition. IDE availability differs from CLI/desktop. |
| pi             | `--agent pi`      | Package with skills and extensions    | Load the package or installed extension in the host.                                                    |
| GitHub Copilot | `--agent copilot` | None                                  | Project instructions, skills, and reviewer installation; no shared-service hooks.                       |

Use either generated native artifacts or the project installer for a host to
avoid loading the same callbacks twice. Global installs require `--yes` and do
not enroll a project automatically. Native custom-agent packaging is not
asserted for Codex or pi.

Pi's project extensions come from the manifest in `treadle/packages/cli/harness/`.
Their shared payloads live under `hooks/`. See the
[extension source map](treadle/packages/cli/harness/hooks/README.md#pi-extension-sources).
Refresh installed Pi hooks with `wukong init harness --agent pi --scope project --hooks-only`.
Inspect the `--dry-run` plan before adding `--force` for differing files, then reload Pi.
The installer regenerates the local `.pi/extensions/runtime.json` pointer for each checkout.

The runtime has passed native Linux, macOS, and Windows CI with Node 22 and 24.
Full host activation journeys remain in the
[host acceptance backlog](specs/harness-host-acceptance/harness-host-acceptance.json),
including separate Codex desktop/IDE behavior and human hook trust. See the
[compatibility record](specs/background-harness/compatibility.md) for observed
versions and support boundaries.

### Portable runtime and native packages

<details>
<summary>Build commands</summary>

Build a portable runtime from this repository into a new directory:

```sh
pnpm --dir treadle package:runtime "/path/to/new-runtime"
node "/path/to/new-runtime/dist/src/main.js" --help
```

Generate a native host artifact with an installed runtime:

```sh
wukong package harness --agent claude --out "/path/to/new-plugin"
wukong package harness --agent codex --out "/path/to/new-plugin"
wukong package harness --agent pi --out "/path/to/new-package"
```

Each output directory must be new. Native artifacts include a machine-local
Node/runtime pointer; regenerate them if the runtime moves. These commands
create local artifacts; no registry publication is performed.

</details>

## Documentation

| Start here                                                   | What you will find                                             |
| ------------------------------------------------------------ | -------------------------------------------------------------- |
| [Project overview](wiki/project/overview.md)                 | Product scope and current state                                |
| [Architecture](wiki/systems/sdd-harness-architecture.md)     | Knowledge, work, web, and connection layers                    |
| [Owner workflow](wiki/systems/owner-workflow.md)             | Questions, decisions, start permission, review, and completion |
| [Documentation map](wiki/project/documentation-map.md)       | Where current knowledge, executable specs, and history live    |
| [Engineering controls](wiki/project/engineering-controls.md) | Verification, evidence, and repository checks                  |
| [Open work](wiki/project/open-work.md)                       | Known gaps and proposed follow-ups                             |
| [Initiatives](wiki/initiatives/index.md)                     | Navigation to canonical work records                           |

Explore commands with `wukong --help`, `wukong do --help`, and
`wukong know --help`. `know` searches and validates the wiki; `do` manages
specpacks and task evidence.

Freshness currently uses Git HEAD and Python-only fingerprints. A fresh stamp
cannot establish that dirty TypeScript or Markdown sources were detected.
Legacy specpack formats retain their original rules; new gated work uses 0.4.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) and [AGENTS.md](AGENTS.md) before changing
the harness. The active code is a strict TypeScript pnpm workspace in `treadle/`;
installable agent content is maintained in `treadle/packages/cli/harness/`.

Run the repository checks from `treadle/`:

```sh
pnpm check
pnpm coverage
pnpm corpus:check
pnpm brand:check
pnpm audit:prod
pnpm links
```

Coverage floors are 75% for statements, lines, and functions, and 65% for
branches. Contract corpus changes require deliberate review. Report actual
results and preserve unrelated work.

For bugs and feature proposals, [open an issue](https://github.com/phanijapps/engram-dev/issues).
Report security issues using [the security policy](SECURITY.md).

## License

[MIT](LICENSE).
