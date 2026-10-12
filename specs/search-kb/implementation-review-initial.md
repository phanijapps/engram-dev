# Independent implementation review: initial findings

Reviewer: `/root/search_kb_plan_review`, read-only red-forman review.
Verdict: FIX BEFORE COMMIT.

DEFECT 1: the init removal branch preceded preview handling. Independent isolated
`--remove --dry-run` and `--remove --json` reproductions each exited 0 and removed
five installed files. Required fix: read-only removal previews and CLI preservation tests.

DEFECT 2: guide publication rechecked only target/backup inputs. An independent
component-copy intervention changed package.json during apply; the install
published stale pnpm/check guidance instead of refusing the changed renderer input.
Required fix: recheck all renderer inputs at publication and test drift during copying.

The reviewer also ran six targeted suites: 73 passed, exit 0. Those passing tests
did not establish the missing expectations. No repository edits or owner actions
were performed by the reviewer. This failure is retained separately from the
repair and subsequent verdict.

Root repairs within the accepted D-4 scope: removal previews now skip mutation,
publication rechecks all context inputs, and regression tests exercise both failures.
Root-document removal protection also applies when ownership data lists those paths.
The live workspace instructions remained untouched during this review/repair.
