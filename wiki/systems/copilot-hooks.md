---
title: "Copilot hooks and the local Wukong integration"
type: System
description: "Copilot hook capability, managed local CLI integration, and cloud deployment limits."
status: stable
sources:
  - {id: manifest, resource: treadle/packages/cli/harness/harness.json}
  - {id: compiler, resource: treadle/packages/cli/src/harness/plan.ts}
  - {id: helper, resource: treadle/packages/cli/harness/hooks/codex-context.js}
  - {id: adapter, resource: treadle/packages/cli/harness/hooks/copilot-context.js}
  - {id: installer, resource: treadle/packages/cli/src/harness/apply.ts}
  - {id: analysis, resource: specs/copilot-hooks/analysis.md}
  - {id: design, resource: specs/copilot-hooks/design.md}
  - {id: plan, resource: specs/copilot-hooks/plan.md}
---

# Capability correction — observed 2026-10-11

GitHub Copilot CLI and cloud agent support hooks in `.github/hooks/*.json`.
The claim that Copilot has no hooks was incorrect.
See [GitHub's how-to](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/use-hooks)
and [hook reference](https://docs.github.com/en/copilot/reference/hooks-reference).

Wukong now installs local Copilot CLI lifecycle hooks through its manifest.
The compiler describes missing component wiring without claiming a platform limitation.
Sources: `treadle/packages/cli/harness/harness.json`;
`treadle/packages/cli/src/harness/plan.ts`.
Copilot CLI supports user hook files; Wukong's installer supports Copilot project scope only.
Source: `treadle/packages/cli/src/harness/paths.ts:25`.

# Host contract and deployment limits

Copilot `sessionStart` consumes top-level `additionalContext`.
Command-hook output from `userPromptSubmitted` is discarded.
The dedicated Copilot wrapper adapts the shared helper to this protocol.
It does not persist prompts or session identifiers.
Sources: `treadle/packages/cli/harness/hooks/copilot-context.js` and the GitHub reference above.

Cloud hooks run in an ephemeral Linux sandbox.
They cannot reach the desktop localhost service or use its machine-specific runtime paths.
Cloud agent needs hook configuration on the default branch and a runtime inside its sandbox.
These are provider and deployment boundaries, not a claim that hooks are absent.

# Local installation and retained analysis

The analysis traces the current omission and checked sources.
Source: `specs/copilot-hooks/analysis.md`.
The accepted design covers local CLI events, safe installation, and exact removal.
Source: `specs/copilot-hooks/design.md`.
The owner accepted the design and started the registered plan.
The canonical pack retains the actual receipts and execution state.
Source: `specs/copilot-hooks/plan.md`.
The canonical pack owns task state; this page records current knowledge only.
No real Copilot host execution or cloud job was verified during this correction.
See [workspace setup](/project/setup.md) for current connection instructions.


## Installation and ownership

Run `wukong init harness --agent copilot --scope project --hooks-only --dry-run`.
Run the same command without `--dry-run` to install.
The dedicated `.github/hooks/wukong.json` uses version 1 and direct event arrays.
The wrapper and shared helper live under `.harness/hooks`, with a machine-specific runtime pointer.
Configuration and pointer conflicts refuse before payload writes.
Upgrade and removal preserve foreign entries and files; identical foreign definitions remain unowned.
Sources: `treadle/packages/cli/src/harness/apply.ts`;
`treadle/packages/cli/src/harness/manifest.ts`;
`treadle/packages/cli/src/harness/plan.ts`.
