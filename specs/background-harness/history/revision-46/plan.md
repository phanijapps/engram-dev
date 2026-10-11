# Proposed task plan

The canonical task ledger is [background-harness.json](background-harness.json). This document describes its proposed scope and acceptance, not a second status ledger. All checks below are future execution expectations; proposed new runners/tests are created by their owning tasks. None has passed merely because it is named here.

Delivery order is T-1 through T-14, one admitted task at a time. `needs` records semantic dependencies, not permission for parallel execution. T-1 is the early contract spike: if it contradicts D-4/D-5 or a required surface cannot be witnessed, stop and amend the plan before proceeding. There is no permission to implement in this planning session.

| Task | Deliverable                                              | Depends on           |
| ---- | -------------------------------------------------------- | -------------------- |
| T-1  | Prove host compatibility and freeze adapter contracts    | None                 |
| T-2  | Package a standalone cross-platform runtime              | T-1                  |
| T-3  | Implement shared start, stop and status                  | T-2                  |
| T-4  | Persist trusted project enrollment and control API       | T-3                  |
| T-5  | Add shared project, wiki and spec web navigation         | T-4                  |
| T-6  | Expose truthful read-only agent context                  | T-4                  |
| T-7  | Generate native host packages from one source            | T-1, T-2             |
| T-8  | Repair installer truth and bootstrap enrollment          | T-3, T-4, T-7        |
| T-9  | Implement the Claude Code lifecycle adapter              | T-6, T-8             |
| T-10 | Implement Codex native and IDE-compatible adapters       | T-6, T-8             |
| T-11 | Implement the pi native extension adapter                | T-6, T-8             |
| T-12 | Verify the complete journey on all required environments | T-5, T-9, T-10, T-11 |
| T-13 | Document operation and run repository gates              | T-12                 |
| T-14 | Obtain independent PACK review                           | T-13                 |

## T-1 — Prove host compatibility and freeze adapter contracts

Create disposable-fixture witnesses, not production adapters. Confirm Linux/macOS/Windows command launching constraints; include native plugin/package custom-agent limits and user activation. Save source URLs, versions, commands and exit codes without real session content. Narrow support only by owner-approved amendment.

Owns: `specs/background-harness/compatibility.md`, `specs/background-harness/compatibility-evidence.json`, `specs/background-harness/verify-compatibility.mjs`

Requires decisions: D-4, D-5.

Verification command (planned):

```text
node specs/background-harness/verify-compatibility.mjs
```

Success means: Validated official contracts and real-host witnesses identify minimum versions, install/trust/reload/removal, event cwd and context output for Claude Code, pi, Codex CLI/desktop and IDE. Unsupported/native-unavailable fields remain explicit; unavailable host access prevents completion.

## T-2 — Package a standalone cross-platform runtime

Build and install local package artifacts; bundle production workspace dependencies/assets and define Node prerequisite/bootstrap instructions. Update asset/manifest resolution and provide a native Windows entry point. Do not publish, download silently, or require source-tree cwd.

Owns: `treadle/package.json`, `treadle/packages/cli/package.json`, `treadle/packages/web/src/servers.ts`, `treadle/packages/cli/src/harness/manifest.ts`, `treadle/scripts/package-runtime.mjs`, `treadle/scripts/verify-runtime-package.mjs`, `install.sh`

Requires decisions: D-1.

Verification command (planned):

```text
node treadle/scripts/verify-runtime-package.mjs
```

Success means: A local distributable installs into a clean path with spaces/non-ASCII outside the checkout, resolves internal dependencies and loads CLI, web assets and harness manifest with Node >=22; native Windows uses fileURLToPath and no Bash/global-link dependency.

## T-3 — Implement shared start, stop and status

Add start serve, stop serve and status serve. Use detached process with disconnected stdio/unref, private per-user state, instance nonce and authenticated health/shutdown. Serialize startup and bound retries; lock recovery requires proof, not age. Fixed preferred UI port may safely choose another and report it; hooks read the descriptor, never assume a port.

Owns: `treadle/packages/cli/src/main.ts`, `treadle/packages/cli/src/commands/serve.ts`, `treadle/packages/cli/src/serve/runtime.ts`, `treadle/packages/cli/test/serve-runtime.test.ts`

Requires decisions: D-1, D-3.

Verification command (planned):

```text
cd treadle && pnpm exec vitest run packages/cli/test/serve-runtime.test.ts
```

