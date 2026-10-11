// Throwaway diagnosis fixture. No runtime implementation changes.
import {
  mkdtempSync,
  mkdirSync,
  symlinkSync,
  rmSync,
  writeFileSync,
  realpathSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, win32 } from "node:path";
import { spawnSync } from "node:child_process";
import { feedbackContainedPath } from "../../treadle/packages/core/src/feedback/store.js";

const started = new Date();
const root = mkdtempSync(join(tmpdir(), "wukong-ci-probe-"));
const physical = join(root, "physical");
const alias = join(root, "alias");
const results: Record<string, unknown> = {
  started: started.toISOString(),
  platform: process.platform,
  node: process.version,
};
mkdirSync(join(physical, "specs", "example"), { recursive: true });
symlinkSync(physical, alias, "dir");
try {
  results.physical = feedbackContainedPath(
    physical,
    join(physical, "specs", "example"),
  );
  try {
    results.alias = feedbackContainedPath(
      alias,
      join(alias, "specs", "example"),
    );
  } catch (e) {
    results.alias = { code: e.code, message: e.message };
  }
  const hook = join(
    process.cwd(),
    "packages/cli/harness/hooks/codex-context.js",
  );
  symlinkSync(
    join(process.cwd(), "packages/cli/harness/hooks"),
    join(physical, "hooks"),
    "dir",
  );
  const stub = join(root, "stub.cjs");
  writeFileSync(
    stub,
    `const args=process.argv.slice(2);const cwd=args[args.indexOf('--workspace')+1]??args[2];console.log(JSON.stringify(args[0]==='project'?{service:{url:'http://127.0.0.1:1/'},project:{id:'fixture'}}:{format:'context/1',workspace:cwd,wiki:{root:cwd+'/wiki',available:false,limit:'fixture'},specs:{root:cwd+'/specs',packs:[],selectionRequired:false},guidance:{newSpec:'fixture',continueSpec:'fixture'}}));`,
  );
  const invoke = (path: string) => {
    const r = spawnSync(process.execPath, [path, "--event", "SessionStart"], {
      cwd: physical,
      env: { ...process.env, HARNESS_RUNTIME_ENTRY: stub },
      input: JSON.stringify({ cwd: physical, hook_event_name: "SessionStart" }),
      encoding: "utf8",
      timeout: 10000,
    });
    return {
      status: r.status,
      stdout: r.stdout,
      stderr: r.stderr,
      error: r.error?.message,
    };
  };
  results.hookPhysical = invoke(hook);
  results.hookAlias = invoke(join(alias, "hooks", "codex-context.js"));
  results.aliasHookRealpath = realpathSync(
    join(alias, "hooks", "codex-context.js"),
  );
  results.windowsIllustration = {
    caveat:
      "Path-function example on Linux; not native filesystem or Git measurements.",
    caseRelative: win32.relative(
      "C:\\Users\\runneradmin\\repo",
      "C:/Users/RunnerAdmin/repo",
    ),
    shortLongRelative: win32.relative(
      "C:\\Users\\RUNNER~1\\repo",
      "C:/Users/runneradmin/repo",
    ),
  };
  const a = results.alias as { code: string };
  if (
    a.code !== "forbidden" ||
    (results.hookPhysical as { stdout: string }).stdout.length === 0 ||
    (results.hookAlias as { stdout: string }).stdout.length !== 0
  )
    throw Error("Hypothesis not reproduced");
  results.exit = 0;
} finally {
  results.elapsedMs = Date.now() - started.getTime();
  console.log(JSON.stringify(results, null, 2));
  rmSync(root, { recursive: true, force: true });
}
