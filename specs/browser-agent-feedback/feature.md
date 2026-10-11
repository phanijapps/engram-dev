---
kind: feature
slug: browser-agent-feedback
title: A durable browser feedback loop in Wukong
status: draft
created: 2026-10-11
repo_head: 98086783d996c563072e6f147045177c23d66310
wiki_freshness: fresh
source_state: dirty hook repairs preserved; pinned source bytes in authoring/source-pins.json
---

# Feature analysis

## Source pins and limits

[Source pins](authoring/source-pins.json) record HEAD, observed file hashes and the dirty workspace.
Earlier hook repairs are separate uncommitted work and remain intact.
Wiki status reports fresh, 0 errors, 0 warnings and 0 anchors needing review; TypeScript and Markdown are unbaselined.
The HEAD stamp does not verify those dirty bytes. Source inspection supports the claims below.

## Problem and evidence

**Declared:** the owner wants artifact comments and agent revisions inside Wukong; see [actual inputs](owner-inputs.md).
**Implementation-supported:** Wukong exposes project-qualified library routes and guarded owner writes in `treadle/packages/web/src/project-server.ts`.
The library renders documents, task state and review verdicts in `treadle/packages/web/src/library.js`.
**Implementation-supported:** current lifecycle hooks read context; they do not listen for a browser feedback batch or send a prompt to an idle host.
See `treadle/packages/cli/harness/hooks/codex-context.js` and `session-recall.js`.
No feedback operation appears in the current CLI or browser routes inspected.

Crit's [integration protocol](https://crit.md/integrations/build-your-own) demonstrates a portable loop: an agent waits on a command, reads structured feedback, revises, replies and starts another round.
Its [Codex](https://crit.md/integrations/codex) and [Pi](https://crit.md/integrations/pi) pages distinguish host-specific installation from the common loop.
This is reference behavior, not an installed dependency or a compatibility claim about Wukong.
Wukong must preserve its distinct owner actions rather than treat a feedback-free review as permission to implement.

## Scope and out of scope

In scope: active owner-gated packs, explicit Markdown and text-code targets, immutable snapshots, anchored comments, durable batches, agent replies, human resolution, CLI waiting, browser states and host witnesses.
For code, the user or agent selects repository paths and an explicit Git baseline; unrelated dirty files are not swept into the review.

Out of scope: full chat/session control, cloud/mobile sharing, remote listeners, repository-wide harvesting, transcript/token capture, automatic approval, arbitrary browser file writes, Crit embedding, legacy workflow adoption, and Windows release certification.

## Affected boundaries and dispositions

| Boundary            | Current evidence                                    | Proposed disposition                                                                          |
| ------------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Core work authority | `core/src/specpack/workflow.ts`, `transaction.ts`   | Retain gates and shared lock; add an independent feedback store                               |
| CLI and Git         | `cli/src/main.ts`, `commands/do.ts`                 | Add scoped snapshot and feedback operations; Git needed only for code diff mode               |
| Shared web app      | `web/src/project-server.ts`, `library.js`           | Add project/pack feedback routes and a Feedback view                                          |
| Host harness        | `cli/harness/harness.json`, lifecycle helpers       | Add one feedback skill and bounded pending summaries; explicit wait is authoritative delivery |
| Knowledge           | `wiki/systems/owner-workflow.md`, no-capture policy | Document actual behavior after implementation; do not describe this proposal as shipped       |
| External reference  | Crit official integration pages                     | Learn the protocol; introduce no Crit binary, SDK or copied implementation                    |

The owner calls the local browser API. The agent calls the CLI. Both use one feedback store; neither can turn its state into a workflow receipt.
The browser serves only enrolled projects and stored snapshot targets. It cannot enroll a root, read an arbitrary supplied path, or launch an agent.

## Questions, assumptions and decisions

The two human scope questions have actual answers in owner-inputs.md. There are no remaining required human spec questions; machine spec-phase membership stays empty.
Technical choices D-1 through D-5 remain proposed in design.md and the canonical pack.

| ID  | Assumption / uncertainty                                                    | Blast radius           | Validation trigger                                            |
| --- | --------------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------------- |
| A-1 | Each named host can keep a bounded shell wait alive and read JSON results   | Host delivery, FR-8    | T-6 real-host witnesses; unavailable access blocks completion |
| A-2 | Local Git can compare selected paths without user-configured diff execution | Snapshot builder, FR-1 | T-2 adversarial Git/path tests; no shell interpolation        |
| A-3 | File snapshots and bounded polling fit the small-repository scope           | Store and UX           | T-1/T-2 bounds tests; no unbounded archive growth             |

D-1 store layout, D-2 transport, D-3 snapshot identity, D-4 authority boundaries and D-5 UI all require owner acceptance.
These are design questions, not invented spec questions.

## Handoff

The initialized pack is `browser-agent-feedback.json`, specpack/0.4 with owner-gated/1.
The registration script populates FR-1 through FR-11 and these artifacts under the shared writer lock.
Ready for planning: the complete bounded feedback slice. Implementation is blocked on proposed decisions and the exact plan's separate Start receipt.
Read design.md and plan.md for the full proposal. checks/ holds actual schema, alignment, DAG, hashes, diagram and repository-gate results.
No proposed capability was executed or reported as implemented during analysis.
