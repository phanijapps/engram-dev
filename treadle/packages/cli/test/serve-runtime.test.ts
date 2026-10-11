import { describe, it, expect, afterEach, vi } from 'vitest';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir, hostname } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { createServer, request } from 'node:http';
import { brand } from '@treadle/brand';
import {
  ensureService,
  stopService,
  runService,
  control,
  serviceStatus,
  readDescriptor,
  publicStatus,
  atomicJSON,
  stateDirectory,
} from '../src/serve/runtime.js';
const disappearing = vi.hoisted(() => ({ path: '' }));
vi.mock('node:fs', async (original) => {
  const fs = await original<typeof import('node:fs')>();
  return {
    ...fs,
    readFileSync: (...args: Parameters<typeof fs.readFileSync>) => {
      if (args[0] === disappearing.path) {
        disappearing.path = '';
        fs.rmSync(args[0]);
      }
      return fs.readFileSync(...args);
    },
  };
});
const dirs: string[] = [],
  closers: (() => Promise<void>)[] = [];
function scratch() {
  const dir = mkdtempSync(join(tmpdir(), 'service-test-'));
  dirs.push(dir);
  return dir;
}
afterEach(async () => {
  disappearing.path = '';
  for (const close of closers.splice(0)) await close();
  for (const dir of dirs.splice(0)) {
    await stopService(dir).catch(() => {});
    rmSync(dir, { recursive: true, force: true });
  }
});
describe('shared service lifecycle', () => {
  it('keeps the default storage identity independent of the public CLI name', () => {
    const previous = process.env.HARNESS_STATE_DIR;
    delete process.env.HARNESS_STATE_DIR;
    try {
      expect(stateDirectory().endsWith(brand.stateDirectory)).toBe(true);
      expect(stateDirectory().endsWith(brand.binName)).toBe(false);
    } finally {
      if (previous !== undefined) process.env.HARNESS_STATE_DIR = previous;
    }
  });
  it('treats descriptor removal between stat and read as stopped', () => {
    const dir = scratch();
    const path = join(dir, 'service.json');
    writeFileSync(path, '{}');
    disappearing.path = path;
    expect(readDescriptor(dir)).toBeNull();
    expect(readDescriptor(dir)).toBeNull();
    writeFileSync(path, '{}');
    expect(() => readDescriptor(dir)).toThrow('Incompatible');
  });
  it('cold-starts once across callers, survives parent command and restarts after stop', async () => {
    const dir = scratch();
    const all = await Promise.all(Array.from({ length: 5 }, () => ensureService({ dir, port: 0 })));
    expect(new Set(all.map((d) => d.instance)).size).toBe(1);
    expect(all[0]!.pid).not.toBe(process.pid);
    expect((await serviceStatus(dir)).state).toBe('running');
    expect(JSON.stringify(publicStatus(all[0]!))).not.toContain(all[0]!.token);
    expect(await stopService(dir)).toBe(true);
    expect(readDescriptor(dir)).toBeNull();
    expect((await ensureService({ dir, port: 0 })).instance).not.toBe(all[0]!.instance);
  }, 30000);
  it('requires exact Host, token and absent Origin, including Unicode credentials', async () => {
    const { descriptor: d, close } = await runService({ dir: scratch(), port: 0 });
    closers.push(close);
    expect((await control(d, '/health'))['ok']).toBe(true);
    for (const headers of [
      {},
      { Authorization: `Bearer ${d.token}`, Origin: new URL(d.url).origin },
      { Authorization: `Bearer ${d.token}`, Host: 'foreign.test' },
      { Authorization: 'é'.repeat(71) },
    ]) {
      const status = await new Promise<number>((done, reject) => {
        const req = request(new URL('health', d.controlURL), { headers }, (res) => {
          res.resume();
          done(res.statusCode!);
        });
        req.on('error', reject);
        req.end();
      });
      expect(status).toBe(403);
    }
    expect(
      (
        await fetch(new URL('shutdown', d.controlURL), {
          method: 'POST',
          headers: { Authorization: `Bearer ${d.token}`, 'Content-Type': 'text/plain' },
          body: '{}',
        })
      ).status,
    ).toBe(415);
    expect((await control(d, '/health'))['ok']).toBe(true);
    await expect(control(d, '/unknown', {})).rejects.toThrow('No such control');
  });
  it('never stops or overwrites an unverified live PID or malformed descriptor', async () => {
    const dir = scratch();
    const d = {
      format: 'service/1',
      protocol: 1,
      pid: process.pid,
      host: hostname(),
      instance: randomUUID(),
      token: 'a'.repeat(64),
      controlURL: 'http://127.0.0.1:1/',
      url: 'http://127.0.0.1:2/',
    };
    atomicJSON(join(dir, 'service.json'), d);
    await expect(stopService(dir)).rejects.toThrow('unverified');
    await expect(ensureService({ dir, timeout: 200 })).rejects.toThrow('identity');
    expect(readDescriptor(dir)?.pid).toBe(process.pid);
    atomicJSON(join(dir, 'service.json'), { ...d, protocol: 2 });
    await expect(ensureService({ dir })).rejects.toThrow('Incompatible');
  });
  it('refuses a live or incomplete startup lock rather than expiring it', async () => {
    const dir = scratch();
    mkdirSync(join(dir, 'starting'));
    writeFileSync(
      join(dir, 'starting/owner.json'),
      JSON.stringify({ pid: process.pid, host: hostname(), token: 'live' }),
    );
    await expect(ensureService({ dir, timeout: 150 })).rejects.toThrow('lock');
    rmSync(join(dir, 'starting/owner.json'));
    await expect(ensureService({ dir, timeout: 150 })).rejects.toThrow('lock');
  });
  it('recovers proven dead startup and recovery owners; unfinished candidates hold no lock', async () => {
    const dir = scratch(),
      dead = spawnSync(process.execPath, ['-e', 'process.exit(0)']).pid;
    for (const name of ['starting', 'recovering']) {
      mkdirSync(join(dir, name));
      writeFileSync(
        join(dir, name, 'owner.json'),
        JSON.stringify({ pid: dead, host: hostname(), token: randomUUID() }),
      );
    }
    mkdirSync(join(dir, 'starting.unpublished.candidate'));
    expect((await ensureService({ dir, port: 0 })).protocol).toBe(1);
  });
  it('uses another UI port when the preferred one belongs to another app', async () => {
    const other = createServer((_req, res) => res.end('other'));
    await new Promise<void>((r) => other.listen(0, '127.0.0.1', r));
    closers.push(() => new Promise<void>((r) => other.close(() => r())));
    const port = (other.address() as { port: number }).port;
    const h = await runService({ dir: scratch(), port });
    closers.push(h.close);
    expect(new URL(h.descriptor.url).port).not.toBe(String(port));
    expect(await (await fetch(`http://127.0.0.1:${port}`)).text()).toBe('other');
  });
});
