# Working in this repository

Read `AGENTS.backup.md` for the existing project rules.
This guide does not revoke those rules, owner gates, or frozen records.

## Repository and commands

The active TypeScript workspace is `treadle/`, with Node >=22 and pnpm 9.15.9.
From the repository root:

```bash
cd treadle
corepack enable
pnpm install --frozen-lockfile
pnpm check
pnpm coverage
pnpm corpus:check
pnpm brand:check
pnpm audit:prod
pnpm links
```

Run only the checks relevant to the task, plus the delivery gates required by the project rules.
These commands come from `treadle/package.json` and the preserved project instructions.

## Repository map

- `treadle/packages/core/`: work admission, context, evidence, and owner workflow.
- `treadle/packages/knowledge/`: OKF knowledge bundles, search, links, and freshness.
- `treadle/packages/cli/`: the `do` and `know` commands, and harness installation.
- `treadle/packages/web/`: the local interview room and spec library.
- `treadle/packages/cli/harness/`: authoritative skills, agents, hooks, and templates.
- `wiki/`: current project knowledge. Start at `wiki/index.md`.
- `specs/`: executable work records. Preserve closed packs and `specs/archive/`.
- `.github/`: installed Copilot skills, agents, and hook configuration.
- `.harness/hooks/`: copied shared callbacks and the machine-local runtime pointer.

## Knowledge before work

Read `wiki/project/documentation-map.md`, `wiki/domain/wiki-contract.md`, and relevant linked concepts.
From the repository root, use the installed harness:

```bash
wukong know search wiki "owner workflow" --limit 5
wukong know read wiki systems/owner-workflow
wukong know read wiki domain/wiki-contract --depth 1 --budget 3000
wukong know status wiki --workspace .
```

Use the observed bundle path and concept IDs; do not assume every project has `wiki/`.
If the CLI is unavailable, read the Markdown directly and state the limitation.
Inspect cited sources before relying on current behavior. Report conflicts and missing evidence.
A fresh HEAD stamp does not verify dirty TypeScript or Markdown.

## SDLC and boundaries

Use the installed analyze, plan, implement, and review skills for their matching stages.
Use build-kb for knowledge maintenance; use search-kb when it is installed for read-only retrieval.
Get owner acceptance and Start for the exact gated plan before implementation.
Run the declared task checks and record actual exits. Keep owner Finish separate.
Obtain the project's independent review before a completion claim.
Edit authoritative harness content, then refresh installed copies through init.
Preserve unrelated edits, generated knowledge, golden witnesses, and historical receipts.
Read `SECURITY.md` before server changes. Keep credentials out of instructions and repository files.
