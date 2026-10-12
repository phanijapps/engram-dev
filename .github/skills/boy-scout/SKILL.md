---
name: boy-scout
description: Leave every file, module, test, and commit cleaner than you found it — the hygiene loop that runs on EVERY code change, any language. Use on every implementation/edit turn: before the first edit (read the mess), during (do not add new mess), and before claiming done (clean the campsite). Triggers on any code edit task, "clean this up", "refactor", commit preparation.
metadata:
  - source: wiki/research/nodejs-engineering-standards.md (R20, R21, R29, R30)
---

# Boy Scout — clean your mess, then leave it cleaner

The rule: **the campsite is cleaner after you leave than before you arrived.**
Not "not worse." Cleaner. Every turn, every file, every commit.

## Before the first edit (read the campsite)

1. Read the file you will touch. Not a skim — the whole file. You cannot clean
   what you have not seen.
2. Note the existing mess in reach: dead code, stale comments, bare TODOs,
   commented-out blocks, names that lie, imports that shadow.
3. Mark what you will fix this turn (in reach, small) and what you will record
   (out of reach → a task/todo with an owner, never a silent shrug).

## During the work (do not add new mess)

- Every new line earns its place: no speculative abstractions, no "might need
  later," no drive-by features outside the task's scope.
- The scope jail holds: clean _in reach_, not everywhere. A refactor two files
  over is a new task with its own verification, not a favor.
- When you must touch a line, leave the line better: honest name, right type,
  comment that tells why or no comment.
- Failures you create, you clean: failing tests you wrote, debug logs, temp
  files, commented experiments — gone before the commit.

## Before you claim done (the campsite check)

Run the full loop, in order, with exits verified (never piped away):

1. **Typecheck + lint + tests pass** — one command, checked exit code. If the
   project has no such command, that is the first mess to fix.
2. **Read your own diff.** Line by line. Hunt: leftover debris, accidental
   debug output, formatting drift, a fix that broke a sibling test.
3. **Stale-comment sweep:** every behavior you changed — did its comments and
   docs move with it? A comment that no longer matches is a defect you shipped.
4. **Dead-code sweep in reach:** the branch you bypassed, the export nothing
   imports, the flag always false. Delete; the vcs remembers.
5. **Naming pass:** did the change make an old name a lie? (`renderPage` that
   now also persists?) Rename now, while the diff is open.
6. **Commit cleanly:** conventional message, one logical change, no "and also
   fixed unrelated thing" buried in the body.
7. **Record what you left:** the mess out of reach becomes a named task/TODO
   with an owner. "Later" is not a record.

## The anti-patterns (each one, met in the wild)

- **The tourist:** fixes the task, leaves the obvious mess beside it. → You are
  not a tourist; you live here.
- **The arsonist firefighter:** makes the mess, fixes half, claims heroism. →
  The diff review (step 2) catches you.
- **The silent cleaner:** refactors beyond scope without a task or disclosure. →
  Out-of-reach cleanup is a task, and the commit says so.
- **The pipe-blind:** `cmd | grep` masks the exit code and calls it green. →
  Exits verified directly; a passing claim without the exit code is a defect.

## The one-line test

> If the next reader opens this file knowing nothing, do they inherit a campsite
> — or a crime scene with a fresh coat of paint?
