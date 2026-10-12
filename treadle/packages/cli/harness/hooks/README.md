# Harness lifecycle hooks

The authoritative manifest defines host-specific wiring and companion files.
The lifecycle bridge uses Node and a versioned runtime pointer; installation
and native packaging include its shared helper. Do not copy a wrapper alone.

Claude and Codex SessionStart/UserPromptSubmit receive bounded JSON on stdin
and return hook-specific additional context. The bridge ensures the shared
service, connects the explicit event cwd, and reads context without task
admission or owner actions. Failure emits bootstrap/retry guidance. Closing a
session does not stop the service. A stopped service reconnects on the next
event. Codex requires explicit host hook trust; inactive hooks need manual
`<harness CLI> project connect <workspace>` and `context --workspace <workspace>`.

Pi loads session-recall as an extension, using `ctx.cwd` for session_start and
before_agent_start. Its companion helper registers no handlers. The native
package loads the extension wrapper explicitly. Use one installation mode per
host; loading native and compatibility callbacks together is unsupported.
Native custom-agent packaging is limited to Claude. This manifest wires local Copilot CLI lifecycle hooks.
GitHub Copilot CLI and cloud agent support hooks
in `.github/hooks/*.json`.
See [GitHub's hooks reference](https://docs.github.com/en/copilot/reference/hooks-reference).

## Copilot capability correction — 2026-10-11

Copilot command hooks use version 1 JSON with event arrays containing command entries.
`sessionStart` accepts a top-level `additionalContext` result.
Command-hook output from `userPromptSubmitted` is discarded, so it cannot supply prompt context.
The existing Claude and Codex output envelope cannot be reused unchanged.
Copilot CLI also supports user hook files, but Wukong's installer currently supports Copilot project scope only.
Cloud hooks run inside an ephemeral Linux sandbox, separate from the desktop service.
They need a runtime inside that sandbox. Cloud agent uses hook files from the repository's default branch.
Local callback fixtures do not establish native Copilot execution.

## Codex project paths

Project Codex wiring uses `node` from PATH and a project-relative payload path.
The launcher walks from the session directory to the nearest `.codex/hooks.json`,
then invokes `.harness/hooks/codex-context.js` under that root.
It preserves the event stdin and working directory, including sessions started in subdirectories.
It does not depend on Git or embed a checkout-specific absolute path.
A nearer Codex config defines a separate project boundary; a missing payload fails there.
Global installations retain absolute runtime paths because they serve unrelated project directories.
The machine-local runtime pointer still needs regeneration if the installed runtime moves.
Native packaged hooks continue to use the plugin-root entry; this compatibility path change does not alter native packaging.

Refresh Codex project wiring through `init harness --agent codex --scope project --hooks-only`.
Inspect `--dry-run` before using `--force`. Installer-owned prior commands are replaced;
foreign hook commands remain. If ownership records are missing, inspect retained legacy commands manually.
Codex hook trust and host activation still need the host's normal action.

## Claude project paths

Project Claude callbacks use `node` with literal arguments.
The launcher finds the nearest ancestor `.claude/settings.json` and resolves the relative payload there.
It preserves event stdin and the session directory.
The commands work after checkout relocation and from project subdirectories.
Global callbacks retain absolute executable and payload paths.

Refresh through `init harness --agent claude --scope project --hooks-only`.
Inspect the dry-run before you use `--force`.
The installer replaces callbacks that its ownership record identifies.
For old manual callbacks, reconcile their exact definitions before installation to avoid duplicate events.
Preserve foreign callbacks and settings.

Context uses the exact event directory as the workspace on every host.
A subdirectory session can therefore report a missing wiki or specs directory.
Start at the repository root to obtain its canonical context.

## Pi extension sources

Pi extensions belong to the harness. Shared script and extension payloads live in
`hooks/`; `harness.json` declares their project destinations.

| Installed Pi file                   | Authoritative source       | Manifest entry             |
| ----------------------------------- | -------------------------- | -------------------------- |
| `.pi/extensions/post-tool-check.js` | `hooks/post-tool-check.js` | `post-tool-check`          |
| `.pi/extensions/session-recall.js`  | `hooks/session-recall.js`  | `session-recall`           |
| `.pi/extensions/codex-context.js`   | `hooks/codex-context.js`   | `session-recall` companion |

The installer also creates `.pi/extensions/runtime.json` for the current machine.
Regenerate this local pointer after moving the checkout or runtime.
The native package uses `extensions/project-context.ts` as its lifecycle entry.
That wrapper exports the same `hooks/session-recall.js` callback.

Refresh project extensions through `init harness --agent pi --scope project
--hooks-only`, prefixed with the installed harness executable.
Inspect its `--dry-run` plan before adding `--force` for differing files.
Reload Pi after installation.

The guard covers corpus `expected.*` witness files, legacy `expected` and `golden` directories,
and the generated `wiki/code` directory. Reads remain permitted.
The separate machine-managed guard retains its legacy argv JSON contract
(exit 0 pass, 3 refusal, 1 malformed input) and pi tool_call blocking. Claude
PostToolUse is an advisory after-the-fact check, not a write admission gate.
The core task and owner workflow remain authoritative. Legacy recall argv
options are compatibility helpers, not the current lifecycle protocol.

## Feedback context and delivery

Lifecycle context exposes bounded feedback session IDs, cursors, latest-round
IDs and draft/unresolved/stale counts. It excludes comment bodies and source
bytes. Read submitted content explicitly with `do feedback read` or a bounded
`do feedback wait` through the installed CLI. Repeated reads retain batches;
remember the last processed cursor and stable batch IDs to avoid repeated edits.

The canonical `skills/sdlc/feedback/` skill and protocol resource ship to Claude,
Codex and Pi. Install through the harness installer rather than editing host
copies. Mixed document/diff requests use separate explicit selections; iterative
worktree rounds differ from sessions pinned to a committed `--head`.

Browser Submit and owner Start do not wake an idle agent or launch a host.
An active wait (1–60 seconds), later prompt or manual feedback invocation handles
delivery. Feedback uses its own ledger and revision, preserving owner gates.
No host session, transcript or token capture is added to lifecycle hooks.
Sources: `treadle/packages/cli/src/harness/context.ts:15`,
`treadle/packages/cli/src/commands/feedback.ts:98`, and
`treadle/packages/cli/harness/skills/sdlc/feedback/resources/protocol.md:1`.

## Local Copilot CLI installation

Use `init harness --agent copilot --scope project --hooks-only`, prefixed with the installed CLI.
Inspect `--dry-run` before installation. The installer creates `.github/hooks/wukong.json`
and installs the wrapper and shared helper through the authoritative manifest.
`sessionStart` returns bounded top-level context and tells the agent to run `do status` before stage-dependent work.
`userPromptSubmitted` reconnects. It emits `{}`, or a `systemMessage` when open spec state changed since the last prompt.
Prompt hooks do not refresh model context through stdout. Read CLI context explicitly when needed.
The commands use Node from PATH and run the project-relative payload through a small guard, with repository-root `cwd` and a 60-second timeout.
Both Unix and PowerShell fields are emitted; local Unix callback execution is covered by fixtures.
Native Windows activation and real Copilot sessions need separate host evidence.

Upgrades remove only recorded definitions. Identical pre-existing foreign entries remain unowned.
Removal preserves foreign event entries, metadata, and sibling hook files.
Malformed or symlinked configuration refuses writes even under `--force`.
Use the installer to regenerate the machine-local runtime pointer after the runtime moves.
Cloud bootstrap and user-level Copilot installation remain outside this integration.

## Cold-clone setup — 2026-10-12

Project hook definitions can be committed, but this repository ignores `.harness/`.
A clone therefore needs local initialization before Copilot can execute its callbacks.
Full project init copies selected skills, agents, wrapper and helper, creates the
local runtime pointer, and enrolls the project. It uses the installed CLI and does
not install dependencies in the target repository.

Run `init harness --agent copilot --scope project --hooks-only --no-agents --root .`
through the installed CLI to repair hooks without changing guides or other components.
Existing identical portable config can be used even when local ownership state is absent.
Foreign config and sibling files remain preserved. Differing local payloads or
unsafe paths retain their existing refusal behavior; inspect a dry-run before force.
Reload Copilot from the root after installation. Repeat init on a new machine or
after the runtime moves. Generated files alone do not establish native activation.

For this source repository, root frozen installation or explicit `pnpm run setup`
installs and builds the nested workspace. Source setup does not initialize arbitrary
target projects. Both source bootstrap scripts select main by default; explicit
branch overrides remain available and protected existing checkouts are not switched.

## Owner actions across hosts — 2026-10-12

The web library writes owner actions into the pack. It does not push them to agents.
An agent sees an owner action when a hook adds current pack state, or when it reads the pack itself.

| Host                                   | Session start                                    | Each prompt                                              |
| -------------------------------------- | ------------------------------------------------ | -------------------------------------------------------- |
| Claude Code, Codex                     | Context block                                    | Context block (current stage of each open spec)          |
| Copilot CLI                            | Context block and a `do status` pull instruction | Output is discarded                                      |
| VS Code Copilot Chat (`.github/hooks`) | Context block and a `do status` pull instruction | `systemMessage` to the user when open spec state changed |

The context block puts guidance first, then one compact line per open spec.
Delivered, closed and refused specs appear as counts. The block stays within 9,000 characters
(Claude Code inlines at most 10,000) and states how many open specs it omitted.

The Copilot change notice keeps per-session fingerprints in `os.tmpdir()/wukong-copilot`.
They are hashed pack names mapped to hashed compact lines. No prompt, transcript or pack text is stored.
`HARNESS_COPILOT_STATE_DIR` overrides the directory.

When committed Copilot wiring outlives its gitignored payload, the hook prints
`init harness --agent copilot --hooks-only` guidance on stderr and exits 0 with `{}`.
