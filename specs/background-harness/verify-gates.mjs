import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve, join } from "node:path";
const root = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const cwd = join(root, "treadle");
const logs = join(
  root,
  process.argv.includes("--skip-wiki")
    ? "specs/background-harness/delta-gates"
    : "specs/background-harness/gates",
);
mkdirSync(logs, { recursive: true });
const commands = [
  "check",
  "coverage",
  "corpus:check",
  "brand:check",
  "audit:prod",
  "links",
].map((name) => ({
  name,
  program: process.platform === "win32" ? "pnpm.cmd" : "pnpm",
  args: [name],
  shell: process.platform === "win32",
}));
for (const [name, args] of process.argv.includes("--skip-wiki")
  ? []
  : [
      ["fingerprints", ["fingerprints", "..", "../wiki"]],
      ["stamp", ["stamp", "../wiki", "--workspace", ".."]],
      ["anchors", ["anchors", "../wiki", "--workspace", ".."]],
      ["validate", ["validate", "../wiki"]],
      ["status", ["status", "../wiki", "--workspace", ".."]],
    ])
  commands.push({
    name: `wiki-${name}`,
    program: process.execPath,
    args: ["packages/cli/dist/src/main.js", "know", ...args],
  });
const results = [];
for (const command of commands) {
  const at = new Date().toISOString();
  const r = spawnSync(command.program, command.args, {
    cwd,
    shell: command.shell ?? false,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
  const output =
    (r.stdout ?? "") + (r.stderr ?? "") + (r.error ? String(r.error) : "");
  writeFileSync(join(logs, `${command.name.replaceAll(":", "-")}.log`), output);
  results.push({
    name: command.name,
    at,
    command: [command.program, ...command.args],
    exit: r.status ?? 1,
  });
  console.log(`${command.name}: exit ${r.status ?? 1}`);
}
writeFileSync(
  join(logs, "results.json"),
  JSON.stringify(
    {
      platform: process.platform,
      node: process.version,
      at: new Date().toISOString(),
      results,
      limits:
        "Fresh stamp compares HEAD; Python-only scanner does not detect dirty TS/Markdown.",
    },
    null,
    2,
  ) + "\n",
);
process.exitCode = results.some((r) => r.exit !== 0) ? 1 : 0;
