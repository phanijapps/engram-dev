/** Real checks for the owner-authorized root executable correction. */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { packageRuntime } from "../../../treadle/scripts/package-runtime.mjs";

const dir = fileURLToPath(new URL(".", import.meta.url));
const root = resolve(dir, "../../..");
const workspace = join(root, "treadle");
const logs = join(dir, "gates");
mkdirSync(logs, { recursive: true });
const results = [];
function run(label, command, args, cwd = workspace) {
  const r = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  });
  writeFileSync(
    join(logs, label + ".log"),
    (r.stdout ?? "") + (r.stderr ?? "") + (r.error?.message ?? ""),
  );
  results.push({
    label,
    command,
    args,
    exit: r.status ?? 1,
    at: new Date().toISOString(),
  });
  writeFileSync(
    join(logs, "results.json"),
    JSON.stringify(results, null, 2) + "\n",
  );
  assert.equal(r.status, 0, `${label}: ${r.stderr || r.error}`);
  console.log(`${label}: exit 0`);
  return r.stdout;
}
for (const task of [
  "check",
  "coverage",
  "corpus:check",
  "brand:check",
  "audit:prod",
  "links",
]) {
  run(task.replace(":", "-"), "pnpm", [task]);
}
const scratch = mkdtempSync(join(tmpdir(), "root wrapper ü "));
try {
  // Materialize the real bundled CLI dependency tree, then invoke the unchanged
  // root wrapper from outside the checkout. This proves resolution and branding.
  const manifest = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  assert.deepEqual(manifest.bin, { wukong: "./bin/engram.js" });
  const installed = join(scratch, "installed");
  const deployed = packageRuntime(join(installed, "node_modules/@treadle/cli"));
  assert.deepEqual(
    JSON.parse(readFileSync(join(deployed, "package.json"), "utf8")).bin,
    { wukong: "./dist/src/main.js" },
  );
  writeFileSync(
    join(installed, "package.json"),
    JSON.stringify(manifest, null, 2) + "\n",
  );
  cpSync(join(root, "bin"), join(installed, "bin"), { recursive: true });
  const help = run(
    "root-wrapper-help",
    process.execPath,
    [join(installed, manifest.bin.wukong), "--help"],
    scratch,
  );
  assert.match(help, /Usage: wukong/);
  assert.match(help, /Wukong/);
  run(
    "root-wrapper-version",
    process.execPath,
    [join(installed, manifest.bin.wukong), "--version"],
    scratch,
  );
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
for (const [label, args] of [
  ["fingerprints", ["know", "fingerprints", "..", "../wiki"]],
  ["stamp", ["know", "stamp", "../wiki", "--workspace", ".."]],
  ["anchors", ["know", "anchors", "../wiki", "--workspace", ".."]],
  ["validate", ["know", "validate", "../wiki"]],
  ["status", ["know", "status", "../wiki", "--workspace", ".."]],
])
  run(label, process.execPath, ["packages/cli/dist/src/main.js", ...args]);
console.log("Root executable correction: PASS");
