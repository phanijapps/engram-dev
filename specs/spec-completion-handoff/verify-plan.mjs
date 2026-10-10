/** Read-only checks for the proposed plan, not evidence of implementation. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { captureScope, digest } from "./plan-scope.mjs";
import {
  loadPackWithMeta,
  alignment,
  gapCount,
  nextTask,
} from "../../treadle/packages/core/src/specpack/index.ts";

const dir = dirname(fileURLToPath(import.meta.url));
const root = resolve(dir, "../..");
const loaded = loadPackWithMeta(dir);
assert.equal(loaded.ok, true);
const { doc } = loaded.value;
const result = alignment(doc);
assert.equal(result.ok, true);
assert.deepEqual(result.value.violations, []);
assert.equal(gapCount(result.value), 0);
assert.equal(doc.tasks.length, 7);
assert.ok(
  doc.tasks.every(
    (task) => task.status === "blocked" && !task.evidence?.length,
  ),
);
assert.ok(
  doc.plan.decisions.every((decision) => decision.status === "proposed"),
);
assert.equal(doc.closed_at, undefined);
assert.ok(!(doc.review?.verdicts ?? []).some((entry) => entry.on === "PACK"));
const next = nextTask(structuredClone(doc));
assert.equal(next.value.status, "BLOCKED");
for (const task of doc.tasks) {
  assert.ok(task.verify?.cmd && task.verify?.expect);
  assert.ok(task.context?.touch?.length && task.context?.notes?.length);
}
for (const file of [
  "owner-flow.md",
  "brief.md",
  "spec.md",
  "design.md",
  "plan.md",
])
  assert.ok(readFileSync(join(dir, file), "utf8").length > 100);
const actualAnswer = doc.spec.clarifications.find(
  (question) => question.id === "Q-1",
);
const prior = JSON.parse(
  readFileSync(join(dir, "pre-plan-revision-4.json"), "utf8"),
);
assert.deepEqual(
  actualAnswer,
  prior.spec.clarifications.find((question) => question.id === "Q-1"),
);
const scope = JSON.parse(readFileSync(join(dir, "plan-scope.json"), "utf8"));
assert.equal(scope.format, "plan-scope/0.1");
assert.deepEqual(
  scope.scope,
  JSON.parse(JSON.stringify(captureScope(dir, doc))),
);
assert.equal(scope.digest, digest(scope.scope));
const startQuestion = doc.spec.clarifications.find(
  (question) => question.id === "Q-6",
);
assert.equal(startQuestion.status, "open");
assert.ok(startQuestion.notes.includes(scope.digest));
const sourcePaths = [
  "treadle/packages/core/src/specpack/next.ts",
  "treadle/packages/core/src/specpack/record.ts",
  "treadle/packages/core/src/specpack/admission.ts",
  "treadle/packages/core/src/specpack/close.ts",
  "treadle/packages/core/src/specpack/loader.ts",
  "treadle/packages/core/src/specpack/emit.ts",
  "treadle/packages/web/src/servers.ts",
  "treadle/packages/web/src/library.js",
  "treadle/packages/cli/src/commands/do.ts",
  "wiki/assets/contracts/specpack.schema.json",
];
const hash = (path) =>
  createHash("sha256").update(readFileSync(path)).digest("hex");
console.log(
  JSON.stringify(
    {
      result: "PLAN_VALIDATED",
      observed_at: new Date().toISOString(),
      revision: doc.revision,
      violations: 0,
      traceability_gaps: 0,
      tasks: 7,
      authorized_ready_tasks: [],
      engine_handout_on_clone: next.value.status,
      pending_decisions: doc.plan.decisions
        .filter((decision) => decision.status === "proposed")
        .map((decision) => decision.id),
      spec_approval: doc.approved_at ?? "unset",
      start_authorization: "unset; awaiting a scope-specific owner act",
      open_questions: doc.spec.clarifications
        .filter((question) => question.status === "open")
        .map((question) => question.id),
      owner_flow_answer_preserved: true,
      reviewed_plan_digest: scope.digest,
      source_hashes: Object.fromEntries(
        sourcePaths.map((path) => [path, hash(join(root, path))]),
      ),
      scope:
        "Planning artifacts only; no runtime fix or implementation evidence.",
    },
    null,
    2,
  ),
);
