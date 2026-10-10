/**
 * The two localhost surfaces, served from TypeScript over the TS core:
 * the interview room (one pack, block until approved) and the library
 * (every pack, standing). The pages are the engine's own portable assets —
 * vendored, engine-name-free by contract; admission runs through the same
 * machine rules the corpus proves. Refusals are 400 JSON, verbatim.
 */
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import {
  answerQuestion,
  approveSpec,
  deriveStage,
  loadPackWithMeta,
  savePack,
  writeEvent,
  eventsPath,
  type PackDoc,
} from '@treadle/core';

const WEB = new URL('.', import.meta.url).pathname;
const NAME_RE = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
const FILE_RE = /^[A-Za-z0-9][A-Za-z0-9._-]*\.md$/;

type Handler = (req: IncomingMessage, res: ServerResponse, body: string) => Promise<void>;

function denied(status: number, message: string): Error & { status: number } {
  return Object.assign(new Error(message), { status });
}

/** decode or refuse: malformed encodings are 404s, never 500s */
function decodeOr(path: string): string {
  try {
    return decodeURIComponent(path);
  } catch {
    return '\x00invalid';
  }
}

function json(res: ServerResponse, code: number, obj: unknown): void {
  const bytes = JSON.stringify(obj) + '\n';
  res.writeHead(code, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  res.end(bytes);
}

/** The security headers every surface speaks (R25): CSP pins the page to
 *  itself + inline config injection; no sniffing; same-origin framing only. */
const SECURITY_HEADERS: Record<string, string> = {
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'self'; base-uri 'none'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'no-referrer',
};

async function asset(res: ServerResponse, file: string, type: string): Promise<void> {
  try {
    const bytes = await readFile(join(WEB, file));
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store', ...SECURITY_HEADERS });
    res.end(bytes);
  } catch {
    json(res, 404, { ok: false, error: 'not found' });
  }
}

/** One event through machine admission — the only write path. */
async function admit(
  packDir: string,
  body: Record<string, unknown>,
): Promise<{ ok: true; revision: number }> {
  const by = typeof body['by'] === 'string' ? body['by'] : 'human:owner';
  const kind = String(body['kind'] ?? '');
  const q = typeof body['q'] === 'string' ? body['q'] : undefined;
  const text = typeof body['text'] === 'string' ? body['text'] : undefined;
  const option = typeof body['option'] === 'string' ? body['option'] : undefined;
  const at = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  const loaded = loadPackWithMeta(packDir);
  if (!loaded.ok) throw denied(400, loaded.message);
  const { doc, path } = loaded.value;
  if (kind === 'answer' || kind === 'unknown' || kind === 'choice') {
    const r = answerQuestion(doc, q ?? '', by, {
      text: kind === 'choice' ? (text ?? option) : text,
      unknown: kind === 'unknown',
      at,
    });
    if (!r.ok) throw denied(400, r.message);
    doc.revision = (doc.revision ?? 1) + 1;
  } else if (kind === 'approve') {
    const r = approveSpec(doc, by, { at });
    if (!r.ok) throw denied(400, r.message);
    doc.revision = (doc.revision ?? 1) + 1;
  } else {
    throw denied(
      400,
      `unknown event kind: '${kind}' (expected one of answer, unknown, choice, approve)`,
    );
  }
  savePack(doc, path, { at });
  writeEvent(eventsPath(packDir), {
    kind: kind as 'answer',
    by,
    at,
    ...(q !== undefined ? { q } : {}),
    ...(text !== undefined ? { text } : {}),
    ...(option !== undefined ? { option } : {}),
  });
  return { ok: true, revision: doc.revision! };
}

function makeServer(handler: Handler): Server {
  return createServer(async (req, res) => {
    const chunks: Buffer[] = [];
    for await (const c of req) chunks.push(c as Buffer);
    const body = Buffer.concat(chunks).toString('utf8');
    try {
      await handler(req, res, body);
    } catch (e) {
      const status = (e as { status?: number }).status ?? 500;
      json(res, status, { ok: false, error: (e as Error).message });
    }
  });
}

export interface RoomHandle {
  readonly url: string;
  close(): Promise<void>;
}

/** The interview room: one pack, the born-spec ceremony. */
export function startRoom(packDir: string, port = 0, owner = 'human:owner'): Promise<RoomHandle> {
  const server = makeServer(async (req, res, body) => {
    const url = req.url ?? '/';
    if (url === '/' || url === '/index.html') {
      const html = (await readFile(join(WEB, 'page.html'))).toString('utf8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', ...SECURITY_HEADERS });
      res.end(
        html.replace(
          '</head>',
          `<script>window.INTERVIEW_CONFIG = ${JSON.stringify({ by: owner })};</script>\n</head>`,
        ),
      );
      return;
    }
    if (url === '/app.js' || url === '/page.js')
      return asset(res, 'page.js', 'text/javascript; charset=utf-8');
    if (url === '/marked.min.js')
      return asset(res, 'marked.min.js', 'text/javascript; charset=utf-8');
    if (url === '/spec') {
      const loaded = loadPackWithMeta(packDir);
      if (!loaded.ok) throw denied(400, loaded.message);
      const { emit } = await import('@treadle/core');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(emit(loaded.value.doc), null, 2) + '\n');
      return;
    }
    if (url === '/event' && req.method === 'POST') {
      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(body || '{}');
      } catch {
        throw denied(400, 'the body is not JSON');
      }
      parsed['by'] = typeof parsed['by'] === 'string' && parsed['by'] ? parsed['by'] : owner;
      const out = await admit(packDir, parsed);
      json(res, 200, out);
      return;
    }
    json(res, 404, { ok: false, error: 'not found' });
  });
  return new Promise((resolveP) => {
    server.listen(port, '127.0.0.1', () => {
      const addr = server.address();
      const p = typeof addr === 'object' && addr ? addr.port : port;
      resolveP({
        url: `http://127.0.0.1:${p}/`,
        close: () => new Promise<void>((done) => server.close(() => done())),
      });
    });
  });
}

