// Proposal authoring only. Never records owner consent or admits work.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "../../../treadle/node_modules/ajv/dist/2020.js";
import {
  withPackLock,
  loadPackWithMeta,
  savePack,
  emit,
} from "../../../treadle/packages/core/src/index.ts";

const dir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(dir, "../..");
const [phase, heldText] = process.argv.slice(2);
const held = Number(heldText);
if (!["analysis", "plan"].includes(phase) || !Number.isSafeInteger(held))
  throw Error("Use analysis|plan <held revision>");
const proposal = JSON.parse(
  readFileSync(resolve(dir, "authoring/proposal.json"), "utf8"),
);
const schema = JSON.parse(
  readFileSync(
    resolve(root, "wiki/assets/contracts/specpack-owner-workflow.schema.json"),
    "utf8",
  ),
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
const result = withPackLock(dir, () => {
  const loaded = loadPackWithMeta(dir);
  if (!loaded.ok) throw Error(JSON.stringify(loaded));
  const { doc, path } = loaded.value;
  if (
    doc.revision !== held ||
    doc.format !== "specpack/0.4" ||
    doc.name !== "browser-agent-feedback"
  )
    throw Error("Wrong pack or held revision");
  if (
    doc.status === "complete" ||
    doc.approved_at ||
    doc.closed_at ||
    doc.workflow?.acts.length ||
    doc.workflow?.pending_audit.length ||
    doc.plan.decisions?.some((d) => d.status !== "proposed") ||
    doc.tasks.some((t) => t.status !== "todo" || t.evidence)
  )
    throw Error("Consent, evidence or recovery exists: preserve bound record");
  const beforeWorkflow = JSON.stringify(doc.workflow);
  doc.spec.requirements = proposal.requirements;
  doc.spec.constraints = proposal.constraints;
  doc.spec.stories = proposal.stories;
  doc.spec.out_of_scope = proposal.out_of_scope;
  const files: Record<string, string> = {
    brief: "brief.md",
    analysis: "feature.md",
    spec: "spec.md",
    research: "research.md",
    "owner-inputs": "owner-inputs.md",
    "source-pins": "authoring/source-pins.json",
  };
  if (phase === "plan") {
    if (
      JSON.stringify(doc.plan.decisions) !== JSON.stringify(proposal.decisions)
    )
      throw Error("Register proposed decisions through do add first");
    if (
      doc.tasks.length !== proposal.tasks.length ||
      doc.tasks.some(
        (t, i) =>
          t.id !== proposal.tasks[i].id || t.title !== proposal.tasks[i].title,
      )
    )
      throw Error("Register task IDs through do add first");
    doc.plan.designs = proposal.designs;
    doc.plan.diagrams = proposal.diagrams;
    doc.tasks = proposal.tasks;
    doc.env = proposal.env;
    Object.assign(files, {
      design: "design.md",
      plan: "plan.md",
      "DG-1": "diagrams/DG-1.mmd",
      "DG-2": "diagrams/DG-2.mmd",
      "DG-3": "diagrams/DG-3.mmd",
      "DG-4": "diagrams/DG-4.mmd",
    });
  }
  doc.artifacts ??= {};
  for (const [key, file] of Object.entries(files))
    doc.artifacts[key] = {
      file,
      type: file.endsWith(".mmd")
        ? "mermaid"
        : file.endsWith(".json")
          ? "json"
          : "markdown",
      sha256: createHash("sha256")
        .update(readFileSync(resolve(dir, file)))
        .digest("hex"),
    };
  if (JSON.stringify(doc.workflow) !== beforeWorkflow)
    throw Error("Workflow changed");
  doc.revision = held + 1;
  if (!validate(emit(doc)))
    throw Error(JSON.stringify(validate.errors, null, 2));
  const saved = savePack(doc, path, { at: new Date().toISOString() });
  if (saved?.durability_error || saved?.audit_pending)
    throw Error(JSON.stringify(saved));
  const reloaded = loadPackWithMeta(dir);
  if (!reloaded.ok || reloaded.value.doc.revision !== held + 1)
    throw Error("Reload failed");
  return {
    phase,
    revision: held + 1,
    artifacts: Object.keys(reloaded.value.doc.artifacts ?? {}),
    ownerActs: reloaded.value.doc.workflow?.acts.length,
  };
});
if (!result.ok) throw Error(JSON.stringify(result));
console.log(JSON.stringify(result.value, null, 2));
