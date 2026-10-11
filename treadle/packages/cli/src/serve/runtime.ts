/** Per-user service identity. No process is stopped by a descriptor PID. */
import { createServer, type Server, type IncomingMessage } from 'node:http';
import { randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { spawn, execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  renameSync,
  rmSync,
  chmodSync,
  lstatSync,
} from 'node:fs';
import { join, resolve } from 'node:path';
import { homedir, hostname } from 'node:os';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import { brand } from '@treadle/brand';

export interface ServiceDescriptor {
  format: 'service/1';
  protocol: 1;
  pid: number;
  host: string;
  instance: string;
  token: string;
  controlURL: string;
  url: string;
}
export interface ServiceOptions {
  dir?: string;
  port?: number;
  entry?: string;
  timeout?: number;
}
export type ControlHandler = (path: string, body: Record<string, unknown>) => unknown;

export function stateDirectory(): string {
  if (process.env['HARNESS_STATE_DIR']) return resolve(process.env['HARNESS_STATE_DIR']);
  const base =
    process.platform === 'win32'
      ? (process.env['LOCALAPPDATA'] ?? join(homedir(), 'AppData/Local'))
      : process.platform === 'darwin'
        ? join(homedir(), 'Library/Application Support')
        : (process.env['XDG_STATE_HOME'] ?? join(homedir(), '.local/state'));
  return join(base, brand.binName);
}
export function privateDirectory(dir: string): void {
  mkdirSync(dir, { recursive: true, mode: 0o700 });
  const stat = lstatSync(dir);
  if (
    !stat.isDirectory() ||
    stat.isSymbolicLink() ||
    (process.getuid && stat.uid !== process.getuid())
  )
    throw Error('Service state must be an owned directory');
  if (process.platform === 'win32') {
    const sid = execFileSync('whoami.exe', ['/user', '/fo', 'csv', '/nh'], {
      encoding: 'utf8',
    }).match(/S-1-[\d-]+/)?.[0];
    if (!sid) throw Error('Cannot determine service state owner');
    execFileSync('icacls.exe', [dir, '/inheritance:r', '/grant:r', `*${sid}:(OI)(CI)F`], {
      stdio: 'ignore',
    });
  } else chmodSync(dir, 0o700);
}
export function atomicJSON(path: string, value: unknown): void {
  const tmp = `${path}.${randomUUID()}.tmp`;
  try {
    writeFileSync(tmp, JSON.stringify(value) + '\n', { mode: 0o600, flag: 'wx' });
    renameSync(tmp, path);
  } finally {
    rmSync(tmp, { force: true });
  }
}
export function readDescriptor(dir = stateDirectory()): ServiceDescriptor | null {
  const path = join(dir, 'service.json');
  if (!existsSync(path)) return null;
  if (lstatSync(path).isSymbolicLink()) throw Error('Service descriptor may not be a symlink');
  const d = JSON.parse(readFileSync(path, 'utf8')) as ServiceDescriptor;
  if (
    d.format !== 'service/1' ||
    d.protocol !== 1 ||
    !Number.isSafeInteger(d.pid) ||
    d.pid <= 0 ||
    d.host !== hostname() ||
    !/^[a-f\d]{64}$/.test(d.token) ||
    !/^[\w-]{36}$/.test(d.instance)
  )
    throw Error('Incompatible or malformed service descriptor');
  for (const u of [d.url, d.controlURL]) {
    const parsed = new URL(u);
    if (
      parsed.protocol !== 'http:' ||
      parsed.hostname !== '127.0.0.1' ||
      !parsed.port ||
      parsed.username ||
      parsed.password ||
      parsed.pathname !== '/' ||
      parsed.search ||
      parsed.hash
    )
      throw Error('Invalid service address');
  }
  return d;
}
function alive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return (e as NodeJS.ErrnoException).code !== 'ESRCH';
  }
}
function eraseDescriptor(dir: string, instance: string): void {
  if (readDescriptor(dir)?.instance === instance)
    rmSync(join(dir, 'service.json'), { force: true });
}
export function publicStatus(
  d: ServiceDescriptor,
): Omit<ServiceDescriptor, 'token' | 'controlURL'> {
  return {
    format: d.format,
    protocol: d.protocol,
    pid: d.pid,
    host: d.host,
    instance: d.instance,
    url: d.url,
  };
}
export async function control(
  d: ServiceDescriptor,
  path: string,
  body?: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const r = await fetch(new URL(path, d.controlURL), {
    method: body ? 'POST' : 'GET',
    headers: {
      Authorization: `Bearer ${d.token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(2000),
  });
  const result = (await r.json()) as Record<string, unknown>;
  if (!r.ok) throw Error(String(result['error'] ?? 'Service control refused'));
  if (result['instance'] !== d.instance || result['protocol'] !== 1)
    throw Error('Service identity mismatch');
  return result;
}
async function healthy(d: ServiceDescriptor): Promise<boolean> {
  try {
    await control(d, '/health');
    return true;
  } catch {
    return false;
  }
}
export function runtimeEntry(): string {
  const candidates = [
    new URL('../main.js', import.meta.url),
    new URL('../../dist/src/main.js', import.meta.url),
  ];
  for (const u of candidates) if (existsSync(fileURLToPath(u))) return fileURLToPath(u);
  throw Error('Build or install the runtime before starting the service');
}
/** Publish a complete owner record atomically; a crash before publication leaves no held lock. */
function claimDirectory(
  path: string,
  owner: { pid: number; host: string; token: string },
): boolean {
  const candidate = `${path}.${owner.token}.candidate`;
  mkdirSync(candidate, { mode: 0o700 });
  try {
    writeFileSync(join(candidate, 'owner.json'), JSON.stringify(owner), {
      mode: 0o600,
      flag: 'wx',
    });
    if (existsSync(path)) return false;
    try {
      renameSync(candidate, path);
      return true;
    } catch (e) {
      if (
        existsSync(path) &&
        ['EEXIST', 'ENOTEMPTY', 'EPERM'].includes((e as NodeJS.ErrnoException).code ?? '')
      )
        return false;
      throw e;
    }
  } finally {
    rmSync(candidate, { recursive: true, force: true });
  }
}
export async function ensureService(options: ServiceOptions = {}): Promise<ServiceDescriptor> {
  const dir = options.dir ?? stateDirectory();
  privateDirectory(dir);
  const lock = join(dir, 'starting'),
    deadline = Date.now() + (options.timeout ?? 15000);
  while (Date.now() < deadline) {
    const existing = readDescriptor(dir);
    if (existing && (await healthy(existing))) return existing;
    if (existing && alive(existing.pid))
      throw Error(
        'Service identity cannot be verified while its process is alive; inspect status before retrying',
      );
    const token = randomUUID();
    const acquired = claimDirectory(lock, { pid: process.pid, host: hostname(), token });
    if (!acquired) {
      const ownerPath = join(lock, 'owner.json');
      if (existsSync(ownerPath)) {
        const owner = JSON.parse(readFileSync(ownerPath, 'utf8')) as {
          pid: number;
          host: string;
          token: string;
        };
        if (
          owner.host === hostname() &&
          Number.isSafeInteger(owner.pid) &&
          owner.pid > 0 &&
          !alive(owner.pid)
        ) {
          // Only one recovery claimant may remove the verified dead lock.
          const recovery = join(dir, 'recovering');
          const recoveryOwner = { pid: process.pid, host: hostname(), token: randomUUID() };
          let recovering = claimDirectory(recovery, recoveryOwner);
          if (!recovering) {
            const record = join(recovery, 'owner.json');
            if (!existsSync(record))
              throw Error('Recovery lock has no verifiable owner; inspect state before retrying');
            const bytes = readFileSync(record, 'utf8');
            const previous = JSON.parse(bytes) as { pid: number; host: string };
            if (
              previous.host === hostname() &&
              Number.isSafeInteger(previous.pid) &&
              previous.pid > 0 &&
              !alive(previous.pid) &&
              readFileSync(record, 'utf8') === bytes
            ) {
              rmSync(recovery, { recursive: true });
              recovering = claimDirectory(recovery, recoveryOwner);
            }
          }
          if (recovering)
            try {
              if (
                existsSync(ownerPath) &&
                readFileSync(ownerPath, 'utf8') === JSON.stringify(owner)
              )
                rmSync(lock, { recursive: true });
            } finally {
              rmSync(recovery, { recursive: true });
            }
        }
      }
      await delay(50);
      continue;
    }
    try {
      const second = readDescriptor(dir);
      if (second && (await healthy(second))) return second;
      if (second && alive(second.pid)) throw Error('Another live service cannot be verified');
      if (second) eraseDescriptor(dir, second.instance);
      const child = spawn(
        process.execPath,
        [options.entry ?? runtimeEntry(), '_serve', '--port', String(options.port ?? 8788)],
        {
          detached: true,
          stdio: 'ignore',
          windowsHide: true,
          env: { ...process.env, HARNESS_STATE_DIR: dir },
        },
      );
      let spawnError: Error | undefined;
      child.on('error', (e) => {
        spawnError = e;
      });
      child.unref();
      while (Date.now() < deadline) {
        if (spawnError) throw spawnError;
        const d = readDescriptor(dir);
        if (d && (await healthy(d))) return d;
        if (child.pid && !alive(child.pid))
          throw Error('Service startup failed; run the runtime foreground for diagnostics');
        await delay(50);
      }
      throw Error('Service startup timed out; inspect status before retrying');
    } finally {
      const own = join(lock, 'owner.json');
      if (
        existsSync(own) &&
        (JSON.parse(readFileSync(own, 'utf8')) as { token: string }).token === token
      )
        rmSync(lock, { recursive: true });
    }
  }
  throw Error('Service startup lock is held; inspect its owner before recovery');
}
export async function stopService(dir = stateDirectory()): Promise<boolean> {
  const d = readDescriptor(dir);
  if (!d) return false;
  if (!(await healthy(d))) {
    if (alive(d.pid)) throw Error('Refusing to stop an unverified live process');
    eraseDescriptor(dir, d.instance);
    return false;
  }
  await control(d, '/shutdown', {});
  const deadline = Date.now() + 5000;
  while (readDescriptor(dir)?.instance === d.instance && Date.now() < deadline) await delay(25);
  if (readDescriptor(dir)?.instance === d.instance)
    throw Error('Service did not acknowledge shutdown completion');
  return true;
}
export async function serviceStatus(
  dir = stateDirectory(),
): Promise<{ state: string; service?: ReturnType<typeof publicStatus> }> {
  let d: ServiceDescriptor | null;
  try {
    d = readDescriptor(dir);
  } catch {
    return { state: 'unavailable' };
  }
  return d
    ? { state: (await healthy(d)) ? 'running' : 'unavailable', service: publicStatus(d) }
    : { state: 'stopped' };
}
export async function requestBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  let size = 0;
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    size += (chunk as Buffer).length;
    if (size > 65536) throw Error('Request too large');
    chunks.push(chunk as Buffer);
  }
  const body: unknown = JSON.parse(Buffer.concat(chunks).toString() || '{}');
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw Error('Expected an object');
  return body as Record<string, unknown>;
}
function listen(server: Server, port: number): Promise<string> {
  return new Promise((done, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => {
      server.removeListener('error', reject);
      const a = server.address();
      if (!a || typeof a === 'string') return reject(Error('No service address'));
      done(`http://127.0.0.1:${a.port}/`);
    });
  });
}
export interface UIHandle {
  url: string;
  close(): Promise<void>;
}
export async function runService(
  options: ServiceOptions & {
    controlHandler?: ControlHandler;
    startUI?: (port: number) => Promise<UIHandle>;
  } = {},
): Promise<{ descriptor: ServiceDescriptor; close(): Promise<void> }> {
  const dir = options.dir ?? stateDirectory();
  privateDirectory(dir);
  const token = randomBytes(32).toString('hex'),
    instance = randomUUID();
  const startUI =
    options.startUI ??
    (async (port: number) => {
      const s = createServer((_req, res) => {
        res.setHeader('Content-Type', 'text/plain');
        res.end('Service ready. Connect a project to open its library.');
      });
      const url = await listen(s, port);
      return { url, close: () => new Promise<void>((r) => s.close(() => r())) };
    });
  let ui: UIHandle;
  try {
    ui = await startUI(options.port ?? 8788);
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== 'EADDRINUSE' || options.port === 0) throw e;
    ui = await startUI(0);
  }
  let descriptor: ServiceDescriptor,
    closed = false;
  const close = async (): Promise<void> => {
    if (closed) return;
    closed = true;
    await Promise.all([ui.close(), new Promise<void>((r) => server.close(() => r()))]);
    eraseDescriptor(dir, instance);
  };
  const server = createServer(async (req, res) => {
    const reply = (status: number, data: Record<string, unknown>): void => {
      res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      res.end(JSON.stringify({ ...data, instance, protocol: 1 }));
    };
    const auth = Buffer.from(req.headers.authorization ?? ''),
      expected = Buffer.from(`Bearer ${token}`);
    if (
      !descriptor ||
      req.headers.origin !== undefined ||
      req.headers.host !== new URL(descriptor.controlURL).host ||
      auth.length !== expected.length ||
      !timingSafeEqual(auth, expected)
    )
      return reply(403, { error: 'Control request refused' });
    try {
      if (req.url === '/health' && req.method === 'GET') return reply(200, { ok: true });
      if (req.url === '/shutdown' && req.method === 'POST') {
        if (!req.headers['content-type']?.startsWith('application/json'))
          return reply(415, { error: 'Send JSON' });
        await requestBody(req);
        res.once('finish', () => {
          void close();
        });
        return reply(200, { ok: true });
      }
      if (req.method !== 'POST' || !req.headers['content-type']?.startsWith('application/json'))
        return reply(404, { error: 'No such control operation' });
      const result = options.controlHandler?.(req.url ?? '', await requestBody(req));
      if (result === undefined) return reply(404, { error: 'No such control operation' });
      reply(200, { ok: true, result });
    } catch (e) {
      reply(400, { error: (e as Error).message });
    }
  });
  try {
    const controlURL = await listen(server, 0);
    descriptor = {
      format: 'service/1',
      protocol: 1,
      pid: process.pid,
      host: hostname(),
      instance,
      token,
      controlURL,
      url: ui.url,
    };
    atomicJSON(join(dir, 'service.json'), descriptor);
    return { descriptor, close };
  } catch (e) {
    await close();
    throw e;
  }
}
