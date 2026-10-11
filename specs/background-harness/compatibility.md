# Adapter contracts — execution spike

Contract sources were checked on 2026-10-10. CLI version observations are checked by verify-compatibility.mjs. They are not desktop/IDE, macOS or Windows integration witnesses.

| Surface | Package/installation | Events | Context output | Activation |
| --- | --- | --- | --- | --- |
| Claude Code 2.1.233 observed | .claude-plugin/plugin.json, hooks/hooks.json; compatibility settings.json | SessionStart, UserPromptSubmit; JSON stdin cwd | hookSpecificOutput.additionalContext and hookEventName | Enable plugin/hooks through host; exec command + args are supported |
| Codex CLI 0.162.1 observed | .codex-plugin/plugin.json, hooks/hooks.json; compatibility .codex/hooks.json | SessionStart, UserPromptSubmit; JSON stdin cwd | hookSpecificOutput.additionalContext and hookEventName | User must trust current hook hash; never bypass trust |
| Codex desktop | Native plugin contract; execution unverified here | Same documented events | Same documented output | Separate real desktop witness required |
| Codex IDE | Native plugins unavailable per current docs; project hook configuration depends on deployed host version | Configuration/manual fallback until verified | CLI context remains available | Separate IDE witness required |
| pi 1.1.0 observed | package.json pi.extensions/skills/prompts; extensions loaded from project | session_start and before_agent_start, ctx.cwd | before_agent_start message field | Host package load/reload; no shutdown of shared service |

Hook callback failures emit actionable status and do not admit tasks or issue owner actions. Use Node entry + argument vectors for runtime subprocesses. No session/prompt/token data is persisted. Windows runtime uses Node and native process APIs; Windows hook commands are generated separately where needed. All native OS/real-host combinations require release matrix evidence in T-12.

Sources: [Codex hooks](https://learn.chatgpt.com/docs/hooks), [Codex plugins](https://learn.chatgpt.com/docs/plugins), [Claude hooks](https://code.claude.com/docs/en/hooks), [Claude plugins](https://code.claude.com/docs/en/plugins-reference), [pi extension docs](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/extensions.md), [pi package docs](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/packages.md).

## Actual Linux host checks — 2026-10-10

`host-observations.json` records disposable fixtures: Claude 2.1.233 validates
the generated plugin (exit 0 with pre-existing skill metadata warnings), Codex
0.162.1 installs/lists the generated local marketplace plugin, and pi 1.1.0
loads the generated extension in offline RPC mode and connects its workspace.
The pi process was deliberately terminated after successful get_state (exit
143); this is a load witness, not a successful full host journey.

The real Claude validator rejected an agents directory. The corrected artifact
uses the default agents/skills/hooks scans. Re-declaring hooks/hooks.json would
merge it twice. Source: [Claude manifest reference](https://code.claude.com/docs/en/plugins-reference).
Windows Codex commandWindows currently targets the documented default cmd
shell; configurable shell behavior requires its own witness. Source:
[Codex command runner](https://github.com/openai/codex/blob/main/codex-rs/hooks/src/engine/command_runner.rs).
No human hook trust, actual prompt execution, desktop/IDE session, or native
macOS/Windows host journey is inferred from these observations.
