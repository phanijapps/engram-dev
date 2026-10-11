import {
  FeedbackError,
  feedbackContainedPath,
  readFeedback,
  readFeedbackSnapshot,
  mutateFeedback,
  feedbackThreadState,
  loadFeedbackPack,
  type FeedbackAction,
  type FeedbackAnchor,
} from '@treadle/core';
/** Shared browser surface. Trusted enrollment lives exclusively on the control listener. */
import { createServer } from 'node:http';
import { readFileSync, realpathSync } from 'node:fs';
import { join, relative, sep, isAbsolute } from 'node:path';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { buildIndex, search, toDict } from '@treadle/knowledge';
import { brand } from '@treadle/brand';
import {
  libraryHandler,
  readWebAsset,
  asset,
  SECURITY_HEADERS,
  type RoomHandle,
} from './servers.js';
export interface ProjectSource {
  id: string;
  label: string;
  workspace: string;
  wiki: string;
  specs: string;
  available: boolean;
  wikiAvailable: boolean;
  specsAvailable: boolean;
  error?: string;
}
const publicCID = (cid: string): boolean =>
  !cid.split('/').some((p) => p === '.okf' || p === 'archive' || p === '..' || p.startsWith('.'));
function denied(status: number, message: string): Error & { status: number } {
  return Object.assign(Error(message), { status });
}
export function startProjects(projects: () => ProjectSource[], port = 0): Promise<RoomHandle> {
  const ownerToken = randomBytes(32).toString('hex');
  let origin = '';
  const server = createServer(async (req, res) => {
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) res.setHeader(key, value);
    const json = (status: number, value: unknown): void => {
      res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      res.end(JSON.stringify(value));
    };
    try {
      if (!origin || req.headers.host !== new URL(origin).host)
        throw denied(403, 'Use the reported local service address');
      if (req.method !== 'GET' && req.method !== 'POST') throw denied(405, 'Use GET or POST');
      if (req.method === 'POST') {
        const supplied = Buffer.from(String(req.headers['x-owner-token'] ?? '')),
          expected = Buffer.from(ownerToken);
        if (
          req.headers.origin !== origin ||
          supplied.length !== expected.length ||
          !timingSafeEqual(supplied, expected)
        )
          throw denied(403, 'Use this page to record owner actions');
        if (!req.headers['content-type']?.startsWith('application/json'))
          throw denied(415, 'Send JSON');
      }
      const url = new URL(req.url ?? '/', origin);
      if (req.method === 'GET' && url.pathname === '/branding') {
        json(200, { name: brand.name, command: brand.binName });
        return;
      }
      if (req.method === 'GET' && url.pathname === '/')
        return asset(res, 'projects.html', 'text/html; charset=utf-8');
      if (req.method === 'GET' && url.pathname === '/projects.js')
        return asset(res, 'projects.js', 'text/javascript; charset=utf-8');
      if (req.method === 'GET' && url.pathname === '/marked.min.js')
        return asset(res, 'marked.min.js', 'text/javascript; charset=utf-8');
      if (req.method === 'GET' && url.pathname === '/projects') {
        json(200, projects());
        return;
      }
      const match = /^\/projects\/([a-f\d]{24})\/(library|wiki)(\/.*)?$/.exec(url.pathname);
      if (!match) throw denied(404, 'No such project route');
      const project = projects().find((p) => p.id === match[1]);
      if (!project) throw denied(404, 'Project is not enrolled');
      if (!project.available) throw denied(409, project.error ?? 'Project unavailable');
      // A fresh project view is required for every request, including missing roots created later.
      for (const root of [project.wiki, project.specs]) {
        try {
          const rel = relative(realpathSync(project.workspace), realpathSync(root));
          if (rel === '..' || rel.startsWith('..' + sep) || isAbsolute(rel))
            throw denied(403, 'Root escaped its project');
        } catch (e) {
          if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e;
        }
      }
      if (match[2] === 'wiki') {
        if (req.method !== 'GET') throw denied(405, 'Knowledge access is read-only');
        if (!project.wikiAvailable) throw denied(404, 'This project has no wiki');
        const index = buildIndex(project.wiki, { excludeDirectories: ['.okf', 'archive'] });
        const visible = { docs: index.docs.filter((d) => publicCID(d.cid)) };
        if (!match[3] || match[3] === '/') {
          json(200, toDict(visible));
          return;
        }
        if (match[3] === '/search') {
          json(200, search(visible, (url.searchParams.get('q') ?? '').slice(0, 200)));
          return;
        }
        if (match[3] === '/read') {
          const cid = url.searchParams.get('cid') ?? '';
          if (!publicCID(cid) || !visible.docs.some((d) => d.cid === cid))
            throw denied(404, 'No such concept');
          const root = realpathSync(project.wiki),
            path = realpathSync(join(root, cid + '.md'));
          const fileRelative = relative(root, path);
          if (
            fileRelative === '..' ||
            fileRelative.startsWith('..' + sep) ||
            isAbsolute(fileRelative)
          )
            throw denied(404, 'No such concept');
          res.writeHead(200, {
            'Content-Type': 'text/markdown; charset=utf-8',
            'Cache-Control': 'no-store',
          });
          res.end(readFileSync(path));
          return;
        }
        throw denied(404, 'No such knowledge route');
      }
      if (!project.specsAvailable) throw denied(404, 'This project has no specs');
      const base = `/projects/${project.id}/library`;
      if (req.method === 'GET' && (!match[3] || match[3] === '/')) {
        // Asset helper owns packaged/source asset resolution; collect no repository HTML as app code.
        const config = JSON.stringify({ base, ownerToken, safeMarkdown: true });
        const html = (await readWebAsset('library.html')).toString('utf8');
        res.writeHead(200, {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store',
        });
        res.end(
          html
            .replace('</head>', `<script>window.LIBRARY_CONFIG=${config}</script></head>`)
            .replace(
              '<script src="/app.js"></script>',
              `<script src="${base}/feedback.js"></script><script src="${base}/app.js"></script>`,
            )
            .replace('src="/marked.min.js"', `src="${base}/marked.min.js"`),
        );
        return;
      }
      if (req.method === 'GET' && match[3] === '/feedback.js')
        return asset(res, 'feedback.js', 'text/javascript; charset=utf-8');
      const chunks: Buffer[] = [];
      let size = 0;
      for await (const chunk of req) {
        size += (chunk as Buffer).length;
        if (size > 65536) throw denied(413, 'Request too large');
        chunks.push(chunk as Buffer);
      }
      const feedback = feedbackRoute(
        project,
        match[3] ?? '/',
        url.searchParams,
        req.method,
        Buffer.concat(chunks).toString('utf8'),
      );
      if (feedback) {
        if (feedback.text) {
          res.writeHead(feedback.status, {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-store',
          });
          res.end(String(feedback.body));
        } else json(feedback.status, feedback.body);
        return;
      }
      req.url = (match[3] ?? '/') + url.search;
      await libraryHandler(project.specs)(req, res, Buffer.concat(chunks).toString('utf8'));
    } catch (e) {
      json((e as { status?: number }).status ?? 500, { error: (e as Error).message });
    }
  });
  return new Promise((done, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => {
      server.removeListener('error', reject);
      const address = server.address();
      if (!address || typeof address === 'string') return reject(Error('No browser address'));
      origin = `http://127.0.0.1:${address.port}`;
      done({ url: origin + '/', close: () => new Promise<void>((r) => server.close(() => r())) });
    });
  });
}

