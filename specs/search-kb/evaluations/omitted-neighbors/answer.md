The documented rollout constraints are:

- Start with **one canary**.
- Obtain **human acceptance before promotion**.

These are the full constraints stated in concept `constraints`. The `service` concept links to `/constraints.md`, which resolves from the KB root to `wiki/constraints.md`. [Rollout constraints](/tmp/search-kb-behavior-KD16NI/fixtures/omitted-neighbors/wiki/constraints.md:7), [Service relationship](/tmp/search-kb-behavior-KD16NI/fixtures/omitted-neighbors/wiki/service.md:7)

The depth-1 service read explicitly omitted `constraints` to fit its 3,000-token budget; I read `constraints` directly, and that command exited 0. `know status` also exited 0, reporting two concepts, no conformance errors or warnings, and **no freshness stamp**. These concepts have no verification or supporting source anchors, so the KB does not establish current operational enforcement, canary duration, promotion thresholds, or rollback procedures. Human acceptance remains required by the documented constraint; retrieval does not supply it.
