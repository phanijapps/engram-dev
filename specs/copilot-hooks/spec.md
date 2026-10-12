# Candidate requirements

Status: proposed. No runtime work has started.

| ID | Required behavior | Observable check |
| --- | --- | --- |
| FR-1 | Project Copilot installation emits version 1 `.github/hooks/wukong.json` with direct event arrays, cross-platform command fields, and a 60-second timeout. | Installer fixtures inspect exact JSON; dry-run, repeat install, and relocated paths |
| FR-2 | A bounded local adapter returns top-level sessionStart context; prompt callbacks reconnect without claiming discarded stdout reaches the model. | Real child processes with documented stdin and controlled runtime responses |
| FR-3 | Upgrade and removal preserve foreign files, event entries, and settings; malformed owned hook configuration refuses modification. | Ownership and refusal fixtures, unchanged foreign bytes and semantic fields |
| FR-4 | Copilot limitations describe Wukong's installed scope; cloud bootstrap and native execution claims require their own evidence. | Documentation review and usage-message assertions; no desktop paths presented as cloud support |
| FR-5 | Existing host wiring and owner authority remain intact; repository gates and wiki health pass. | Existing installer/lifecycle suites, repository gates, and wiki maintenance results |

Empty spec question list: the provider contract and requested correction resolve the behavior questions.
D-1 and D-2 remain separate owner decisions.

Out of scope: cloud runtime bootstrap, user-level Copilot installation, VS Code extension hooks, preToolUse write gates, native packages, and publication.
Native CLI activation across platforms and cloud jobs remain explicit follow-ups.
Do not call fixtures native host evidence.
