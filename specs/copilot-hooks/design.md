# Proposed design

Depth: compact. One installer subsystem and one host adapter need changes.
The local service API, storage, and owner workflow remain unchanged.
No diagram is needed: this design has a direct event-to-command flow and a linear delivery sequence.

## D-1: Local CLI integration first

Add project-scoped Copilot command hooks for `sessionStart` and `userPromptSubmitted`.
At session start, return `{ "additionalContext": "..." }` with the bounded context from the shared helper.
On prompt submission, reconnect the local service and emit `{}`.
Report failures through bounded stderr; sessionStart may also return recovery context.
Prompt stdout does not inject context. Do not rewrite user prompts.

Alternatives: documentation-only repair; immediate cloud bootstrap; user-scope integration.
Recommend local CLI integration because it reuses the existing service and has a bounded verification path.
Cloud runtime setup is a different deployment boundary.
Consequences: automatic prompt context refresh is not asserted; direct CLI context reads remain available.
The choice is reversible through recorded removal.

## D-2: Dedicated format and wrapper

Add `copilot-hooks` as an additive manifest wiring kind.
Target `.github/hooks/wukong.json`, with `version: 1` and direct event arrays.
Use a dedicated `copilot-context.js` wrapper and install `codex-context.js` as its companion.
Declare both `bash` and `powershell` commands using project-relative paths.
Set `cwd: "."` relative to the repository root and `timeoutSec: 60`.
The wrapper uses bounded stdin and rejects missing cwd or unsupported events.
It consumes only cwd and the configured event; do not persist prompts, session IDs, credentials, or tokens.
The shared helper can take up to 2 command timeouts after the stdin deadline; 60 seconds covers that existing bound.

Alternatives: reuse Claude merge shape; write a static file without ownership handling; modify the shared host envelope.
Recommend a separate format branch to preserve existing hosts and exact removal records.
Do not use the generic Codex target fallback for Copilot.

Compile a truthful dry-run before writes.
For unsupported entries, say that this component has no wiring in the manifest.
Describe refused Copilot global scope as an installer restriction; Copilot CLI itself has user hook files.

Parse existing owned configuration and validate its version, event-map shape, and affected arrays before modification.
Malformed configuration refuses even under force; preserve its bytes.
Preserve unrelated hook files and foreign entries in the dedicated file.
Track exact installed event definitions in the existing per-agent ownership record.
Repeat installation avoids duplicates; upgrades remove only recorded prior definitions.
Removal deletes recorded definitions and removes an empty installer-created container only when no foreign content remains.
Treat runtime-pointer differences and payload conflicts through existing inspect-before-force behavior.
Preflight Copilot configuration before payload or pointer mutation to avoid partial refused installs.

## Runtime and deployment boundary

Local install regenerates the machine-specific runtime pointer through the installer.
A moved runtime requires regeneration, as with the existing hosts.
Relative hook commands survive checkout relocation and spaces in paths.
Tests must invoke the emitted Unix command; Windows invocation needs native evidence for a platform claim.

Cloud agent can run hooks, but it does not share the desktop service or runtime pointer.
No cloud bootstrap or desktop-to-cloud connection is implemented in this plan.
Documentation explains the default-branch requirement and sandbox runtime prerequisite.
No owner controls or approvals run through the wrapper.
Session exit leaves the local service running; no sessionEnd shutdown hook is installed.

## Rollout and rollback

Preview `init harness --agent copilot --scope project --hooks-only --dry-run`.
Install through the authoritative manifest after plan approval.
Use recorded removal to revert the integration while preserving foreign content.
Record actual host versions and activation before a native compatibility claim.
Keep all closed historical packs unchanged.
