import { describe, expect, it } from 'vitest';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadManifest, wakeMode } from '../src/harness/manifest.js';

const real = new URL('../harness/harness.json', import.meta.url).pathname;
function manifestWith(wake: unknown): string {
  const file = join(mkdtempSync(join(tmpdir(), 'wake-')), 'harness.json');
  writeFileSync(file, JSON.stringify({ format: 'harness/0.1', components: [], hooks: [], wake }));
  return file;
}

describe('per-host wake declaration', () => {
  it('declares Copilot as background-command and the other hosts as context-only', () => {
    const { manifest } = loadManifest(real);
    expect(wakeMode(manifest, 'copilot')).toBe('background-command');
    for (const host of ['claude', 'codex', 'pi'] as const)
      expect(wakeMode(manifest, host)).toBe('context-only');
  });
  it('defaults an undeclared host to context-only', () => {
    const { manifest } = loadManifest(manifestWith({ copilot: 'none' }));
    expect(wakeMode(manifest, 'copilot')).toBe('none');
    expect(wakeMode(manifest, 'claude')).toBe('context-only');
  });
  it('accepts a manifest without the field', () => {
    const file = join(mkdtempSync(join(tmpdir(), 'wake-')), 'harness.json');
    writeFileSync(file, JSON.stringify({ format: 'harness/0.1', components: [], hooks: [] }));
    expect(wakeMode(loadManifest(file).manifest, 'copilot')).toBe('context-only');
  });
  it('refuses unknown modes, unknown hosts and non-map values', () => {
    expect(() => loadManifest(manifestWith({ copilot: 'push' }))).toThrow(/wake refused/);
    expect(() => loadManifest(manifestWith({ vim: 'none' }))).toThrow(/unknown host/);
    expect(() => loadManifest(manifestWith(['none']))).toThrow(/per-host map/);
  });
});
