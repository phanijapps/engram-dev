/** Local host packages generated from the same harness authority as the installer. */
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname, basename } from 'node:path';
import { createHash } from 'node:crypto';
import { brand } from '@treadle/brand';
import { defaultManifestPath, loadManifest } from './manifest.js';
import { runtimeEntry } from '../serve/runtime.js';
export type NativeSurface = 'claude' | 'codex' | 'pi';
export function packageHarness(surface: NativeSurface, output: string, entry = runtimeEntry()) {
  if (!['claude', 'codex', 'pi'].includes(surface))
    throw Error('Native package requires claude, codex or pi');
  if (!existsSync(entry))
    throw Error('Install/build the runtime first and select its actual Node entry');
  const destination = resolve(output);
  if (existsSync(destination))
    throw Error('Package destination already exists; choose a new directory');
  const { manifest, root } = loadManifest(defaultManifestPath());
  mkdirSync(destination, { recursive: true });
  const json = (file: string, value: unknown): void => {
    const path = join(destination, file);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, JSON.stringify(value, null, 2) + '\n');
  };
  json('package.json', {
    name: `${brand.binName}-harness-${surface}`,
    version: manifest.version ?? '0.1.0',
    private: true,
    type: 'module',
    ...(surface === 'pi'
      ? {
          keywords: ['pi-package'],
          pi: {
            extensions: ['extensions/project-context.ts', 'hooks/post-tool-check.js'],
            skills: ['./skills'],
          },
        }
      : {}),
  });
  for (const c of manifest.components) {
    const source = typeof c.source === 'string' ? c.source : c.source[surface];
    if (!source) continue;
    // Only Claude's native plugin agent format is witnessed. Codex/pi custom agents use compatibility install.
    if (c.kind === 'agent' && surface !== 'claude') continue;
    cpSync(
      join(root, source),
      join(destination, c.kind === 'skill' ? `skills/${c.id}` : `agents/${basename(source)}`),
      { recursive: true },
    );
  }
  mkdirSync(join(destination, 'hooks'));
  for (const h of manifest.hooks)
    if (h.wiring[surface]) {
      cpSync(join(root, h.file), join(destination, 'hooks', basename(h.file)));
      for (const companion of h.companions ?? [])
        cpSync(join(root, companion), join(destination, 'hooks', basename(companion)));
    }
  if (surface === 'pi')
    cpSync(join(root, 'extensions'), join(destination, 'extensions'), { recursive: true });
  json('hooks/runtime.json', {
    format: 'runtime-pointer/1',
    node: process.execPath,
    entry: resolve(entry),
    protocol: 1,
  });
  if (surface !== 'pi') {
    const callback = surface === 'codex' ? 'codex-context.js' : 'claude-context.js';
    const prefix = surface === 'claude' ? 'CLAUDE_PLUGIN_ROOT' : 'PLUGIN_ROOT';
    const hook = (event: string) =>
      surface === 'claude'
        ? {
            type: 'command',
            timeout: 30,
            command: 'node',
            args: [`\${${prefix}}/hooks/${callback}`, '--host', surface, '--event', event],
          }
        : {
            type: 'command',
            timeout: 30,
            command: `node "\${${prefix}}/hooks/${callback}" --host ${surface} --event ${event}`,
            commandWindows: `node "%${prefix}%\\hooks\\${callback}" --host ${surface} --event ${event}`,
          };
    json('hooks/hooks.json', {
      hooks: {
        SessionStart: [{ hooks: [hook('SessionStart')] }],
        UserPromptSubmit: [{ hooks: [hook('UserPromptSubmit')] }],
      },
    });
    json(`.${surface === 'claude' ? 'claude' : 'codex'}-plugin/plugin.json`, {
      name: `${brand.binName}-harness`,
      version: manifest.version ?? '0.1.0',
      description: 'Local knowledge and owner-gated spec development',
      // Claude scans these standard directories itself. Re-declaring hooks loads them twice;
      // its agents field accepts files, not directories. Codex uses explicit manifest paths.
      ...(surface === 'codex' ? { hooks: './hooks/hooks.json', skills: './skills/' } : {}),
    });
    if (surface === 'codex')
      json('.agents/plugins/marketplace.json', {
        name: `${brand.binName}-local`,
        plugins: [{ name: `${brand.binName}-harness`, source: { source: 'local', path: './' } }],
      });
  }
  const hashes: Record<string, string> = {};
  function walk(dir: string, prefix = ''): void {
    for (const file of readdirSync(dir).sort()) {
      const path = join(dir, file),
        key = prefix + file;
      if (readdirIsDirectory(path)) walk(path, key + '/');
      else hashes[key] = createHash('sha256').update(readFileSync(path)).digest('hex');
    }
  }
  walk(destination);
  json('.harness-package.json', {
    format: 'harness-package/1',
    generator: 1,
    surface,
    version: manifest.version ?? '0.1.0',
    runtimeProtocol: 1,
    bootstrap:
      'Runtime pointer is local to this machine. Regenerate after moving/removing the runtime. Node >=22 required; host enable/trust/reload remains a human action.',
    unsupported:
      surface === 'pi'
        ? ['native custom agents']
        : surface === 'codex'
          ? ['native custom agents (unverified)', 'IDE native plugin loading']
          : [],
    files: hashes,
  });
  return destination;
}
import { statSync } from 'node:fs';
const readdirIsDirectory = (path: string): boolean => statSync(path).isDirectory();
