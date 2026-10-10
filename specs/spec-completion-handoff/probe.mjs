/** Analysis probe only. Owner acts below apply to disposable fixtures. */
import assert from "node:assert/strict";
import { readFileSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  loadPackWithMeta,
  deriveStage,
  closureGaps,
  nextTask,
  closePack,
  savePack,
} from "../../treadle/packages/core/src/specpack/index.ts";
import { startLibrary } from "../../treadle/packages/web/src/servers.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const path = join(root, "specs/docs-root-migration/docs-root-migration.json");
const journal = join(root, "specs/docs-root-migration/interview.jsonl");
const digest = (path) =>
  createHash("sha256").update(readFileSync(path)).digest("hex");
const before = { pack: digest(path), journal: digest(journal) };
const loaded = loadPackWithMeta(dirname(path));
assert.equal(loaded.ok, true);
const doc = loaded.value.doc;
const report = {
  observed_at: new Date().toISOString(),
  source_head: "51c2a789eec47b29108f07947009bfb32db55af0",
  observed: {
    revision: doc.revision,
    lifecycle: doc.status,
    stage: deriveStage(doc),
    approval: { at: doc.approved_at, by: doc.approved_by },
    closed_at: doc.closed_at ?? null,
    tasks: doc.tasks.map((task) => ({
      id: task.id,
      status: task.status,
      evidence: task.evidence?.length ?? 0,
    })),
    gaps: closureGaps(doc),
    decisions: doc.plan.decisions,
    hashes: before,
  },
};
assert.equal(doc.approved_by, "human:owner");
assert.equal(
  doc.tasks.every((task) => task.status === "done"),
  true,
);
assert.deepEqual(closureGaps(doc).pending_decisions, ["D-2", "D-3"]);
assert.equal(closureGaps(doc).review_pass, true);
report.current_close_on_clone = closePack(
  structuredClone(doc),
  "human:probe",
  {},
);
assert.equal(report.current_close_on_clone.ok, false);
assert.match(
  report.current_close_on_clone.message,
  /decisions proposed: D-2, D-3/,
);

const runnable = structuredClone(doc);
runnable.tasks[0].status = "todo";
report.proposed_decisions_do_not_gate_handout = nextTask(runnable);
assert.equal(
  report.proposed_decisions_do_not_gate_handout.value.status,
  "task",
);
assert.deepEqual(closureGaps(runnable).pending_decisions, ["D-2", "D-3"]);
const settled = structuredClone(doc);
// Fixture assumption, not actual owner acceptance or a saved live-pack change.
for (const decision of settled.plan.decisions)
  if (decision.status === "proposed") decision.status = "accepted";
report.settled_not_closed = {
  stage: deriveStage(settled),
  handout: nextTask(settled),
};
assert.equal(report.settled_not_closed.stage, "in_progress");
assert.equal(report.settled_not_closed.handout.value.status, "DONE");
const noReview = structuredClone(settled);
noReview.review = { verdicts: [] };
report.missing_review_handout = nextTask(noReview);
assert.equal(report.missing_review_handout.value.status, "DONE");
report.explicit_close_on_clone = closePack(settled, "human:probe", {
  at: "2000-01-01T00:00:00Z",
});
assert.equal(report.explicit_close_on_clone.ok, true);
assert.equal(deriveStage(settled), "delivered");

const temp = mkdtempSync(join(tmpdir(), "completion-analysis-"));
let library;
try {
  const fixture = structuredClone(doc);
  delete fixture.approved_at;
  delete fixture.approved_by;
  const directory = join(temp, "fixture");
  mkdirSync(directory);
  savePack(fixture, join(directory, "fixture.json"), {
    at: "2000-01-01T00:00:00Z",
  });
  library = await startLibrary(temp, 0, "human:probe");
  const post = async (kind) => {
    const response = await fetch(library.url + "event/fixture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind }),
    });
    return { status: response.status, body: await response.json() };
  };
  report.fixture_http_approve = await post("approve");
  assert.equal(report.fixture_http_approve.status, 200);
  const afterApproval = loadPackWithMeta(directory).value.doc;
  report.fixture_after_approval = {
    stage: deriveStage(afterApproval),
    lifecycle: afterApproval.status,
    gaps: closureGaps(afterApproval),
    closed_at: afterApproval.closed_at ?? null,
  };
  assert.equal(report.fixture_after_approval.stage, "awaiting_owner");
  report.fixture_http_close = await post("close");
  assert.equal(report.fixture_http_close.status, 400);
  assert.match(report.fixture_http_close.body.error, /unknown event kind/);
} finally {
  if (library) await library.close();
  rmSync(temp, { recursive: true, force: true });
}
assert.equal(digest(path), before.pack);
assert.equal(digest(journal), before.journal);
report.live_pack_and_journal_unchanged_by_probe = true;
report.result = "OBSERVED_CURRENT_BEHAVIOR";
console.log(JSON.stringify(report, null, 2));
