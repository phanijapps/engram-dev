Only `stable` is eligible as current documented guidance by lifecycle; its verification still does not prove current implementation behavior.

| Concept | Lifecycle and claim | What verification establishes |
| --- | --- | --- |
| `stable` | No status is specified, so it defaults to stable. It says a reviewed definition needs source confirmation for current behavior. | The bare verification mapping records `human:alex` at `2026-01-01T00:00:00Z`: human-reviewed, advisory evidence. It does not establish runtime correctness, freshness, access, or owner approval. |
| `draft` | Explicitly draft. Its automatic owner Start rule is a proposal, not accepted policy. | `process:lint` at `2026-01-01T00:00:00Z` indicates machine confirmation only. It neither accepts the proposal nor authorizes Start. |
| `old` | Deprecated; the ban on all retries is historical guidance. It is also stale: `stale_after` is `2000-01-01T00:00:00Z`, before this run's observed time. | No verification event is present, so it is unverified. |

Evidence: [Stable metadata and claim](/tmp/search-kb-behavior-KD16NI/fixtures/trust-lifecycle/wiki/stable.md:5), [Draft metadata and proposal](/tmp/search-kb-behavior-KD16NI/fixtures/trust-lifecycle/wiki/draft.md:5), [Deprecated metadata and claim](/tmp/search-kb-behavior-KD16NI/fixtures/trust-lifecycle/wiki/old.md:5). Lifecycle defaults and verification normalization follow [OKF interpretation](/tmp/search-kb-behavior-KD16NI/skill/resources/okf-consumption.md).

None of these concepts cites an implementation source, and the inspected inventory contains only the index and three concepts. Current implementation and any separate owner decision therefore remain unconfirmed. `know status`, search, and all three direct reads exited 0. Status reports three concepts, no conformance errors or warnings, and `freshness: no-stamp`; those checks do not make a draft accepted, a deprecated policy current, or verification a grant of authority.
