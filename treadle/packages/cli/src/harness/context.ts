/** Read-only event context. Candidate tasks are never admitted by this reader. */
import { existsSync, realpathSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, relative, isAbsolute, sep } from 'node:path';
import {
  deriveStage,
  loadPackWithMeta,
  workflowGate,
  readFeedback,
  feedbackThreadState,
  FeedbackError,
} from '@treadle/core';
import { readFreshness } from '@treadle/knowledge';
import { serviceStatus, stateDirectory } from '../serve/runtime.js';
import { contained, listProjects, specsRoot } from '../serve/projects.js';
export async function context(workspace: string, dir = stateDirectory()) {
  const root = realpathSync(resolve(workspace));
  const wiki = contained(root, join(root, 'wiki')),
    specs = contained(root, specsRoot(root));
  const packs: Record<string, unknown>[] = [];
  if (existsSync(specs))
    for (const entry of readdirSync(specs, { withFileTypes: true })
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 512)) {
      if (!entry.isDirectory() || entry.name.startsWith('.') || entry.name === 'archive') continue;
      const packDir = contained(root, join(specs, entry.name));
      const files = readdirSync(packDir).filter((p) => p.endsWith('.json'));
      if (files.length !== 1 || statSync(join(packDir, files[0]!)).size > 2 * 1024 * 1024) {
        packs.push({
          name: entry.name,
          error: 'Missing, ambiguous or oversized spec JSON',
          stage: 'refused',
        });
        continue;
      }
      const jsonPath = realpathSync(join(packDir, files[0]!)),
        rel = relative(packDir, jsonPath);
      if (rel === '..' || rel.startsWith('..' + sep) || isAbsolute(rel)) {
        packs.push({
          name: entry.name,
          error: 'Spec JSON escaped its directory',
          stage: 'refused',
        });
        continue;
      }
      const loaded = loadPackWithMeta(packDir);
      if (!loaded.ok) {
        packs.push({ name: entry.name, error: loaded.message.slice(0, 300), stage: 'refused' });
        continue;
      }
      const { doc, path } = loaded.value,
        done = new Set(doc.tasks.filter((t) => t.status === 'done').map((t) => t.id));
      const candidate = doc.tasks.find(
        (t) => t.status === 'todo' && ((t['needs'] ?? []) as string[]).every((n) => done.has(n)),
      );
      let feedback: Record<string, unknown> | null = null;
      if (doc.format === 'specpack/0.4' && doc.workflow?.policy === 'owner-gated/1') {
        try {
          const ledger = readFeedback(packDir, root);
          if (ledger)
            feedback = {
              revision: ledger.revision,
              session_count: ledger.sessions.length,
              // Bounded identity/count hints only; bodies are read through the CLI.
              sessions: ledger.sessions.slice(-8).map((session) => {
                const threads = ledger.threads.filter((t) => t.session === session.id);
                const unresolved = threads.filter((t) => !feedbackThreadState(session, t).resolved);
                return {
                  id: session.id,
                  cursor: session.cursor,
                  latest_round: session.rounds.at(-1)?.id,
                  sealed: session.rounds.at(-1)?.sealed,
                  drafts: session.drafts.length,
                  unresolved: unresolved.length,
                  stale: unresolved.filter((t) => feedbackThreadState(session, t).stale).length,
                };
              }),
              omitted_sessions: Math.max(0, ledger.sessions.length - 8),
            };
        } catch (error) {
          feedback = {
            state: 'unavailable',
            code: error instanceof FeedbackError ? error.code : 'unavailable',
          };
        }
      }
      packs.push({
        feedback,
        name: doc.name,
        path: packDir,
        revision: doc.revision ?? 1,
        stage: deriveStage(doc),
        lifecycle: doc.status ?? 'active',
        workflow: doc.workflow
          ? workflowGate(doc, path)
          : { phase: 'legacy', note: 'Legacy pack retains its original admission rules' },
        doing: doc.tasks.filter((t) => t.status === 'doing').map((t) => t.id),
        candidate: candidate ? { id: candidate.id, admitted: false } : null,
        evidence: doc.tasks.flatMap((t) =>
          ((t['evidence'] ?? []) as Record<string, unknown>[])
            .slice(-1)
            .map((e) => ({ task: t.id, ...e })),
        ),
        openQuestions: (doc.spec.clarifications ?? [])
          .filter((q) => q.status === 'open')
          .map((q) => q.id),
      });
    }
  let project: unknown = null;
  let registryError: string | undefined;
  try {
    project = listProjects(dir).find((p) => p.workspace === root) ?? null;
  } catch (e) {
    registryError = (e as Error).message;
  }
  const open = packs.filter((p) => !['closed', 'delivered'].includes(String(p['stage'])));
  return {
    format: 'context/1',
    workspace: root,
    service: await serviceStatus(dir),
    project,
    ...(registryError ? { registryError } : {}),
    wiki: {
      root: wiki,
      available: existsSync(wiki),
      freshness: existsSync(wiki) ? readFreshness(wiki, root) : null,
      limit:
        'Freshness uses Git HEAD; the current fingerprint scanner covers Python only and does not establish dirty TypeScript/Markdown freshness.',
    },
    specs: { root: specs, available: existsSync(specs), packs, selectionRequired: open.length > 1 },
    guidance: {
      newSpec: 'do init <slug> --owner-gated (from the canonical specs root)',
      continueSpec:
        'Choose a spec if multiple are open. Read its core gate and current task handout before execution. Candidate next tasks are not admitted. Agents perform no owner actions.',
    },
  };
}
export function contextBlock(report: Awaited<ReturnType<typeof context>>): string {
  const lines = [
    `Workspace: ${report.workspace}`,
    `Service: ${report.service.state}`,
    `Knowledge: ${report.wiki.root} (${report.wiki.available ? 'available' : 'missing'})`,
    report.wiki.limit,
    `Specs: ${report.specs.root}`,
  ];
  for (const p of report.specs.packs)
    lines.push(
      `${p['name']}: ${p['stage']} | gate ${String((p['workflow'] as { phase?: string })?.phase ?? 'refused')} | doing ${JSON.stringify(p['doing'] ?? [])} | candidate (not admitted) ${JSON.stringify(p['candidate'] ?? null)}${p['error'] ? ' | ' + String(p['error']) : ''}${p['feedback'] ? ' | feedback (counts/IDs only) ' + JSON.stringify(p['feedback']) : ''}`,
    );
  if (report.specs.selectionRequired)
    lines.push('More than one spec is open. Ask which one to continue; never guess.');
  lines.push(report.guidance.newSpec, report.guidance.continueSpec);
  return lines.join('\n').slice(0, 24000);
}
