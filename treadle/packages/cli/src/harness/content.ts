/** Normalization: the plan and the apply step hash the SAME bytes.
 *  LF endings + exactly one trailing newline — platform checkouts and
 *  editors cannot flap the modes (D-6, R1 #7). */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

export function normalize(text: string): string {
  const lf = text.replace(/\r\n?/g, '\n');
  return lf.replace(/\n+$/, '') + '\n';
}

export function normalizedHash(text: string): string {
  return createHash('sha256').update(normalize(text)).digest('hex');
}

export function hashFile(path: string): string {
  return normalizedHash(readFileSync(path, 'utf8'));
}
