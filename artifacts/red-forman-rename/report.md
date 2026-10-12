# Reviewer rename — 2026-10-11

The requested mechanical rename changes the reviewer agent ID from
`red-foreman` to `red-forman`. It does not change reviewer behavior or the
executable spec workflow. No owner action or historical receipt was rewritten.

The four authoritative definitions under `treadle/packages/cli/harness/agents/`
now use the corrected name, as do the manifest's component ID and source and
destination paths, the installer prompt, and existing installer/package tests.
Current guidance in `AGENTS.md`, the agents README, the guide, and the setup
page uses the corrected name. Historical specs, receipts, replays, and corpus
identities retain their original recorded spelling.

## Installed definitions

The harness installer refreshed the project definitions for Codex, Claude Code,
Pi, and Copilot using a temporary manifest projection containing only this
agent. Each dry run and apply exited 0; see `installer-results.json` and the
eight installer logs. The Codex projection preserves the existing
`gpt-6.1-sol` / `xhigh` customization; the authoritative default is unchanged.
The old aliases were removed only after their bytes matched the saved hashes
and the replacement bytes were verified. The prior bytes and hashes are retained
in `before.json` and the three before snapshots. Reload the host to refresh
agent discovery; the current session's tool catalog may retain the old name.

## Verification

All commands below ran from `treadle/`, with actual exit 0:

| Command | Result | Evidence |
| --- | --- | --- |
| `pnpm exec vitest run packages/cli/test/init-surfaces.test.ts packages/cli/test/harness-packages.test.ts` | 13 tests passed | `focused-tests.log` |
| `pnpm check` | Source typecheck, lint, formatting, 294 tests passed; 9 skipped | `gate-check.log` |
| `pnpm coverage` | Statements 84.51%, branches 76.62%, functions 88.64%, lines 87.36%; floors met | `gate-coverage.log` |
| `pnpm corpus:check` | 90 golden files reproduce exactly | `gate-corpus-check.log` |
| `pnpm brand:check` | Clean | `gate-brand-check.log` |
| `pnpm audit:prod` | No known vulnerabilities found | `gate-audit-prod.log` |
| `pnpm links` | 110 live files, links resolve | `gate-links.log` |
| `git diff --check` (repository root) | Clean | independently rerun and root verified |

Wiki maintenance ran once: fingerprints, stamp, anchors, validate, status;
each exited 0. Validation reported 0 errors and 0 warnings, anchors reported
185 checked and 0 needing review, and status reported fresh. See
`wiki-results.json` and the wiki logs. The pre-existing dirty fingerprint and
stamp bytes were preserved afterward; status remained fresh. The scanner covers
Python only and the stamp compares Git HEAD, so neither proves dirty TypeScript
or Markdown freshness. The touched references were inspected directly.

## Independent review

Read-only reviewer `/root/red_forman_rename_review` returned:

> PASS — nothing to fix

The reviewer independently verified canonical rename identity, saved hashes,
retired aliases, replacement bytes, manifest routing, preserved Codex settings,
and current references; its identity/hash check exited 0. It reran the focused
installer/package tests: 13 passed, exit 0, and `git diff --check`: exit 0.
Its initial README table finding was repaired and rechecked before this verdict.
The independent test transcript is `independent-review-tests.log`.
