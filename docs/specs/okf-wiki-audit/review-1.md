---
kind: review
slug: okf-wiki-audit
title: Wave 1 — wiki trust restoration (T1–T5)
review: 1
status: active
created: 2026-10-07
diff_base: b017c05 (wave start; plan's 5d0f9e2 pin predates the skills-authoring commit — see Scope audit)
diff_head: 7328d7f + stamp re-anchor during review
tasks_in_scope: [T1, T2, T3, T4, T5]
commits: [3b47f7c, 01aa49b, c883fd2, 036bed2, 1604e35, aa17a00, 7328d7f]
related: [plan.md, design.md, gap-1.md]
---

# Review 1 — wave 1: wiki trust restoration

## Verdict summary

| Task | Verdict | Re-run result | Evidence ref |
|------|---------|---------------|--------------|
| T1 | **pass** | `engine/okf pytest -q` → `159 passed in 0.78s` (6 pins incl.) | 3b47f7c: base.py + test file only |
| T2 | **pass** | greps `.( ` = 0, `.)` = 0; `memory.py.md:55` clean dotted label | c883fd2: wiki managed + stamp only |
| T3 | **pass** | web-server 0, clear-transcripts 1 (cli.py:116), L10-13 1, validate.py 25-29 ×2, counting-rules 1; 2 remaining `39bad0f` hits are correction-provenance notes (intentional) | 1604e35: exactly the 4 curated pages |
| T4 | **pass** | idempotent re-update: 0 content diffs, `indexes: 28`, root `okf_version: '0.2'`, D5 held (0 `indexes` in stamp), `engine/core pytest` → `15 passed`, status 0/0/fresh | 036bed2: knowledge.py + wiki only |
| T5 | **pass** | 6/6 U-rows carry exactly one marker, consistent with L3#18 | 01aa49b: plan doc only |

**Slice verdict: PASS** — zero blockers, zero majors; evidence authentic
(all cited commits exist with matching content, `git show`-verified) and
current (re-runs executed at HEAD). Wave-1 scope closed through
`7328d7f`.

## Re-run log

```
$ cd engine/okf && uv run pytest -q          → 159 passed in 0.78s
$ cd engine/core && uv run pytest -q         → 15 passed in 0.76s
$ grep -rlF ".( " wiki/code | wc -l          → 0      (was 13)
$ grep -rlF ".)" wiki/code | wc -l           → 0      (was 13)
$ grep -ci "web server" wiki/systems/memex.md → 0
$ rg -c '**paper…**|**partial**' Kit_Wiki_Engine_Plan.md → 6
$ uv run memex-core wiki update              → 0 written / 83 updated / indexes: 28
$ git status --short wiki/ (post-update)     → last-index.json only (idempotent)
$ uv run memex-core status                   → 0 errors / 0 warnings / fresh
```

## Findings

| ID | Severity | Finding | Evidence | Route |
|----|----------|---------|----------|-------|
| F1 | minor | Evidence-status tags partial on T3-edited sections: wiki-contract/one-engine corrections carry `(implementation-supported…)` tags, the memex.md adapter-list and verb-list edits carry none | wiki/systems/memex.md:22-33 vs wiki/domain/wiki-contract.md:82-99 | **T6** (appended, ready) |
| F2 | nit — arbitration, no route | T4 expectation said "root index enumerates concepts by type incl. curated"; §8's designed shape is per-directory (root lists subdirs, subdir indexes list concepts). Reachability core holds (root→decisions/index.md:3→page). Imprecision was in the plan's wording, not the implementation | plan.md T4 row vs wiki/index.md + wiki/decisions/index.md | recorded here; plan is a complete artifact — amending would rewrite history |
| F3 | note (conformance-positive) | T3's managed-page micro-adaptation (scope statement in curated wiki-contract.md instead of managed repository.md) is *required* by the build-kb managed/curated rule — correct call, recorded in ledger | wiki-contract.md "Counting rules and coverage" § | none |

## Scope audit

Wave-1 commits touch exactly the frozen-context union (verified
per-commit via `git show --stat`). A naive `5d0f9e2..HEAD` diff shows 8
extra files — all from `b017c05` (implement/review skill authoring),
which landed between plan and execution and is not wave-1 work; the
correct wave base is `b017c05`. **No creep.**

## Traceability audit

| Gap (wave-1 scope) | Landed by | Deferred? | Check |
|--------------------|-----------|-----------|-------|
| G2 renderer defect | T1, T2 | no | greps 0/0 at HEAD |
| G5 falsified claims | T3 | no | per-claim re-verify green |
| G10 counting/coverage | T3 | no | section present, rules match resolve.py:78-81 |
| G3 disclosure + orphan | T4 (+T3) | no | 28 indexes; decisions/index.md:3 |
| G12 U-scorecard | T5 | no | 6/6 marked |
| G4 (page-pin half) | T3/D4 | no | pins → pointers; machinery half deferred to wave 3 (explicit, gap-1 close plan) |

No orphan rows. Out-of-scope items (U1, ledger hardening, upstream,
PROFILE) are explicitly deferred in design.md — not silent holes.

## Conformance audit

- **D1** honored — sanitation in `_clean_imports` (base.py:134);
  mechanism refined during implementation (whole-list paren replace vs
  per-token strip) to handle valid `from x import (a) as c`; refinement
  recorded in the T1 commit. Two-way, recorded → conforms.
- **D2** honored — grouped curly imports still dropped (indexer `return []`
  untouched); known gap stands.
- **D3** honored — wired into `wiki_update`, no new verb.
- **D4** honored — all volatile stamps/pins are pointers now.
- **D5** honored — `grep -c '"indexes"' last-index.json` = 0.
- **Carried uncertainty:** A1 closed by T2 greps; Q1/Q2 still open, no
  artifact claims resolution.
- **Findings-ledger discipline:** wave 1 wrote no normative content as
  settled truth; corrections were descriptive (no proposals required).

## Handoff

- **Slice passed** — evidence current through `7328d7f` + this review's
  stamp re-anchor.
- **Routed fix:** T6 appended to plan.md (ready, S).
- **Next step:** wave 2 (U1) via **impact mode** — analyze first, per
  the wave strategy; T6 can ride along with any implement pass.
