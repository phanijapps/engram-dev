# Independent delivery review 1

Verdict: FIX BEFORE COMMIT.
Reviewer: agent:replay_review.
Reviewed HEAD: 797bf408a1bbcc74740cbeee5d9ad1643186f1cf.
Completed: 2026-10-10T22:45:10Z.
Plan digest: 7469f1c44e8b85379df31fc2275c197a07827e43de21b95c36c99d8f46a7ebf3.
Evidence digest: ac322feed5f56d90716c181646212390c2250c6e05fdfdb88ef334d2b5d6105b.

The actual reviewer returned these findings. No PACK PASS was registered.

## Commands

T1 exit 0; T2 exit 0; T3 exit 0; T4 exit 0 and rerun after UI fix exit 0;
T5 exit 0; T6 rerun at reviewed HEAD exit 1.

## BLOCKER 1: current full gate is red

Evidence: treadle/packages/web/src/library.html:386 and
packages/web/test/library-skin.test.ts:25.
The declared T6 command fails because the pinned gradient CTA grammar changed.
Restore the pinned gradient while keeping the contrast assertion green, or
change the skin contract deliberately and rerun T6.

## BLOCKER 2: schema evidence is not reproducible

Evidence: specs/spec-completion-handoff/verify-contract.mjs:8,
wiki/assets/contracts/specpack-owner-workflow.schema.json:2, and
T-6-contract-verification.json:2.
The verifier requires AJV_MODULE. The repository's transient Ajv 6 cannot compile draft 2020-12.
Declare the required validator, or use a supported schema draft.
Regenerate the evidence with repository dependencies.

## DEFECT 1: implement eval uses a nonexistent flag

Evidence: shipped and installed implement/evals/cases.json:82.
The needs-rebase expectation refers to --approved-by, which the CLI does not support.
Replace it with the actual owner start or unblock flow and resync the copies.
