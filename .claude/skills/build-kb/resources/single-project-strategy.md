# Single-project strategy

One package, one product, wiki at the repo root.

## Index pass

```
# code indexing delegated — curated anchors only (recorded gap)
  --include "src/**" \
  --exclude "src/**/tests/**"
```

Adjust the include to the source root(s) (`src/`, `lib/`, package dir).
Generated `wiki/code/**` mirrors the package layout.

## Curated concept seeds

- `systems/<product>.md` — what it is, entry points, how a request flows.
- `domain/<core-abstraction>.md` ×2–4 — the ideas the code implements.
- `workflows/<primary-loop>.md` — the main runtime or dev loop.
- Golden path (normative, via findings) only when evidence is explicit
  (framework-owned interfaces, conventions repeated in ≥2 modules).

## Signals you are done for this pass

Stamp check (`repo_head` == HEAD) → wiki fresh; every curated concept has ≥1 path-level
evidence claim; no pending findings older than the session.
