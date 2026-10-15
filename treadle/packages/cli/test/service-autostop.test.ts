import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { writeLease, removeLease } from '@treadle/core';
import { runService, readDescriptor, ensureService } from '../src/serve/runtime.js';

const roots: string[] = [];
const closers: (() => Promise<void>)[] = [];
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const idle = { graceMs: 150, pollMs: 30 };

beforeEach(() => {
  const leases = mkdtempSync(join(tmpdir(), 'autostop-leases-'));
  roots.push(leases);
  process.env['HARNESS_LEASE_DIR'] = leases;
});
afterEach(async () => {
  delete process.env['HARNESS_LEASE_DIR'];
  for (const c of closers.splice(0)) await c();
  for (const r of roots.splice(0)) rmSync(r, { recursive: true, force: true });
});

async function start(idleStop?: typeof idle) {
  const dir = mkdtempSync(join(tmpdir(), 'autostop-state-'));
  roots.push(dir);
  const h = await runService({ dir, port: 0, ...(idleStop ? { idleStop } : {}) });
  closers.push(h.close);
  return dir;
}

describe('service idle self-stop', () => {
  it('stops after the grace period with no live lease', async () => {
    const dir = await start(idle);
    await delay(600);
    expect(readDescriptor(dir)).toBeNull();
  });
  it('stays up while a lease is live, and stops after it is removed', async () => {
    writeLease('a', { pid: process.pid });
    writeLease('b', { pid: process.pid });
    const dir = await start(idle);
    removeLease('a');
    await delay(500);
    expect(readDescriptor(dir)).not.toBeNull();
    removeLease('b');
    await delay(600);
    expect(readDescriptor(dir)).toBeNull();
  });
  it('never stops a service started without idleStop', async () => {
    const dir = await start();
    await delay(500);
    expect(readDescriptor(dir)).not.toBeNull();
  });
  it('a manual start makes a running idle-stop service persistent', async () => {
    const dir = await start(idle);
    expect(readDescriptor(dir)?.autostop).toBe(true);
    const d = await ensureService({ dir, keep: true });
    expect(d.autostop).toBeFalsy();
    await delay(600);
    expect(readDescriptor(dir)).not.toBeNull();
  });
});
