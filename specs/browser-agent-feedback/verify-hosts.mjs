/** Evidence admission only: never manufactures UI or native-host witnesses. */
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { resolve, dirname, basename, relative, isAbsolute } from "node:path";
const home = dirname(fileURLToPath(import.meta.url)),
  root = resolve(home, "../..");
const read = (path) => JSON.parse(readFileSync(resolve(home, path), "utf8"));
const requireValue = (ok, message) => {
  if (!ok) throw Error(message);
};
const hash = (path) =>
  createHash("sha256").update(readFileSync(path)).digest("hex");
const artifact = (file) => {
  requireValue(
    typeof file === "string" && file.length > 0,
    "Missing evidence path",
  );
  const path = resolve(home, file),
    rel = relative(home, path);
  requireValue(
    rel && !rel.startsWith("..") && !isAbsolute(rel),
    "Evidence must stay inside initiative",
  );
  requireValue(existsSync(path), "Evidence file missing");
  return path;
};
const validArgv = (argv) =>
  Array.isArray(argv) &&
  argv.length > 0 &&
  argv.every((a) => typeof a === "string" && a.length > 0 && a.length <= 32768);
const option = (argv, name) => argv[argv.indexOf(name) + 1];
function ui() {
  const evidence = read("checks/ui-witness.json"),
    captures = read("checks/rendered-captures.json");
  requireValue(
    evidence.format === "feedback-ui-witness/1" &&
      evidence.inspection.state === "completed" &&
      evidence.inspection.verdict === "pass",
    "Rendered inspection must be completed and pass",
  );
  requireValue(
    evidence.observed_at &&
      evidence.review &&
      evidence.review.by &&
      evidence.review.file,
    "Missing observed independent rendered review",
  );
  requireValue(
    existsSync(resolve(home, evidence.review.file)),
    "Review evidence is missing",
  );
  for (const [file, digest] of Object.entries(evidence.sources))
    requireValue(
      hash(resolve(root, file)) === digest,
      `UI source changed after witness: ${file}`,
    );
  for (const width of [600, 601, 901])
    for (const height of [600, 900]) {
      const rest = captures.captures.find(
        (c) =>
          c["viewport-width"] === width &&
          c["viewport-height"] === height &&
          c["scroll-position"] === 0,
      );
      requireValue(rest, "Missing at-rest capture");
      requireValue(
        rest["page-scrollable"] === "no" ||
          captures.captures.some(
            (c) =>
              c["viewport-width"] === width &&
              c["viewport-height"] === height &&
              c["scroll-position"] > 0,
          ),
        "Missing attained scroll capture",
      );
    }
  for (const c of captures.captures) {
    requireValue(
      c.route &&
        !/[?#]/.test(c.route) &&
        ["yes", "no"].includes(c["page-scrollable"]),
      "Malformed capture identity",
    );
    requireValue(existsSync(resolve(home, c.file)), "Capture image missing");
    requireValue(!c.horizontalOverflow, "Rendered horizontal overflow");
  }
  requireValue(
    captures.keyboard.submitted &&
      captures.keyboard.focus.active === "feedback-comment",
    "Keyboard loop missing",
  );
  requireValue(
    captures.targets.every((t) => t.width >= 24 && t.height >= 24),
    "Undersized interactive target",
  );
  requireValue(
    !captures.errors.length &&
      evidence.html.exit === 0 &&
      evidence.a11y.violations === 0,
    "UI checks failed",
  );
  console.log(
    "UI witness: completed/pass; structural HTML, accessibility subset, keyboard, targets and rendered channels verified",
  );
}
ui();
function native() {
  requireValue(
    existsSync(resolve(home, "checks/native-witness.json")),
    "Native Claude/Codex/Pi human feedback witnesses are not recorded yet; T-6 remains pending",
  );
  const witness = read("checks/native-witness.json"),
    ledger = read("feedback/state.json");
  const waived = new Set();
  if (witness.owner_test_waiver) {
    const waiverPath = artifact(witness.owner_test_waiver.file),
      waiver = JSON.parse(readFileSync(waiverPath, "utf8")),
      pack = read("browser-agent-feedback.json"),
      unresolved = ledger.threads.filter(
        (t) => t.events.at(-1)?.kind !== "resolve",
      );
    requireValue(
      hash(waiverPath) ===
        "8e0f60ee60401ae15ea06874d238c65e3d00dca1b057dfc02354af0dc84bcbd7" &&
        hash(waiverPath) === witness.owner_test_waiver.sha256 &&
        waiver.format === "feedback-owner-test-waiver/1" &&
        waiver.source ===
          "Actual user async reply in this chat; owner instruction overrides remaining manual test steps" &&
        waiver.instruction ===
          "I think I finished all take them as trouth. if anything is remaining let us ignore" &&
        waiver.by === "human:owner" &&
        waiver.observed_at === "2026-10-11T16:31:35.623465+00:00" &&
        waiver.plan_digest === pack.workflow.start_receipt.plan_digest &&
        waiver.ledger_sha256 === hash(artifact("feedback/state.json")) &&
        waiver.ledger_revision === 49 &&
        ledger.revision === waiver.ledger_revision &&
        waiver.pending.length === 1 &&
        unresolved.length === 1 &&
        waiver.pending[0].thread === unresolved[0].id &&
        waiver.pending[0].session === unresolved[0].session &&
        unresolved[0].id === "00a777c0-3e7e-4b55-97b0-40af05f068f9" &&
        unresolved[0].session === "a84b9b3a-2e34-4a10-8451-155ee83a0cc3",
      "Owner exception must bind the actual remaining Claude diff Resolve, current ledger and Start receipt",
    );
    waived.add(unresolved[0].id);
  }
  const humanResolution = (thread, round) => {
    const last = thread.events.at(-1);
    return (
      (last?.kind === "resolve" &&
        /^human:\S+$/.test(last.by) &&
        Date.parse(last.at) >= Date.parse(round.at)) ||
      waived.has(thread.id)
    );
  };
  requireValue(
    witness.format === "feedback-native-witness/1" && witness.observed_at,
    "Missing native witness format/time",
  );
  requireValue(
    witness.human_browser_confirmation?.source &&
      witness.human_browser_confirmation?.observed_at,
    "Actual human browser confirmation required; agent simulations cannot satisfy this witness",
  );
  requireValue(
    witness.independent_review?.verdict ===
      (waived.size ? "pass_with_owner_waiver" : "pass") &&
      /^agent:\S+$/.test(witness.independent_review.by) &&
      hash(artifact(witness.independent_review.file)) ===
        witness.independent_review.sha256,
    "Native evidence needs independent review",
  );
  requireValue(
    hash(artifact("feedback/state.json")) === witness.ledger_sha256,
    "Native ledger changed after witness",
  );
  const sessions = new Set();
  for (const host of ["claude", "codex", "pi"])
    for (const mode of ["documents", "diff"]) {
      const cases = witness.cases.filter(
        (c) => c.host === host && c.mode === mode,
      );
      requireValue(
        cases.length === 1,
        `Expected one native ${host}/${mode} witness`,
      );
      const c = cases[0],
        s = ledger.sessions.find((s) => s.id === c.session);
      requireValue(
        !sessions.has(c.session),
        "Host/mode witnesses cannot reuse a session",
      );
      sessions.add(c.session);
      requireValue(
        s && s.selection.mode === mode,
        `Missing matching ${host}/${mode} session`,
      );
      requireValue(
        c.version &&
          c.native_process?.exit === 0 &&
          validArgv(c.native_process.argv) &&
          basename(c.native_process.argv[0]) === host,
        "Actual native invocation/version/exit missing",
      );
      requireValue(
        hash(artifact(c.native_process.prompt_file)) ===
          c.native_process.prompt_sha256 &&
          hash(artifact(c.command_evidence)) === c.command_evidence_sha256,
        "Native command evidence missing",
      );
      const commands = read(c.command_evidence);
      requireValue(
        commands.format === "feedback-native-commands/1" &&
          commands.host === host &&
          commands.session === s.id,
        "Command evidence identity mismatch",
      );
      for (const phase of ["wait", "read", "reply", "round", "verify"])
        requireValue(
          commands.records.some(
            (r) =>
              r.phase === phase &&
              r.exit === 0 &&
              validArgv(r.argv) &&
              Number.isFinite(Date.parse(r.observed_at)),
          ),
          `Missing actual ${phase} command/exit for ${host}/${mode}`,
        );
      const batch = ledger.batches.find(
        (b) => b.id === c.batch && b.session === s.id,
      );
      requireValue(
        batch && batch.items.length > 0 && /^human:\S+$/.test(batch.by),
        "Human submitted nonempty batch required",
      );
      for (const r of commands.records.filter(
        (r) =>
          r.exit === 0 && ["wait", "read", "reply", "round"].includes(r.phase),
      )) {
        requireValue(
          validArgv(r.argv) &&
            basename(r.argv[0]) === "node" &&
            resolve(root, r.argv[1]) ===
              resolve(root, "treadle/packages/cli/dist/src/main.js") &&
            r.argv[2] === "do" &&
            r.argv[3] === "feedback" &&
            r.argv[4] === r.phase &&
            resolve(root, r.argv[5]) === home &&
            option(r.argv, "--session") === s.id &&
            r.argv.includes("--json"),
          "Protocol command does not name its session/phase",
        );
        requireValue(
          r.output?.format === "feedback-result/1" && r.output.session === s.id,
          "Observed CLI JSON identity missing",
        );
        if (["reply", "round"].includes(r.phase)) {
          const receipt = ledger.operations.find(
            (o) => o.id === option(r.argv, "--operation-id"),
          )?.result;
          requireValue(
            receipt &&
              Object.entries(receipt).every(
                ([key, value]) => r.output[key] === value,
              ) &&
              option(r.argv, "--by") === `agent:${host}`,
            "Mutation result is not a matching committed native receipt",
          );
        }
      }
      requireValue(
        commands.records.some(
          (r) =>
            r.phase === "wait" &&
            r.exit === 0 &&
            r.output?.status === "submitted" &&
            r.output.batches?.some(
              (b) =>
                b.id === batch.id &&
                JSON.stringify(b) === JSON.stringify(batch),
            ),
        ),
        "Native wait must deliver the exact recorded batch JSON",
      );
      requireValue(
        commands.records.some(
          (r) =>
            r.phase === "read" &&
            r.exit === 0 &&
            r.output?.batches?.some((b) => b.id === batch.id),
        ),
        "Native read must retain submitted batch",
      );
      const original = s.rounds.find((r) => r.id === batch.round),
        revised = s.rounds.find((r) => r.id === c.revised_round);
      for (const item of batch.items) {
        const t = ledger.threads.find(
          (t) => t.id === item.thread && t.session === s.id,
        );
        requireValue(
          t &&
            /^human:\S+$/.test(t.by) &&
            t.replies.some((r) => r.by === `agent:${host}`),
          "Human thread/native agent reply missing",
        );
        requireValue(
          humanResolution(t, revised),
          "Human resolution required after revision",
        );
        requireValue(
          commands.records.some(
            (r) =>
              r.phase === "reply" && r.exit === 0 && r.output?.thread === t.id,
          ),
          "Native reply command missing for submitted thread",
        );
      }
      requireValue(
        original &&
          revised &&
          revised.sequence > original.sequence &&
          revised.by === `agent:${host}`,
        "Native agent revised round missing",
      );
      requireValue(
        commands.records.some(
          (r) =>
            r.phase === "round" &&
            r.exit === 0 &&
            r.output?.round === revised.id,
        ),
        "Native round command receipt missing",
      );
      requireValue(
        original.targets.some(
          (t) =>
            revised.targets.find((n) => n.path === t.path)?.after?.sha256 !==
            t.after?.sha256,
        ),
        "Selected source bytes must change in the witnessed revision",
      );
      for (const round of [original, revised])
        for (const target of round.targets)
          for (const side of ["before", "after"])
            if (target[side])
              requireValue(
                hash(artifact("feedback/" + target[side].ref)) ===
                  target[side].sha256,
                "Native immutable snapshot hash mismatch",
              );
    }
  requireValue(witness.cases.length === 6, "Unexpected native witness matrix");
  for (const t of ledger.threads.filter((t) => sessions.has(t.session))) {
    const c = witness.cases.find((c) => c.session === t.session),
      revised = ledger.sessions
        .find((s) => s.id === t.session)
        .rounds.find((r) => r.id === c.revised_round);
    requireValue(
      humanResolution(t, revised),
      "Every native test thread needs human resolution after its revised round",
    );
  }
  const reattached = ledger.batches
    .flatMap((b) => b.items)
    .find(
      (i) =>
        i.kind === "reattach" &&
        i.original &&
        i.event &&
        /^human:\S+$/.test(i.by) &&
        sessions.has(ledger.threads.find((t) => t.id === i.thread)?.session),
    );
  requireValue(
    reattached,
    "Native stale refresh, human reattachment and Submit redelivery witness missing",
  );
  const reattachThread = ledger.threads.find((t) => t.id === reattached.thread),
    reattachBatch = ledger.batches.find((b) => b.items.includes(reattached)),
    reattachCase = witness.cases.find(
      (c) => c.session === reattachThread.session,
    ),
    reattachCommands = read(reattachCase.command_evidence).records;
  requireValue(
    JSON.stringify(reattached.original) ===
      JSON.stringify(reattachThread.original) &&
      reattached.anchor.sha256 !== reattached.original.sha256 &&
      reattachThread.events.some(
        (e) =>
          e.id === reattached.event &&
          e.kind === "reattach" &&
          e.by === reattached.by &&
          e.at === reattached.at &&
          JSON.stringify(e.anchor) === JSON.stringify(reattached.anchor),
      ),
    "Human reattachment must preserve the stale original anchor and event",
  );
  for (const phase of ["wait", "read"])
    requireValue(
      reattachCommands.some(
        (r) =>
          r.phase === phase &&
          r.exit === 0 &&
          r.output?.batches?.some(
            (b) => JSON.stringify(b) === JSON.stringify(reattachBatch),
          ),
      ),
      "Native command must redeliver the exact submitted reattachment batch",
    );
  requireValue(
    reattachCommands.some(
      (r) =>
        r.phase === "reply" &&
        r.exit === 0 &&
        r.output?.thread === reattachThread.id &&
        Date.parse(r.started_at) >= Date.parse(reattachBatch.at),
    ) &&
      reattachThread.events.at(-1)?.kind === "resolve" &&
      /^human:\S+$/.test(reattachThread.events.at(-1).by),
    "Reattached original thread needs a later native reply and human resolution",
  );
  requireValue(
    hash(artifact(witness.recovery.file)) === witness.recovery.sha256,
    "Recovery witness hash mismatch",
  );
  const recovery = read(witness.recovery.file);
  requireValue(
    recovery.format === "feedback-recovery-witness/1" &&
      recovery.exit === 0 &&
      JSON.stringify(recovery.argv) ===
        JSON.stringify([
          "pnpm",
          "exec",
          "vitest",
          "run",
          "packages/cli/test/feedback-loop.test.ts",
        ]) &&
      hash(resolve(root, "treadle/packages/cli/test/feedback-loop.test.ts")) ===
        recovery.source_sha256,
    "Actual recovery check/source evidence missing",
  );
  const logPath = artifact(recovery.log_file),
    log = readFileSync(logPath, "utf8");
  requireValue(
    hash(logPath) === recovery.log_sha256 &&
      recovery.observed_at &&
      log.includes("4 passed (4)"),
    "Recovery command result log missing",
  );
  for (const event of recovery.events)
    requireValue(
      log.includes("FEEDBACK_RECOVERY " + JSON.stringify(event)),
      "Recovery observation not present in actual command output",
    );
  const restarted = recovery.events.find(
      (e) => e.kind === "restart-redelivery",
    ),
    lost = recovery.events.find((e) => e.kind === "lost-ack");
  requireValue(
    restarted?.before_cursor === 1 &&
      restarted.after_cursor === restarted.before_cursor &&
      restarted.before_batches?.length === 1 &&
      JSON.stringify(restarted.before_batches) ===
        JSON.stringify(restarted.after_batches),
    "Restart stable batch/cursor redelivery not observed",
  );
  requireValue(
    lost?.operation_id &&
      lost.received_batch &&
      lost.received_batch === lost.replay_batch &&
      lost.committed_batches === 1,
    "Lost acknowledgement committed receipt replay not observed",
  );
  console.log(
    waived.size
      ? "Native matrix: six human submissions/native revisions verified; seven of eight human thread resolutions observed; Claude diff Resolve explicitly owner-waived and unverified"
      : "Native matrix: six human browser / native agent revision / human resolution journeys verified",
  );
}
if (!process.argv.includes("--ui-only")) native();
