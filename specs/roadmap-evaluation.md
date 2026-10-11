# Roadmap skill improvement and evaluation

Observed on 2026-10-11 UTC (2026-10-10 America/New_York).
The user requested a roadmap skill usable independently or with new-project.
This record covers the bounded skill edit, behavioral evaluation, independent
review, and installation. It is not an executable plan or owner approval.

## Change

The authoritative roadmap previously contained only a generic description and
CLI preamble. It now supports creation, revision, and audit of product roadmaps.
It connects initiatives to audience outcomes, observable success signals,
dependencies, evidence, capacity, exclusions, and decision triggers.

Standalone use does not require a repository or harness. The new-project handoff
reuses supplied product context and interview answers. A small handoff section
was added to new-project; its broader project-creation workflow was not rewritten.
Roadmap priorities remain separate from executable task state and delivery gates.
Accepted baselines and completed records are preserved during revisions.

Authoritative files:

- `treadle/packages/cli/harness/skills/sdlc/roadmap/SKILL.md`
- `treadle/packages/cli/harness/skills/sdlc/roadmap/resources/output-contract.md`
- `treadle/packages/cli/harness/skills/sdlc/roadmap/resources/new-project-handoff.md`
- `treadle/packages/cli/harness/skills/sdlc/new-project/SKILL.md`

## Behavioral evaluation

Five isolated agent runs used realistic requests and raw fixture artifacts.
Each started without the implementation conversation or an intended answer.
Evaluators wrote only under `/tmp/roadmap-eval-nyh5hpp8/`; questions were recorded
instead of sent to the user. Outputs were inspected for behavior, rather than
graded by matching phrases. Original fixture inputs were preserved.

| Run                     | Raw context                                                                                                                                                                                                                          | Observed result                                                                                                                                                                                                  |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Standalone create       | Local study app; three informal problem reports; unknown weekend capacity; no deadline or stack; local notes/search MVP; explicit account/sync/AI/social exclusions                                                                  | Proposed retrieval learning before the integrated capture/search loop; deferred tagging and onboarding; retained exclusions, unknown measurements, and conditional capacity.                                     |
| New-project handoff     | Completed single-studio booking interview; one developer with ten weekly hours including maintenance; API supplies calendar/reminders; missing mail credentials; November 15 desired pilot; partner feed no earlier than November 30 | Reused interview decisions; sequenced validation → API → calendar; left architecture proposed; kept deadline unverified; deferred integrations and named their external blockers.                                |
| Revision                | Accepted prioritization baseline; new delegation interviews; export output observed but review/Finish missing; one shared specialist; reciprocal delegation/permission prerequisites                                                 | Preserved baseline and IDs; distinguished functioning export from delivery completion; proposed a conditional discovery phase to resolve the cycle; recorded order changes, assumptions, and downstream effects. |
| Audit                   | One developer with unestimated capacity; auth/API cycle; same-Friday billing; intuition-based RICE score; silence described as approval                                                                                              | Returned two blockers and five defects, including unsupported approval, dependencies, deadlines, evidence, and product outcomes. Applied no corrections to inputs.                                               |
| Final standalone create | Same raw request and notes, using the final compact-output guidance                                                                                                                                                                  | Retained key behavioral constraints with a compact sequence and handoff; 787 words versus 1,651 in the first run.                                                                                                |

The initial outputs contained excess detail for small briefs. The demonstrated
issue prompted a narrow clarification: keep small roadmaps compact and treat
output-contract fields as information, not separate essays. The final standalone
run tested that refinement. Other behavioral instructions stayed unchanged.
These are small qualitative evaluations, not a statistical reliability claim.
No production integrations, human interviews, implementation, or owner actions
were performed by these simulations.

Output SHA-256 records (paths relative to the fixture root):

