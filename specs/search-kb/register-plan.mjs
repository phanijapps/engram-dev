import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { withPackLock, loadPackWithMeta, savePack } from '../../treadle/packages/core/dist/src/index.js';

const dir = dirname(fileURLToPath(import.meta.url));
const skill = 'treadle/packages/cli/harness/skills/sdlc/search-kb';
const skillFiles = ['SKILL.md', 'resources/okf-consumption.md', 'evals/cases.json', 'evals/rubric.md'];
const routing = ['analyze', 'plan', 'implement', 'review'].map(
  (name) => `treadle/packages/cli/harness/skills/sdlc/${name}/SKILL.md`,
);
const support = ['specs/search-kb/verify-skill.mjs', 'specs/search-kb/verify-delivery.mjs',
  'specs/search-kb/eval-support.mjs'];
const touch = (paths) => paths.map((path) => ({ path }));
const refs = [
  'AGENTS.md', 'wiki/assets/contracts/OKF_SPEC_v0.2.txt',
  'treadle/packages/cli/src/commands/know.ts',
  'treadle/packages/knowledge/src/search.ts', 'treadle/packages/knowledge/src/read.ts',
  'treadle/packages/knowledge/src/links.ts',
].map((path) => ({ path, why: 'Observed contract and existing runtime behavior' }));
const common = { read: refs, wiki: ['domain/wiki-contract', 'project/documentation-map'],
  commands: [{ cmd: 'node packages/cli/dist/src/main.js know search ../wiki "OKF"', expect_exit: 0 }],
  notes: ['Commands run from treadle unless explicitly stated. Read execution evidence before continuation.',
    'Evidence and execution logs live under specs/search-kb/checks and evaluations; never edit bound planning artifacts.',
    'Only file touch entries are machine-pinned; newly absent files remain unpinned until they exist.'] };

