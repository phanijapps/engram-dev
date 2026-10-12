The documented cache TTL is **45 seconds**, in concept `runtime/cache`. The inspected source agrees: `export const ttlSeconds = 45;`. [Cache concept](/tmp/search-kb-behavior-KD16NI/fixtures/custom-bundle/context/kb/runtime/cache.md:9), [Cache source](/tmp/search-kb-behavior-KD16NI/fixtures/custom-bundle/src/cache.ts:1)

The repository declares its knowledge home as `context/kb` and source resources as workspace-relative. [Repository guidance](/tmp/search-kb-behavior-KD16NI/fixtures/custom-bundle/AGENTS.md:1)

`know status`, search, and read exited 0. Status found one concept, no conformance errors or warnings, and `freshness: no-stamp`. This confirms the documented value and its source declaration; the one-line source does not demonstrate expiry execution or its timing semantics.
