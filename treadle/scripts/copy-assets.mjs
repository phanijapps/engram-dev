import { cpSync, mkdirSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
const web = fileURLToPath(new URL('../packages/web/', import.meta.url));
mkdirSync(join(web, 'dist/src'), { recursive: true });
for (const f of readdirSync(join(web, 'src'))) {
  if (/\.(html|js|css)$/.test(f)) cpSync(join(web, 'src', f), join(web, 'dist/src', f));
}
