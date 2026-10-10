# Contributing

One command tells the truth:

    corepack enable && pnpm install
    pnpm check        # tsc --build → eslint → prettier → vitest (exits checked)
    pnpm brand:check  # the white-label fence
    pnpm corpus:check # goldens regenerate byte-exact from the python engines

Rules that matter here (the full set: `skills/node/*/SKILL.md`):

1. Types carry the contract; `any` fails the build. Refusals return typed
   values; bugs throw.
2. The corpus is truth: behavior changes regenerate goldens deliberately,
   with the diff in the commit.
3. Exit codes are verified, never piped away.
4. Leave the campsite cleaner (the boy-scout skill): stale comments are
   defects; dead code is deleted; the vcs remembers.
5. Security findings go through SECURITY.md, not issues.

Commit style: conventional commits. Architecture decisions land as ADRs
in `docs/adr/` once the project grows beyond this repo's wiki.
