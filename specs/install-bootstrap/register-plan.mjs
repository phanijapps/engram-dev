import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { withPackLock, loadPackWithMeta, savePack } from '../../treadle/packages/core/dist/src/index.js';
const dir = dirname(fileURLToPath(import.meta.url));
const requirements = [
  'Root scripts-enabled frozen install and explicit setup delegate dependency installation and build to the existing nested workspace.',
  'Keep runtime workspace and deploy authority under treadle; retire root file dependencies and bundle metadata; preserve a usable local compiled CLI entry.',
  'Use pinned pnpm 9.15.9 through Corepack or a checked fallback, support native source paths with spaces, and propagate failures without later operations.',
  'Both source installers default to main and reuse shared setup, retaining ref overrides, branch protection, global link scope and actual failure exits.',
  'Copilot full project init and hooks-only cold-clone recovery materialize complete hooks without target dependency installation or weakening preservation guards.',
  'Document source setup versus project init, verify actual delivery and wiki health, obtain independent review, and prepare the PR handoff.',
];
const rootFiles = ['package.json', 'pnpm-lock.yaml', 'scripts/setup.mjs', 'bin/engram.js',
  'treadle/scripts/set-brand.mjs', 'treadle/packages/cli/test/source-setup.test.ts',
  'specs/install-bootstrap/verify-delivery.mjs'];
const installerFiles = ['install.sh', 'install.ps1',
  'treadle/packages/cli/test/installers.test.ts',
  'treadle/packages/cli/test/installers-powershell.test.ts',
  'scripts/setup.mjs', 'treadle/packages/cli/test/source-setup.test.ts'];
const initFiles = ['treadle/packages/cli/src/commands/init.ts',
  'treadle/packages/cli/src/harness/plan.ts', 'treadle/packages/cli/src/harness/apply.ts',
  'treadle/packages/cli/src/harness/manifest.ts',
  'treadle/packages/cli/harness/hooks/README.md',
  'treadle/packages/cli/harness/templates/AGENTS.md',
  'treadle/packages/cli/test/copilot-hooks.test.ts',
  'treadle/packages/cli/test/init-surfaces.test.ts', 'README.md',
  'wiki/project/setup.md', 'wiki/assets/guide/index.html'];
const context = (files) => ({ touch: [...new Set(files)].map((path) => ({ path })),
  read: ['AGENTS.md', 'AGENTS.backup.md', 'treadle/package.json', 'treadle/pnpm-lock.yaml',
    'treadle/pnpm-workspace.yaml', 'treadle/scripts/package-runtime.mjs',
    'treadle/packages/brand/src/brand.ts', 'treadle/packages/cli/harness/harness.json',
    'treadle/packages/cli/src/harness/agents-guide.ts', 'specs/install-paths/research.md',
    'specs/install-bootstrap/brief.md', 'specs/install-bootstrap/bug-source-setup.md',
    'specs/install-bootstrap/spec.md', 'specs/install-bootstrap/design.md',
    'specs/install-bootstrap/plan.md'].map((path) => ({ path, why: 'Bootstrap authority, preserved history, safeguards and exact proposal' })),
  wiki: ['project/setup', 'project/engineering-controls', 'systems/copilot-hooks'],
  notes: ['Run verification from treadle; application targets never install their own dependencies during init.',
    'Preserve owner closure receipts and unrelated edits. Do not edit approved proposal bytes.',
    'No nested lock regeneration, workspace relocation, host trust claim, cloud bootstrap or provider request.',
    'Use execution-log and actual command exits. Record native platform skips honestly.'] });