Success means: Concurrent cold starts produce one service; parent exit leaves it alive; authenticated stop acknowledges shutdown; next ensure restarts; stale descriptor/PID reuse, held startup lock, crash, timeout, incompatible version and occupied port never kill or claim an unrelated process.

## T-4 — Persist trusted project enrollment and control API

Add versioned atomic registry, project connect/disconnect/status and credentialed control listener. Register only explicit trusted roots; global harness install does not enroll home/cwd implicitly. Event cwd connects the current checkout, never an unrelated worktree discovered by git. Validate token storage permissions/ACL on each OS; same-user malicious processes remain outside credential isolation guarantees.

Owns: `treadle/packages/cli/src/serve/projects.ts`, `treadle/packages/cli/src/commands/project.ts`, `treadle/packages/cli/test/project-registry.test.ts`

Requires decisions: D-1, D-3.

Verification command (planned):

```text
cd treadle && pnpm exec vitest run packages/cli/test/project-registry.test.ts
```

Success means: Canonical realpath aliases enroll once; distinct worktrees have distinct identities; duplicate slugs coexist; concurrent enrollment and daemon restart retain records; disconnect, moved/deleted roots, symlink escape, bad Host/Origin/token and incompatible schema behave explicitly.

## T-5 — Add shared project, wiki and spec web navigation

Reuse library workflow and knowledge public API without a second ledger. Browser writes include project-qualified action, held revision and CSRF protection; titles render as text and Markdown previews use opaque sandbox without execution privileges. Wiki/search never enumerate .okf or archive. Legacy foreground commands remain compatible. Record keyboard/focus checks on project selection and owner actions.

Owns: `treadle/packages/web/package.json`, `treadle/packages/web/src/servers.ts`, `treadle/packages/web/src/library.js`, `treadle/packages/web/src/library.html`, `treadle/packages/web/test/project-library.test.ts`, `treadle/packages/web/test/project-security.test.ts`

Requires decisions: D-2, D-3.

Verification command (planned):

```text
cd treadle && pnpm exec vitest run packages/web/test/project-library.test.ts packages/web/test/project-security.test.ts packages/web/test/owner-workflow.test.ts
```

Success means: Project-qualified lists, search, wiki and spec links work with equal slugs; owner actions remain revision/lock guarded. Traversal, symlink escape, browser enrollment/stop, forged Host, cross-origin/CSRF writes and malicious Markdown cannot control service or act as owner.

## T-6 — Expose truthful read-only agent context

Add treadle context --workspace <root> --json and bounded human output. Return wiki/spec locations, service/project identity, core workflow phase, current doing task, evidence references and candidate next task explicitly non-admitted. New-work guidance uses do init --owner-gated; continuing never calls nextTask or ownerAction. Bound reads/output; malformed packs have explicit per-pack refusals.

Owns: `treadle/packages/cli/src/harness/where.ts`, `treadle/packages/cli/src/commands/context.ts`, `treadle/packages/cli/src/harness/context.ts`, `treadle/packages/cli/test/context.test.ts`, `treadle/packages/cli/test/where.test.ts`

Requires decisions: D-2, D-3.

Verification command (planned):

```text
cd treadle && pnpm exec vitest run packages/cli/test/context.test.ts packages/cli/test/where.test.ts packages/cli/test/owner-workflow.test.ts
```

Success means: Before/after bytes, revisions and task states are equal; actual core gates match recall; doing tasks and invalid/missing/empty/closed roots differ; multiple open specs require selection; canonical-empty does not merge legacy; unavailable knowledge/freshness is disclosed.

## T-7 — Generate native host packages from one source

Version the source manifest and generator contract while reading existing harness/0.1. Include only supported skills/agents/hooks/extensions per host, use package-relative references, and define managed artifact identity/digests for migration/removal. Keep generated installed artifacts out of authoritative source edits; no registry publication.

Owns: `treadle/packages/cli/harness/harness.json`, `treadle/packages/cli/src/harness/types.ts`, `treadle/packages/cli/src/harness/manifest.ts`, `treadle/scripts/package-harness.mjs`, `treadle/packages/cli/test/harness-packages.test.ts`

Requires decisions: D-4, D-5.

Verification command (planned):

```text
cd treadle && pnpm exec vitest run packages/cli/test/harness-packages.test.ts
```

Success means: Deterministic local Claude plugin, supported Codex plugin and pi package validate against witnessed host contracts; all content derives from the authoritative tree; host/runtime/protocol compatibility versions and unsupported fields are explicit.

