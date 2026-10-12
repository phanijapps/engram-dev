The KB establishes that **writes wait for two replicas before acknowledgment**. It explicitly declares **no failover guarantee**. That is the scope of concept `domain/replication`; it does not establish zero-loss failover. [Replication concept](/tmp/search-kb-behavior-KD16NI/fixtures/no-hit/wiki/domain/replication.md:7)

Searching `zeroloss` returned no hits; the combined query `zeroloss failover` returned a weak match, and broadening to replication/replica terms found the concept above. All searches and the direct read exited 0. A missing search hit does not prove the capability is absent.

The concept cites no implementation source, and the inspected file inventory contains only the KB index and this concept. Runtime replication and failover behavior remain unverified. `know status` exited 0 with one concept, no conformance errors or warnings, and `freshness: no-stamp`. A failover implementation or explicit guarantee/runbook is the next evidence needed.
