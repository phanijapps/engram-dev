# Contributing

Start with the [project overview](wiki/project/overview.md). Read
[AGENTS](AGENTS.md) for the SDD workflow and [SECURITY](SECURITY.md) for reporting.

Use Node 22.22.2+ in the 22.x line or Node 24.15+ in 24.x, and pnpm 9.15.9.
Run from `treadle/`:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm check
pnpm coverage
pnpm brand:check
pnpm corpus:check
pnpm audit:prod
pnpm links
```

The TypeScript generator regenerates the corpus against committed witnesses.
A golden change is a contract change: regenerate deliberately and review its diff.
Record actual exit codes. Do not present a failed or unrun check as successful.

Use conventional commits. Architectural decisions belong in
[wiki/decisions](wiki/decisions/index.md). The proposed documentation maintenance
practice is [here](wiki/project/documentation-lifecycle.md); it remains draft.
Current controls and known gaps are documented in the wiki rather than duplicated
in this entry document.