## T-8 — Repair installer truth and bootstrap enrollment

Separate runtime installed, host artifacts wired/activated/trusted, and project connected readiness. Successful project bootstrap ensures then enrolls; awaiting host trust stays visible. Server failure leaves truthful installed-but-disconnected state. Native install without runtime diagnoses bootstrap. Migrate only recorded owned files/wiring; global install needs existing authorization flags and an explicit project connect; --no-hooks does not promise automatic reconnect.

Owns: `treadle/packages/cli/src/commands/init.ts`, `treadle/packages/cli/src/harness/apply.ts`, `treadle/packages/cli/src/harness/plan.ts`, `treadle/packages/cli/src/harness/types.ts`, `treadle/packages/cli/test/init-engine.test.ts`, `treadle/packages/cli/test/init-surfaces.test.ts`

Requires decisions: D-1, D-4, D-5.

Verification command (planned):

```text
cd treadle && pnpm exec vitest run packages/cli/test/init-engine.test.ts packages/cli/test/init-surfaces.test.ts
```

Success means: Refused wiring yields a truthful non-success exit and cannot enroll; dry-run writes/starts nothing; durable install then ensure/enroll can retry without duplicate hooks. Foreign notify/settings survive; upgrade/remove leave other projects and the shared runtime intact.

## T-9 — Implement the Claude Code lifecycle adapter

Use generated native hook configuration and existing compatibility installer, shared Node adapter bridge and versioned context. Test start/resume/clear/compact/worktree, Windows launching and reload/removal with a real disposable Claude host in T-12; mocks here verify parsing/error boundaries only.

Owns: `treadle/packages/cli/harness/hooks/session-recall.js`, `treadle/packages/cli/harness/hooks/claude-context.js`, `treadle/packages/cli/test/claude-context.test.ts`, `specs/background-harness/host-evidence/claude.json`

Requires decisions: D-4, D-5.

Verification command (planned):

```text
cd treadle && pnpm exec vitest run packages/cli/test/claude-context.test.ts
```

Success means: Witnessed SessionStart/UserPromptSubmit use event cwd and correct stdin/output/exit contracts; next prompt after stop reconnects; closing Claude leaves server running; timeout/failure provides an actionable status without leaking control token or admitting tasks.

## T-10 — Implement Codex native and IDE-compatible adapters

Replace the obsolete manual-only recall claim where actual hooks are supported. Generate commandWindows/host fields only when witnessed. Inactive/untrusted or unsupported IDE hooks show explicit remediation and manual connect/context fallback, never a fake ready state. Test actual CLI, desktop and IDE surfaces separately in T-12.

Owns: `treadle/packages/cli/harness/hooks/codex-context.js`, `treadle/packages/cli/harness/harness.json`, `treadle/packages/cli/src/harness/plan.ts`, `treadle/packages/cli/test/codex-context.test.ts`, `specs/background-harness/host-evidence/codex.json`

Requires decisions: D-4, D-5.

Verification command (planned):

```text
cd treadle && pnpm exec vitest run packages/cli/test/codex-context.test.ts
```

Success means: Witnessed hooks produce valid contextual output, event cwd and bounded failures; exact hook trust remains a human host action; CLI/desktop native path and IDE supported configuration path are distinct; notify integration is preserved without double callbacks.

## T-11 — Implement the pi native extension adapter

Package extensions/skills/prompts through the native pi package contract; retain explicit custom-agent compatibility files only where separately supported. Avoid process.cwd assumptions and the old unenforced message_end gate claim; core admission remains the authority. Real-host load, restart, update and removal witnesses are required in T-12.

Owns: `treadle/packages/cli/harness/hooks/session-recall.js`, `treadle/packages/cli/harness/extensions/project-context.ts`, `treadle/packages/cli/test/pi-context.test.ts`, `specs/background-harness/host-evidence/pi.json`

Requires decisions: D-4, D-5.

Verification command (planned):

```text
cd treadle && pnpm exec vitest run packages/cli/test/pi-context.test.ts
```

Success means: Witnessed session_start/before_agent_start use ctx.cwd and valid context-message return contracts; reload/resume/new/fork do not duplicate handlers; shutdown closes only session resources, and next event after stop reconnects.

## T-12 — Verify the complete journey on all required environments

