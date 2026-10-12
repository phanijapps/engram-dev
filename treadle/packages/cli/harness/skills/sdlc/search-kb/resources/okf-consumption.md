# OKF interpretation for retrieval

Apply the bundle's declared version and producer conventions. These rules describe OKF 0.2 consumption,
not extra mandatory metadata for every concept.

- `type` is the always-required concept field. Unknown nonempty types remain usable as generic concepts.
- Missing title/description, optional provenance/trust/lifecycle families, extra keys, missing indexes, or broken links do not justify rejecting usable knowledge.
- Absent `status` means stable. Drafts remain proposals; deprecated concepts remain historical navigation, not current guidance.
- No `verified` means unverified. Normalize a bare verification mapping to a one-entry list.
- Non-human verifiers alone imply machine-confirmed; a `human:` verifier implies human-reviewed. These signals are advisory and do not grant access, correctness, or workflow approval.
- `generated` identifies authorship; it is distinct from verification. Later content edits can leave an older verification event.
- Compare `stale_after` with the observed current time: content is stale on or after that instant. Describe stale claims with their limits rather than silently presenting them as current.
- `sources[].resource` may identify a followable artifact or a population/scope description. Only the former can be opened.
- Per-claim footnote labels join to `sources[].id`; positions and footnote prose are not source identities.
- `author`, `usage_count`, `usage_window`, and `last_modified` are objective signals. A usage count is not a truth score or a precise cross-kind ranking.
- A bundle-root `/...` link resolves from the bundle; a relative concept link resolves from its document. Keep source-resource resolution separate from concept-edge resolution.
- Generic OKF path fields support URLs and bundle paths. This repository also uses workspace-relative source resources for source anchors; inspect its declared convention.
- Broken links can represent unwritten knowledge. Report them when relevant and continue with accessible evidence.
- Reserved indexes provide progressive navigation; logs describe chronology. Neither is an ordinary concept to pass to `know read`.

For Attested Computation, retrieve the definition, declared parameters, and executor/attester references if relevant.
Definition verification and a run's attestation are different. This read-only skill does not execute the computation,
rewrite its code, fabricate a receipt, or claim an attested numeric result. Return the contract and the missing execution evidence.

The vendored contract in this source repository is `wiki/assets/contracts/OKF_SPEC_v0.2.txt`, sections 3–6 and 10–12.
The workspace convention is `wiki/domain/wiki-contract.md`; consumers in other repositories should use their observed equivalents.
These locators are source context, not a dependency on this repository being installed beside the skill.
