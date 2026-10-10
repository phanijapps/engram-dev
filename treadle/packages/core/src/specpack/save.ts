/** The save pipeline: derive the stage, stamp updated, write in canonical
 *  order — atomically (tmp file + fsync + rename), the crash discipline the
 *  engine's writer established. JSON.stringify emits raw non-ASCII, matching
 *  the python writer's ensure_ascii=False — no escaping shim needed. */
import { writeFileSync, renameSync, openSync, closeSync, fsyncSync } from 'node:fs';
import { emit } from './emit.js';
import { deriveStage } from './derive.js';
import type { PackDoc } from './model.js';
import { dirname } from 'node:path';
import { flushOwnerAudit, ownerEventsPath, appendPendingAudit } from './audit.js';
import type { OwnerAct } from './workflow.js';

export function savePack(
  doc: PackDoc,
  jsonPath: string,
  opts: { at: string; auditAppend?: (path: string, pending: readonly OwnerAct[]) => void },
): void | { recorded: true; audit_pending: number; durability_error?: string } {
  doc.deliverable = deriveStage(doc);
  doc.updated = opts.at;
  const persist = (): string | undefined => {
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
    if (doc.format === 'specpack/0.4') {
      try {
        const dir = openSync(dirname(jsonPath), 'r');
        try {
          fsyncSync(dir);
        } finally {
          closeSync(dir);
        }
      } catch (error) {
        return (error as Error).message;
      }
    }
    return undefined;
  };
  const error = persist();
  if (doc.format === 'specpack/0.4') {
    if (!error)
      flushOwnerAudit(
        doc,
        ownerEventsPath(dirname(jsonPath)),
        () => {
          const error = persist();
          if (error) throw Error(error);
        },
        opts.auditAppend ?? appendPendingAudit,
      );
    return {
      recorded: true,
      audit_pending: doc.workflow?.pending_audit.length ?? 0,
      ...(error ? { durability_error: error } : {}),
    };
  }
}