Implement portable smoke fixtures and CI runtime jobs; collect versioned real-host witnesses locally or on available machines with disposable fixture owner actions clearly labelled. Include two simultaneous session connections and stop races without concurrent same-task execution, equal slugs, server crash, packed assets and hostile-browser tests. Preserve closed real packs. Any claimed absent capability requires changed scope and owner reapproval.

Owns: `specs/background-harness/verify-matrix.mjs`, `specs/background-harness/platform-evidence.json`, `treadle/scripts/harness-smoke.mjs`, `.github/workflows/ci.yml`

Requires decisions: D-1, D-2, D-3, D-4, D-5.

Verification command (planned):

```text
node specs/background-harness/verify-matrix.mjs
```

Success means: Actual Linux, macOS and native Windows runtime results plus real-host results for each supported OS/surface pass: clean install, trust, project selection, new/continue spec, stop/next-event restart, session exit, upgrade/removal and owner flow. Missing/unrun combinations fail the release verifier; a CI matrix declaration is not evidence.

## T-13 — Document operation and run repository gates

Create the portable gate runner that captures each real command/exit; update setup, lifecycle, package management, connection troubleshooting and accepted local threat boundary. Only close gap G4 to the implemented extent; G1/G2/G10 and license remain separate. No automatic retrospective/session capture or publication. Record any environment blockers instead of carrying old green evidence.

Owns: `README.md`, `SECURITY.md`, `wiki/systems/sdd-harness-architecture.md`, `wiki/project/open-work.md`, `wiki/assets/guide`, `treadle/packages/cli/harness/hooks/README.md`, `specs/background-harness/verify-gates.mjs`

Requires decisions: D-1, D-2, D-3, D-4, D-5.

Verification command (planned):

```text
node specs/background-harness/verify-gates.mjs
```

Success means: Actual check, coverage floors, corpus:check, brand:check, audit:prod, links and wiki fingerprint/stamp/anchors/validate/status commands succeed; wiki has zero errors/warnings/review anchors and a fresh stamp. Documentation states native/fallback support and TS/Markdown dirty-freshness limits.

## T-14 — Obtain independent PACK review

Implement only the artifact verifier, obtain an independent review, repair within approved scope and return to review. Phase review avoids digest recursion. Separate human Finish spec remains pending after this task; no reviewer or agent may synthesize that owner act.

Owns: `specs/background-harness/delivery-review.md`, `specs/background-harness/verify-review.mjs`

Requires decisions: D-1, D-2, D-3, D-4, D-5.

Verification command (planned):

```text
node specs/background-harness/verify-review.mjs
```

Success means: Independent read-only red-foreman reruns relevant task expectations, reports severity/location/fix and records actual PACK PASS matching current plan and non-review evidence digests; unresolved findings or self-review refuse completion.

## Execution and evidence discipline

Every task has explicit requirement/design/decision links and touch context. Existing file hashes are pinned by the engine at first admitted handout, then checked on resume; this avoids pretending pre-plan hashes of files changed by predecessor tasks remain current. Approved brief/spec/design/plan documents are hashed now. Read each task's machine handout and frozen context; do not silently repin on drift.

T-1/T-12 verification runners validate actual witnessed artifacts, not self-declared booleans: host version, OS, invoked fixture command, exit code, observation and artifact digest. Real human host trust remains outside agent authority. Fixture tests may use labelled synthetic owner claims only inside disposable fixture packs; production owner acts and receipts are never generated by tests.

T-13 runs `pnpm check`, `pnpm coverage` (75% statements/lines/functions; 65% branches), `pnpm corpus:check`, `pnpm brand:check`, `pnpm audit:prod`, `pnpm links`, then the AGENTS.md wiki block once. Record every command and exit code. A changed golden is a contract change requiring review. Wiki fresh HEAD stamps do not prove dirty TypeScript/Markdown detection.

T-14 is phase review. PACK review is scoped to the current plan digest and non-review evidence digest. It cannot be the implementer's verdict. Human Finish remains a separate owner action after tasks and current PACK PASS.


## Authorized execution refinement

The current user instruction delegates best judgment and authorizes implementation on a new branch; see execution-authorization.md. Plan 2 moves unavailable real-platform/desktop/IDE evidence from the early compatibility spike to the release matrix T-12. T-13 runs after T-5/T-9/T-10/T-11 and before T-12 so the implementation is documented and locally checked before external release witnesses. All platform requirements remain. No unavailable witness is counted as passed. The canonical tasks own the amended dependencies and T-1 expectation.
