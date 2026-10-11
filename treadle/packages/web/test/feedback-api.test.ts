import { afterEach, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import {
  emitBytes,
  mutateFeedback,
  readFeedback,
  loadPackWithMeta,
  type PackDoc,
} from '@treadle/core';
import { startProjects, type ProjectSource } from '../src/project-server.js';
const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});
async function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'feedback-api-'));
  roots.push(root);
  const projects: ProjectSource[] = ['a', 'b'].map((name, i) => {
    const workspace = join(root, name),
      specs = join(workspace, 'specs'),
      wiki = join(workspace, 'wiki');
    mkdirSync(join(specs, 'same'), { recursive: true });
    mkdirSync(wiki);
    const pack: PackDoc = {
      name: 'same',
      format: 'specpack/0.4',
      revision: 1,
      spec: { requirements: [], clarifications: [] },
      plan: { decisions: [] },
      tasks: [],
      workflow: {
        policy: 'owner-gated/1',
        plan: 1,
        phase_questions: { spec: [] },
        acts: [],
        pending_audit: [],
      },
    };
    writeFileSync(join(specs, 'same/same.json'), emitBytes(pack));
    return {
      id: String(i + 1).repeat(24),
      label: name,
      workspace,
      specs,
      wiki,
      available: true,
      wikiAvailable: true,
      specsAvailable: true,
    };
  });
  const project = projects[0]!,
    dir = join(project.specs, 'same');
  const opened = mutateFeedback(dir, project.workspace, {
    by: 'agent:test',
    operation_id: randomUUID(),
    expected_revision: 0,
    action: {
      kind: 'open',
      selection: { mode: 'documents', paths: ['doc.md'], artifacts: [] },
      snapshots: [
        { key: 'doc.md', path: 'doc.md', before: null, after: '<script>bad()</script>\none\n' },
      ],
    },
  });
  const ui = await startProjects(() => projects),
    base = ui.url + `projects/${project.id}/library`;
  const token = /"ownerToken":"([a-f\d]+)"/.exec(await (await fetch(base + '/')).text())![1]!;
  const headers = {
    Origin: ui.url.slice(0, -1),
    'X-Owner-Token': token,
    'Content-Type': 'application/json',
  };
  const post = (kind: string, fields: object = {}, extra: object = {}) =>
    fetch(`${base}/feedback/same/${kind}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        by: 'human:test',
        operation_id: randomUUID(),
        expected_revision: readFeedback(dir, project.workspace)!.revision,
        session: opened.session,
        ...fields,
        ...extra,
      }),
    });
  return { root, projects, project, dir, opened, ui, base, headers, post };
}
it('isolates snapshots and records comments, submission retries and resolution without canonical writes', async () => {
  const f = await fixture();
  try {
    const canonical = readFileSync(join(f.dir, 'same.json'));
    const state = await (await fetch(f.base + '/feedback/same/state')).json();
    expect(state.format).toBe('feedback/1');
    expect(state.operations).toBeUndefined();
    const target = state.sessions[0].rounds[0].targets[0];
    const params = new URLSearchParams({
      session: f.opened.session,
      round: f.opened.round!,
      target: target.id,
      side: 'after',
    });
    const snapshot = await fetch(f.base + '/feedback/same/snapshot?' + params);
    expect(snapshot.headers.get('content-type')).toContain('text/plain');
    expect(snapshot.headers.get('x-content-type-options')).toBe('nosniff');
    expect(await snapshot.text()).toBe('<script>bad()</script>\none\n');
    expect(
      (
        await fetch(
          f.ui.url +
            `projects/${f.projects[1]!.id}/library/feedback/same/state?session=${f.opened.session}`,
        )
      ).status,
    ).toBe(404);
    expect(
      (
        await fetch(
          f.base + '/feedback/same/snapshot?' + params.toString().replace(target.id, randomUUID()),
        )
      ).status,
    ).toBe(404);
    const comment = await (
      await f.post('comment', {
        anchor: {
          round: f.opened.round,
          target: target.id,
          side: 'after',
          sha256: target.after.sha256,
          start: 2,
          end: 2,
        },
        body: 'Revise <img src=x>',
      })
    ).json();
    expect(comment.thread).toBeTruthy();
    const envelope = {
      operation_id: randomUUID(),
      expected_revision: readFeedback(f.dir, f.project.workspace)!.revision,
    };
    const submit = await (await f.post('submit', { round: f.opened.round }, envelope)).json();
    expect(submit.cursor).toBe(1);
    expect(await (await f.post('submit', { round: f.opened.round }, envelope)).json()).toEqual(
      submit,
    );
    expect(
      (await f.post('submit', { round: f.opened.round }, { expected_revision: 0 })).status,
    ).toBe(409);
    expect((await f.post('resolve', { thread: comment.thread })).status).toBe(200);
    expect((await (await fetch(f.base + '/feedback/same/state')).json()).threads[0].resolved).toBe(
      true,
    );
    expect(readFileSync(join(f.dir, 'same.json'))).toEqual(canonical);
  } finally {
    await f.ui.close();
  }
});
it('rejects CSRF, role escalation, malformed anchors, oversized input and path escapes', async () => {
  const f = await fixture();
  try {
    for (const headers of [
      {},
      { ...f.headers, Origin: 'http://evil.test' },
      { ...f.headers, 'X-Owner-Token': 'wrong' },
    ])
      expect(
        (await fetch(f.base + '/feedback/same/submit', { method: 'POST', headers, body: '{}' }))
          .status,
      ).toBe(403);
    expect(
      (
        await fetch(f.base + '/feedback/same/submit', {
          method: 'POST',
          headers: { ...f.headers, 'Content-Type': 'text/plain' },
          body: '{}',
        })
      ).status,
    ).toBe(415);
    expect(
      (
        await f.post(
          'comment',
          { anchor: { round: f.opened.round }, body: 'x' },
          { by: 'agent:codex' },
        )
      ).status,
    ).toBe(403);
    for (const kind of ['open', 'round', 'reply', 'start', 'finish'])
      expect((await f.post(kind)).status).toBe(403);
    expect(
      (await f.post('comment', { anchor: { round: f.opened.round, start: 1, end: 1 }, body: 'x' }))
        .status,
    ).toBe(400);
    expect(
      (await f.post('comment', { anchor: { round: f.opened.round }, body: 'x'.repeat(8193) }))
        .status,
    ).toBe(413);
    expect(
      (await f.post('comment', { anchor: { round: f.opened.round }, body: 'x' }, { workflow: {} }))
        .status,
    ).toBe(400);
    expect(
      (
        await fetch(f.base + '/feedback/same/comment', {
          method: 'POST',
          headers: f.headers,
          body: 'x'.repeat(65537),
        })
      ).status,
    ).toBe(413);
    symlinkSync(f.dir, join(f.project.specs, 'escape'), 'dir');
    expect((await fetch(f.base + '/feedback/escape/state')).status).toBe(403);
    expect(readFeedback(f.dir, f.project.workspace)!.revision).toBe(1);
  } finally {
    await f.ui.close();
  }
});
it('retains closed history but rejects writes and leaves legacy packs unsupported', async () => {
  const f = await fixture();
  try {
    const path = join(f.dir, 'same.json'),
      loaded = loadPackWithMeta(f.dir);
    if (!loaded.ok) throw Error(loaded.message);
    const pack = loaded.value.doc;
    pack.status = 'complete';
    writeFileSync(path, emitBytes(pack));
    expect((await (await fetch(f.base + '/feedback/same/state')).json()).closed).toBe(true);
    expect((await f.post('submit', { round: f.opened.round })).status).toBe(409);
    pack.status = 'active';
    pack.format = 'specpack/0.3';
    delete pack.workflow;
    writeFileSync(path, emitBytes(pack));
    expect((await fetch(f.base + '/feedback/same/state')).status).toBe(409);
  } finally {
    await f.ui.close();
  }
});
