# Wukong runtime workspace

The active TypeScript runtime for `do` and `know`. Read the
[project overview](../wiki/project/overview.md) and
[package architecture](../wiki/systems/treadle.md).

Run in this directory:

```bash
corepack enable
pnpm install
pnpm check
pnpm coverage
pnpm brand:check
pnpm corpus:check
pnpm audit:prod
pnpm links
```

Node >=22; pnpm 9 is pinned in `package.json`. Current controls and limits are
in [engineering controls](../wiki/project/engineering-controls.md). Test files
remain outside the composite source typecheck; see [open work](../wiki/project/open-work.md).

For rebranding, see [REBRAND](packages/brand/REBRAND.md). Format identifiers are
contracts and retain their names.