const result = withPackLock(dir, () => {
  const loaded = loadPackWithMeta(dir);
  if (!loaded.ok) throw Error(JSON.stringify(loaded));
  const { doc, path } = loaded.value;
  if (doc.revision !== 1 || doc.status === 'complete' || doc.workflow?.acts.length ||
      doc.workflow?.pending_audit.length || doc.tasks.length) throw Error('Only the untouched unapproved shell can be populated');
  doc.spec.requirements = requirements.map((text, index) => ({ id: `FR-${index + 1}`, text, priority: 'P1' }));
  doc.spec.out_of_scope = ['Workspace relocation', 'Root registry packaging', 'Dependency upgrades',
    'Provider authentication', 'Cloud agent runtime bootstrap', 'Automatic activation on clone',
    'Silent branch migration of existing source installations', 'Changing target application dependencies'];
  doc.plan.decisions = [
    { id: 'D-1', decision: 'Replace root file-package orchestration with a private source setup wrapper, matching root lockfile, shared nested setup and compiled local bin entry.',
      because: 'Clean probes confirm the boundary defect. Retain the one active workspace and portable deploy mechanism rather than relocating them. Retire unsupported future root bundle metadata. Reversible files.', status: 'proposed' },
    { id: 'D-2', decision: 'Default both source installers to main and reuse pinned shared setup with prerequisite checks, explicit ref overrides and branch mismatch refusal.',
      because: 'Merged code is the current source; one mechanism avoids shell drift. Existing other-branch checkouts remain protected rather than silently switched. Reversible script change.', status: 'proposed' },
    { id: 'D-3', decision: 'Retain generated per-machine hook scripts and runtime pointer; prove and explain full project init and hooks-only cold-clone recovery.',
      because: 'Clones retain portable host definitions but cannot inherit executable paths from another machine. Current manifest already provides local materialization. Preserve existing foreign-file and backup rules.', status: 'proposed' },
  ];
  doc.plan.approach = 'Thin root setup wrapper and one pinned source bootstrap; explicit per-machine project init with cold-clone regression coverage.';
  doc.plan.designs = [
    { id: 'DES-1', title: 'Root source setup interface', kind: 'component', addresses: ['FR-1', 'FR-2', 'FR-3'], detail: 'Private root manifest/lock and Node setup helper retain the nested workspace and compiled entry.' },
    { id: 'DES-2', title: 'Pinned shared installer bootstrap', kind: 'mechanism', addresses: ['FR-3', 'FR-4'], detail: 'Shared helper, native process invocation and main defaults preserve branch and exit guards.' },
    { id: 'DES-3', title: 'Cold-clone Copilot initialization', kind: 'mechanism', addresses: ['FR-5', 'FR-6'], detail: 'Use manifest-owned payloads and pointer without target package install; preserve config/guide bytes and explain next steps.' },
    { id: 'DES-4', title: 'Real lifecycle and delivery verification', kind: 'mechanism', addresses: requirements.map((_, i) => `FR-${i + 1}`), detail: 'Real clean root install/build, lock hash comparison, packaging, six gates, wiki health and independent review.' },
  ];
  doc.tasks = [
    { id: 'T-1', title: 'Repair root source installation and setup entry', status: 'todo', phase: 'core', needs: [],
      implements: ['DES-1', 'DES-2'], satisfies: ['FR-1', 'FR-2', 'FR-3'], requires_decisions: ['D-1'],
      detail: 'Implement root manifest/lock, shared pinned helper and local compiled bin. Test resolution, lifecycle delegation, native argument paths, failure exits and missing assets. Author real delivery verifier; do not claim its unrun results.',
      verify: { cmd: 'pnpm exec vitest run packages/cli/test/source-setup.test.ts', expect: 'Root frozen resolution, setup order/version, paths with spaces, failed install/build and entry behavior pass.' }, context: context(rootFiles) },
    { id: 'T-2', title: 'Unify shell and PowerShell installers on current merged source', status: 'todo', phase: 'integration', needs: ['T-1'],
      implements: ['DES-2'], satisfies: ['FR-3', 'FR-4'], requires_decisions: ['D-2'],
      detail: 'Route both installers through shared setup, default to main, validate prerequisites before Git mutation and retain overrides/branch protection/link/verify exit behavior. Preserve foreign existing checkouts.',
      verify: { cmd: 'pnpm exec vitest run packages/cli/test/installers.test.ts packages/cli/test/installers-powershell.test.ts packages/cli/test/source-setup.test.ts', expect: 'Correct default/ref/cwd, shared setup, protected branches and failure short-circuits pass on available native platforms; skips remain explicit.' }, context: context(installerFiles) },
    { id: 'T-3', title: 'Verify and explain Copilot cold-clone initialization', status: 'todo', phase: 'integration', needs: ['T-2'],
      implements: ['DES-3'], satisfies: ['FR-5', 'FR-6'], requires_decisions: ['D-3'],
      detail: 'Test complete full and hooks-only materialization when config exists but local ownership/payloads do not. Run copied commands against a controlled runtime. Preserve target dependency files, foreign config and guide backups. Add truthful setup/reload guidance; repair only demonstrated init defects within listed files.',
      verify: { cmd: 'pnpm exec vitest run packages/cli/test/copilot-hooks.test.ts packages/cli/test/init-surfaces.test.ts packages/cli/test/source-setup.test.ts', expect: 'Cold clone creates wrapper/helper/pointer/config, commands execute, dry-run is read-only and target manifests/lock/foreign/guide bytes stay preserved.' }, context: context([...initFiles, 'treadle/packages/cli/test/source-setup.test.ts']) },
    { id: 'T-4', title: 'Verify clean source lifecycle and independent delivery', status: 'todo', phase: 'integration', needs: ['T-3'],
      implements: ['DES-4'], satisfies: requirements.map((_, i) => `FR-${i + 1}`), requires_decisions: ['D-1', 'D-2', 'D-3'],
      detail: 'Run actual scripts-enabled frozen root install/build from a disposable snapshot of current scoped bytes and compare both lock hashes. Smoke compiled CLI/portable package and all six gates, refresh affected wiki under stated limits, obtain independent current-digest review, and prepare PR publication. Owner Finish stays separate.',
      verify: { cmd: 'node ../specs/install-bootstrap/verify-delivery.mjs', expect: 'Real root lifecycle, exact lock stability, compiled CLI/packaging, repository gates/coverage and wiki health pass; raw commands and failures retained.' },
      context: context([...rootFiles, ...installerFiles, ...initFiles, 'wiki/.okf/fingerprints.json', 'wiki/.okf/last-index.json']) },
  ];
  doc.artifacts = {};
  for (const [key, file] of Object.entries({ brief: 'brief.md', analysis: 'bug-source-setup.md', spec: 'spec.md', design: 'design.md', plan: 'plan.md' })) {
    doc.artifacts[key] = { file, type: 'text/markdown', sha256: createHash('sha256').update(readFileSync(join(dir, file))).digest('hex') };
  }
  doc.revision = 2;
  const saved = savePack(doc, path, { at: new Date().toISOString() });
  if (saved?.audit_pending || saved?.durability_error) throw Error(JSON.stringify(saved));
  return { revision: doc.revision, tasks: doc.tasks.map((task) => task.id), decisions: doc.plan.decisions.map((decision) => decision.id), owner_start: 'not recorded' };
});
if (!result.ok) throw Error(JSON.stringify(result));
console.log(JSON.stringify(result.value, null, 2));
