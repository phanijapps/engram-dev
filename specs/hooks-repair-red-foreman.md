# Independent hook repair review — 2026-10-11

## Verdict

PASS — nothing to fix

Independent reviewer: `agent:roadmap_eval_revision`, read-only red-foreman review. Scope is the three confirmed hook defects, their bounded source and installation repairs, tests, and final report/evidence. The reviewer changed only this authorized review record; no implementation, installer state, owner state, or historical pack was edited.

## Findings

No remaining BLOCKER, DEFECT, or SMELL in the reviewed scope.

The original Claude lifecycle defect is resolved: installed settings have one current exec-form callback per event, use a relative payload through the nearest Claude settings boundary, and preserve event stdin and cwd. The old installed PostToolUse defect is resolved: the active payload matches source and consumes Claude stdin events with advisory output. The corpus guard defect is resolved: real `expected.*` witnesses are recognized in addition to legacy generated directories, with reads permitted.

An initial independent rerun found a stale argument-position assertion in `treadle/packages/cli/test/init-engine.test.ts:220`. That assertion was corrected; the independent rerun below passed. This was an intermediate finding, not a remaining defect.

## Independently checked evidence

- Reran eight suites covering installer behavior, Claude and Codex project paths, current lifecycle callbacks, and the machine-managed guard: **40 tests passed, exit 0**. Relocation, nested cwd, stdin, global scope, nearer configuration boundaries, owned-command migration/removal, and foreign-hook preservation are exercised.
- Checked every current corpus witness against the source guard: **90 `expected.*` paths, zero misses, exit 0**. No write was attempted.
- Compared current compiled Codex definitions with installed definitions: both event definitions were byte-for-byte unchanged.
- Inspected actual Claude/Codex settings: one callback per configured event, with no embedded checkout path. Active shared Claude/Codex/guard payloads and all three Pi JavaScript payloads match authoritative source.
- Inspected the exact ownership reconciliation: it adopts only the three previously observed legacy Claude callback definitions, then uses the canonical installer. All three installer runs exited 0.
- Verified actual configured-command evidence: eight Claude/Codex lifecycle executions at repository root and nested cwd exited 0 with connected JSON context; six Claude PostToolUse executions exited 0 with empty Read results and managed wiki/corpus Write advisory results. Installed Pi smoke evidence confirms single registration, connected lifecycle context, read permission, and blocked wiki/corpus file-tool writes.
- Verified recorded source/installed hashes against current bytes, and inspected [the final report](hooks-repair-evaluation.md) and [evidence record](hooks-repair-evidence.json). All six repository gates exited 0: check, coverage, corpus, brand, production audit, and links. Check reports **179 tests in 42 files**; coverage is **86.52% statements/lines, 95.06% functions, 76.45% branches**.
- Inspected all five wiki command outputs: exit 0 each, **44 concepts, 0 errors, 0 warnings, 156 anchors, 0 needing review, fresh stamp**. The existing pending finding remains pending. Final diff whitespace check exited 0. Targeted Prettier passed; ESLint checks the compiler but ignores hook JavaScript, so behavioral tests supply the guard evidence.

The recorded actual-hook executions and full gates were run by the implementing agent and independently inspected here. The 40-test rerun, 90-witness audit, compiled-definition comparison, installed-byte checks, and report/evidence inspection were performed by this reviewer. Test-fixture human claims are synthetic; no real owner action was performed by the review.

## Verification limits

Native host activation/reload/trust and native Windows execution remain unverified. Claude PostToolUse is after-the-fact advisory output; the file-tool guard is not a shell sandbox.

Exact-directory workspace semantics remain unchanged. Nested sessions use their event cwd and therefore discover that directory's wiki/specs, rather than automatically inheriting the ancestor repository's canonical context. The README/report disclose this; it is not a remaining installation defect.

The HEAD-based stamp and Python-only fingerprints do not establish dirty TypeScript/Markdown freshness. This review inspected the changed source, installed files, and captured results directly. Existing context-level freshness/discovery warnings do not indicate callback execution failures.
