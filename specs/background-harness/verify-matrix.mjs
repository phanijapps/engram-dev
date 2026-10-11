/** Release completeness is deliberately stricter than the implementation checks. */
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { createHash } from "node:crypto";
const dir = fileURLToPath(new URL(".", import.meta.url));
const matrix = JSON.parse(
  readFileSync(join(dir, "platform-evidence.json"), "utf8"),
);
const requiredChecks = [
  "shared-instance",
  "project-wiki-library",
  "read-only-context",
  "stop-next-event-restart",
  "persistent-enrollment",
  "parent-exit-survival",
];
const runtime = [],
  missing = [],
  witnesses = [];
for (const file of matrix.runtimeFiles) {
  const path = join(dir, file);
  if (!existsSync(path)) {
    missing.push(`Missing artifact: ${file}`);
    continue;
  }
  const bytes = readFileSync(path),
    result = JSON.parse(bytes);
  witnesses.push({
    file,
    sha256: createHash("sha256").update(bytes).digest("hex"),
  });
  if (
    result.format !== "harness-smoke/1" ||
    result.exit !== 0 ||
    !result.commands?.length ||
    result.commands.some((c) => c.exit !== 0) ||
    !Array.isArray(result.checks) ||
    requiredChecks.some((check) => !result.checks.includes(check))
  )
    missing.push(`Incomplete runtime witness: ${file}`);
  else runtime.push(result.platform);
}
for (const platform of matrix.requiredRuntimePlatforms)
  if (!runtime.includes(platform))
    missing.push(`Actual runtime witness pending: ${platform}`);
for (const journey of matrix.pendingHostJourneys)
  missing.push(`Host journey pending: ${journey}`);
const result = {
  at: new Date().toISOString(),
  verdict: missing.length ? "INCOMPLETE" : "PASS",
  witnesses,
  missing,
  note: "Published contracts, unit callback tests and CI configuration cannot substitute for actual native host journeys or human host trust.",
};
writeFileSync(
  join(dir, "release-verification.json"),
  JSON.stringify(result, null, 2) + "\n",
);
console.log(JSON.stringify(result, null, 2));
process.exitCode = missing.length ? 1 : 0;
