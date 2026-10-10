---
name: nodejs-craft
description: Write clean, well-commented TypeScript/Node code — naming, functions, types, comment discipline. Use whenever creating or editing any .ts/.mts/.cts file, reviewing Node code, or answering "is this clean code" for TypeScript. Bakes in the rules from wiki/research/nodejs-engineering-standards.md (R1–R15, R40). Triggers on "clean code", "refactor this module", "write the TS for", any TypeScript file edit.
metadata:
  - source: wiki/research/nodejs-engineering-standards.md
---

# Node.js craft — clean code, clean comments

Code is read twenty times more often than it is written. Every rule here serves the
reader. The full rulebook is `wiki/research/nodejs-engineering-standards.md`; this
skill is the part you apply at the keyboard.

## Before you write

1. **Can the type system carry it?** If a union, branded type, or `readonly` shape
   can replace a runtime check or a comment, use the type. Types are comments the
   compiler proofreads.
2. **One job per function.** If the function needs "and" in its name, it is two
   functions. If it needs a paragraph to explain, it is a module.
3. **Name from the reader's seat.** `deriveStage(doc)`, not `process(d)`. Booleans
   read as claims: `isFrozen`, `hasOpenQuestions`. No abbreviations except the
   domain's own (`FR`, `AC`, `DES` are domain words here).

## The type rules (non-negotiable)

- Discriminated unions for every closed vocabulary. Exhaustive `switch` ends in
  `assertNever(x)` — a new member must break the build.
- Branded IDs (`type TaskId = string & { readonly __brand: 'Task' }`) — a
  `TaskId` never slides into a `QuestionId` parameter.
- `any` is a build failure. A cast (`as`) carries a comment naming the invariant
  that makes it true.
- Data that landed is `readonly`. Mutation happens in one place, on explicit
  copies, never in place on loaded documents.
- Parse at boundaries (HTTP bodies, CLI args, config, files) exactly once;
  internals consume typed values. Never re-validate what a parse already proved.

## Clean comments — the discipline

A comment is a failure report: it documents what the code _cannot_ say.

1. **Delete the comment the code already makes.** `// increment i` over `i++` is
   noise; noise trains readers to skip comments.
2. **Explain WHY, never WHAT.** The why lives in domain terms: why this order, why
   this refusal word, why the clock is injected. Never narrate the mechanism.
3. **A comment that contradicts the code is worse than none.** When you change
   code, hunt its comment in the same breath. Stale comments are defects.
4. **Public API gets doc comments** (`/** … */`): one line of purpose, the shape
   contract, one minimal example if non-obvious. Internals usually need nothing.
5. **TODO discipline:** every `TODO` carries an owner and a condition
   (`TODO(maintainer): remove when specpack/0.4 lands`). A bare TODO is litter.
6. **Do not comment out code.** Delete it — the vcs keeps the history. A commented
   block is a message to no one.

## Function shape

- Short enough that the name and the body tell one story. Extract at the first
  "and".
- No boolean parameters that switch behavior (`render(doc, true)`) — two functions
  with honest names.
- Early returns for refusals; the happy path reads last and flat.
- Errors: bugs throw; domain refusals return typed values (`{ ok: false, code,
message }`). Never throw for a refusal the caller should handle.
- No floating promises — await it or name the deliberate detach. Sync I/O only in
  one-shot CLI paths.

## When you review your own diff

- [ ] Every new name survives the "read it aloud in a standup" test.
- [ ] Every comment answers _why_; none narrate _what_; none are stale.
- [ ] Unions are closed; switches are exhaustive; IDs are branded.
- [ ] The diff contains no commented-out code and no bare TODOs.
- [ ] `pnpm check` (typecheck → lint → tests) passes with exits verified, not piped.
