# Wukong

```text
##      ##  ##      ##  ##      ##    ######    ##      ##    ######
##      ##  ##      ##  ##    ##    ##      ##  ####    ##  ##      ##
##      ##  ##      ##  ##  ##      ##      ##  ####    ##  ##
##  ##  ##  ##      ##  ####        ##      ##  ##  ##  ##  ##  ######
##  ##  ##  ##      ##  ##  ##      ##      ##  ##    ####  ##      ##
####  ####  ##      ##  ##    ##    ##      ##  ##    ####  ##      ##
##      ##    ######    ##      ##    ######    ##      ##    ######
```

**The human drives; the machine moves.**

Build with an AI coding agent that understands your repository and follows an
agreed plan. Wukong connects a searchable wiki, verified tasks, browser feedback,
and explicit human approval in one local workflow.

Your agent proposes and executes the work. You decide when implementation starts
and when the result is complete. The records stay with your repository.

[Get started](#getting-started) · [Choose a workflow](#choose-a-workflow) ·
[Work through a change](#work-through-a-change) · [Documentation](#documentation)

## Choose a workflow

| What you need                          | Start with                                  | What you get                                                                          |
| -------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------- |
| Understand an existing repository      | `build-kb`                                  | Product context, architecture, dependencies, interfaces, and their documented history |
| Shape a new product or prioritize work | `new-project` or `roadmap`                  | A product brief or an outcome-based sequence of initiatives                           |
| Deliver a feature or repair a defect   | `analyze` → `plan` → `implement` → `review` | An agreed design, checked tasks, evidence, and independent review                     |

Knowledge and roadmap work can stand alone. A roadmap does not grant permission
to implement. For code changes, agree the scope and plan before execution.

## Getting started

You need **Git**, **Node.js 22 or newer**, **pnpm 9.15.9**, and a supported coding
agent. If pnpm's global commands are unavailable, run `pnpm setup` first.
Open a new terminal after it updates your `PATH`.

This is a **preview** on `codex/background-harness`. The commands below download
that branch's installer. The installer selects the same branch for the source.

### 1. Install Wukong

**macOS and Linux**

Run this in your terminal:

```sh
curl -LsSf https://raw.githubusercontent.com/phanijapps/wukong/codex/background-harness/install.sh | bash
```

**Windows**

Run this in PowerShell:

```powershell
powershell -NoProfile -Command "irm https://raw.githubusercontent.com/phanijapps/wukong/codex/background-harness/install.ps1 | iex"
```

The installers build the source and link the `wukong` command automatically.
They use `$HOME/.engram-dev` on macOS and Linux, or `$env:LOCALAPPDATA\engram-dev`
on Windows. These existing directory names preserve installation compatibility.
An existing checkout on another branch stops the installer before it changes the
source. See [installer options](#for-developers) to use a different directory.

Check the command:

```sh
wukong --version
```

### 2. Connect your project

Open a terminal in the project you want to work on. Run:

```sh
wukong init harness
```

Choose your agent and the integration you need. For an explicit Codex installation,
run this from your project root:

```sh
wukong init harness --agent codex --scope project --root .
```

Use `claude`, `pi`, or `copilot` for those agents. Project hook installation starts
the local app and connects the project. Open the address printed by the installer.
Reload your agent and complete its hook trust or activation steps.
Copilot has no shared-service hooks; use `wukong project connect .` to connect it.

### 3. Ask your agent to begin

In your agent's chat, ask:

```text
Use build-kb to understand this repository, then use analyze to investigate email alerts.
```

Skill names belong in the agent's chat. The `wukong` commands belong in the terminal.
Agent invocation syntax depends on the host.

## Work through a change

Wukong starts with knowledge, then follows a short delivery loop:

```text
Repository knowledge → Analyze → Plan → Implement → Review → Finish
```

**Understand and analyze.** The agent reads the code and related documents.
It records the problem, requirements, unknowns, and affected components.

```text
Use analyze to investigate email alerts when a spec needs owner attention.
```

**Plan.** Review a design and task sequence before the agent edits the code.
Answer and approve spec questions when present. Accept the design decisions,
then separately select **Start Implementation** for the exact plan.

```text
Use plan to design the email alerts change and define its verification checks.
```

**Implement and review.** After you grant Start permission, ask the agent to
execute the approved tasks. It runs each declared check and records the result.
Independent review verifies the changes against the plan and current evidence.

```text
Use implement to execute the approved email alerts plan.
Use review to independently verify the email alerts specpack.
```

Send those requests separately. Failed checks and unresolved findings need repair
before another review. A changed plan needs new Start permission.
One Start approval covers the agreed task sequence.

**Finish.** Inspect the reviewed result in the local app.
Select **Finish spec** to complete and freeze the record.
Tests and agent review do not grant permission to finish.

Start permission does not wake an idle coding agent. Continue in the agent's chat
after approval. See [the owner workflow](wiki/systems/owner-workflow.md) for the full contract.

## Review in your browser

Review selected documents or code diffs with the installed `feedback` skill:

```text
Use feedback to open browser review of the email alerts design and code diff.
```

Select a line, write a comment, and choose **Save draft**.
Select **Submit feedback** when your comments are ready for the agent.
The agent reads submitted feedback and publishes revised rounds through the CLI.
Inspect the revision before you resolve a thread.

Save, Submit, Resolve, and Reattach are separate actions.
Feedback does not replace Start or Finish approval.
See [browser feedback](wiki/initiatives/browser-agent-feedback.md) for the current behavior and limits.

## Supported agents

| Agent          | Integration                                                | What you must activate                                      |
| -------------- | ---------------------------------------------------------- | ----------------------------------------------------------- |
| Claude Code    | Skills, reviewers, and hooks; optional native plugin       | Reload and enable the integration.                          |
| Codex          | Skills, reviewers, and hooks; optional native plugin       | Trust the current hooks. Availability differs across hosts. |
| pi             | Skills, reviewers, and extensions; optional native package | Reload the extensions or load the package.                  |
| GitHub Copilot | Instructions, skills, and reviewers                        | Connect the project manually; no service hooks.             |

Use a native artifact or the project installer for each host.
Avoid loading the same callbacks twice. Installation does not establish host activation.
Native custom-agent packages are not asserted for Codex or pi.
See the [compatibility record](specs/background-harness/compatibility.md) and
[host acceptance backlog](specs/harness-host-acceptance/harness-host-acceptance.json).

## Your records and local app

| Location        | Purpose                                                                                  |
| --------------- | ---------------------------------------------------------------------------------------- |
| `wiki/`         | Searchable product context, architecture, domain rules, decisions, and source references |
| `specs/<slug>/` | Requirements, design, tasks, checks, review, and owner actions                           |

Manage the app from your terminal:

```sh
wukong start serve
wukong status serve
wukong stop serve
```

One service runs per operating-system user and serves connected projects.
The preferred port is **8788**; the service prints another address if it is occupied.
Project connections survive restarts. Closing an agent session leaves the app available.
After an explicit stop, the next supported session event starts it again.

All listeners bind to `127.0.0.1`. Use trusted repositories and keep the ports local.
See [SECURITY.md](SECURITY.md) for the trust boundary.

## Documentation

- [Project overview](wiki/project/overview.md) and [architecture](wiki/systems/sdd-harness-architecture.md)
- [Owner workflow](wiki/systems/owner-workflow.md) and [engineering controls](wiki/project/engineering-controls.md)
- [Documentation map](wiki/project/documentation-map.md), [initiatives](wiki/initiatives/index.md), and [open work](wiki/project/open-work.md)
- [Pi extension source map](treadle/packages/cli/harness/hooks/README.md#pi-extension-sources)

Explore commands with `wukong --help`, `wukong do --help`, and `wukong know --help`.
Use `--dry-run` to inspect a harness installation. Inspect differing files before
using `--force`. `--hooks-only` refreshes adapters; `--no-hooks` skips automatic connection.

Freshness currently uses Git HEAD and Python-only fingerprints. A fresh stamp
cannot establish that dirty TypeScript or Markdown changes were detected.
Legacy spec formats retain their original rules; new owner-gated work uses 0.4.

## For developers

Clone and build the preview if you want to change Wukong itself:

```sh
git clone --branch codex/background-harness https://github.com/phanijapps/wukong.git
cd wukong/treadle
pnpm install --frozen-lockfile
pnpm build
pnpm --dir packages/cli link --global
```

The public command is `wukong`; the source workspace remains `treadle/`.
Maintain installable agent content in `treadle/packages/cli/harness/`.
Read [CONTRIBUTING.md](CONTRIBUTING.md) and [AGENTS.md](AGENTS.md) before making changes.

```sh
pnpm check
pnpm coverage
pnpm corpus:check
pnpm brand:check
pnpm audit:prod
pnpm links
```

Coverage floors are 75% for statements, lines, and functions, and 65% for branches.
Review contract changes deliberately. Record actual results and preserve unrelated work.

<details>
<summary>Installer options</summary>

Use `ENGRAM_SRC` for a new source directory and `HARNESS_REF` to select a Bash
installer ref. The PowerShell installer accepts `-Source`, `-Repository`, and `-Ref`
when you run a downloaded script. Both installers stop on a different existing branch.

```sh
ENGRAM_SRC="/path/to/new-source" bash install.sh
```

```powershell
.\install.ps1 -Source "C:\path\to\new-source"
```

</details>

<details>
<summary>Portable runtime and native packages</summary>

Run from the repository root to build a runtime into a new directory:

```sh
pnpm --dir treadle package:runtime "/path/to/new-runtime"
node "/path/to/new-runtime/dist/src/main.js" --help
```

Use an installed runtime to create native agent artifacts:

```sh
wukong package harness --agent claude --out "/path/to/new-plugin"
wukong package harness --agent codex --out "/path/to/new-plugin"
wukong package harness --agent pi --out "/path/to/new-package"
```

Output directories must be new. Regenerate native artifacts if the runtime moves.
These commands create local artifacts; they do not publish to a registry.

</details>

## Support and license

[Report a bug or suggest a feature](https://github.com/phanijapps/wukong/issues).
Report security issues through [the security policy](SECURITY.md).
Wukong is [MIT licensed](LICENSE).
