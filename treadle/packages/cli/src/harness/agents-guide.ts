import { createHash, randomUUID } from 'node:crypto';
import {
  closeSync,
  fsyncSync,
  lstatSync,
  mkdirSync,
  openSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { brand } from '@treadle/brand';
import type { GuideInput, ProjectGuidePlan } from './types.js';

const digest = (bytes: Buffer | string): string => createHash('sha256').update(bytes).digest('hex');
const MAX_MANIFEST = 128 * 1024;
const ignored = new Set(['node_modules', 'vendor', 'dist', 'build']);
const inline = (text: string): string => text.replace(/`/g, '\\`').replace(/[\r\n]/g, ' ');
const directories = (root: string): string[] => {
  try {
    return readdirSync(root, { withFileTypes: true })
      .filter((e) => e.isDirectory() && !e.name.startsWith('.') && !ignored.has(e.name))
      .map((e) => e.name)
      .sort();
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw e;
  }
};
function input(path: string, limited = false): GuideInput {
  try {
    const stat = lstatSync(path);
    if (stat.isSymbolicLink()) return { path, kind: 'symlink' };
    if (stat.isDirectory()) return { path, kind: 'directory' };
    if (!stat.isFile()) return { path, kind: 'other' };
    if (limited && stat.size > MAX_MANIFEST)
      return { path, kind: 'large-file', sha256: `${stat.size}:${stat.mtimeMs}` };
    return { path, kind: 'file', sha256: digest(readFileSync(path)) };
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return { path, kind: 'missing' };
    throw e;
  }
}
function current(item: GuideInput): GuideInput {
  return item.kind === 'directories'
    ? {
        path: item.path,
        kind: 'directories',
        sha256: digest(JSON.stringify(directories(item.path))),
      }
    : input(item.path, item.kind === 'large-file');
}
function regular(inputs: GuideInput[], path: string, limited = false): boolean {
  const item = input(path, limited);
  inputs.push(item);
  return item.kind === 'file';
}
function render(root: string, template: string, inputs: GuideInput[], prior: boolean): string {
  const dirs = directories(root);
  inputs.push({ path: root, kind: 'directories', sha256: digest(JSON.stringify(dirs)) });
  const packages: { dir: string; value: Record<string, unknown> }[] = [];
  for (const dir of ['.', ...dirs.slice(0, 20)]) {
    const path = join(root, dir, 'package.json');
    if (!regular(inputs, path, true)) continue;
    try {
      const value: unknown = JSON.parse(readFileSync(path, 'utf8'));
      if (value && typeof value === 'object' && !Array.isArray(value))
        packages.push({ dir, value: value as Record<string, unknown> });
    } catch {
      /* Malformed manifests do not establish commands. */
    }
  }
  const commands: string[] = [];
  for (const { dir, value } of packages.slice(0, 3)) {
    const manager =
      typeof value['packageManager'] === 'string'
        ? /^(pnpm|npm|yarn|bun)@([^\s`]+)$/.exec(value['packageManager'])
        : null;
    const scripts = value['scripts'];
    if (!manager || !scripts || typeof scripts !== 'object' || Array.isArray(scripts)) continue;
    const available = Object.keys(scripts)
      .filter(
        (name) =>
          /^(build|test|check|lint|coverage|corpus:check|brand:check|audit:prod|links)$/.test(
            name,
          ) && typeof (scripts as Record<string, unknown>)[name] === 'string',
      )
      .sort();
    if (!available.length) continue;
    commands.push(
      `From \`${inline(dir)}\`, the declared package manager is \`${inline(value['packageManager'] as string)}\`.`,
    );
    for (const name of available) commands.push(`- \`${manager[1]} run ${name}\``);
  }
  const structure = dirs.slice(0, 20).map((dir) => `- \`${inline(dir)}/\``);
  if (dirs.length > 20)
    structure.push(`See the repository for ${dirs.length - 20} additional top-level directories.`);
  const wiki = join(root, 'wiki');
  const wikiInput = input(wiki);
  inputs.push(wikiInput);
  const knowledge =
    wikiInput.kind === 'directory'
      ? [
          `The observed knowledge home is \`wiki/\`.`,
          ...['index.md', 'project/documentation-map.md', 'domain/wiki-contract.md']
            .filter((path) => regular(inputs, join(wiki, path)))
            .map((path) => `Read \`wiki/${path}\` for navigation and conventions.`),
          'From the repository root, use the installed harness:',
          '```text',
          `${brand.binName} know search wiki "specific terms" --limit 5`,
          `${brand.binName} know read wiki <concept-id>`,
          `${brand.binName} know read wiki <concept-id> --depth 1 --budget 3000`,
          `${brand.binName} know status wiki --workspace .`,
          '```',
          'Concept IDs are bundle paths without `.md`; use an observed ID from search.',
        ].join('\n')
      : 'No wiki/ directory was observed at init. Find the declared knowledge home in the project docs; do not invent a bundle or claim an empty validation proves coverage.';
  const docs = ['README.md', 'CONTRIBUTING.md', 'SECURITY.md']
    .filter((path) => regular(inputs, join(root, path)))
    .map((path) =>
      path === 'SECURITY.md'
        ? 'Read `SECURITY.md` before server changes.'
        : `Read \`${path}\` for project-specific commands and conventions.`,
    )
    .join('\n');
  const project = packages.find((p) => p.dir === '.')?.value['name'];
  const replacements: Record<string, string> = {
    PROJECT: typeof project === 'string' ? inline(project) : 'this repository',
    PRIOR_RULES: prior
      ? 'Read `AGENTS.backup.md` for the preserved project instructions. Those rules, owner gates, and frozen records remain authoritative.'
      : 'Use the observed project documentation for repository-specific rules; this guide does not invent them.',
    COMMANDS:
      commands.join('\n') ||
      'No supported package-manager/script combination was established. Read the project manifests and README for exact commands; do not guess or execute scripts during init.',
    STRUCTURE:
      structure.join('\n') ||
      'No visible top-level source directories were observed at init. Read the project documentation for its layout.',
    KNOWLEDGE: knowledge,
    PROJECT_DOCS: docs,
  };
  return template.replace(/\{\{([A-Z_]+)\}\}/g, (_, key: string) => replacements[key] ?? '');
}

export function planProjectGuide(root: string, templatePath: string): ProjectGuidePlan {
  const destination = join(root, 'AGENTS.md'),
    backup = join(root, 'AGENTS.backup.md');
  const inputs = [input(destination), input(backup), input(templatePath)];
  const plan: ProjectGuidePlan = {
    destination,
    backup,
    mode: 'refuse',
    content: '',
    inputs,
    backupRequired: false,
  };
  for (const item of inputs) {
    if (!['file', 'missing'].includes(item.kind)) {
      plan.note = `Unsafe guide path: ${item.path} (${item.kind}); preserve it and repair before init.`;
      return plan;
    }
  }
  if (inputs[2]!.kind !== 'file') {
    plan.note = 'Canonical AGENTS.md template is unavailable; build/reinstall the runtime.';
    return plan;
  }
  const template = readFileSync(templatePath, 'utf8');
  const prior = inputs[1]!.kind === 'file';
  let content = render(root, template, inputs, prior);
  const existing = inputs[0]!.kind === 'file' ? readFileSync(destination) : undefined;
  if (existing?.equals(Buffer.from(content))) {
    plan.mode = 'same';
    plan.content = content;
    return plan;
  }
  if (existing) {
    if (prior && inputs[1]!.sha256 !== inputs[0]!.sha256) {
      plan.note =
        'AGENTS.backup.md already differs; preserve both files and reconcile before replacing AGENTS.md.';
      return plan;
    }
    // The first replacement references the backup it will publish.
    if (!prior) {
      inputs.splice(3);
      content = render(root, template, inputs, true);
    }
    plan.mode = 'replace';
    plan.backupRequired = !prior;
  } else plan.mode = 'create';
  plan.content = content;
  return plan;
}

export function guideConflict(
  plan: ProjectGuidePlan | undefined,
  targetsOnly = false,
): string | undefined {
  if (!plan) return undefined;
  if (plan.mode === 'refuse') return plan.note ?? 'Project guide refused';
  for (const item of targetsOnly ? plan.inputs.slice(0, 2) : plan.inputs) {
    if (JSON.stringify(current(item)) !== JSON.stringify(item))
      return `Project guide input changed after planning: ${item.path}. Re-run init to inspect a fresh plan.`;
  }
  return undefined;
}

export function publishProjectGuide(plan: ProjectGuidePlan): number {
  const conflict = guideConflict(plan);
  if (conflict) throw Error(conflict);
  if (plan.mode === 'same') return 0;
  mkdirSync(dirname(plan.destination), { recursive: true });
  if (plan.backupRequired) {
    let fd: number | undefined;
    let complete = false;
    try {
      fd = openSync(plan.backup, 'wx');
      writeFileSync(fd, readFileSync(plan.destination));
      fsyncSync(fd);
      complete = true;
    } finally {
      if (fd !== undefined) {
        closeSync(fd);
        if (!complete) rmSync(plan.backup);
      }
    }
  }
  const temp = join(dirname(plan.destination), `.AGENTS-${randomUUID()}.tmp`);
  let fd: number | undefined;
  try {
    fd = openSync(temp, 'wx');
    writeFileSync(fd, plan.content);
    fsyncSync(fd);
    closeSync(fd);
    fd = undefined;
    // A concurrent edit must not be replaced even after the backup was published.
    if (JSON.stringify(input(plan.destination)) !== JSON.stringify(plan.inputs[0]))
      throw Error('AGENTS.md changed during publication; original/backup preserved.');
    if (plan.mode === 'replace' && input(plan.backup).sha256 !== plan.inputs[0]?.sha256)
      throw Error('AGENTS.backup.md changed during publication; both files preserved.');
    renameSync(temp, plan.destination);
    return 1;
  } finally {
    if (fd !== undefined) closeSync(fd);
    rmSync(temp, { force: true });
  }
}
