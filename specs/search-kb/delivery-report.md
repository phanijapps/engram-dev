# Implemented delivery — 2026-10-12

The shared read-only `search-kb` skill is registered for all four surfaces and
installed to Copilot in this workspace. Analyze, plan, implement, and review
route relevant knowledge retrieval to it with an existing-procedure fallback.
Copilot's installed agents/skills/configuration remain under `.github`; the
manifest-owned hook wrapper/helper and runtime pointer are under `.harness`.

Full project init now generates a concise guide from a canonical template and
observed manifest/directory context. This workspace's guide is 62 lines; the
prior AGENTS.md is preserved byte-for-byte in AGENTS.backup.md. Repeated and
multi-host init do not rotate unchanged instructions. A differing backup,
unsafe path, or stale planned input refuses replacement; --force does not
bypass those guards. Global/hooks-only/opt-out operations leave instructions
alone. Removal preserves both documents, and removal/install previews are
read-only. A later filesystem failure can leave partial installed outputs,
which are reported without claiming successful activation.

## Actual verification

- T-1 structural skill/fixture check: exit 0; 11 case recipes materialize exactly.
- T-2 installer/package check: exit 0; 17 tests passed across four destinations.
- T-4 exact installer check: exit 0; 70 tests passed after independent repairs.
- T-3 exact delivery check: exit 0; all six repository gates passed.
- Full suite: 312 passed, 9 skipped. Coverage: statements 84.55%, branches
  76.53%, functions 88.83%, lines 87.46%; all required floors met.
- Corpus: 90 goldens reproduce exactly. Production audit: no known
  vulnerabilities. Links: 114 live files resolve. Brand check: clean.
- Wiki: 0 errors, 0 warnings, 190 anchors checked, 0 needing review; fresh
  HEAD stamp. One pre-existing pending finding remains; it was not resolved.

Eleven blind behavioral runs were performed in isolated temporary workspaces
by `/root/search_kb_eval_a` and `/root/search_kb_eval_b`. All fixture hashes
remained unchanged. The runs retain 109 actual command records, raw logs,
answers, timestamps, skill identity, and copied raw fixture inputs.
Independent reviewer `/root/search_kb_plan_review` graded every case against
five critical gates and the case-specific expectations: all passed, 4/4 quality.
The generated-guide case uses actual installer output and its original backup.
Evidence is under `evaluations/`, including the actual independent assessments.

Initial build/test failures, the independent failed implementation review,
and the first delivery's lint/brand failures remain retained. Repairs were
within the accepted plan; no receipt or approved artifact was rewritten.
Current successful delivery evidence is
`checks/delivery-2026-10-12T04-50-12-243Z/` and `checks/T-3-attempt-2.log`.
The verifier rejects missing independent assessments; the observed pre-grade
refusal is retained separately. Wiki mutating maintenance ran once and the
rerun retained the already current stamp rather than inventing a new check.

## Limits and remaining handoff

The current fingerprint scanner covers Python and the stamp compares Git HEAD.
Neither proves dirty TypeScript/Markdown accuracy; touched claims and sources
were inspected directly. Local callback execution is verified; native Copilot
activation, Windows hook execution, and cloud runtime bootstrap are separate.
No model API key or provider authentication was tested or changed in this PR.

Independent current-digest PACK review and PR publication follow the recorded
task checks. The owner's Finish action remains separate and has not been issued
by an agent. Earlier Copilot hook commits and the separately reviewed reviewer
rename are prerequisites included in this branch because they are absent from main.
