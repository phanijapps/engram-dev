// Scoped native-test command observations, not host sessions/transcripts/tokens.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const checks = dirname(fileURLToPath(import.meta.url)),
  root = resolve(checks, "../../..");
const [host, session, phase, ...extra] = process.argv.slice(2);
const cases = JSON.parse(
  readFileSync(resolve(checks, "native-preparation.json")),
).cases;
const selected = cases.find((c) => c.host === host && c.session === session);
if (!selected || !["wait", "read", "reply", "round", "verify"].includes(phase))
  throw Error("Explicit native case/phase required");
const options = {
  wait: ["--after", "--timeout"],
  read: ["--after"],
  reply: ["--thread", "--body-file", "--expected-revision", "--operation-id"],
  round: ["--expected-revision", "--operation-id"],
  verify: [],
};
// Accept only separate, paired options for this phase. Identity, project,
// equals-form overrides and positional arguments never reach the child CLI.
for (let i = 0; i < extra.length; i += 2) {
  if (
    !options[phase].includes(extra[i]) ||
    extra[i + 1] === undefined ||
    extra[i + 1].startsWith("-")
  )
    throw Error("Native case/phase options are fixed");
}
let argv;
if (phase === "verify") {
  const assertion =
    selected.mode === "documents"
      ? `import{readFileSync}from'node:fs';import assert from'node:assert/strict';assert.ok(readFileSync(${JSON.stringify(selected.file)},'utf8').includes('Submitting feedback does not grant Start approval.'));console.log('Document fixture assertion passed');`
      : `import{readFileSync}from'node:fs';import assert from'node:assert/strict';const m=await import('data:text/javascript;base64,'+Buffer.from(readFileSync(${JSON.stringify(selected.file)},'utf8')).toString('base64'));for(const n of[0,1,2])assert.equal(m.reviewLabel(n),n+' feedback '+(n===1?'comment':'comments'));console.log('Code fixture assertions passed: 0,1,2');`;
  argv = [process.execPath, "--input-type=module", "-e", assertion];
} else {
  argv = [
    process.execPath,
    resolve(root, "treadle/packages/cli/dist/src/main.js"),
    "do",
    "feedback",
    phase,
    resolve(root, "specs/browser-agent-feedback"),
    "--session",
    session,
    ...extra,
    "--json",
  ];
  if (["reply", "round"].includes(phase)) argv.push("--by", `agent:${host}`);
}
const started_at = new Date().toISOString();
const result = spawnSync(argv[0], argv.slice(1), {
  cwd: root,
  encoding: "utf8",
  timeout: 65000,
  maxBuffer: 4 * 1024 * 1024,
});
const exit = result.error ? 1 : (result.status ?? 1);
let output;
try {
  output =
    phase === "verify" ? result.stdout.trim() : JSON.parse(result.stdout);
} catch {
  output = {
    unavailable: true,
    error: result.error?.message ?? "Non-JSON CLI output",
  };
}
const record = {
  format: "feedback-native-command-observation/1",
  host,
  session,
  phase,
  argv,
  started_at,
  observed_at: new Date().toISOString(),
  exit,
  output,
};
const home = resolve(checks, "native-command-observations");
mkdirSync(home, { recursive: true });
writeFileSync(
  resolve(home, `${host}-${session}-${randomUUID()}.json`),
  JSON.stringify(record, null, 2) + "\n",
);
console.log(JSON.stringify(output));
process.exitCode = exit;
