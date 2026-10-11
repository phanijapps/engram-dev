# Proposed specification

- **FR-1**: Provide an installable runtime with bundled web/harness assets on Linux, macOS and native Windows; installation works outside the source checkout.
- **FR-2**: treadle start serve starts or reuses one background service per OS user; treadle stop serve stops that verified service and leaves project enrollment intact.
- **FR-3**: Successful project harness installation enrolls its explicit workspace after ensuring the service; host startup/resume and pre-prompt events reconnect it. After stop, restart occurs on the next relevant event; closing a session leaves the service running.
- **FR-4**: Persist project identities and trusted real workspace/wiki/spec roots independently of sessions; provide honest connection status, retry, disconnect and missing-root states.
- **FR-5**: One local web app lists enrolled projects and provides project-qualified existing spec workflow plus read-only wiki navigation/search without slug collisions or cross-project access.
- **FR-6**: New/continuing-spec agent context reads canonical pack gates, revision, doing task and knowledge references without task admission, mutation or guessing among multiple open packs.
- **FR-7**: Generate versioned native Claude, supported Codex and pi artifacts from the authoritative harness tree, retaining explicit compatibility installation where native support is absent.
- **FR-8**: Adapters use verified host lifecycle/output contracts and current event workspace; report runtime, activation/trust and enrollment readiness separately, preserving foreign configuration and avoiding duplicate hooks.
- **FR-9**: Preserve owner answers, decision acceptance, exact-plan start, sequential task evidence, independent PACK review and separate human Finish; context and adapters perform no owner acts.
- **FR-10**: Verify the connection and SDD journey across the three operating systems and supported host surfaces; record actual commands/versions/results and keep unsupported or unrun combinations explicit.

## Constraints

- **CON-1**: Local single-machine use, with PO, Dev Lead, Dev and QA sharing one agent session; no remote authentication, role permissions or concurrent task-execution leases.
- **CON-2**: Both new listeners bind 127.0.0.1. Browser UI cannot enroll roots or control the service; privileged control rejects browser origins and requires a private local credential plus exact Host validation.
- **CON-3**: Runtime state stores project pointers and service identity only; no sessions, prompts, transcripts, credentials in context, telemetry or token usage.
- **CON-4**: Canonical specs/ wins even when empty; legacy-only external roots remain compatible; archive and .okf are excluded. Core writer lock, held revision and owner receipts remain authoritative.
- **CON-5**: No native package publication or license decision in this plan; generate/build/install local artifacts for review. Preserve Copilot existing behavior but do not promise new service integration.

## Acceptance boundaries

The three operating systems are required. Codex CLI, desktop and IDE are separate surfaces. T-1 proves supported contracts; T-12 proves the shipped integration. Mock tests do not establish real host compatibility, and an unavailable host/OS leaves its task incomplete.

Context identifies the exact checkout and asks which spec continues when several are open. It never runs task admission, performs owner actions or records real session content. A current `doing` task is reported without acquiring an execution lease.

Existing spec question/approval ceremony applies only when spec questions exist. Existing decision acceptance, exact-plan start permission, independent PACK review and separate human Finish remain distinct. This proposal has no new unanswered product questions; implementation choices are proposed decisions below.

Out of scope: remote collaboration/RBAC, autonomous background task execution, browser spec-authoring wizard, concurrent execution of one task, new QA approval state, automatic retrospectives/knowledge upkeep, TypeScript/Markdown freshness redesign, Copilot service support, registry publication and license selection.


## Owner-authorized acceptance amendment (2026-10-11T01:29:33.198Z)

The owner instructed: “finish the spec but add the tests to backlog”. Plan 4 supersedes the original full-host closure boundary: accept the six actual native runtime witnesses, transfer all unrun real host journeys to [harness-host-acceptance](../harness-host-acceptance/harness-host-acceptance.json), obtain independent PACK review of this revised scope, then record the explicitly requested Finish. The prior pack and approved documents are preserved byte-for-byte in history/revision-46/. No missing host test is passed or waived; the unchanged strict verify-matrix.mjs and release-verification.json continue to describe incomplete full host acceptance. T-12 now checks runtime evidence and complete backlog transfer; its earlier failed evidence remains. T-14 still requires independent review. The current instruction authorizes this scope amendment and finishing; no human host trust is inferred.
