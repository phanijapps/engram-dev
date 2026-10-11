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