interface FeedbackResponse {
  status: number;
  body: unknown;
  text?: boolean;
}
const object = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === 'object' && !Array.isArray(v);
function invalid(message: string): never {
  throw new FeedbackError('invalid', message);
}
function strings(body: Record<string, unknown>, key: string): string {
  const value = body[key];
  if (typeof value !== 'string') invalid(`Missing text field: ${key}`);
  return value;
}
function anchor(value: unknown): FeedbackAnchor {
  if (
    !object(value) ||
    Object.keys(value).some(
      (key) => !['round', 'target', 'side', 'sha256', 'start', 'end', 'quote'].includes(key),
    )
  )
    invalid('Malformed anchor');
  return value as unknown as FeedbackAnchor;
}
function action(kind: string, body: Record<string, unknown>): FeedbackAction {
  const session = strings(body, 'session');
  const fields: Record<string, string[]> = {
    comment: ['anchor', 'body'],
    submit: ['round'],
    resolve: ['thread'],
    reattach: ['thread', 'anchor'],
  };
  if (
    Object.keys(body).some(
      (key) =>
        !['session', 'by', 'operation_id', 'expected_revision', ...(fields[kind] ?? [])].includes(
          key,
        ),
    )
  )
    invalid('Unexpected feedback fields');
  switch (kind) {
    case 'comment':
      return { kind, session, anchor: anchor(body['anchor']), body: strings(body, 'body') };
    case 'submit':
      return { kind, session, round: strings(body, 'round') };
    case 'resolve':
      return { kind, session, thread: strings(body, 'thread') };
    case 'reattach':
      return { kind, session, thread: strings(body, 'thread'), anchor: anchor(body['anchor']) };
    default:
      throw new FeedbackError(
        'forbidden',
        'Agent actions are available only through the local CLI',
      );
  }
}
export function feedbackRoute(
  project: ProjectSource,
  path: string,
  query: URLSearchParams,
  method: string,
  bodyText: string,
): FeedbackResponse | undefined {
  if (!path.startsWith('/feedback/')) return;
  try {
    const match = /^\/feedback\/([A-Za-z0-9][A-Za-z0-9_.-]*)\/([a-z]+)$/.exec(path);
    if (!match || match[1] === 'archive')
      throw new FeedbackError('missing', 'No such feedback route');
    const dir = feedbackContainedPath(project.workspace, `${project.specs}/${match[1]}`);
    const loaded = loadFeedbackPack(dir, project.workspace);
    if (!loaded.ok) throw new FeedbackError('missing', 'No such spec');
    const kind = match[2]!;
    if (method === 'GET') {
      if (kind === 'snapshot')
        return {
          status: 200,
          text: true,
          body: readFeedbackSnapshot(
            dir,
            project.workspace,
            query.get('session') ?? '',
            query.get('round') ?? '',
            query.get('target') ?? '',
            query.get('side') ?? '',
          ),
        };
      if (kind !== 'state') throw new FeedbackError('missing', 'No such feedback read route');
      const state = readFeedback(dir, project.workspace);
      const id = query.get('session');
      if (id && !state?.sessions.some((s) => s.id === id))
        throw new FeedbackError('missing', 'Unknown feedback session');
      const sessions = (state?.sessions ?? []).filter((s) => !id || s.id === id);
      const ids = new Set(sessions.map((s) => s.id));
      const threads = (state?.threads ?? [])
        .filter((t) => ids.has(t.session))
        .map((t) => ({
          ...t,
          ...feedbackThreadState(
            sessions.find((s) => s.id === t.session)!,
            t,
          ),
        }));
      return {
        status: 200,
        body: {
          format: 'feedback/1',
          project: project.id,
          pack_id: loaded.value.doc.id ?? loaded.value.doc.name,
          revision: state?.revision ?? 0,
          closed: loaded.value.doc.status === 'complete',
          sessions,
          threads,
          batches: (state?.batches ?? []).filter((b) => ids.has(b.session)),
        },
      };
    }
    if (!['comment', 'submit', 'resolve', 'reattach'].includes(kind))
      throw new FeedbackError(
        'forbidden',
        'Browser feedback cannot create rounds, reply as an agent, or record owner workflow acts',
      );
    let body: unknown;
    try {
      body = JSON.parse(bodyText);
    } catch {
      invalid('Send a JSON feedback object');
    }
    if (!object(body)) invalid('Send a JSON feedback object');
    if (typeof body['expected_revision'] !== 'number') invalid('Supply the held feedback revision');
    const result = mutateFeedback(dir, project.workspace, {
      operation_id: strings(body, 'operation_id'),
      expected_revision: body['expected_revision'],
      by: strings(body, 'by'),
      action: action(kind, body),
    });
    return { status: 200, body: { format: 'feedback/1', project: project.id, ...result } };
  } catch (error) {
    const code = error instanceof FeedbackError ? error.code : 'unavailable';
    const status = {
      invalid: 400,
      forbidden: 403,
      missing: 404,
      conflict: 409,
      bounds: 413,
      unavailable: 409,
    }[code];
    return {
      status,
      body: {
        format: 'feedback/1',
        error: error instanceof Error ? error.message : String(error),
        code,
      },
    };
  }
}
