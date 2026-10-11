import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve, join } from "node:path";
import assert from "node:assert/strict";
import { brand } from "../../treadle/packages/brand/dist/src/index.js";
const dir = fileURLToPath(new URL(".", import.meta.url)),
  root = resolve(dir, "../..");
assert.equal(brand.name, "Wukong");
assert.equal(brand.binName, "wukong");
assert.equal(brand.stateDirectory, "treadle");
const args = [
  "exec",
  "vitest",
  "run",
  "packages/brand/test/brand.test.ts",
  "packages/brand/test/rebrand.test.ts",
  "packages/cli/test/serve-runtime.test.ts",
  "packages/cli/test/init-surfaces.test.ts",
  "packages/web/test/project-library.test.ts",
];
const r = spawnSync("pnpm", args, {
  cwd: join(root, "treadle"),
  encoding: "utf8",
  maxBuffer: 8 * 1024 * 1024,
});
writeFileSync(
  join(dir, "implementation.log"),
  (r.stdout ?? "") + (r.stderr ?? ""),
);
console.log("Focused implementation checks: exit " + (r.status ?? 1));
process.exitCode = r.status ?? 1;
