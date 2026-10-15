import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { liveLeases, removeLease, writeLease } from '../src/index.js';

let dir: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'leases-'));
  process.env['HARNESS_LEASE_DIR'] = dir;
});
afterEach(() => {
  delete process.env['HARNESS_LEASE_DIR'];
  rmSync(dir, { recursive: true, force: true });
});

describe('session leases', () => {
  it('writes, lists and removes a lease', () => {
    writeLease('s1', { pid: process.pid });
    expect(liveLeases().map((l) => l.session)).toEqual(['s1']);
    removeLease('s1');
    expect(liveLeases()).toEqual([]);
  });
  it('drops a lease whose pid is dead', () => {
    writeLease('dead', { pid: 2 ** 22 + 12345 });
    expect(liveLeases()).toEqual([]);
  });
  it('keeps a pidless lease until its TTL passes', () => {
    const now = Date.now();
    writeLease('ttl', { ttlMs: 1000, nowMs: now });
    expect(liveLeases(now + 500)).toHaveLength(1);
    expect(liveLeases(now + 1500)).toEqual([]);
  });
  it('keeps several sessions independent', () => {
    writeLease('a', { pid: process.pid });
    writeLease('b', { pid: process.pid });
    removeLease('a');
    expect(liveLeases().map((l) => l.session)).toEqual(['b']);
  });
  it('is best-effort when the directory is unwritable', () => {
    writeFileSync(join(dir, 'file'), '');
    process.env['HARNESS_LEASE_DIR'] = join(dir, 'file', 'sub');
    expect(() => writeLease('s', { pid: process.pid })).not.toThrow();
    expect(liveLeases()).toEqual([]);
  });
  it('leaves no temp files after a write', () => {
    writeLease('s', { pid: process.pid });
    expect(readdirSync(dir).every((n) => n.endsWith('.json'))).toBe(true);
  });
});
