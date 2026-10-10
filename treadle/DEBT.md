# Recorded debt (honest, owned, not hidden)

## SPEC-level (both engines, decided together — red-forman conformance table)

1. §5.3 trust tiers derived from `verified` — derivation helper missing in
   both engines. Owner decision pending on tier semantics.
2. §9 log format (ISO date headings) — unchecked in both validators.
3. §10 Attested Computation (`runtime`/`parameters`/`executor`/`attester`) —
   no `runtime`-required rule; keys surface as extension-key info only.
4. §8 index structure as a conformance condition (§11.3) — partial.
5. `stale_after` staleness comparison (now >= stale_after) with injectable
   clock — the shape check exists; the freshness comparison does not.

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
