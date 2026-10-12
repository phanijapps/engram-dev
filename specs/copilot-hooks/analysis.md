# Copilot hooks: capability correction and integration defect

Observation date: 2026-10-11. Mode: bug with bounded impact analysis.
Repository HEAD: `7b19f07612b2c14441cdd6e56b3b009c47e50e56`.

## Finding

The assertion that GitHub Copilot has no hooks is false.
GitHub documents hooks for Copilot CLI and cloud agent.
Wukong currently omits Copilot lifecycle wiring.
The setup guide treats that omission as a platform limitation.

The user requested analysis and correction.
Direct documentation corrections are in this change.
Runtime integration remains a proposed owner-gated plan.
There are no owner answers, accepted decisions, or start receipts for this pack.

## Evidence and cause

| Claim | Status | Deciding evidence |
| --- | --- | --- |
| Copilot supports repository hook files | declared by provider | [GitHub how-to](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/use-hooks): version 1 JSON in `.github/hooks/*.json` |
| CLI and cloud are distinct execution surfaces | declared by provider | [GitHub reference](https://docs.github.com/en/copilot/reference/hooks-reference): local CLI execution; isolated cloud Linux sandbox |
| Wukong omits Copilot lifecycle wiring | implementation-supported | `treadle/packages/cli/harness/harness.json:151`; no Copilot lifecycle entry |
| Null wiring becomes a platform-level refusal message | implementation-supported | `treadle/packages/cli/src/harness/plan.ts:187`: missing wiring emits `hooks not supported on ...` |
| Installer understands no Copilot JSON hook format | implementation-supported | `types.ts:8`, `plan.ts:95`, `apply.ts:123`: existing kinds route to Claude or Codex formats |
| Local bridge is reusable only below its host envelope | implementation-supported | `hooks/codex-context.js:57` exports `eventContext`; `:136` returns Claude/Codex `hookSpecificOutput` |
| Installer deliberately skips Copilot project bootstrap | implementation-supported | `treadle/packages/cli/src/commands/init.ts:143`: explicit Copilot exclusion |
| Prior agent reasoning confused missing integration with missing platform support | inferred | The supplied correction and current guide support this explanation; no prior session transcript was supplied |
| Copilot execution succeeds in a real host | unknown | No native Copilot run occurred in this investigation |

Confirmed repository cause: a missing Copilot format adapter, plus documentation that generalizes this omission.
An unavailable Copilot feature cannot explain the current omission: the provider explicitly documents the feature.
A JSON-only copy of Claude settings is also insufficient: Copilot uses direct event arrays and different result fields.

## Provider contract

Use camelCase `sessionStart` and `userPromptSubmitted` entries.
Command entries have `type`, `bash`, `powershell`, `cwd`, and `timeoutSec` fields.
`sessionStart` consumes top-level `additionalContext`.
Command-hook output from `userPromptSubmitted` is discarded.
That event can reconnect the local service, but cannot inject fresh context through stdout.
Copilot CLI also supports user hook files; Wukong's current installer supports Copilot project scope only.
Cloud agent loads repository hook files from the default branch.
Cloud execution cannot reach the desktop localhost service.
A runtime pointer containing desktop absolute paths is not a cloud bootstrap mechanism.

## Impact

| Boundary | Disposition | Consequence |
| --- | --- | --- |
| Current README and installation guide | revise now | Explain platform support and current Wukong omission separately |
| Authoritative hook documentation | revise now | Record event output and cloud boundaries |
| Installer manifest, compiler, apply/remove, usage text | proposed repair | Add project JSON hook wiring and preserve foreign data |
| Shared lifecycle helper | retain | Reuse bounded stdin and service/context operations; adapt output separately |
| Existing hosts | retain | Regression checks must prove no wiring change |
| Closed packs and replay records | retain | Their missing-wiring observations are historical; do not rewrite them |
| Copilot user scope, VS Code extension, native packaging | defer | Separate scope and native activation evidence are needed |
| Cloud runtime bootstrap and real cloud run | defer | Requires a sandbox runtime and actual job evidence; no desktop reachability claim |

## Questions and assumptions

No human spec questions remain: provider documents resolve capability and protocol questions.
D-1 and D-2 are proposed design choices, and block all runtime tasks until owner acceptance and Start.
A-1: reuse the current local service bridge without a server change.
Its blast radius is the local Copilot integration; callback tests must falsify this assumption on incompatible payloads.
A-2: native host behavior matches the documented contract.
Fixtures establish adapter behavior only; actual host acceptance remains a follow-up before a native compatibility claim.
No new repository-wide normative rule is proposed, so no findings-ledger proposal is needed.

## Source pins

These are observed source bytes before runtime work. TypeScript and Markdown are unbaselined by the current scanner.
The initial user change was `wiki/.okf/last-index.json`; preserve it.

| Source | SHA-256 |
| --- | --- |
| `treadle/packages/cli/harness/harness.json` | `0ce6fc3bbfc899f44a70f1aee701f6317d337ab671e79aac7d51642c93274235` |
| `treadle/packages/cli/src/harness/types.ts` | `1148b943edf9e1b6b17c095522de8d3f26a5bb7dac7e3a75a431924f966d6776` |
| `treadle/packages/cli/src/harness/plan.ts` | `362a890273a8ffcd10345294bd9f8b2dce6d5bbab846db995a7338badf5bdb22` |
| `treadle/packages/cli/src/harness/apply.ts` | `173a33ae762073530ec57ec666c2b8a68565e1efc04964742711df950271ec06` |
| `treadle/packages/cli/src/harness/paths.ts` | `967576ca451f8cc0ff2ef8ee393c413e5d5d3a0e656c5d6f1b3fa84634b3639b` |
| `treadle/packages/cli/harness/hooks/codex-context.js` | `c796605097b4599f9f5e6107ca691a42c7fe9b84a87ccecb38c5eb95fce48fff` |
| `treadle/packages/cli/test/init-engine.test.ts` | `c3e810eb7b8eecc6387bb82916aa3a3d8fb85412a3fc347cf56e807079736f29` |
| `treadle/packages/cli/test/init-surfaces.test.ts` | `6cf770fded807e8d4deea2069c0dfa61441c8144293b8ef580ef6a1ffb60893a` |

## Knowledge and checks

`know search ../wiki Copilot` returned no hits before the correction.
The existing bundle stamp compared HEAD only and did not establish dirty TypeScript or Markdown accuracy.
Initial anchors reported 177 checked and 0 needing review, with many unbaselined sources.
The final check report records fresh command exits and their logs.

## Handoff

Ready for planning: local CLI event adapter; managed project wiring; tests and bounded documentation refresh.
Blocked on owner acceptance of D-1 and D-2 and Start for the exact proposed plan.
Out of scope: remote service changes, cloud bootstrap, user-level install, plugin publication, host trust actions, and closed-pack edits.
See `brief.md`, `spec.md`, `design.md`, and `plan.md`.
