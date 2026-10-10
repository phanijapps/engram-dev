# Documentation repair evidence — 2026-10-10

Pinned HEAD: `b4dd8706f2646fbc1b122a49501445ee55ccb150`.
The working tree includes prior replay artifacts and this documentation repair.
`gates.json` records observed exit codes. Log files retain command output.

## Documentation verification

The read-only audit command ran from `treadle/`:

```bash
./node_modules/.bin/tsx ../docs/specs/documentation-consolidation/verify-docs.mjs
```

Exit 0. `verification.json` reports 37 concepts, all reachable,
checked source paths and line bounds, 30 protected files, 27 preserved documents,
and 234 existing documentation inventory entries. Protected files and preserved
snapshots match their original hashes. All four packs have hash-labelled
initiative and retrospective projections. Lifecycle finding `policy-1662c471`
remains pending. The draft page creates no owner acceptance or closure gate.

The first audit caught one out-of-range ESLint source locator. It was corrected
before the passing audit. This audit establishes paths, line bounds, hashes,
coverage, navigation, and OKF conformance. It does not prove prose semantics.
Source reinspection and the read-only review provide the qualitative check.

## Workspace gates

| Command | Exit | Observed result | Evidence |
| --- | --- | --- | --- |
| `pnpm check` | 1 | Types, lint, format passed; 110 tests passed, 1 failed | `check.log` |
| `pnpm coverage` | 1 | Same test failed; current coverage floors not verified | `coverage.log` |
| `pnpm corpus:check` | 0 | 78 golden files regenerated; exact reproduction | `corpus.log` |
| `pnpm brand:check` | 0 | Brand fence clean | `brand.log` |
| `pnpm links` | 0 | 88 live Markdown files checked; all inline links resolve | `links.log` |

The failing test is `treadle/packages/cli/test/where.test.ts:175`.
It requires an open wave and specifically an open `install-paths` pack.
All four packs are delivered. No frozen pack was reopened to satisfy the test.
The failure also occurred before this repair, in the earlier replay verification.
Its fixture repair remains G3 in the wiki open-work register.

## Wiki ritual and search

Fingerprints, stamp, anchors, validate, status, search, and work discovery all ran
with exit 0. `wiki-commands.json` records their exact invocations.
Validation: 0 errors, 0 warnings. Status: fresh, 37 concepts, 108 source anchors,
0 needing review, 1 pending finding. Anchors report 104 untracked source entries.

Untracked is report-only in the current engine. A fresh stamp does not establish
TypeScript source freshness. The independent audit records source hashes for
this documentation observation; it does not fix continuous drift detection.
`do where` reports all four executable packs delivered. This repair has draft
prose artifacts, not an executable pack, and is tracked by its wiki initiative.

## Task observations

- T1: Preserved prior explanations; current CIDs retained; TypeScript sources inspected;
  source path and line-bound checks passed.
- T2: Project and research interpretation consolidated; entry documents redirected;
  the maintenance proposal remains draft and pending.
- T3: Four dated projections and retrospective backfills exist; source packs are unchanged.
- T4: Documentation audit and wiki checks passed. Full workspace gates expose the
  existing test failure. The initial review found three stale execution placeholders; they were corrected.
  Closing read-only review passed.

## Review

The initial read-only review returned FIX BEFORE COMMIT on three stale execution
placeholders. Those findings are recorded with corrections in `review.md`.
The closing read-only review returned **PASS — nothing to fix** and independently
reran the audit with exit 0. No full-workspace green claim is made.
