# Public product and CLI branding

`packages/brand/src/brand.ts` owns the displayed product name, executable name,
tagline and lineage. Rebrand with:

```sh
pnpm brand:set -- --name Acme --bin acme --tagline "Your words"
```

The helper updates those public tokens and the CLI executable in both the
workspace CLI package and the repository's root wrapper package.json, when present.
It preserves internal package names/imports, workspace paths, service storage
identity and format contracts. An omitted tagline preserves the existing one;
an omitted `--formerly` records the previous product name. Repeated renames and
quoted values are supported. Invalid command names refuse before any writes.

Update current README/installation usage, then run `pnpm build`, `pnpm check`,
`pnpm coverage`, `pnpm brand:check`, `pnpm corpus:check`, `pnpm audit:prod` and
`pnpm links`. Relink the CLI and regenerate native host packages. Refresh
installed skills/hooks through the authoritative installer; preserve foreign
configuration and complete each host's trust/reload steps yourself.

The brand gate scans current and previous public product tokens, including
JavaScript/browser assets. Approved documentation, internal imports and contract
fixtures have explicit exemptions. Historical closed specs and archived research
retain their original names. Format tags (`specpack/0.x`, `specweb-events/0.x`)
remain contracts; a public rename does not migrate them.
