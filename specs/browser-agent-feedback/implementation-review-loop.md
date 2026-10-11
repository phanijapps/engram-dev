# Independent T-6 implementation review

Reviewer: `agent:red-foreman` (independent of implementation). Observed 2026-10-11 at 13:37–13:40 UTC. Scope: the four synthetic integration cases in `treadle/packages/cli/test/feedback-loop.test.ts`, the initiative's native/UI evidence admission in `verify-hosts.mjs`, and the corresponding witness guidance. This is a bounded implementation review, not PACK review, task completion, owner Start, or owner Finish.

**Verdict: PASS for the repaired code and evidence-refusal behavior within this scope. T-6 delivery remains unverified.** The exact declared combined command exited **1**: all four integration tests passed, the existing UI witness passed its verifier, and native verification refused the absent `checks/native-witness.json`. No native completion evidence was manufactured or admitted by this review.

## Rerun evidence

Executed from `/home/videogamer/code/memex_beta/treadle`:

```sh
pnpm exec vitest run packages/cli/test/feedback-loop.test.ts && node ../specs/browser-agent-feedback/verify-hosts.mjs
```

Actual result: one test file / four tests passed; then `Native Claude/Codex/Pi human feedback witnesses are not recorded yet; T-6 remains pending`. The final command log and exit are retained in `checks/implementation-red-loop-final-declared.log` and `checks/implementation-red-loop-final-checks.json`. Earlier independent runs remain in `checks/implementation-red-loop-checks.json`, `checks/implementation-red-loop-tests.log`, and `checks/implementation-red-loop-native-refusal.log`.

Final reviewed source SHA-256:

| File                                              | SHA-256                                                            |
| ------------------------------------------------- | ------------------------------------------------------------------ |
| `treadle/packages/cli/test/feedback-loop.test.ts` | `053a067c2469b1376407428c5ef1a4b412c483c8f5ded07737b82ea9a66fcee9` |
| `specs/browser-agent-feedback/verify-hosts.mjs`   | `ef0c21edad5fd9ecbfa22130a828c2a9d793debb5866fa5c15f85cbf72187336` |
| `specs/browser-agent-feedback/host-witnesses.md`  | `81a287fdfac560af341e74d4a411d5ae5d7cd7c50b91d0be116bcfa5742a8f9f` |

At that observation the actual feedback ledger contained six sessions, three batches, and three threads. These counts do not prove their human provenance or the six completed native journeys. No native witness file existed. Concurrent browser activity can change the ledger; this review does not freeze or certify its subsequent state.

## Historical findings and repaired checks

The initial synthetic negative probe demonstrated that the original verifier admitted wholly fabricated metadata, including an executable whose basename merely contained a host name, empty command argv, an invalid prompt hash, declared submitted status despite pending output, resolution before the revised round, and an arbitrary empty recovery file. It ran zero native processes and performed zero real human acts. Its code and output remain in `checks/implementation-red-loop-negative-probe.json` and `.log`; they are adversarial fixtures, never delivery evidence.

| Severity / disposition | Finding and current location                                                                                                                                                              | Repair verified                                                                                                                                                                                                                                                                                                   |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DEFECT — resolved      | Native command metadata lacked binding to actual invocation, prompt bytes, observed CLI results and committed operations. Current checks: `verify-hosts.mjs:156`, `:176`, `:194`, `:229`. | Exact host basename, bounded nonempty argv, contained file hashes, ledger hash, session/phase/JSON identity, exact submitted wait batch, read retention and reply/round receipt crosslinks now apply. Empty argv, invalid prompt hash and pending wait output each refuse independently.                          |
| DEFECT — resolved      | Human resolution could predate the claimed revised round. Current check: `verify-hosts.mjs:264`.                                                                                          | A last human resolve event must have a valid timestamp at or after the revised round. The before-round variant refuses.                                                                                                                                                                                           |
| DEFECT — resolved      | Recovery truth flags and file existence could substitute for recovery execution evidence. Current checks: `verify-hosts.mjs:327`, `:331`, `:347`, `:360`.                                 | Recovery requires the current test source hash, exact test argv, exit zero, hashed log, both emitted observations, stable batch/cursor redelivery and a single committed lost-ack batch replay. Empty recovery content refuses. Actual rerun emitted both observations at `feedback-loop.test.ts:146` and `:300`. |

The final negative probe is retained in `checks/implementation-red-loop-final-negative-probes.json` and `.log` and binds the same final verifier SHA above. It copies the verifier into a temporary isolated fixture, omits only the independent UI check, and points source/CLI path checks at read-only repository bytes. A structurally valid synthetic baseline accepts; the five individual invalid variants all refuse. The intermediate `implementation-red-loop-repaired-negative-probes.*` attempt was overtaken by stricter command-layout checks and failed earlier than its intended timeline/recovery checks; it is retained as an inconclusive intermediate attempt, not counted as independent validation of those branches.

## Behavior covered by the integration tests

