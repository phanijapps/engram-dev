# Rebranding the harness (white-label)

One file owns every user-facing name: `packages/brand/src/brand.ts`.

1. Edit the tokens (name, binName, tagline, formerly), or run:
   `pnpm brand:set -- --name Acme --bin acme --tagline "Your words"`
   (the script rewrites brand.ts AND the workspace package names + bin fields).
2. `pnpm brand:check` must pass — it proves the old name survives nowhere else
   in source.
3. `pnpm check` must pass (types, lint, tests).

What never changes on a rebrand: the format tags (`specpack/0.x`,
`specweb-events/0.x`) — they are contracts, not brands.