const result = withPackLock(dir, () => {
  const loaded = loadPackWithMeta(dir);
  if (!loaded.ok) throw Error(JSON.stringify(loaded));
  const { doc, path } = loaded.value;
  if (doc.revision !== 1 || doc.status === 'complete' || doc.tasks.length ||
      doc.workflow?.acts.length || doc.workflow?.pending_audit.length) {
    throw Error('Only the pristine held revision 1 proposal may be populated');
  }
  doc.spec.requirements = [
    ['FR-1', 'Discover the actual bundle and retrieve relevant concepts through the existing CLI or read-only Markdown fallback.'],
    ['FR-2', 'Consume OKF links, source attribution, lifecycle and advisory trust without inventing current facts or owner authority.'],
    ['FR-3', 'Return source-backed SDLC context, conflicts and gaps while preserving workspace bytes and owner gates.'],
    ['FR-4', 'Ship search-kb from the authoritative harness to all four surfaces and install it to the requested Copilot workspace.'],
    ['FR-5', 'Run actual behavioral evaluations, repository gates and independent review before raising the PR.'],
  ].map(([id, text]) => ({ id, text, priority: 'P1' }));
  doc.spec.out_of_scope = ['Knowledge runtime changes or new indexes', 'Remote search services',
    'Hook protocol changes or cloud bootstrap', 'Attested computation execution',
    'Owner acceptance, Start or Finish actions performed by agents', 'Automatic knowledge repair',
    'Other installed host skill refreshes'];
  doc.plan.decisions = [
    { id: 'D-1', decision: 'Use search-kb as a read-only consumer of the existing knowledge CLI with a Markdown fallback.',
      because: 'Existing retrieval is sufficient; adding runtime/index behavior expands the request. Reversible instruction change.', status: 'proposed' },
    { id: 'D-2', decision: 'Ship one shared skill to four surfaces, route relevant SDLC context to it, and validate it with blind behavioral fixtures.',
      because: 'Avoid host duplicates and mandatory work on unrelated steps; real evaluations establish behavior beyond wording checks. Reversible packaging/routing change.', status: 'proposed' },
  ];
  doc.plan.designs = [
    { id: 'DES-1', title: 'OKF retrieval and evidence interpretation', kind: 'flow', addresses: ['FR-1', 'FR-2', 'FR-3'], detail: 'Follow D-1 and design.md; report metadata, linked evidence, conflicts and gaps without mutations.' },
    { id: 'DES-2', title: 'Portable skill routing and installation', kind: 'component', addresses: ['FR-4'], detail: 'Register canonical manifest component, route selectively, and use existing installer guards.' },
    { id: 'DES-3', title: 'Behavioral evaluation and delivery evidence', kind: 'mechanism', addresses: ['FR-5'], detail: 'Blind isolated runs with command/output/hash evidence; repository gates, wiki checks and independent review precede PR.' },
  ];
  doc.tasks = [
    { id: 'T-1', title: 'Author the read-only OKF search skill and evaluation fixtures', status: 'todo', phase: 'core',
      needs: [], implements: ['DES-1'], satisfies: ['FR-1', 'FR-2', 'FR-3'], requires_decisions: ['D-1', 'D-2'],
      detail: 'Author concise entrypoint, focused interpretation reference, realistic case recipes and rubric. Add a structural verifier and isolated fixture support; do not claim behavioral results yet.',
      verify: { cmd: 'node ../specs/search-kb/verify-skill.mjs', expect: 'Skill frontmatter/validator and routed resources pass; fixtures materialize correctly; no behavioral success is inferred.' },
      context: { ...common, touch: touch([...skillFiles.map((f) => `${skill}/${f}`), ...support]) } },
    { id: 'T-2', title: 'Integrate SDLC routing and install the skill to Copilot', status: 'todo', phase: 'integration',
      needs: ['T-1'], implements: ['DES-2'], satisfies: ['FR-4'], requires_decisions: ['D-2'],
      detail: 'Add all four manifest destinations, selective source-first routing and real install/package tests. Refresh only Copilot project skills/agent/hooks through the installer; preserve foreign entries and other host customization.',
      verify: { cmd: 'pnpm exec vitest run packages/cli/test/search-kb-install.test.ts packages/cli/test/init-surfaces.test.ts packages/cli/test/harness-packages.test.ts', expect: 'Actual resources install, packages contain the skill, idempotency/conflict preservation pass and existing hooks remain intact.' },
      context: { ...common, touch: touch(['treadle/packages/cli/harness/harness.json', ...routing,
        'treadle/packages/cli/test/search-kb-install.test.ts', 'treadle/packages/cli/test/init-surfaces.test.ts',
        'treadle/packages/cli/test/harness-packages.test.ts', '.github/hooks/wukong.json', '.github/agents/red-forman.md',
        '.harness/hooks/copilot-context.js', '.harness/hooks/codex-context.js',
        ...skillFiles.map((f) => `.github/skills/search-kb/${f}`),
        ...['analyze', 'plan', 'implement', 'review'].map((name) => `.github/skills/${name}/SKILL.md`)]) } },
    { id: 'T-3', title: 'Evaluate behavior, verify delivery and prepare the PR', status: 'todo', phase: 'review',
      needs: ['T-2'], implements: ['DES-3'], satisfies: ['FR-5'], requires_decisions: ['D-1', 'D-2'],
      detail: 'Run blind independent evaluations in temporary workspaces, retain raw outputs and before/after hashes, score actual outcomes and repair demonstrated scoped defects. Run six gates and wiki checks; obtain independent review and raise/attach the PR. Owner Finish stays separate.',
      verify: { cmd: 'node ../specs/search-kb/verify-delivery.mjs', expect: 'Every declared case has actual evidence and passes all critical rubric gates; six repository gates and wiki validation/anchors/status pass; failures remain retained.' },
      context: { ...common, touch: touch([...skillFiles.map((f) => `${skill}/${f}`), ...support, ...routing,
        'treadle/packages/cli/test/search-kb-install.test.ts',
        'wiki/project/setup.md', 'wiki/domain/wiki-contract.md', 'wiki/.okf/fingerprints.json', 'wiki/.okf/last-index.json']),
        notes: [...common.notes, 'Independent evaluation and red-forman review delegation are authorized by the skill evaluation protocol and AGENTS.md. Do not give evaluators expected answers.'] } },
  ];
  doc.artifacts = Object.fromEntries(['brief', 'analysis', 'spec', 'design', 'plan'].map((key) => {
    const file = key === 'analysis' ? 'feature.md' : `${key}.md`;
    return [key, { file, type: 'text/markdown', sha256: createHash('sha256').update(readFileSync(join(dir, file))).digest('hex') }];
  }));
  doc.revision = 2;
  const saved = savePack(doc, path, { at: new Date().toISOString() });
  if (saved?.audit_pending || saved?.durability_error) throw Error(JSON.stringify(saved));
  return { path, revision: doc.revision, decisions: doc.plan.decisions.map((d) => d.id), tasks: doc.tasks.map((t) => t.id) };
});
if (!result.ok) throw Error(JSON.stringify(result));
console.log(JSON.stringify(result.value));
