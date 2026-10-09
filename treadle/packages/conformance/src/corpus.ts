/** Corpus loader: reads a case directory per the runner contract.
 *  The expected outputs are bytes after scrubbing (design §4) — never
 *  structural comparisons: key order is part of the contract. */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export interface Case {
  readonly name: string;
  readonly layer: string;
  readonly hasExpectedEmit: boolean;
}

export function listCases(root: string): Case[] {
  const out: Case[] = [];
  for (const layer of readdirSync(root, { withFileTypes: true })) {
    if (!layer.isDirectory()) continue;
    const layerDir = join(root, layer.name);
    for (const c of readdirSync(layerDir, { withFileTypes: true })) {
      if (!c.isDirectory()) continue;
      out.push({
        name: c.name,
        layer: layer.name,
        hasExpectedEmit: exists(join(layerDir, c.name, 'expected.emit.json')),
      });
    }
  }
  return out;
}

function exists(p: string): boolean {
  try {
    readFileSync(p);
    return true;
  } catch {
    return false;
  }
}
