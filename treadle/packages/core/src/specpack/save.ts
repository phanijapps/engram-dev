/** The save pipeline: derive the stage, stamp updated, write in canonical
 *  order — atomically (tmp file + fsync + rename), the crash discipline the
 *  engine's writer established. JSON.stringify emits raw non-ASCII, matching
 *  the python writer's ensure_ascii=False — no escaping shim needed. */
import { writeFileSync, renameSync, openSync, closeSync, fsyncSync } from 'node:fs';
import { emit } from './emit.js';
import { deriveStage } from './derive.js';
import type { PackDoc } from './model.js';

export function savePack(doc: PackDoc, jsonPath: string, opts: { at: string }): void {
  doc.deliverable = deriveStage(doc);
  doc.updated = opts.at;
  const bytes = JSON.stringify(emit(doc), null, 2) + '\n';
  const tmp = jsonPath + '.tmp';
  writeFileSync(tmp, bytes, 'utf8');
  const fd = openSync(tmp, 'r+'); // fsync before rename: bytes land before the name moves
  try {
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
  renameSync(tmp, jsonPath);
}