| Artifact                                  | SHA-256                                                            |
| ----------------------------------------- | ------------------------------------------------------------------ |
| `standalone/roadmap.md`                   | `f1129443e357b9f99a85ba6e0863ed022fa0a5f9922d301ad62cf05d10dad094` |
| `new_project/roadmap.md`                  | `73e2129215546d7e0f42957e08ec98be0c5755e1bfb8b0339224fe8610e47d2e` |
| `revision/roadmap-revision-2-proposal.md` | `f1dcfe6dff68bc8e2467dd3d8aeab8bfeb0c48d33dbf42a8e26991d276289a5e` |
| `audit/audit.md`                          | `df3884239c5aa7f7543fdf4cc67a4c6854b9faecf138d9125c93bd186e6adb17` |
| `standalone_final/roadmap.md`             | `248e825bd207b068bff2ab58b73435be751d28c689ff43b68f07982fc33759b5` |

Fixtures and outputs are temporary local evidence; they are not installed skill
resources. The scenario descriptions above retain their relevant inputs.

## Independent review and checks

Read-only reviewer `agent:roadmap_red_foreman` returned **PASS — nothing to fix**
for the final four authoritative artifacts, including compact-output guidance.
The reviewer checked standalone use, context reuse, missing-sibling fallback,
prioritization, dependencies, capacity, revisions, and authority boundaries.
Actual checks exited 0: quick validation for both skills, link check,
scoped Prettier check, and scoped whitespace check. The reviewer made no edits.

All six repository gates were rerun after the final source change and installer
sync. Each exited 0; logs are under `/tmp/roadmap-gates-final/`:

| Command from treadle | Result                                                                               |
| -------------------- | ------------------------------------------------------------------------------------ |
| `pnpm check`         | Source typecheck, lint, formatting, and 172 tests across 39 files passed.            |
| `pnpm coverage`      | Statements/lines 86.22%, functions 94.71%, branches 76.09%; above repository floors. |
| `pnpm corpus:check`  | All 90 goldens reproduced exactly.                                                   |
| `pnpm brand:check`   | Clean.                                                                               |
| `pnpm audit:prod`    | No known production vulnerabilities found.                                           |
| `pnpm links`         | All Markdown links resolved across 101 live files.                                   |

Read-only wiki checks also exited 0: validate reported 0 errors and 0 warnings;
anchors reported 153 checked and 0 needing review; status reported fresh, 44
concepts, and one pending finding. Logs are under `/tmp/roadmap-gates/`.
The preexisting dirty wiki stamp was preserved. Freshness uses Git HEAD and the
fingerprint scanner covers Python only; it does not establish dirty TypeScript
or Markdown freshness. These limits were not changed by this documentation edit.

## Installation and preservation

For each of `pi`, `codex`, and `claude`, previewed and applied:

```text
pnpm exec tsx packages/cli/src/main.ts init harness --agent <surface> --scope project --skills roadmap new-project --no-agents --no-hooks --root /home/videogamer/code/memex_beta --manifest /home/videogamer/code/memex_beta/treadle/packages/cli/harness/harness.json --force
```

Previews contained exactly the two requested skills, no leftover deletions,
and no hook wiring. All three installs exited 0. Each surface's three roadmap
files and new-project entrypoint match authoritative bytes: 12 files total.
Installation logs and JSON plans are under `/tmp/roadmap-gates/`.

All 41 files captured before this turn's edits retained their hashes, including
prior build-kb changes, reports, the dirty wiki stamp, and existing configuration.
No commit, new delivery pack, acceptance, or start/finish action was created.

Reviewed and installed source SHA-256:

| File                                       | SHA-256                                                            |
| ------------------------------------------ | ------------------------------------------------------------------ |
| `roadmap/SKILL.md`                         | `461ca85ae0a6d6857bfff5394c13a34b5fda61887e12d5d68cd2646566dd0a95` |
| `roadmap/resources/output-contract.md`     | `91a26ac216e9066c3d3d48f59287e012364a2838f2574ca35e2afcdb03e95303` |
| `roadmap/resources/new-project-handoff.md` | `cb3d491c8b154e2581aa65d3b2fc9c81f0b5b85f752470189e2a7878ca6102f0` |
| `new-project/SKILL.md`                     | `d4687fcc6987a28fe459bfeb24df78aac62ff9bdfc809fb1cff4ec56192e6d7c` |
