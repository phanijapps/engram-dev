// Read-only checks of the proposal, never admission or consent.
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import Ajv from "../../../treadle/node_modules/ajv/dist/2020.js";
import {
  loadPackWithMeta,
  alignment,
  gapCount,
  workflowGate,
  planDigest,
  executionGate,
} from "../../../treadle/packages/core/src/index.ts";

const dir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(dir, "../..");
const json = (file: string) => JSON.parse(readFileSync(file, "utf8"));
const sha = (file: string) =>
  createHash("sha256").update(readFileSync(file)).digest("hex");
const loaded = loadPackWithMeta(dir);
assert(loaded.ok, JSON.stringify(loaded));
const { doc, path } = loaded.value;
const raw = json(path);
const schema = json(
  resolve(root, "wiki/assets/contracts/specpack-owner-workflow.schema.json"),
);
const ajv = new Ajv({ strict: false, allErrors: true });
ajv.addFormat("date-time", {
  type: "string",
  validate: (value: string) =>
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(
      value,
    ) && Number.isFinite(Date.parse(value)),
});
const validate = ajv.compile(schema);
assert(validate(raw), JSON.stringify(validate.errors));
const a = alignment(doc);
assert(a.ok, JSON.stringify(a));
assert.deepEqual(a.value.violations, []);
assert.equal(gapCount(a.value), 0);
assert.deepEqual(a.value.coverage.story_drift, {
  requirements_without_stories: [],
  stories_unserved: [],
});
const proposal = json(resolve(dir, "authoring/proposal.json"));
for (const key of ["requirements", "constraints", "stories", "out_of_scope"])
  assert.deepEqual(doc.spec[key], proposal[key]);
for (const key of ["designs", "diagrams"])
  assert.deepEqual(doc.plan[key], proposal[key]);
const decisionDefinitions = (items: any[]) =>
  items.map(({ status, accepted_by, ...definition }) => definition);
assert.deepEqual(
  decisionDefinitions(doc.plan.decisions ?? []),
  decisionDefinitions(proposal.decisions),
);
assert.deepEqual(doc.tasks, proposal.tasks);
assert.deepEqual(doc.env, proposal.env);
const order: string[] = [];
const remaining = new Map(doc.tasks.map((t) => [t.id, t]));
const edges: string[] = [];
while (remaining.size) {
  const ready = [...remaining.values()].filter((t) =>
    ((t.needs as string[]) ?? []).every((id) => order.includes(id)),
  );
  assert(ready.length, "DAG stalled");
  for (const task of ready) {
    order.push(task.id);
    remaining.delete(task.id);
    for (const id of (task.needs as string[]) ?? [])
      edges.push(`${id.replace("-", "")}->${task.id.replace("-", "")}`);
    const context = task.context as {
      read: { path: string }[];
      touch: { path: string }[];
    };
    assert(context.touch.length, `${task.id} has no allowed changes`);
    for (const entry of context.read)
      assert(
        existsSync(resolve(root, entry.path)),
        `Missing read: ${entry.path}`,
      );
    assert.equal(task.status, "todo");
    assert(
      !task.evidence && !task.context_hash,
      "Proposal has execution evidence",
    );
  }
}
const diagramEdges = [
  ...readFileSync(resolve(dir, "diagrams/DG-4.mmd"), "utf8").matchAll(
    /\b(T\d+)(?:\[[^\n]*?\])?\s*-->\s*(T\d+)/g,
  ),
].map((m) => `${m[1]}->${m[2]}`);
assert.deepEqual(diagramEdges.sort(), edges.sort());
const inline = ["design.md", "plan.md"].flatMap((file) =>
  [
    ...readFileSync(resolve(dir, file), "utf8").matchAll(
      /```mermaid\s*\n([\s\S]*?)```/g,
    ),
  ].map((m) => m[1].trim()),
);
for (const d of proposal.diagrams)
  assert(
    inline.includes(
      readFileSync(resolve(dir, `diagrams/${d.id}.mmd`), "utf8").trim(),
    ),
    `Inline differs: ${d.id}`,
  );
for (const [key, artifact] of Object.entries(doc.artifacts ?? {}))
  assert.equal(
    sha(resolve(dir, artifact.file)),
    artifact.sha256,
    `Artifact drift: ${key}`,
  );
const pins = json(resolve(dir, "authoring/source-pins.json"));
for (const [file, hash] of Object.entries(pins.sources))
  assert.equal(sha(resolve(root, file)), hash, `Evidence changed: ${file}`);
assert.equal(
  readdirSync(dir).filter((file) => file.endsWith(".json")).length,
  1,
);
assert(
  doc.workflow?.acts.every(
    (a) => ["accept", "start"].includes(a.kind) && a.by.startsWith("human:"),
  ),
  "Unexpected owner transition; inspect rather than rewrite",
);
assert.deepEqual(doc.workflow?.pending_audit, []);
assert.deepEqual(doc.workflow?.phase_questions.spec, []);
assert(!doc.approved_at && !doc.closed_at);
assert(
  doc.plan.decisions?.every((d) =>
    d.status === "proposed"
      ? !d.accepted_by
      : d.status === "accepted" && String(d.accepted_by).startsWith("human:"),
  ),
);
const gate = workflowGate(doc, path);
assert(["decisions", "start", "implementation"].includes(gate.phase));
const digest = planDigest(doc, path);
assert(digest.ok, JSON.stringify(digest));
if (doc.workflow?.start_receipt)
  assert.equal(
    doc.workflow.start_receipt.plan_digest,
    digest.value,
    "Start binds a different plan",
  );
console.log(
  JSON.stringify(
    {
      observed_at: new Date().toISOString(),
      revision: doc.revision,
      schema: "specpack-owner-workflow.schema.json",
      schemaValid: true,
      violations: [],
      gaps: 0,
      requirements: proposal.requirements.length,
      decisions: proposal.decisions.length,
      tasks: doc.tasks.length,
      artifacts: Object.keys(doc.artifacts ?? {}).length,
      sourcePins: Object.keys(pins.sources).length,
      structuralEntry: doc.tasks
        .filter((t) => !(t.needs as string[])?.length)
        .map((t) => t.id),
      topologicalOrder: order,
      gate,
      plan_digest: digest.value,
      ownerActs: doc.workflow?.acts.length,
      acceptedDecisions: doc.plan.decisions
        ?.filter((d) => d.status === "accepted")
        .map((d) => d.id),
      startReceipt: doc.workflow?.start_receipt ?? null,
      executionPermitted: executionGate(doc, path).ok,
      tasksAdmitted: doc.tasks
        .filter((t) => t.status !== "todo")
        .map((t) => t.id),
    },
    null,
    2,
  ),
);