- `feedback-loop.test.ts:110`: drafts are absent from delivery until explicit Submit; a submitted batch survives server restart with identical cursor and contents; reply/new round preserve the old snapshot; resolution changes visible thread state without changing the canonical specpack.
- `feedback-loop.test.ts:186`: selected Git paths exclude an unselected file; stale recovery publishes a fresh round, retains the original anchor, and delivers reattachment only after another Submit advances the cursor.
- `feedback-loop.test.ts:269`: injected loss of acknowledgement after publication survives restart and replays the same operation's committed batch without duplication.
- `feedback-loop.test.ts:316`: feedback does not grant Start; changing a bound plan invalidates the old Start; completed-pack history remains readable while reply mutation is refused. Its owner action is explicitly synthetic and confined to a disposable fixture.

## Limits and remaining delivery work

The integration tests prove synthetic boundary and recovery behavior. They do not exercise Claude, Codex or Pi as native agents or establish real human browser actions. The real combined verifier currently refuses missing native evidence; there is no completed six-case matrix to review yet.

The witness validator admits structured evidence; it does not authenticate human actor claims or prevent someone deliberately fabricating a self-consistent ledger, logs and review. The accepting synthetic structural baseline makes that limit explicit. Genuine human provenance, actual native execution and independent-review authorship must therefore be observed and checked independently when the real witness is supplied, as required by the owner/trust contract. A test fixture or a bounded native wait returning pending cannot satisfy those delivery claims.

This review neither read nor exported native conversation transcripts, changed source or installed harness files, mutated the canonical pack, performed owner acts, nor created a real native witness. No remaining verified source defect was found in the bounded repaired checks. Final PACK and native delivery verdicts are withheld.

## Native observation supplement — 2026-10-11, 13:50–13:53 UTC

This expands the bounded review to `checks/native-command-runner.mjs` and the actual native observation artifacts. It does not replace the earlier source/test verdict or certify completed native delivery.

**Supplement verdict: DEFECT in the observer's session guard; native delivery remains pending.**

| Severity | Location                              | Finding                                                                                                                                                                                                                                                                                                                                                                                     | One-line fix                                                                                                                                       |
| -------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| DEFECT   | `checks/native-command-runner.mjs:37` | `extra.includes("--session")` misses Commander's `--session=<id>` form. Extras appear after the fixed session, so they can redirect reply/round mutations while the observation still labels the originally selected case. The final witness rejects mismatched output identity, but this acts after the mutation. Actual read-only CLI probe returned the override session with exit zero. | Reject both separate and equals forms of reserved session/actor options before spawning, and retain a regression probe showing no child execution. |

The concrete probe is retained in `checks/implementation-red-loop-native-override.json`. It invokes only the actual compiled CLI `read`; no native runner or write action was executed. No reviewed real command had this override, so this finding does not invalidate their correctly matched receipts.

`checks/implementation-red-loop-native-audit.json` binds a point-in-time ledger hash and inventories 45 actual observation files by hash. All six sessions have submitted wait/read observations and published revised rounds; Codex documents has a stale refresh plus a later fresh revision (three total rounds). All snapshot references match stored byte hashes and each latest selected fixture matches its latest round. Successful protocol observations crosslink exact stored batches or committed mutation receipts. The two original Codex child-spawn observations with nominal exit zero and unavailable output remain retained and inadmissible. Other failed conflict/fixture-verification attempts remain failures; successful later receipts do not relabel them.

Canonical bytes match `checks/native-round-baseline.json` exactly (`3bffd83753f65f3468cadeb4c310732dc964eefdf4e91f9562a2699c0108f39d`, revision 40), which also proves workflow bytes unchanged. The separate workflow digest's serialization was not inferred from the baseline record; no contradictory workflow change is claimed.

The actual process records for Claude, Codex and Pi state exit zero and pin prompt files whose hashes match. The human confirmation record cites two actual async replies plus a stale follow-up; this independent artifact review can verify consistency, while the coordinating agent retains direct observation of the actual user replies/processes. These records are not authentication. The availability record is an earlier pending observation and must remain dated history.

At the audit observation there were seven submitted batches and zero human resolution events or submitted reattachment items. The extra Codex document batch is a new comment, which preserves no claim of reattachment. `checks/native-witness.json` was absent. Native completion and PACK review remain withheld.

The recovery record's current test-source hash, log hash, four passing tests and both logged recovery observations match. Those tests remain explicitly synthetic. `checks/implementation-red-loop-native-runner-probes.json` separately injects synthetic spawn results into a temporary copy: a spawn error produces exit one; malformed JSON produces an unavailable record (even when the child exit is zero); valid pending JSON preserves identity. The verifier's format/status guards are essential: an exit-zero pending or unavailable output cannot prove submitted native delivery. These probes ran no native agent and wrote no real ledger/observation files.

## Repaired native observer supplement — 2026-10-11, 13:55 UTC

**PASS — the observer session-override DEFECT above is resolved.** No remaining concrete defect was found in this bounded observer repair; native delivery and PACK verdicts remain pending.

The phase-specific separate option/value allowlist at `checks/native-command-runner.mjs:16` and pre-spawn validation at `:25` reject session/actor overrides, equals forms, positional arguments, wrong-phase options, missing values and dash-prefixed values. The reviewed runner SHA-256 is `a2904f3d78c039e31c4914ef380dca65690c994d14f1fde12efd7678848d44a7`.

