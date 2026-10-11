/** Bounded delivery verification; disposable fixture data never grants real owner authority. */
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  mkdtempSync,
  existsSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
const packRoot = dirname(fileURLToPath(import.meta.url));
const repo = resolve(packRoot, "../..");
const workspace = join(repo, "treadle");
const manifestPath = join(packRoot, "frontend-evidence.json");
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const runtime = mkdtempSync(join(tmpdir(), "quiet-workspace-"));
const fixtureSource = String.raw`
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { savePack, planDigest, evidenceDigest, mutateFeedback, readFeedback, workflowGate } from ${JSON.stringify(join(workspace, "packages/core/src/index.ts"))};
import { startProjects } from ${JSON.stringify(join(workspace, "packages/web/src/project-server.ts"))};
import { startRoom } from ${JSON.stringify(join(workspace, "packages/web/src/servers.ts"))};
const root = ${JSON.stringify(runtime)};
const specs = join(root, 'specs'); const wiki = join(root, 'wiki');
mkdirSync(specs); mkdirSync(wiki);
const at = new Date().toISOString();
const paths = {};
function make(name, stage) {
 const dir = join(specs, name); mkdirSync(dir);
 const path = join(dir, name + '.json');
 const doc = {format:'specpack/0.4', name, title:'Disposable ' + name + ' fixture', description:'Frontend verification only', revision:1, status:'active',
 artifacts:{}, spec:{why:'Inspect existing approval controls without changing authority.',requirements:[],clarifications:[]},
 plan:{decisions:[]}, tasks:[{id:'T-1',title:'Review the selected document and its bounded check',status:'todo',verify:{cmd:'fixture-only',expect:'Synthetic display data'},context:{touch:[]}}],
 workflow:{policy:'owner-gated/1',plan:1,phase_questions:{spec:[]},acts:[],pending_audit:[]}};
 for(const id of ['brief','spec','design','plan']) {
  writeFileSync(join(dir,id+'.md'), '# '+ id +'\n\nDisposable browser fixture.\n\n'+ Array.from({length:18},(_,i)=>'Supporting paragraph '+(i+1)+': inspect readable content and the reachable action area.').join('\n\n'));
  doc.artifacts[id]={file:id+'.md'};
 }
 if(stage==='plan') delete doc.artifacts.plan;
 if(stage==='spec') {
  doc.spec.clarifications=[{id:'Q-1',question:'Which existing approach should be reviewed?',status:'open',kind:'choice',options:['Review each gate','Review the whole plan'],default:'Review each gate'}];
  doc.workflow.phase_questions.spec=['Q-1'];
 }
 if(stage==='decisions' || stage==='rejected') {
  doc.plan.decisions=[{id:'D-1',decision:'Keep each existing owner act explicit',because:'Permission and feedback are separate acts.',status:stage==='rejected'?'rejected':'proposed'}];
  doc.tasks[0].requires_decisions=['D-1'];
 }
 if(['implementation','blocked','review','closure','delivered','audit'].includes(stage)) {
  const digest = planDigest(doc,path); if(!digest.ok) throw Error(digest.message);
  doc.workflow.start_receipt={by:'human:synthetic-fixture',at,plan_digest:digest.value};
  if(stage==='implementation') doc.tasks[0].status='doing';
  if(stage==='blocked') doc.tasks[0].status='blocked';
  if(['review','closure','delivered'].includes(stage)) {
   doc.tasks[0].status='done';doc.tasks[0].evidence=[{cmd:'fixture-only',exit:0,at,by:'agent:synthetic-fixture',notes:'Synthetic rendering data, not execution evidence'}];
  }
  if(['closure','delivered'].includes(stage)) doc.review={verdicts:[{on:'PACK',verdict:'PASS',by:'agent:synthetic-display-reviewer',at,findings:[],plan_digest:digest.value,evidence_digest:evidenceDigest(doc)}]};
  if(stage==='delivered') doc.status='complete';
 }
 savePack(doc,path,{at});
 if(stage==='audit') {doc.workflow.pending_audit=[{id:randomUUID(),kind:'start',by:'human:synthetic-fixture',at,revision:1,plan_digest:doc.workflow.start_receipt.plan_digest}];writeFileSync(path,JSON.stringify((awaitEmit)(doc)));}
 paths[name]={dir,path,doc};
 return paths[name];
}
import { emit as awaitEmit } from ${JSON.stringify(join(workspace, "packages/core/src/index.ts"))};
for(const state of ['plan','spec','decisions','rejected','start','implementation','blocked','review','closure','delivered','audit']) make(state,state);
const review=make('feedback','start');
const apply=(action,by='agent:synthetic-fixture')=>mutateFeedback(review.dir,root,{operation_id:randomUUID(),expected_revision:readFeedback(review.dir,root)?.revision||0,by,action});
const opened=apply({kind:'open',selection:{mode:'diff',base:'a'.repeat(40),paths:['design.md'],artifacts:[]},snapshots:[{key:'design.md',path:'design.md',before:'# Previous design\n\nReview each gate.\n',after:'# Revised design\n\nReview each gate with a clear primary action.\n'+Array.from({length:110},(_,i)=>'Supporting source line '+(i+1)).join('\n')}]});
const t=apply({kind:'comment',session:opened.session,anchor:{round:opened.round,target:undefined},body:'Clarify that Submit is separate from Start.'},'human:synthetic-fixture');
apply({kind:'submit',session:opened.session,round:opened.round},'human:synthetic-fixture');
apply({kind:'reply',session:opened.session,thread:t.thread,body:'Published the clarified source; inspect the newer round.'});
apply({kind:'round',session:opened.session,snapshots:[{key:'design.md',path:'design.md',before:'# Revised design\n\nReview each gate with a clear primary action.\n',after:'# Latest design\n\nSubmit feedback requests revisions. Start grants separate permission.\n'+Array.from({length:110},(_,i)=>'Supporting source line '+(i+1)).join('\n')}]});
make('empty','start');
const roomFixture=make('interview','spec');
mkdirSync(join(specs,'history'));writeFileSync(join(specs,'history','notes.md'),'# Historical fixture\n\nRead-only document history.\n');
const project={id:'b'.repeat(24),label:'Disposable Quiet Workspace fixtures',workspace:root,specs,wiki,available:true,wikiAvailable:true,specsAvailable:true};
const ui=await startProjects(()=>[project]); const room=await startRoom(roomFixture.dir);
const result={root,library:ui.url+'projects/'+project.id+'/library/',room:room.url,session:opened.session,fixtures:Object.fromEntries(Object.entries(paths).map(([name,f])=>[name,{path:f.path,phase:workflowGate(f.doc,f.path).phase}]))};
writeFileSync(join(root,'fixture-metadata.json'),JSON.stringify(result)); console.log(JSON.stringify(result));
process.on('SIGTERM',async()=>{await ui.close();await room.close();process.exit(0)});
`;
if (process.argv.includes("--audit-rendered")) {
  const require = createRequire(import.meta.url);
  const toolRoot =
    process.env.QUIET_WORKSPACE_TOOL_ROOT ||
    "/tmp/quiet-workspace-a11y/node_modules";
  const { HtmlValidate } = require(join(toolRoot, "html-validate"));
  const { JSDOM } = require(join(workspace, "node_modules/jsdom"));
  const validator = new HtmlValidate({
    extends: ["html-validate:recommended"],
    rules: {
      "no-inline-style": "off",
      "prefer-native-element": "off",
      "no-trailing-whitespace": "off",
      "void-style": "off",
      "doctype-style": "off",
      "attribute-empty-style": "off",
      "attribute-boolean-style": "off",
    },
  });
  const axeSource = readFileSync(join(toolRoot, "axe-core/axe.min.js"), "utf8");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const reports = [];
  for (const state of ["library", "feedback", "room"]) {
    const html = readFileSync(
      join(tmpdir(), "quiet-workspace-" + state + ".html"),
      "utf8",
    ).replace(/<div id="codex-browser-sidebar-comments-root"[^>]*><\/div>/, "");
    const validation = await validator.validateString(html);
    const dom = new JSDOM(html, { runScripts: "outside-only" });
    dom.window.eval(axeSource);
    const audit = await dom.window.axe.run(dom.window.document, {
      runOnly: {
        type: "tag",
        values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
      },
      rules: { "color-contrast": { enabled: false } },
    });
    reports.push({
      state,
      html_sha256: hash(html),
      html_valid: validation.valid,
      html_messages: validation.results.flatMap((r) => r.messages),
      axe_violations: audit.violations,
      axe_incomplete: audit.incomplete.map((r) => ({
        id: r.id,
        impact: r.impact,
      })),
      axe_passes: audit.passes.length,
    });
    dom.window.close();
  }
  manifest.accessibility = {
    tool:
      "axe-core " + require(join(toolRoot, "axe-core/package.json")).version,
    tags: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
    mode: "Rendered DOM exported through browser, audited in JSDOM",
    violations: reports.reduce((n, r) => n + r.axe_violations.length, 0),
    reports,
    exceptions: [
      "JSDOM cannot measure rendered color contrast. Token contrast and visible focus are measured separately.",
      "HTML validation permits existing inline styles/native-element legacy rules and DOM serialization styles; browser-owned comments overlay is removed.",
    ],
    unverified: [
      "Full WCAG 2.2 AA conformance",
      "2.4.11 Focus Not Obscured",
      "2.5.7 Dragging Movements",
      "3.2.6 Consistent Help",
      "3.3.7 Redundant Entry",
      "3.3.8 Accessible Authentication",
      "Screen reader and assistive technology interaction",
    ],
  };
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  console.log(
    JSON.stringify(
      reports.map((r) => ({
        state: r.state,
        html_valid: r.html_valid,
        axe_violations: r.axe_violations.length,
      })),
    ),
  );
  if (reports.some((r) => !r.html_valid || r.axe_violations.length))
    process.exitCode = 1;
} else if (process.argv.includes("--serve-fixtures")) {
  const source = join(runtime, "fixtures.mts");
  writeFileSync(source, fixtureSource);
  const child = spawn("pnpm", ["exec", "tsx", source], {
    cwd: workspace,
    stdio: "inherit",
  });
  process.on("SIGTERM", () => child.kill("SIGTERM"));
  child.on("exit", (code) => process.exit(code || 0));
} else {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  manifest.runs ||= [];
  const run = {
    at: new Date().toISOString(),
    head: spawnSync("git", ["rev-parse", "HEAD"], {
      cwd: repo,
      encoding: "utf8",
    }).stdout.trim(),
    commands: [],
  };
  manifest.runs.push(run);
  const persist = () =>
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  let failed = false;
  const required = ["approval-ux.test.ts", "approval-feedback-ux.test.ts"];
  for (const name of required)
    if (!existsSync(join(workspace, "packages/web/test", name)))
      throw Error("Missing required suite: " + name);
  const allowed =
    /^(treadle\/packages\/web\/(src\/(library\.(html|js)|page\.(html|js)|feedback\.js)|test\/(theme|library-skin|room-skin|workflow-ui|inspector|approval-ux|feedback-ui|room-keyboard|approval-feedback-ux)\.test\.ts)|specs\/quiet-workspace\/|wiki\/(systems\/owner-workflow\.md|initiatives\/(quiet-workspace|index)\.md|\.okf\/(fingerprints|last-index)\.json))/;
  const files = spawnSync(
    "git",
    ["diff", "--name-only", "2d22941c84a1362f5572e461753e29813386aadd"],
    { cwd: repo, encoding: "utf8" },
  )
    .stdout.trim()
    .split("\n")
    .filter(Boolean);
  run.changed_files = files;
  run.frontend_boundary = files.every((file) => allowed.test(file));
  if (!run.frontend_boundary)
    throw Error("Changes escaped frontend delivery allowlist");
  for (const file of [
    "library.html",
    "library.js",
    "page.html",
    "page.js",
    "feedback.js",
  ])
    if (!manifest.source_hashes?.["treadle/packages/web/src/" + file])
      throw Error("Missing rendered source hash: " + file);
  for (const [file, digest] of Object.entries(manifest.source_hashes || {}))
    if (hash(readFileSync(join(repo, file))) !== digest)
      throw Error("Rendered source drift: " + file);
  const requiredStates = [
    "library",
    "plan",
    "spec",
    "decisions",
    "rejected",
    "start",
    "implementation",
    "blocked",
    "review",
    "closure",
    "finish-confirmation",
    "delivered",
    "feedback",
    "feedback-draft",
    "feedback-stale",
    "feedback-conflict",
    "owner-conflict",
    "audit",
    "unavailable",
    "empty-feedback",
    "interview",
    "archived-history",
    "no-results",
  ];
  const currentStates = {
    plan: "plan-current",
    implementation: "implementation-current",
    blocked: "blocked-current",
    review: "review-current",
    unavailable: "unavailable-current",
  };
  for (const state of requiredStates)
    if (
      !manifest.captures?.some(
        (c) =>
          c.state === (currentStates[state] || state) &&
          !c.historical &&
          c.inspected &&
          c.png_base64 &&
          c.viewport &&
          c.observation,
      )
    )
      throw Error("Missing inspected render: " + state);
  for (const capture of manifest.captures)
    if (hash(Buffer.from(capture.png_base64, "base64")) !== capture.sha256)
      throw Error("Capture digest mismatch: " + capture.state);
  if (
    !manifest.captures.some((c) => c.theme === "dark") ||
    !manifest.captures.some((c) => c.viewport.width <= 390) ||
    !manifest.captures.some((c) => c.viewport.width >= 1280)
  )
    throw Error("Missing theme/viewport coverage");
  if (
    manifest.accessibility?.violations !== 0 ||
    manifest.accessibility?.reports?.length !== 3 ||
    manifest.accessibility.reports.some((report) => !report.html_valid) ||
    manifest.asset_observations?.length !== 3 ||
    manifest.asset_observations.some((asset) => !asset.source_matches) ||
    !manifest.manual?.targets_pass ||
    !manifest.manual?.focus_pass
  )
    throw Error("Incomplete accessibility evidence");
  const commands = [
    ["check", ["check"]],
    ["coverage", ["coverage"]],
    ["corpus", ["corpus:check"]],
    ["brand", ["brand:check"]],
    ["audit", ["audit:prod"]],
    ["links", ["links"]],
    [
      "fingerprints",
      [
        "exec",
        "tsx",
        "packages/cli/src/main.ts",
        "know",
        "fingerprints",
        "..",
        "../wiki",
      ],
    ],
    [
      "stamp",
      [
        "exec",
        "tsx",
        "packages/cli/src/main.ts",
        "know",
        "stamp",
        "../wiki",
        "--workspace",
        "..",
      ],
    ],
    [
      "anchors",
      [
        "exec",
        "tsx",
        "packages/cli/src/main.ts",
        "know",
        "anchors",
        "../wiki",
        "--workspace",
        "..",
      ],
    ],
    [
      "validate",
      [
        "exec",
        "tsx",
        "packages/cli/src/main.ts",
        "know",
        "validate",
        "../wiki",
      ],
    ],
    [
      "status",
      [
        "exec",
        "tsx",
        "packages/cli/src/main.ts",
        "know",
        "status",
        "../wiki",
        "--workspace",
        "..",
      ],
    ],
  ];
  for (const [name, args] of commands) {
    console.log("Running " + name);
    const result = spawnSync("pnpm", args, {
      cwd: workspace,
      encoding: "utf8",
      maxBuffer: 32 * 1024 * 1024,
    });
    const log = (result.stdout || "") + (result.stderr || "");
    const entry = {
      name,
      cmd: "pnpm " + args.join(" "),
      exit: result.status,
      log,
      sha256: hash(log),
    };
    run.commands.push(entry);
    writeFileSync(join(runtime, name + ".log"), log);
    persist();
    console.log(name + " exit " + result.status);
    const healthFailed =
      (name === "validate" &&
        !/conformant: 0 error\(s\), 0 warning\(s\)/.test(log)) ||
      (name === "anchors" &&
        !/anchors: \d+ checked, 0 need review/.test(log)) ||
      (name === "status" &&
        (!/freshness: fresh/.test(log) ||
          !/conformance: 0 error\(s\), 0 warning\(s\)/.test(log) ||
          !/anchors: \d+ checked, 0 need review/.test(log)));
    entry.health_pass = !healthFailed;
    persist();
    if (result.status !== 0 || healthFailed) {
      failed = true;
      console.error(log.slice(-5000));
    }
  }
  run.exit = failed ? 1 : 0;
  persist();
  process.exitCode = run.exit;
}
