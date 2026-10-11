/** Observe local CLI, service continuity, owned installer and generated packages. */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { resolve, join } from "node:path";
import assert from "node:assert/strict";
import { stateDirectory } from "../../treadle/packages/cli/dist/src/serve/runtime.js";
const dir = fileURLToPath(new URL(".", import.meta.url));
const root = resolve(dir, "../..");
const entry = join(root, "treadle/packages/cli/dist/src/main.js");
const commands = [];
function run(command, args, json = false) {
  const r = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    timeout: 120000,
  });
  commands.push({ command, args, exit: r.status ?? 1 });
  assert.equal(r.status, 0, r.stderr || String(r.error));
  return json ? JSON.parse(r.stdout) : r.stdout;
}
const cli = (args, json = false) =>
  run(process.execPath, [entry, ...args], json);
const hash = (file) =>
  createHash("sha256").update(readFileSync(file)).digest("hex");
const reviewer = join(root, ".codex/agents/red-foreman.toml");
const beforeReviewer = hash(reviewer);
const registry = join(stateDirectory(), "projects.json");
const beforeRegistry = hash(registry);
const old = cli(["status", "serve"], true);
assert.equal(old.state, "running");
assert.match(run("wukong", ["--help"]), /Usage: wukong/);
run("wukong", ["--version"]);
cli(["stop", "serve"]);
assert.equal(cli(["status", "serve"], true).state, "stopped");
const connected = cli(["project", "connect", root, "--json"], true);
assert.notEqual(connected.service.instance, old.instance);
assert.equal(connected.project.id, "f69b47a23566ae2a3e86acb0");
const registryPreserved = hash(registry) === beforeRegistry;
assert(registryPreserved, "Project registry changed during rename");
const brand = await fetch(connected.service.url + "branding").then((r) =>
  r.json(),
);
assert.deepEqual(brand, { name: "Wukong", command: "wukong" });
for (const path of [
  "projects",
  `projects/${connected.project.id}/library/`,
  `projects/${connected.project.id}/wiki`,
]) {
  assert.equal((await fetch(connected.service.url + path)).status, 200);
}
cli([
  "init",
  "harness",
  "--agent",
  "codex",
  "--scope",
  "project",
  "--root",
  root,
  "--skills",
  "analyze",
  "build-kb",
  "implement",
  "new-project",
  "plan",
  "review",
  "roadmap",
  "--no-agents",
  "--no-hooks",
]);
cli([
  "init",
  "harness",
  "--agent",
  "codex",
  "--scope",
  "project",
  "--root",
  root,
  "--hooks-only",
]);
const reviewerPreserved = hash(reviewer) === beforeReviewer;
assert(reviewerPreserved);
const output = mkdtempSync(join(tmpdir(), "wukong-harness-"));
const packages = [];
for (const agent of ["claude", "codex", "pi"]) {
  const path = join(output, agent);
  cli(["package", "harness", "--agent", agent, "--out", path]);
  const metadata = JSON.parse(readFileSync(join(path, "package.json"), "utf8"));
  assert.equal(metadata.name, `wukong-harness-${agent}`);
  const witness = JSON.parse(
    readFileSync(join(path, ".harness-package.json"), "utf8"),
  );
  for (const [file, sha256] of Object.entries(witness.files))
    assert.equal(hash(join(path, file)), sha256);
  packages.push({ surface: agent, name: metadata.name, path });
}
mkdirSync(join(dir, "gates"), { recursive: true });
writeFileSync(
  join(dir, "gates/local-delivery.json"),
  JSON.stringify(
    {
      exit: 0,
      at: new Date().toISOString(),
      platform: process.platform,
      node: process.version,
      brand,
      projectId: connected.project.id,
      registryPreserved,
      reviewerPreserved,
      packages,
      commands,
      url: connected.service.url,
      scope:
        "Actual local Linux CLI/service and generated package bytes; host trust/reload and native host journeys remain separate.",
    },
    null,
    2,
  ) + "\n",
);
console.log(
  "Local CLI/service continuity, owned Codex install, and three native packages: PASS",
);
