---
name: nodejs-architecture
description: Design and review clean Node/TypeScript architecture — package boundaries, dependency direction, SOLID in TS, schema-first contracts, error taxonomy placement. Use when creating a package/module, deciding where code lives, wiring a CLI or server, or reviewing module structure. Companion to nodejs-craft (code-level); this skill is the module-level rules (standards R4, R28, §8).
metadata:
  - source: wiki/research/nodejs-engineering-standards.md
---

# Node.js architecture — where code lives, and why

Clean architecture is one property: **dependencies point one way, and the important
things do not know about the unimportant things.**

## The package map

```
packages/
  core/        schema types, admission, normalizer, events, refusals   (knows nothing)
  knowledge/   bundle plane: pages, links, search, findings, anchors    (independent)
  web/         pages + localhost servers                                (imports core)
  cli/         commands, banners, user strings                          (imports all)
  brand/       the ONLY place the product name lives (white-label)
  conformance/ the golden corpus + runner (imports core only)
```

**Dependency direction is the design rule** (`core` ← `web`/`conformance` ← `cli`,
and `knowledge` ← `cli`). The current lint configuration does not enforce package
boundaries; review the imports. The observed controls are documented in
`wiki/project/engineering-controls.md`. `brand` supplies CLI and web strings;
the brand gate keeps product names out of `core`.

## The five SOLID rules, in this codebase's terms

1. **Single responsibility** — one admission path, one canonical writer, one
   emitter per concern. If you are adding a second path "just for this case,"
   stop: extend the one that exists.
2. **Open/closed** — the schema's namespaced extension envelopes are the pattern:
   extend by adding an envelope kind; never edit a frozen shape. New behavior
   lands as a new module behind an existing interface.
3. **Liskov** — subtypes/union members are substitutable: any `Stage` value works
   wherever a `Stage` is expected. Unions + exhaustiveness make this a compile
   question, not a faith statement.
4. **Interface segregation** — small explicit interfaces (`Admitter`, `Emitter`,
   `PackStore`). No module imports a god-interface to get one method.
5. **Dependency inversion** — the event seam is the published example: high-level
   policy (admission rules) depends on an interface; the harness adapter and any
   platform adapter implement it. Both sides run the same contract tests.

## Placement test — where does new code go?

Ask in order:

1. **Is it a contract?** (schema shape, event kind, refusal code) → `core`, plus
   the conformance corpus if it changes observable output.
2. **Does it touch disk, HTTP, or a process?** It is an adapter — put it behind
   an interface at the lowest package that needs it; keep `core` pure.
3. **Does it say the product name?** → `brand` tokens or `cli` strings. Nowhere
   else; the grep check enforces it.
4. **Is it a command?** → `cli`, one file per command, thin over `core`.
5. **None of the above?** It is probably a smell — name the concept, find its
   siblings, place it beside them.

## Module rules

- No deep imports: consumers use the package `exports` map, never `src/` paths.
- No side-effectful module imports; work happens in called functions.
- Public surface: named exports only (one default per package at most).
- Barrels (`index.ts` re-exporting everything) are a smell — export what is used,
  not what exists.
- Errors cross package boundaries as the typed refusal taxonomy; adapter-level
  exceptions are wrapped with `{ cause }` at the boundary and never leak raw.

## Review questions for any architecture diff

- [ ] Which direction does the new dependency point? (If it points up the stack,
      justify or move the code.)
- [ ] Does `core` still compile with `cli`/`web` deleted? (It must.)
- [ ] Is the product name still only in `brand`/`cli`? (`pnpm brand:check`)
- [ ] Did a frozen contract change? If yes: that is an ADR + conformance golden
      regeneration, not a quiet edit.
- [ ] Could this new module be replaced by extending one that exists?
