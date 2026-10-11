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
            .replace('src="/app.js"', `src="${base}/app.js"`)
            .replace('src="/marked.min.js"', `src="${base}/marked.min.js"`),
        );
        return;
      }
      const chunks: Buffer[] = [];
      let size = 0;
      for await (const chunk of req) {
        size += (chunk as Buffer).length;
        if (size > 65536) throw denied(413, 'Request too large');
        chunks.push(chunk as Buffer);
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
