# Candidate specification

| ID | Requirement | Observable acceptance |
| --- | --- | --- |
| FR-1 | Discover the actual bundle and retrieve relevant concepts with the current CLI or read-only Markdown fallback. | Fixtures cover existing, custom-path, missing, and no-hit bundles; no bundle is created. |
| FR-2 | Consume OKF IDs, links, metadata, sources, lifecycle, and advisory trust without inventing acceptance or current facts. | Cases cover relative/root links, unknown types, optional metadata, verified mappings, expired dates, draft rules, and source conflicts. |
| FR-3 | Return concise source-backed context, conflicts, and gaps to the SDLC step while preserving workspace bytes and owner authority. | Fixture hashes remain unchanged; conclusions cite inspected sources, missing evidence stays explicit. |
| FR-4 | Ship `search-kb` from the authoritative harness tree to all four agent surfaces, including `.github/skills/search-kb`. | Manifest dry runs and isolated installs preserve existing files and copy the full skill; native package tests pass. |
| FR-5 | Run meaningful behavioral evaluations, repository gates, and independent review before raising the PR. | Each case has raw output, actual commands, rubric scores, and side-effect checks; all critical gates pass. |

Title and description are this repository's authoring requirements, not extra mandatory keys for every consumed OKF concept.
Absent `status` means stable; absent verification means unverified. Trust does not grant authority.
A search score measures retrieval relevance, not truth. A fresh HEAD stamp does not attest dirty source content.
Reserved indexes and logs guide navigation; they are not ordinary concepts.
An Attested Computation concept can be described and linked, but this skill does not execute it or claim a run result.

Required human spec questions: empty. Exclusions are recorded in the analysis and machine pack.
