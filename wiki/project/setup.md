---
title: "Installation and workspace setup"
type: Project
description: "Find the installation walkthrough, local work library, and current build commands."
status: stable
created: 2026-10-10
updated: 2026-10-11
sources:
  - {id: guide, resource: wiki/assets/guide/index.html}
  - {id: package, resource: treadle/package.json}
  - {id: cli, resource: treadle/packages/cli/src/commands/do.ts}
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
