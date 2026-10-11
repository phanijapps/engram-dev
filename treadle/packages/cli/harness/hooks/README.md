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
Native custom-agent packaging is limited to Claude. Copilot has no lifecycle
hook wiring in this manifest.

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
