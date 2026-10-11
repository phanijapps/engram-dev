---
kind: spec
slug: browser-agent-feedback
title: Browser artifact feedback requirements
status: draft
created: 2026-10-11
repo_head: 98086783d996c563072e6f147045177c23d66310
wiki_freshness: fresh
source_state: dirty hook repairs preserved; pinned source bytes in authoring/source-pins.json
---

# Candidate specification

All FR entries below are proposed requirements supported by the user's declared scope.
Their observable criteria are planned checks, not implementation results.
Current behavior and pinned evidence are in feature.md and authoring/source-pins.json.

## Scope

Active owner-gated packs in the existing local web app; Markdown and selected text-code diffs; Claude, Codex and Pi through one portable feedback protocol.

## Requirements and acceptance

| ID    | Requirement                                                                                                                                                                                                                | Acceptance                                                                                                                                                                                                                                    | Planned method                                                                                                         |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| FR-1  | The system MUST review explicitly selected Markdown documents and Git code changes as immutable rounds tied to exact bytes, project, pack and baseline.                                                                    | AC-1: the UI shows the selected immutable bytes and exact diff sides; unrelated dirty files are excluded                                                                                                                                      | Snapshot and Git fixtures including adds, deletes, renames, untracked selections, binary/size refusal and source drift |
| FR-2  | The owner MUST add round, file and line-range comments bound to a target ID, snapshot digest and diff side; invalid anchors are refused.                                                                                   | AC-2: a stable thread records the original quote and byte identity; forged or invalid line ranges fail                                                                                                                                        | Store and route tests                                                                                                  |
| FR-3  | Draft comments MUST stay drafts until explicit Submit feedback; submitted batches MUST have monotonic cursors and stable IDs, survive restart and be safely reread.                                                        | AC-3: one immutable batch appears; retry does not duplicate it; repeated reads do not consume it                                                                                                                                              | Restart, duplicate-operation and cursor tests                                                                          |
| FR-4  | Agents MUST reply to threads and publish new immutable rounds without resolving human comments; source changes retain original anchors and explicit stale status.                                                          | AC-4: the owner can compare both rounds; edited/deleted anchors stay linked to the original and are never silently retargeted or cleared; stale recovery publishes a fresh round and explicit reattachment plus Submit redelivers that thread | Round-diff, stale-anchor and role tests                                                                                |
| FR-5  | Feedback MUST NOT grant spec approval, decision acceptance, Start permission, task completion, PACK PASS or Finish; changed bound artifacts require the existing replan route.                                             | AC-5: the machine execution gate remains closed; a plan change cannot use the old receipt                                                                                                                                                     | Owner workflow and feedback integration fixtures                                                                       |
| FR-6  | Feedback writes MUST use the shared pack writer lock, held feedback revision, durable atomic publication and stable operation IDs; corruption, recovery and bounds fail explicitly.                                        | AC-6: no false acknowledgement or partial committed round appears; retries and recovery are explicit                                                                                                                                          | Fault-injection, lock, limits and corruption tests                                                                     |
| FR-7  | Browser feedback MUST remain loopback-only and enforce existing Host, Origin, page token, content-type, size and realpath guards; agents cannot resolve threads or write completed packs.                                  | AC-7: it is refused without source, store or owner-receipt mutation; permitted reads remain available                                                                                                                                         | Cross-project, traversal, symlink, injection and owner-role tests                                                      |
| FR-8  | Claude, Codex and Pi MUST receive the same structured submitted batch through the CLI wait/read protocol and show replies/new rounds through Wukong; idle-host delivery is explicitly manual or next-prompt.               | AC-8: the command returns a batch and the agent reads/replies; timeout is pending, never approval; an idle host is not claimed to be awakened                                                                                                 | CLI tests, installer tests and actual host witnesses                                                                   |
| FR-9  | The Feedback view MUST show document/diff selection, draft/submitted/agent-response states, original/new rounds, stale anchors, unresolved threads, conflicts, errors and unavailable-agent guidance with keyboard access. | AC-9: states are distinguishable and recoverable; focus, labels and keyboard navigation work; source/comment HTML stays inert                                                                                                                 | DOM tests and rendered manual keyboard/responsive inspection                                                           |
| FR-10 | Feedback MUST preserve specpack 0.2/0.3/0.4 bytes and core discovery; active 0.4 enables writes, legacy and completed records get clear unsupported/read-only behavior.                                                    | AC-10: no adoption or format rewrite occurs; the canonical pack remains discoverable with exactly one root JSON                                                                                                                               | Corpus, discovery and lifecycle compatibility tests                                                                    |
| FR-11 | Delivery MUST record document and code review loops for Claude, Codex and Pi, relevant recovery checks, repository gates, current knowledge and independent PACK review before the owner finishes.                         | AC-11: actual host/check evidence supports claims; missing native witnesses remain blocked; separate human Finish freezes the record                                                                                                          | T-6 host matrix, T-7 gates and subsequent independent review                                                           |

