# treadle

The human drives; the machine moves. _(formerly `loom` — lineage in
`docs/research/harness-naming.md`)_

A spec-driven development harness: a knowledge engine (anchored, searchable
truth about a codebase) and a loop engine (one frozen task at a time, evidence
only). Agents propose; humans accept. Two pedals, one loom:

- `treadle know …` — the knowledge plane
- `treadle do …` — the loop plane

**Status: scaffold.** The rules this codebase lives by:
`docs/research/nodejs-engineering-standards.md` (40 checkable rules). The
contract it must honor: the golden conformance suite
(`docs/research/golden-conformance-suite.md`; the corpus begins in
`packages/conformance/corpus/`).

## White-label

Every user-facing name lives in `packages/brand/src/brand.ts`. Rebrand:

```bash
pnpm brand:set -- --name Acme --bin acme --tagline "Your words"
pnpm brand:check   # proves the old name leaked nowhere
pnpm check         # types, lint, tests — exits verified
```

See `packages/brand/REBRAND.md`. Format tags (`specpack/0.x`,
`specweb-events/0.x`) are contracts, never brands.

## Development

```bash
corepack enable && pnpm install
pnpm check     # tsc --build → eslint → prettier → vitest
pnpm brand:check
```

Node >= 22, pnpm 9 (pinned via `packageManager` — corepack handles it).
Strict TypeScript (see `tsconfig.base.json`). Known scaffold trade-off,
honest: test files are not yet in the composite typecheck — the upgrade path
is a per-package test tsconfig; tracked as debt, not hidden.