Independently executed twelve rejected argument combinations against the actual repaired runner: each exited one with the explicit guard error, and the entire real command-observation filename/hash inventory remained unchanged. In a disposable copied-runner fixture with a synthetic spawn stub, allowed wait/read/reply/round/verify forms reach the child construction, preserve the fixed session, and preserve the fixed mutation actor. No valid real mutation or native agent was executed by those probes. Evidence: `checks/implementation-red-loop-native-guard-repaired.json`.

The new Codex document process record states exit zero and its stored prompt hash matches actual bytes. The whole canonical file continues to match the native-round baseline exactly; that whole-file equality is sufficient proof of unchanged owner workflow bytes, without interpreting the historical separate workflow hash. A fresh verifier invocation still exits one for the absent native witness after the UI check passes. Evidence: `checks/implementation-red-loop-native-repaired-checks.json`. The current fresh Codex comment and revised round do not substitute for the pending original-thread human Reattach + Submit or human Resolve steps.

## Reattachment admission supplement — 2026-10-11, 14:59 UTC

**PASS for the repaired bounded admission delta. Native completion remains pending.** The initial delta review found a DEFECT at `verify-hosts.mjs:350`: the referenced reattachment event was joined by ID/kind without checking its anchor, actor or timestamp against the submitted item. An explicitly synthetic in-memory projection accepted a mismatched event anchor. The real recorded lineage was correct; this was an admission-check gap.

The repair at `verify-hosts.mjs:350` now requires exact event ID/kind/by/at and JSON anchor equality. Current verifier SHA-256: `d19dd19d1220313ecad9985b8b02f5913748e41312ee62470ed055365f9561a1`. Independent delta probes refuse mismatched event anchor/actor/time, mismatched original anchor, unchanged original/source hash, missing exact reattachment wait or read batch, missing later native original-thread reply, and an unresolved extra thread. The actual pending ledger projection also refuses. A consistent synthetic resolved baseline accepts solely to exercise those downstream guards; its synthetic resolve events exist only in memory and were never recorded as real acts. The real ledger's bytes remained unchanged throughout. Evidence: `checks/implementation-red-loop-reattach-delta-repaired.json`.

Actual cursor-4 batch `30fb0850-7729-4248-97fd-430cc2e52990` preserves original thread `5c92a460-6998-4071-a24f-108e0dc1ee94`, original round-1 anchor and original body, and references human event `49da1592-8cd9-4e8f-85ef-aeb13aed19b5` with an exact round-4 after-line-7 anchor/actor/time match. Native wait and read contain its exact committed batch. The later original-thread reply and round-5 (`2ba041b5-66bf-4c9e-b09b-bc8388aeebab`) outputs match committed operation receipts. `native-process-codex-reattach.json` states exit zero and its prompt hash matches stored bytes. Draft ledger and all six aggregated command hashes match the actual files at this observation.

A fresh actual full verifier invocation exits one for the missing native witness after its UI check passes. Eight native test threads exist; zero human Resolve events are recorded. All-thread resolution admission, exact submitted reattachment redelivery, preserved lineage and a later reply are required, while direct human provenance observation still belongs to the coordinating agent/independent final review. No completed native witness, PACK verdict or owner approval is asserted. Actual artifact checks and command outputs are retained in `checks/implementation-red-loop-reattach-actual-checks.json`.

## Explicit owner test exception assessment — 2026-10-11, 16:33 UTC

The owner explicitly instructed: "I think I finished all take them as trouth. if anything is remaining let us ignore". The coordinator recorded that actual instruction in `checks/native-owner-test-waiver.json`; its observed SHA-256 is `8e0f60ee60401ae15ea06874d238c65e3d00dca1b057dfc02354af0dc84bcbd7`. The ledger is revision 49 with seven actual human Resolve events. Only Claude diff thread `00a777c0-3e7e-4b55-97b0-40af05f068f9` remains unresolved. Its session, current ledger hash and the existing Start receipt digest match the bounded exception record.

This explicit owner override permits waiving that remaining manual test step. It does not prove the missing Resolve occurred. An honest admission result is **five completed native host/mode journeys and one actual delivery/revision journey whose human Resolve step is waived**, rather than six completed resolution journeys. All six native host deliveries/revisions remain required; this exception cannot supply absent native processes, technical checks, runtime role guards, changed Start-bound artifacts, PACK review or separate human Finish.

The minimally bounded verifier may accept only the exact observed exception file/hash, recorded source/instruction/actor/time, sole session/thread, current feedback ledger hash and existing Start digest. Additional unresolved threads, stale binding, a changed Start plan, absent delivery/revision or failed technical evidence must still refuse. The actual declared T-6 command can then report a qualified exit-zero acceptance under that explicit manual-test exception while preserving the canonical plan and owner records. This assessment does not itself admit evidence or claim that the current unmodified verifier has passed. An independent review of the actual exception check remains required before a stable final native report.

Evidence: `checks/implementation-red-native-owner-exception-assessment.json`. No Resolve, Start, Finish or successful six-resolution record was fabricated.
