/** Flush persisted state using the filesystem primitive available on this platform. */
import { openSync, fsyncSync, closeSync } from 'node:fs';
import { dirname } from 'node:path';
export function syncPublishedPath(path: string): void {
  // Windows Node cannot open directories for fsync. Flush the published file instead;
  // retain failures as pending receipts. POSIX also flushes the parent directory entry.
  const fd = openSync(
    process.platform === 'win32' ? path : dirname(path),
    process.platform === 'win32' ? 'r+' : 'r',
  );
  try {
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
}
