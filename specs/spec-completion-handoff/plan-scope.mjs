/** Read-only scope capture for this proposal's bootstrap approval. */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const canonical = (value) =>
  JSON.stringify(value, (_key, item) =>
    item && typeof item === "object" && !Array.isArray(item)
      ? Object.fromEntries(
          Object.keys(item)
            .sort()
            .map((key) => [key, item[key]]),
        )
      : item,
  );
export const digest = (value) =>
  createHash("sha256").update(canonical(value)).digest("hex");

export function captureScope(dir, doc) {
  return {
    plan: 1,
    files: ["owner-flow.md", "brief.md", "spec.md", "design.md", "plan.md"].map(
      (file) => ({
        file,
        sha256: createHash("sha256")
          .update(readFileSync(join(dir, file)))
          .digest("hex"),
      }),
    ),
    spec: {
      why: doc.spec.why,
      requirements: doc.spec.requirements,
      stories: doc.spec.stories,
      out_of_scope: doc.spec.out_of_scope,
    },
    design: {
      approach: doc.plan.approach,
      designs: doc.plan.designs,
      decisions: doc.plan.decisions.map(
        ({ status, accepted_by, ...definition }) => definition,
      ),
    },
    tasks: doc.tasks.map(({ status, evidence, context, ...definition }) => ({
      ...definition,
      context: {
        ...context,
        touch: context.touch.map(({ path }) => ({ path })),
      },
    })),
  };
}
