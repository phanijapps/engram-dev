The repository has no KB from which to establish deployment rollback rules. Its README explicitly says no knowledge bundle has been created, and `know status wiki --workspace …` exited **1** because `wiki/` does not exist. [Repository README](/tmp/search-kb-behavior-KD16NI/fixtures/missing-bundle/README.md:1)

The available source only declares `releaseIdRequired = true`; the README says the deploy script records a release ID. Neither defines rollback triggers, eligible releases, approval requirements, or recovery steps. [Deployment source](/tmp/search-kb-behavior-KD16NI/fixtures/missing-bundle/src/deploy.ts:1)

Rollback rules therefore remain unknown. An existing rollback runbook, policy record, or deployment implementation would be needed to answer them. No bundle was created or repaired.