## Given / when / then

- **AC-1 (FR-1):** Given an active pack and explicit document paths or code paths plus a Git baseline; when the agent opens a round; then the UI shows the selected immutable bytes and exact diff sides; unrelated dirty files are excluded.
- **AC-2 (FR-2):** Given a stored snapshot; when the owner adds a comment; then a stable thread records the original quote and byte identity; forged or invalid line ranges fail.
- **AC-3 (FR-3):** Given draft comments and a waiting CLI reader; when the owner submits the round; then one immutable batch appears; retry does not duplicate it; repeated reads do not consume it.
- **AC-4 (FR-4):** Given an unresolved thread on round one; when an agent replies and publishes round two; then the owner can compare both rounds; edited/deleted anchors stay linked to the original and are never silently retargeted or cleared; stale recovery publishes a fresh round and explicit reattachment plus Submit redelivers that thread.
- **AC-5 (FR-5):** Given a pack without Start or with a receipt for different bytes; when feedback is submitted or all comments are resolved; then the machine execution gate remains closed; a plan change cannot use the old receipt.
- **AC-6 (FR-6):** Given concurrent writers, a failed publication or an oversized record; when a write is attempted; then no false acknowledgement or partial committed round appears; retries and recovery are explicit.
- **AC-7 (FR-7):** Given two enrolled projects, hostile requests and completed packs; when a request crosses a boundary or claims the wrong role; then it is refused without source, store or owner-receipt mutation; permitted reads remain available.
- **AC-8 (FR-8):** Given a host using the feedback skill in the correct workspace; when the owner submits feedback while its CLI wait is active; then the command returns a batch and the agent reads/replies; timeout is pending, never approval; an idle host is not claimed to be awakened.
- **AC-9 (FR-9):** Given the Feedback view; when the owner reviews, submits, retries or changes round; then states are distinguishable and recoverable; focus, labels and keyboard navigation work; source/comment HTML stays inert.
- **AC-10 (FR-10):** Given existing and new packs, with nested feedback records; when feedback is opened or queried; then no adoption or format rewrite occurs; the canonical pack remains discoverable with exactly one root JSON.
- **AC-11 (FR-11):** Given the approved task sequence has completed; when delivery is checked; then actual host/check evidence supports claims; missing native witnesses remain blocked; separate human Finish freezes the record.

## Constraints

- **CON-1:** Retain localhost enrollment, Host/Origin/page-token/realpath guards and no outbound network behavior from SECURITY.md.
- **CON-2:** Capture review artifacts and explicit comments only; no agent session, transcript, token or credential capture.
- **CON-3:** Preserve canonical workflow authority, source drift guards, approved artifacts, closed packs and historical formats.
- **CON-4:** Use the authoritative harness and canonical installer for requested Claude/Codex/Pi surface updates.
- **CON-5:** Bound snapshot bytes, round count, comment size, store size and wait duration; never silently truncate review targets.

Sources: SECURITY.md; AGENTS.md; wiki/systems/owner-workflow.md; wiki/domain/policy-no-session-capture-in-engine.md; the observed core writer and harness manifest. All paths are pinned in authoring/source-pins.json.

## Out of scope

- Browser chat or session/tool process control.
- Cloud sharing, phone access, remote listeners and PR hosting integration.
- Crit installation, embedding or copied implementation.
- Live-app DOM and static HTML preview review.
- Session/transcript/token capture.
- Automatic adoption of legacy packs or permission inference.
- Windows native release certification in this Linux slice.

## Questions, assumptions and authority

Human scope questions have actual answers in owner-inputs.md. No required human spec questions remain, so the initialized spec-phase membership stays empty.
A-1 through A-3 are validation assumptions carried from feature.md. D-1 through D-5 are proposed technical decisions in design.md.
A new behavior ambiguity returns to analysis; unavailable host access blocks FR-8/FR-11 rather than being fabricated as a successful test.
The user has not accepted these decisions or granted permission to start the exact plan.

## Handoff

Register FR-1 through FR-11, AC-1 through AC-11, US-1 through US-3 and CON-1 through CON-5 in the canonical pack.
The full plan must trace each requirement to a design, task and declared check.
Owner acceptance and Start remain later gates; feedback resolution cannot supply them.