async function listSpecs(root: string): Promise<{ specs: unknown[]; legacy: unknown[] }> {
  const specs: Record<string, unknown>[] = [];
  const legacy: Record<string, unknown>[] = [];
  let entries: import('node:fs').Dirent[];
  try {
    entries = await readdir(root, { withFileTypes: true });
  } catch {
    return { specs, legacy };
  }
  for (const e of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (!e.isDirectory()) continue;
    const d = join(root, e.name);
    const loaded = loadPackWithMeta(d);
    if (!loaded.ok) {
      const files = (await readdir(d)).filter((f) => f.endsWith('.md')).sort();
      legacy.push({ name: e.name, title: e.name.replace(/-/g, ' '), files });
      continue;
    }
    const doc = loaded.value.doc;
    const qs = doc.spec.clarifications ?? [];
    specs.push({
      name: e.name,
      title: (doc.title ?? e.name).split('.')[0]!.slice(0, 100),
      stage: deriveStage(doc),
      revision: doc.revision ?? 1,
      lifecycle: doc.status ?? 'active',
      open_questions: qs.filter((q) => q.status === 'open').length,
      approved: Boolean(doc.approved_at),
      updated: doc.updated ?? doc.created ?? '',
      docs: (await readdir(d)).filter((f) => f.endsWith('.md')).sort(),
    });
  }
  return { specs, legacy };
}

/** The library: every pack under a root, standing. */
export function startLibrary(root: string, port = 0, owner = 'human:owner'): Promise<RoomHandle> {
  const server = makeServer(async (req, res, body) => {
    const url = req.url ?? '/';
    const path = url.split('?')[0]!;
    if (path === '/') return asset(res, 'library.html', 'text/html; charset=utf-8');
    if (path === '/app.js') return asset(res, 'library.js', 'text/javascript; charset=utf-8');
    if (path === '/marked.min.js')
      return asset(res, 'marked.min.js', 'text/javascript; charset=utf-8');
    if (path === '/specs') {
      json(res, 200, await listSpecs(root));
      return;
    }
    if (path.startsWith('/spec/')) {
      const name = decodeOr(path.slice('/spec/'.length));
      if (!NAME_RE.test(name)) throw denied(404, `no spec named '${name}'`);
      const loaded = loadPackWithMeta(join(root, name));
      if (!loaded.ok)
        throw denied(loaded.message.includes('no spec json') ? 404 : 400, loaded.message);
      const { emit } = await import('@treadle/core');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(emit(loaded.value.doc), null, 2) + '\n');
      return;
    }
    if (path.startsWith('/artifact/')) {
      const rest = path.slice('/artifact/'.length);
      const name = decodeOr(rest.split('/')[0] ?? '');
      const file = decodeOr(rest.split('/')[1] ?? '');
      if (!NAME_RE.test(name) || !FILE_RE.test(file)) throw denied(404, 'no such document');
      const f = resolve(join(root, name), file);
      const contained = f.startsWith(resolve(join(root, name)));
      if (!contained) throw denied(404, 'no such document');
      try {
        const bytes = await readFile(f);
        res.writeHead(200, { 'Content-Type': 'text/markdown; charset=utf-8' });
        res.end(bytes);
      } catch {
        json(res, 404, { ok: false, error: 'no such document' });
      }
      return;
    }
    if (path.startsWith('/event/') && req.method === 'POST') {
      const name = decodeOr(path.slice('/event/'.length));
      if (!NAME_RE.test(name)) throw denied(404, `no spec named '${name}'`);
      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(body || '{}');
      } catch {
        throw denied(400, 'the body is not JSON');
      }
      parsed['by'] = typeof parsed['by'] === 'string' && parsed['by'] ? parsed['by'] : owner;
      const out = await admit(join(root, name), parsed);
      json(res, 200, out);
      return;
    }
    json(res, 404, { ok: false, error: 'not found' });
  });
  return new Promise((resolveP) => {
    server.listen(port, '127.0.0.1', () => {
      const addr = server.address();
      const p = typeof addr === 'object' && addr ? addr.port : port;
      resolveP({
        url: `http://127.0.0.1:${p}/`,
        close: () => new Promise<void>((done) => server.close(() => done())),
      });
    });
  });
}

export type { PackDoc };
