import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { withPackLock, loadPackWithMeta, savePack } from '../../treadle/packages/core/dist/src/index.js';

const dir = dirname(fileURLToPath(import.meta.url));
const installerPaths = [
  'treadle/packages/cli/src/harness/agents-guide.ts',
  'treadle/packages/cli/src/harness/types.ts',
  'treadle/packages/cli/src/harness/plan.ts',
  'treadle/packages/cli/src/harness/apply.ts',
  'treadle/packages/cli/src/commands/init.ts',
  'treadle/packages/cli/harness/templates/AGENTS.md',
  'treadle/packages/cli/test/agents-guide.test.ts',
  'treadle/packages/cli/test/init-engine.test.ts',
  'treadle/packages/cli/test/init-surfaces.test.ts',
  'treadle/packages/cli/test/init-skin.test.ts',
  'treadle/packages/cli/test/copilot-hooks.test.ts',
  'AGENTS.md', 'AGENTS.backup.md',
];
const result = withPackLock(dir, () => {
  const loaded = loadPackWithMeta(dir);
  if (!loaded.ok) throw Error(JSON.stringify(loaded));
  const { doc, path } = loaded.value;
  if (doc.revision !== 2 || doc.status === 'complete' || doc.workflow?.acts.length ||
      doc.workflow?.pending_audit.length || doc.tasks.some((t) => t.status !== 'todo')) {
    throw Error('Only the unapproved held revision 2 proposal can be extended');
  }
  doc.spec.requirements.push(
    { id: 'FR-6', text: 'Full project init MUST create concise AGENTS.md with observed repository paths/commands, wiki retrieval, SDLC usage and preserved project-rule references.', priority: 'P1' },
    { id: 'FR-7', text: 'Before replacing existing AGENTS.md, init MUST preserve its exact bytes as AGENTS.backup.md and MUST NOT overwrite a prior differing backup.', priority: 'P1' },
    { id: 'FR-8', text: 'Guide/backup actions MUST be visible in dry-run/JSON, idempotent across surfaces, guarded against unsafe paths/source drift, and preserved during removal.', priority: 'P1' },
  );
  doc.spec.out_of_scope.push('LLM-generated repository policy', 'Executing project scripts during guide discovery',
    'Automatic backup rotation', 'Changing host instruction discovery behavior', 'Creating a wiki during initialization');
  doc.plan.decisions.push(
    { id: 'D-3', decision: 'Generate a concise project guide deterministically from a canonical template, observed manifest/path data, wiki commands and preserved project instructions.',
      because: 'Specific observed commands and links follow the requested guidance without inventing architecture or requiring an LLM/network. Reversible template/renderer change.', status: 'proposed' },
    { id: 'D-4', decision: 'Create the guide on full project init with opt-out; preserve byte-exact AGENTS.backup.md, refuse differing backup collisions even with force, and preserve both root documents on removal.',
      because: 'Avoid backup loss and repeated multi-host rotation; global/hooks-only operations retain their scope. Reversible with retained original bytes and explicit user action.', status: 'proposed' },
  );
  doc.plan.designs.push({ id: 'DES-4', title: 'Project-guide generation and backup lifecycle', kind: 'mechanism',
    addresses: ['FR-6', 'FR-7', 'FR-8'], detail: 'Use D-3/D-4 template, context discovery, truthful planning, input preflight and safe publication; preserve shared root documents outside ordinary removable outputs.' });
  const finalTask = doc.tasks.find((t) => t.id === 'T-3');
  if (!finalTask) throw Error('Missing delivery task');
  finalTask.needs = ['T-4'];
  finalTask.requires_decisions = [...finalTask.requires_decisions, 'D-3', 'D-4'];
  finalTask.detail += ' Include behavioral use of the generated guide/backup rules, installer guide tests, and updated installation documentation. Preserve new failure evidence.';
  const existing = new Set(finalTask.context.touch.map((e) => e.path));
  for (const path of [...installerPaths, 'wiki/assets/guide/index.html']) {
    if (!existing.has(path)) finalTask.context.touch.push({ path });
  }
  doc.tasks.splice(2, 0, { id: 'T-4', title: 'Generate and safely preserve project instructions at init',
    status: 'todo', phase: 'integration', needs: ['T-2'], implements: ['DES-4'], satisfies: ['FR-6', 'FR-7', 'FR-8'],
    requires_decisions: ['D-3', 'D-4'],
    detail: 'Implement canonical template/renderer and CLI integration. Plan/guard exact guide and backup bytes, reject unsafe paths/drift/collisions, and preserve root documents across hosts/removal. Test actual publication, failure, scope and idempotency before applying to this workspace.',
    verify: { cmd: 'pnpm exec vitest run packages/cli/test/agents-guide.test.ts packages/cli/test/init-engine.test.ts packages/cli/test/init-surfaces.test.ts packages/cli/test/copilot-hooks.test.ts',
      expect: 'Exact backup and safe replacement, dry-run/JSON no-write behavior, stale input/unsafe path/collision refusals, no script execution, repeat/multi-host/global/hooks-only/opt-out/remove cases pass.' },
    context: { touch: installerPaths.map((path) => ({ path })),
      read: ['treadle/packages/cli/src/harness/paths.ts', 'treadle/packages/cli/src/harness/manifest.ts',
        'treadle/packages/cli/harness/hooks/README.md', 'treadle/packages/brand/src/brand.ts',
        'specs/search-kb/examples/AGENTS.proposed.md'].map((path) => ({ path, why: 'Observed installer contracts, naming and owner-reviewable guide example' })),
      wiki: ['project/setup', 'domain/wiki-contract', 'project/documentation-map'],
      links: [{ url: 'https://www.betterclaw.io/blog/agents-md-best-practices', why: 'Owner-requested guide structure and writing constraints' }],
      notes: ['Use existing installer pipeline; no knowledge/server/hook protocol changes.',
        'Do not edit approved proposal artifacts. Checks, evaluations and execution-log record actual progress.',
        'Keep prior project instructions authoritative through the byte-exact backup; no agent owner actions.',
        'Use brand naming; do not hardcode this workspace architecture into portable output.'] },
  });
  for (const key of ['brief', 'analysis', 'spec', 'design', 'plan']) {
    doc.artifacts[`${key}_revision_2`] = { ...doc.artifacts[key] };
    const stem = key === 'analysis' ? 'feature' : key;
    const file = `${stem}-2026-10-12.md`;
    doc.artifacts[key] = { file, type: 'text/markdown',
      sha256: createHash('sha256').update(readFileSync(join(dir, file))).digest('hex') };
  }
  doc.artifacts.guide_preview = { file: 'examples/AGENTS.proposed.md', type: 'text/markdown',
    sha256: createHash('sha256').update(readFileSync(join(dir, 'examples/AGENTS.proposed.md'))).digest('hex') };
  doc.revision = 3;
  const saved = savePack(doc, path, { at: new Date().toISOString() });
  if (saved?.audit_pending || saved?.durability_error) throw Error(JSON.stringify(saved));
  return { path, revision: doc.revision, tasks: doc.tasks.map((t) => t.id), decisions: doc.plan.decisions.map((d) => d.id) };
});
if (!result.ok) throw Error(JSON.stringify(result));
console.log(JSON.stringify(result.value));
