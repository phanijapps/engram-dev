# Proposed task sequence

Compact plan. One start receipt covers T-1 through T-3 after D-1 and D-2 acceptance.
The sequence is T-1 → T-2 → T-3. It is linear because each step consumes the previous step's artifacts.
Structural entry: T-1. Machine permission remains awaiting owner action; no task is admitted.

| Task | Outcome | Trace | Check from `treadle/` |
| --- | --- | --- | --- |
| T-1 | Author the canonical search-kb entrypoint, focused OKF reference, case recipes, rubric, and skill verifier. | DES-1; FR-1/2/3 | `node ../specs/search-kb/verify-skill.mjs` |
| T-2 | Register the component, add selective SDLC routing, extend install/package checks, and install search-kb to Copilot. | DES-2; FR-4 | `pnpm exec vitest run packages/cli/test/search-kb-install.test.ts packages/cli/test/init-surfaces.test.ts packages/cli/test/harness-packages.test.ts` |
| T-3 | Run independent blind evaluations, repair scoped defects, refresh affected wiki guidance, run gates, and obtain review. | DES-3; FR-5 | `node ../specs/search-kb/verify-delivery.mjs` |

T-1 check must parse frontmatter, confirm all routed resources exist, invoke the available skill validator,
and materialize valid fixtures. It does not claim behavioral success.
T-2 tests must install real skill resources, prove idempotency/conflict preservation and package inclusion,
and verify the requested Copilot surface. Keep existing hook configuration intact.
T-3 delivery check must verify every actual case record and unchanged fixture hashes, run six repository gates,
and run the required wiki maintenance once. It must reject absent results and preserve failure evidence.
No sentence/heading matching substitutes for behavioral evaluation.

Allowed T-1 paths: canonical `skills/sdlc/search-kb/**`, pack-local verifiers, eval support and evidence.
Allowed T-2 paths: manifest; canonical analyze/plan/implement/review skill routing; relevant CLI tests;
`.github/skills/**`, `.github/agents/red-forman.md`, `.github/hooks/wukong.json`, installer-owned hook payloads;
pack-local evidence. Add no server or knowledge-runtime behavior.
Allowed T-3 paths: search skill fixes, evaluation evidence/support, routing/tests if a scoped defect needs repair,
`wiki/project/setup.md`, `wiki/domain/wiki-contract.md`, and wiki metadata. Keep all approved plan artifacts frozen.
Canonical task context enumerates exact initial files and resource directories; handout pins touch entries.
Advisory wiki/source reads are not automatically frozen.

Before a completion claim, obtain an independent read-only red-forman review and independent PACK review for current digests.
Raise a PR after checks and review, on a `codex/` branch. Attach its URL to this chat.
A PR is permitted while owner Finish remains pending; it must state that status.
The owner performs Finish separately. Never create an owner acceptance, Start, or Finish receipt for them.

## Follow-ups and limits

Native Copilot host activation, Windows hook execution, cloud bootstrap, and runtime search improvements remain excluded.
Tests of local command callbacks do not prove a real host session.
Freshness still compares HEAD and scans Python only; inspect touched TypeScript and Markdown directly.
No implementation or behavioral evaluation has run for this new skill yet.
