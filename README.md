# Wukong

```text
 __        __      _
 \ \      / /_   _| | _____  _ __   __ _
  \ \ /\ / /| | | | |/ / _ \| '_ \ / _` |
   \ V  V / | |_| |   < (_) | | | | (_| |
    \_/\_/   \__,_|_|\_\___/|_| |_|\__, |
                                   |___/
          .-"""-.       |
         /  o o  \      |
        (   (_)   )     |
         \  ___  /      |
          '-----'       |
          /|   |\-------|
         / |___|        |
           /   \        |
```

**The human drives; the machine moves.**

Welcome to Wukong. Give your AI coding agent repository knowledge, a clear plan,
and a reliable path from idea to reviewed code. You decide when work starts and
when it is complete.

Wukong runs on your machine. Your wiki, specs, decisions, and evidence stay with
your repository. The local web app puts the current gate and next action in view.

[Install](#install) · [Connect your project](#connect-your-project) ·
[Your first journey](#your-first-journey) · [Documentation](#documentation)

## Install

You need **Git**, **Node.js 22 or newer**, and **pnpm 9.15.9**. Wukong currently
installs from source. The scripts download the source, build it, and link the
`wukong` command.

This preview lives on `codex/background-harness`. The commands below use that
branch until it reaches `main`. Use an empty destination directory for the clone.

If pnpm has no global binary directory, run `pnpm setup` first. Open a new
terminal after it updates your `PATH`.

### macOS and Linux

Run these commands in a Bash terminal:

```sh
git clone --branch codex/background-harness https://github.com/phanijapps/wukong.git "$HOME/.engram-dev"
bash "$HOME/.engram-dev/install.sh"
```

The [Bash installer](install.sh) uses `$HOME/.engram-dev` by default.

### Windows

Run these commands in PowerShell:

```powershell
git clone --branch codex/background-harness https://github.com/phanijapps/wukong.git "$env:LOCALAPPDATA\engram-dev"
powershell -NoProfile -ExecutionPolicy Bypass -File "$env:LOCALAPPDATA\engram-dev\install.ps1"
```

The [PowerShell installer](install.ps1) uses `$env:LOCALAPPDATA\engram-dev` by
default. The execution policy option applies only to that PowerShell process.
Both default directory names preserve the existing installation layout.

Check the installed command:

```sh
wukong --version
```

<details>
<summary>Install from your own checkout</summary>

```sh
git clone --branch codex/background-harness https://github.com/phanijapps/wukong.git
cd wukong/treadle
pnpm install --frozen-lockfile
pnpm build
pnpm --dir packages/cli link --global
wukong --version
```

The public command is `wukong`. The source workspace remains `treadle/`.

</details>

## Connect your project

Open a terminal in the project you want to work on. Run the interactive installer:

```sh
wukong init harness
```

Choose your agent, then select the hooks and reviewers you need.
For an explicit project installation, replace the path below with your project:

```sh
wukong init harness --agent codex --scope project --root "/path/to/project"
```

Use `claude`, `pi`, or `copilot` instead of `codex` for those agents.
Successful project hook installation starts the shared app and connects your
project. Open the browser address that the installer prints.

Reload your agent and complete its trust or activation steps.
Installation does not establish that the host has activated its hooks.
Copilot has no shared-service hooks; connect its project manually:

```sh
wukong project connect "/path/to/project"
```

Use `--dry-run` to inspect the installation first. Inspect differing files before
using `--force`. Use `--hooks-only` to refresh hook adapters, or `--no-hooks` to
install without automatic project connection.

## Your first journey

Start with a request like this:

```text
Build the knowledge base for this repository, then analyze adding email alerts.
```

The agent follows a clear sequence:

```text
Know the code -> Analyze -> Plan -> Implement -> Review -> Finish
```

1. **Know the code.** `build-kb` documents the repository in a searchable wiki.
   Use `new-project` to shape a new project.
2. **Analyze.** Record the problem, requirements, questions, and relevant context.
3. **Plan.** Review the design and tasks. Accept the decisions, then separately
   authorize the exact plan with **Start Implementation**.
4. **Implement.** The agent executes one admitted task at a time and records real
   check results.
5. **Review.** An independent reviewer checks the changes against the plan and
   evidence. The agent repairs failures before another review.
6. **Finish.** Inspect the result, then select **Finish spec** to complete and
   freeze the record.

Answer and approve spec questions when the plan contains them.
One start approval covers the agreed task sequence. A changed plan needs new
permission. Tests and review do not supply permission to finish.

In browser feedback, save a draft before selecting **Submit feedback**.
The agent can read your submitted comments and publish revised rounds.
Resolve threads after you inspect the revisions. Feedback submission and thread
resolution are separate from owner start and finish approval.

Your repository keeps two useful records:

| Record          | Purpose                                                                |
| --------------- | ---------------------------------------------------------------------- |
| `wiki/`         | Product context, architecture, rules, decisions, and source references |
| `specs/<slug>/` | Requirements, design, tasks, checks, review, and owner actions         |

To create an empty owner-gated specpack directly, run this from your project root:

```sh
wukong do init specs/email-alerts --owner-gated --title "Email alerts" --why "Notify users when work needs attention"
```

This creates the record. Analysis and task planning still follow.
See [the owner workflow](wiki/systems/owner-workflow.md) for the full contract.

## Manage the local app

```sh
wukong start serve
wukong status serve
wukong stop serve
```

One background service runs per operating-system user and serves connected
projects. The preferred port is **8788**. If that port is occupied, the service
prints a different address.

Closing an agent session leaves the app available. After an explicit stop, the
next supported session event starts it again. Project connections survive restarts.

Inspect project context or remove a project connection:

```sh
wukong context --workspace "/path/to/project" --json
wukong project disconnect <id>
```

Context reads wiki and spec state without executing tasks or owner actions.
All listeners bind to `127.0.0.1`. Use trusted repositories and keep the ports
local. See [SECURITY.md](SECURITY.md) for the trust boundary.

## Agent support

| Agent          | Installed integration                                      | Activation                                                  |
| -------------- | ---------------------------------------------------------- | ----------------------------------------------------------- |
| Claude Code    | Skills, reviewers, and hooks; optional native plugin       | Reload and enable the integration.                          |
| Codex          | Skills, reviewers, and hooks; optional native plugin       | Trust the current hooks. Availability differs across hosts. |
| pi             | Skills, reviewers, and extensions; optional native package | Reload the installed extensions or load the package.        |
| GitHub Copilot | Instructions, skills, and reviewers                        | No shared-service hooks. Connect the project manually.      |

Use either a native artifact or the project installer for each host. Avoid
loading the same callbacks twice. Global installation needs `--yes` and does not
connect a project automatically.

Pi extensions come from the authoritative harness manifest. See the
[extension source map](treadle/packages/cli/harness/hooks/README.md#pi-extension-sources).
The installer regenerates their local runtime pointer for each checkout.

Host activation and trust need actual host checks. See the
[compatibility record](specs/background-harness/compatibility.md) and
[host acceptance backlog](specs/harness-host-acceptance/harness-host-acceptance.json)
for the observed boundaries. Native custom-agent packages are not asserted for
Codex or pi.

<details>
<summary>Build a portable runtime or native agent package</summary>

Build a runtime with bundled dependencies and assets into a new directory:

```sh
pnpm --dir treadle package:runtime "/path/to/new-runtime"
node "/path/to/new-runtime/dist/src/main.js" --help
```

Create a native agent artifact with an installed runtime:

```sh
wukong package harness --agent claude --out "/path/to/new-plugin"
wukong package harness --agent codex --out "/path/to/new-plugin"
wukong package harness --agent pi --out "/path/to/new-package"
```

Each output directory must be new. Regenerate native artifacts if the runtime
moves. These commands create local artifacts; they do not publish to a registry.

</details>

## Documentation

| Start here                                                   | What you will find                                     |
| ------------------------------------------------------------ | ------------------------------------------------------ |
| [Project overview](wiki/project/overview.md)                 | Product scope and current state                        |
| [Architecture](wiki/systems/sdd-harness-architecture.md)     | Knowledge, work, and web layers                        |
| [Owner workflow](wiki/systems/owner-workflow.md)             | Questions, decisions, start permission, and completion |
| [Documentation map](wiki/project/documentation-map.md)       | Current knowledge, executable specs, and history       |
| [Engineering controls](wiki/project/engineering-controls.md) | Verification and evidence                              |
| [Open work](wiki/project/open-work.md)                       | Known gaps and proposed follow-ups                     |
| [Initiatives](wiki/initiatives/index.md)                     | Canonical work records                                 |

Explore the commands with `wukong --help`, `wukong do --help`, and
`wukong know --help`. `know` searches and validates the wiki. `do` manages specs
and task evidence.

Freshness currently uses Git HEAD and Python-only fingerprints. A fresh stamp
cannot prove that dirty TypeScript or Markdown sources were detected.
Legacy spec formats retain their original rules. New owner-gated work uses 0.4.

## Contribute

Read [CONTRIBUTING.md](CONTRIBUTING.md) and [AGENTS.md](AGENTS.md) before changing
the harness. Maintain installable agent content in `treadle/packages/cli/harness/`.

Run these checks from `treadle/`:

```sh
pnpm check
pnpm coverage
pnpm corpus:check
pnpm brand:check
pnpm audit:prod
pnpm links
```

Coverage floors are 75% for statements, lines, and functions, and 65% for branches.
Review contract corpus changes deliberately. Record actual results and preserve
unrelated work.

Have a bug or an idea? [Open an issue](https://github.com/phanijapps/wukong/issues).
Report security issues through [the security policy](SECURITY.md).

## License

[MIT](LICENSE).
