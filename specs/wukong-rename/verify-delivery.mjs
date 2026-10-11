/** Run actual delivery checks; retain each command and its exit status. */
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, resolve } from "node:path";
import assert from "node:assert/strict";
const dir = fileURLToPath(new URL(".", import.meta.url));
const root = resolve(dir, "../..");
const workspace = join(root, "treadle");
const logs = join(dir, "gates");
mkdirSync(logs, { recursive: true });
const results = [];
const steps = [
  ["check", "pnpm", ["check"]],
  ["coverage", "pnpm", ["coverage"]],
  ["corpus", "pnpm", ["corpus:check"]],
  ["brand", "pnpm", ["brand:check"]],
  ["audit", "pnpm", ["audit:prod"]],
  ["links", "pnpm", ["links"]],
  ["runtime-package", process.execPath, ["scripts/verify-runtime-package.mjs"]],
  ["runtime-journey", process.execPath, ["scripts/harness-smoke.mjs"]],
  ...[
    ["fingerprints", ["know", "fingerprints", "..", "../wiki"]],
    ["stamp", ["know", "stamp", "../wiki", "--workspace", ".."]],
    ["anchors", ["know", "anchors", "../wiki", "--workspace", ".."]],
    ["validate", ["know", "validate", "../wiki"]],
    ["status", ["know", "status", "../wiki", "--workspace", ".."]],
  ].map(([label, args]) => [
    label,
    process.execPath,
    ["packages/cli/dist/src/main.js", ...args],
  ]),
];
for (const [label, command, args] of steps) {
  const run = spawnSync(command, args, {
    cwd: workspace,
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
    env: {
      ...process.env,
      HARNESS_SMOKE_OUTPUT: join(logs, "runtime-journey.json"),
    },
  });
  writeFileSync(
    join(logs, `${label}.log`),
    (run.stdout ?? "") + (run.stderr ?? "") + (run.error?.message ?? ""),
  );
  results.push({
    label,
    command,
    args,
    exit: run.status ?? 1,
    at: new Date().toISOString(),
  });
  writeFileSync(
    join(logs, "results.json"),
    JSON.stringify(results, null, 2) + "\n",
  );
  console.log(`${label}: exit ${run.status ?? 1}`);
  if (run.status !== 0) process.exit(run.status ?? 1);
}
const operations = JSON.parse(
  readFileSync(join(logs, "local-delivery.json"), "utf8"),
);
assert.equal(operations.exit, 0);
assert.equal(operations.brand.name, "Wukong");
assert.equal(operations.brand.command, "wukong");
assert.equal(operations.registryPreserved, true);
assert.equal(operations.reviewerPreserved, true);
assert.equal(operations.projectId, "f69b47a23566ae2a3e86acb0");
assert.deepEqual(operations.packages.map((p) => p.name).sort(), [
  "wukong-harness-claude",
  "wukong-harness-codex",
  "wukong-harness-pi",
]);
assert(operations.commands.every((c) => c.exit === 0));
console.log("Delivery gates and observed local integration: PASS");
