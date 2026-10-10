# treadle

A spec-driven development harness with a knowledge plane (`know`) and a work
plane (`do`). The active runtime is strict TypeScript in `treadle/`.

Start with the [project overview](wiki/project/overview.md). The workspace wiki
holds current architecture, project gaps, initiative navigation, and dated
retrospectives. The [documentation map](wiki/project/documentation-map.md)
explains which executable and historical records retain their own authority.

## Install and develop

The [installation guide](docs/guide/index.html) covers the supported install path.
For development, run from `treadle/`:

```bash
corepack enable
pnpm install
pnpm check
pnpm coverage
pnpm corpus:check
pnpm brand:check
pnpm exec tsx packages/cli/src/main.ts do where ..
```

Node >=22; pnpm is pinned in `treadle/package.json`. See
[CONTRIBUTING](CONTRIBUTING.md) for verification and [SECURITY](SECURITY.md) for
reporting and trusted-on-disk operating limits.

## Knowledge and work

- [Current architecture](wiki/systems/sdd-harness-architecture.md)
- [Engineering controls](wiki/project/engineering-controls.md)
- [Open work](wiki/project/open-work.md)
- [Initiatives](wiki/initiatives/index.md)
- [Retrospectives](wiki/retrospectives/index.md)

Executable specpacks remain under `docs/specs/`. The wiki links dated summaries
to those records. Python engines are preserved at tag `python-final`; the
TypeScript generator checks the committed corpus. Current gate outcomes belong
in dated evidence, not an undated claim of green tests or coverage.
