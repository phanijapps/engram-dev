# Reference and implementation evidence

Observed 2026-10-11. External pages describe Crit; they do not establish Wukong behavior.

| Source                                                                                                               | Observation and implication                                                                                                                                |
| -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Crit integration protocol](https://crit.md/integrations/build-your-own)                                             | A foreground command waits for browser review and exposes a structured result; agents reply and repeat the round. A portable CLI avoids a per-model SDK.   |
| [Crit Codex integration](https://crit.md/integrations/codex)                                                         | Skill-only and plan-hook installation are distinct; host activation must be tested rather than inferred.                                                   |
| [Crit Pi integration](https://crit.md/integrations/pi)                                                               | The common review loop can be taught through host-discovered skills.                                                                                       |
| [Crit source skill](https://raw.githubusercontent.com/tomasz-tomczyk/crit/main/integrations/pi/skills/crit/SKILL.md) | Original anchors and quotes help reviewers interpret edited content. Reviewer resolution stays distinct from an agent reply. Used as source material only. |
| [Git diff reference](https://git-scm.com/docs/git-diff)                                                              | Commit/worktree comparisons accept explicit path selectors. The proposed builder disables external diff/text conversion and avoids shell interpolation.    |
| [Mermaid sequence syntax](https://mermaid.js.org/syntax/sequenceDiagram.html)                                        | Standard flowchart and sequence notation provide proposed architecture and interaction views.                                                              |

Current Wukong source evidence: project-server.ts checks Host and browser write credentials before routing an enrolled project; library.js provides artifact and owner views; workflow.ts enforces separate owner acts; transaction.ts owns the shared lock; context.ts reads work state without admitting tasks.
Exact bytes and repository paths are in authoring/source-pins.json. Current code does not supply the proposed feedback operations.
