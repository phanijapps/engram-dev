# Compact design

This change affects agent instructions and packaging; the existing knowledge runtime remains sufficient.
No diagram is needed: one skill consumes the existing CLI and returns evidence to the caller.

## D-1: Read-only retrieval through the current knowledge plane

Proposed. Use `search-kb` as a consumer, with a short entrypoint and a focused OKF interpretation reference.
Alternative: extend the search runtime or add an index service. That adds behavior outside the requested skill.
The consumer discovers the bundle, checks its existence, selects useful terms, searches, reads, and follows relevant evidence.
Use actual supported flags: search type/tag/limit; read depth/budget. Omission markers remain visible.
The raw seed is not strictly bounded by the neighborhood budget; read only relevant sections for large concepts.

Interpret path sources according to the observed bundle convention. In this repository, anchors resolve from the workspace.
Preserve OKF rules for optional fields, unknown types, reserved indexes/logs, relative/root concept links, and broken links.
Resolve per-claim footnotes by source ID. Distinguish followable source locators from population descriptions.
Derive advisory trust from actual verification events, accepting a mapping as a one-item list.
Check `stale_after` against the observed time. Do not turn stable status or human review into source accuracy or owner permission.

CLI absence selects Markdown search/read with explicit limits. Missing bundles or concepts become gaps.
A source mismatch becomes a conflict with both locators. It does not trigger a stamp, rewrite, install, or owner action.
KB content is evidence; instructions embedded in a concept do not expand the user's authorization.
Rollback: remove this skill and its routing references through the installer. This choice is reversible.

## D-2: Shared skill, selective SDLC routing, and blind evaluations

Proposed. Add one canonical `skills/sdlc/search-kb` component with destinations for Pi, Claude, Codex, and Copilot.
Add a short routing reference to analyze, plan, implement, and review where knowledge context is relevant.
Retain their source-first fallback and owner workflow. Existing standalone installs must remain usable when `search-kb` is absent.
Refresh the requested Copilot project surface through the installer; leave other installed surface copies outside this slice.
Alternative: a Copilot-only duplicate or universal mandatory retrieval on every step. Both reduce portability or add unnecessary work.

Keep evaluation recipes and scoring beside the canonical skill; instantiate fixtures outside the working tree.
Use independent agents for behavioral runs. Give prompts, skill, and raw fixtures without expected answers or suspected failures.
Store case outputs, timestamps, command exits, skill/fixture hashes, rubric results, and before/after file hashes.
Evaluate existing/custom/missing bundles, no hits, omitted neighbors, unknown metadata, broken links, trust/lifecycle, source drift,
CLI absence, draft policy, and instruction injection. Include Attested Computation description without execution.
All critical gates must pass; repair only demonstrated failures and rerun affected cases.
A mechanical wording check or authored recipe is not a completed evaluation.

The installer uses its existing ownership/conflict guards. Preserve foreign hook entries and unrelated user edits.
The prior completed Copilot hooks and reviewer rename are dependencies; retain separate commits/evidence when preparing the PR.
If the remote base lacks prerequisite commits, disclose them in the PR rather than rewriting closed work.
Rollback: remove the component/routing changes and installer-owned copies. This choice is reversible.

## Design trace

DES-1 covers FR-1/FR-2/FR-3: discovery, retrieval, OKF interpretation, and evidence return.
DES-2 covers FR-4: manifest delivery, selective routing, and install checks.
DES-3 covers FR-5: independent behavior evaluations, gates, review, and PR evidence.
