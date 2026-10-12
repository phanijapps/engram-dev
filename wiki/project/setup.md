---
title: "Installation and workspace setup"
type: Project
description: "Find the installation walkthrough, local work library, and current build commands."
status: stable
created: 2026-10-10
updated: 2026-10-12
sources:
  - {id: guide, resource: wiki/assets/guide/index.html}
  - {id: package, resource: treadle/package.json}
  - {id: cli, resource: treadle/packages/cli/src/commands/do.ts}
  - {id: agent-guide, resource: treadle/packages/cli/src/harness/agents-guide.ts}
  - {id: installer, resource: treadle/packages/cli/src/commands/init.ts}
  - {id: search-skill, resource: treadle/packages/cli/harness/skills/sdlc/search-kb/SKILL.md}
---

# Installation

Open [the installation walkthrough](../assets/guide/index.html).
The guide is a relocated asset. A dated correction now explains Copilot hook support.
Source: `wiki/assets/guide/index.html:1`.

# Local work and verification

From `treadle`, serve current work with:

```bash
pnpm exec tsx packages/cli/src/main.ts do library ../specs
```

The command opens the localhost library. Decisions, approval, and closure
remain explicit owner actions. Source: `treadle/packages/cli/src/commands/do.ts:243`.
Build and verification commands are declared at `treadle/package.json:9`.
See [engineering controls](/project/engineering-controls.md) and
[security posture](/project/security-posture.md).

# Public command rename

The public product is Wukong and the executable is `wukong`. Internal workspace
paths and packages retain their existing names. The relocated walkthrough
retains historical install instructions; use the current repository README
quickstart for the current command. Existing service state and project enrollment
retain their storage identity across the rename.
Source: `treadle/packages/brand/src/brand.ts` and `treadle/packages/cli/src/serve/runtime.ts`.

# Copilot hooks correction — 2026-10-11

GitHub Copilot CLI and cloud agent support hooks. Wukong now installs project
hooks for local Copilot CLI. See [Copilot hooks](/systems/copilot-hooks.md) for the provider
contract, local installation, and cloud deployment limits.


# Z.ai models in Copilot — checked 2026-10-11

Model-provider setup is separate from Wukong hooks.
Copilot CLI supports OpenAI-compatible providers through environment variables.
Z.ai documents an OpenAI-compatible Chat Completions API.
The following setup combines those documented contracts; no authenticated Z.ai request was tested here.
Sources: [GitHub BYOK instructions](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/use-byok-models)
and [Z.ai quick start](https://docs.z.ai/guides/overview/quick-start).

For ordinary Z.ai API usage, run this in Bash:

```bash
export COPILOT_PROVIDER_TYPE=openai
export COPILOT_PROVIDER_BASE_URL=https://api.z.ai/api/paas/v4
export COPILOT_MODEL=glm-5.3
read -rsp 'Z.ai API key: ' COPILOT_PROVIDER_API_KEY
export COPILOT_PROVIDER_API_KEY
copilot
```

Use a model that your key can access and that supports streaming and tool calls.
The key stays in the local shell; do not put it in repository configuration.

In VS Code, run **Chat: Manage Language Models**.
Select **Add Models**, then **Custom Endpoint**.
Enter the API key through the provider prompt and select **Chat Completions**.
In `chatLanguageModels.json`, set the model ID to `glm-5.3`, enable `toolCalling`, and use
`https://api.z.ai/api/paas/v4/chat/completions` as the model URL.
Select the model in Chat. Older versions may call this provider **OpenAI Compatible**.
Source: [VS Code custom endpoint setup](https://code.visualstudio.com/docs/agent-customization/language-models#add-a-custom-endpoint-model).

Z.ai Coding Plan uses a different endpoint and restricts subscription use to its supported tool list.
That current list does not name Copilot. Do not assume a Coding Plan key supplies Copilot quota.
Source: [Z.ai supported tools](https://docs.z.ai/devpack/tool/others).


# Reviewer agent name — 2026-10-11

The adversarial reviewer is `red-forman` on Codex, Claude Code, Pi, and Copilot.
The authoritative manifest supplies its agent ID and per-host file names.
Use the harness installer to install the definitions; reload the host to refresh discovered names.
Sources: `treadle/packages/cli/harness/harness.json`;
`treadle/packages/cli/harness/agents/README.md`.
Historical review records retain the actor identity recorded at the time of each review.


# Project agent instructions and knowledge search — observed 2026-10-12

Full project `init harness` now generates a concise root `AGENTS.md` for all supported agent surfaces.
It uses a canonical template and observed directories, declared package managers, and supported scripts.
It does not run project scripts, ask an LLM to invent conventions, or create a wiki.
The guide includes wiki search/read commands, SDLC routing, and links to existing project documents.
Source: `treadle/packages/cli/src/harness/agents-guide.ts`; template `treadle/packages/cli/harness/templates/AGENTS.md`.

If `AGENTS.md` exists and needs replacement, init preserves its exact bytes in `AGENTS.backup.md`.
The new guide directs agents to the preserved project rules. An identical guide stays unchanged on repeated or multi-host init.
An identical existing backup can support a retry; a differing backup blocks replacement, including with `--force`.
Unsafe target/backup paths and changed inputs refuse publication. Later filesystem failure can leave partial installed outputs;
the command reports that failure and preserves the original instructions or a complete backup.
Sources: `treadle/packages/cli/src/harness/agents-guide.ts`; `treadle/packages/cli/test/agents-guide.test.ts`.

Use `--no-project-guide` to leave root instructions untouched.
Global installs and `--hooks-only` do not generate project instructions.
`--no-agents` controls custom agent definitions; it does not disable the root guide.
Install and removal `--dry-run`/`--json` are read-only previews.
Removal preserves both root instruction files, including user edits.
Sources: `treadle/packages/cli/src/commands/init.ts`; `treadle/packages/cli/src/harness/apply.ts`.

The shared `search-kb` skill ships to Pi, Claude Code, Codex, and Copilot.
It retrieves OKF concepts and linked evidence, checks sources/trust/lifecycle, and returns context to the SDLC step.
It is read-only; use `build-kb` for authorized maintenance. Its presence does not grant task or owner authority.
Source: `treadle/packages/cli/harness/skills/sdlc/search-kb/SKILL.md`; destinations in `treadle/packages/cli/harness/harness.json`.

This workspace's Copilot definitions are in `.github/agents` and `.github/skills`; hook configuration is `.github/hooks/wukong.json`.
The installer copies the adapter and shared helper to `.harness/hooks` and generates a machine-local runtime pointer there.
The pointer names the installed CLI; run init again if that runtime moves.
Source: `treadle/packages/cli/src/harness/plan.ts`; `treadle/packages/cli/src/harness/apply.ts`.
