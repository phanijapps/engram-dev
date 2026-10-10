# DEBT — what is owed, what is paid

## SPEC debts (all five PAID — guided-loop T-3, 2026-10-10)

1. §5.3 trust tiers — PAID: `trustTier()` helper (unverified /
   machine-confirmed / human-reviewed from `verified` actors);
   advisory info in validate + a header line in read; consumers never
   reject. Witness: corpus debt-witness + okf02-advisory golden.
2. §9 log format — PAID as §11.3 conformance (D-6: one clause with
   §8): ISO `YYYY-MM-DD` date headings, newest first; violations are
   errors. Witness: debt-witness log.md (period-correct).
3. §10 Attested Computation — ADMISSION PAID: `runtime` REQUIRED,
   `parameters` entries `{name, type}`, `executor`/`attester` carry
   `resource`, executor declares `receipt` (§10.2). EXECUTION
   machinery (the runtime, executor runners, attesters) — deferred;
   trigger: the first real consumer of a receipt.
4. §8 index structure — PAID as §11.3 conformance (D-6): sections of
   bullet links; violations are errors.
5. `stale_after` staleness comparison — PAID: `now >= stale_after`
   with the injectable clock (`validateBundle(root, { now })`);
   surfaced as a warning. Witness: debt-witness broken.md.

## Standing debts

- `do library` multi-root/worktree parity with `do where` — the
  standing single-root surface; own wave when the surfaces converge.
- Freshness stamp is stale-by-construction at committed HEAD (the
  stamp records its parent commit) — mechanism debt; fresh at session
  close is the honest claim until the stamp compares source hashes.

## Port surface (not yet in TS)

- `okf` CLI command surface + MCP server; `templates.py`; `status.py`
  one-screen summary (readFreshness is the weaker stand-in); bundle
  `index.py`; legacy spine routing (`sdd.json`) in loom.

## Process

- **Future public repository name: engram-dev** (owner decision,
  2026-10-10). The GitHub repo phanijapps/engram-dev is born as the
  docs home; the harness itself carries the treadle brand until the
  split completes — the brand fence makes the eventual rename a
  one-command act.

- License choice (MIT vs Apache-2.0) — owner decision before any publish.
- Test-file typecheck outside the composite build (recorded in README).
- Python engines remain the golden authority; they retire only when the
  corpus generator self-hosts (TS-generated goldens validated against
  frozen fixtures) — deliberately not yet.
