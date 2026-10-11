# Current correction and planning checks

Scope: factual documentation correction and a proposed runtime plan.
Canonical pack revision: 4. Format: specpack/0.4, owner-gated/1.
No spec questions, owner acts, accepted decisions, start receipt, admitted tasks, or task evidence exist in this pack.
All 3 tasks remain todo. D-1 and D-2 remain proposed.

## Observed repository checks

All commands ran from `treadle` and exited 0.

| Command | Result | Retained log |
| --- | --- | --- |
| `pnpm check` | Source typecheck, ESLint, Prettier, 267 tests passed; 9 skipped | `check.log` |
| `pnpm coverage` | Statements 84.32%, branches 76.16%, functions 88.44%, lines 87.15%; all floors pass | `coverage.log` |
| `pnpm corpus:check` | 90 golden files reproduce | `corpus.log` |
| `pnpm brand:check` | Brand fence passes | `brand.log` |
| `pnpm audit:prod` | No known vulnerabilities | `audit.log` |
| `pnpm links` | 110 live files, no unresolved Markdown links | `links.log` |

The root README received a targeted Prettier write, exit 0.
No runtime source code was changed. Current suite results do not establish proposed Copilot integration or native host acceptance.

## Plan checks

The supported core writer registered the plan under the shared lock.
The first temporary authoring adapter failed to parse because a variable used an ECMAScript reserved word; exit 1, no pack mutation.
The repaired adapter published revision 2.
The first schema check failed because advisory references lacked required `why` fields; see `schema-first-failure.log`.
Revision 3 corrected those fields. Citation repair then temporarily invalidated the analysis hash.
Revision 4 repinned actual artifact bytes and removed a nonexistent metadata touch path.
These were proposal repairs; no owner receipt was modified.

Final checks: structural Ajv schema validation, all 5 artifact hashes, and the T-1 → T-2 → T-3 DAG pass.
Ajv does not install a date-time format checker in this temporary validator; no owner receipt dates exist to validate.
`do check` exits 0 with 0 violations and 0 gaps.
`do status` exits 0 and reports decisions pending at revision 4.
Structural entry set is T-1; it is not admitted for execution.
`do where` found the new canonical pack; existing closed records are unchanged.
See `final-results.json`, `schema.log`, `alignment.log`, `status.log`, and `where.log`.

## Wiki checks and retained failures

The required fingerprints, stamp, anchors, validate, and status block ran once, all exits 0.
Initial validation found 3 broken bundle links in the new concept.
The independent reviewer identified the same defect.
The links now use repository source citations and frontmatter resources.
Final validation reports 0 errors and 0 warnings; final anchors report 183 checked and 0 needing review.
Final status reports fresh, 48 concepts, and 1 existing pending finding.
The pending finding is not a new accepted policy.
Original failures remain in `validate-before-final-repair.log` and related logs.

The initially dirty `wiki/.okf/last-index.json` was saved before maintenance and restored byte-for-byte afterward.
Its HEAD equals the current HEAD, so final freshness remains fresh.
This preserves unrelated user state; the copy is `original-dirty-stamp.json`.
Fingerprints were refreshed. The scanner still covers Python only.
HEAD freshness does not detect dirty TypeScript or Markdown; affected claims were checked directly against source.

## Review and execution limits

The first independent red-foreman verdict was FIX BEFORE COMMIT.
It cited the 3 bundle link warnings and temporary analysis hash mismatch.
The final independent review returned PASS — nothing to fix on revision 4; see `../review.md`.
No actual Copilot CLI session, Windows hook command, cloud job, hook trust, or owner approval was performed.
Runtime implementation waits for D-1/D-2 acceptance and separate Start for the current plan.
