import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, statSync, realpathSync } from 'node:fs';
import { resolve, relative, sep } from 'node:path';
import { createHash } from 'node:crypto';
import {
  feedbackContainedPath,
  readFeedbackSnapshot,
  loadFeedbackPack,
  FeedbackError,
  FEEDBACK_LIMITS,
  type FeedbackSelection,
  type FeedbackSession,
  type FeedbackSnapshotInput,
} from '@treadle/core';

const sha = (bytes: Buffer | string) => createHash('sha256').update(bytes).digest('hex');
function refuse(code: FeedbackError['code'], message: string): never {
  throw new FeedbackError(code, message);
}
export interface SnapshotRequest {
  mode: 'documents' | 'diff';
  paths?: string[];
  artifacts?: string[];
  base?: string;
  head?: string;
}
export interface BuiltFeedbackSnapshots {
  selection: FeedbackSelection;
  snapshots: FeedbackSnapshotInput[];
  verify: () => void;
}
function normalized(path: string): string {
  if (
    !path ||
    path.length > 4096 ||
    path.includes('\\') ||
    path.includes('\0') ||
    path.startsWith('/') ||
    path.split('/').some((s) => !s || s === '..' || s === '.')
  )
    refuse('forbidden', 'Choose a normalized repository-relative file path');
  return path;
}
function sourcePath(workspace: string, packDir: string, path: string): string {
  normalized(path);
  const parts = path.split('/');
  if (
    parts.some((p) => ['.git', '.harness', '.okf', '.codex', '.claude', '.pi'].includes(p)) ||
    parts.some(
      (p) =>
        /^(?:\.env(?:\..*)?|\.npmrc|\.netrc|id_rsa|id_ed25519)$/.test(p) ||
        /\.(?:pem|key|p12|pfx)$/.test(p),
    )
  )
    refuse('forbidden', 'State or credential files cannot be feedback targets');
  const file = feedbackContainedPath(workspace, path);
  const feedback = resolve(packDir, 'feedback');
  if (file === feedback || file.startsWith(feedback + sep))
    refuse('forbidden', 'Feedback records cannot snapshot themselves');
  return file;
}
function decode(bytes: Buffer): string {
  if (bytes.length > FEEDBACK_LIMITS.file) refuse('bounds', 'Selected text exceeds 256 KiB');
  if (bytes.includes(0)) refuse('unavailable', 'Binary targets are unsupported');
  try {
    return new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes);
  } catch {
    return refuse('unavailable', 'Target is not UTF-8 text');
  }
}
function worktree(file: string): Buffer | null {
  if (!existsSync(file)) return null;
  if (!statSync(file).isFile())
    refuse('unavailable', 'Select files, not directories or submodules');
  if (statSync(file).size > FEEDBACK_LIMITS.file) refuse('bounds', 'Selected file exceeds 256 KiB');
  return readFileSync(file);
}
// Only object/index operations use Git. Worktree bytes are read directly, so
// configured clean/smudge filters, external diffs and text converters cannot run.
function git(workspace: string, args: string[], maxBuffer = 1024 * 1024): Buffer {
  const environment = Object.fromEntries(
    Object.entries(process.env).filter(([key]) => !key.toUpperCase().startsWith('GIT_')),
  );
  try {
    return execFileSync('git', ['--no-optional-locks', '-c', 'protocol.allow=never', ...args], {
      cwd: workspace,
      env: {
        ...environment,
        GIT_LITERAL_PATHSPECS: '1',
        GIT_NO_REPLACE_OBJECTS: '1',
        GIT_NO_LAZY_FETCH: '1',
        GIT_ALLOW_PROTOCOL: '',
        GIT_TERMINAL_PROMPT: '0',
      },
      maxBuffer,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch {
    return refuse('unavailable', 'Git comparison is unavailable or exceeds its output bound');
  }
}
export function resolveFeedbackCommit(workspace: string, ref: string): string {
  if (!ref || ref.includes('\0') || ref.length > 4096)
    refuse('invalid', 'Choose an explicit Git baseline');
  const result = git(workspace, ['rev-parse', '--verify', '--end-of-options', `${ref}^{commit}`])
    .toString('utf8')
    .trim();
  if (!/^[0-9a-f]{40,64}$/.test(result))
    refuse('unavailable', 'Git reference did not resolve to a commit');
  return result;
}
function tree(workspace: string, revision: string, paths: string[]): Map<string, string> {
  const entries = git(workspace, ['ls-tree', '-r', '-z', revision, '--', ...paths])
    .toString('utf8')
    .split('\0')
    .filter(Boolean);
  const map = new Map<string, string>();
  for (const entry of entries) {
    const match = /^(\d+) (\w+) ([0-9a-f]+)\t([\s\S]+)$/.exec(entry);
    if (!match || match[2] !== 'blob' || !['100644', '100755'].includes(match[1]!))
      refuse('unavailable', 'Symlink, submodule or unsupported Git target');
    map.set(match[4]!, match[3]!);
  }
  return map;
}
function blob(workspace: string, id: string | undefined): Buffer | null {
  if (id && Number(git(workspace, ['cat-file', '-s', id]).toString()) > FEEDBACK_LIMITS.file)
    refuse('bounds', 'Selected Git blob exceeds 256 KiB');
  return id === undefined
    ? null
    : git(workspace, ['cat-file', 'blob', id], FEEDBACK_LIMITS.file + 1);
}

export function buildFeedbackSnapshots(
  workspaceInput: string,
  packInput: string,
  request: SnapshotRequest,
  previous?: FeedbackSession,
): BuiltFeedbackSnapshots {
  const workspace = realpathSync(workspaceInput);
  const packDir = feedbackContainedPath(workspace, packInput);
  const paths = [...(request.paths ?? [])].map(normalized);
  const artifacts = [...(request.artifacts ?? [])];
  if (!['documents', 'diff'].includes(request.mode) || (!paths.length && !artifacts.length))
    refuse('invalid', 'Choose explicit review targets and a supported mode');
  if (paths.length + artifacts.length > FEEDBACK_LIMITS.targets)
    refuse('bounds', 'Too many selected targets');
  if (new Set(paths).size !== paths.length || new Set(artifacts).size !== artifacts.length)
    refuse('invalid', 'Selected targets must be unique');
  const selection: FeedbackSelection = { mode: request.mode, paths, artifacts };
  const observations: { path: string; digest: string | null }[] = [];
  const checks: (() => void)[] = [];
  let snapshots: FeedbackSnapshotInput[];
  if (request.mode === 'documents') {
    const loaded = loadFeedbackPack(packDir, workspace);
    if (!loaded.ok) refuse('unavailable', loaded.message);
    const selected = [
      ...paths.map((path) => ({ key: path, path })),
      ...artifacts.map((key) => {
        const artifact = loaded.value.doc.artifacts?.[key];
        if (!artifact) return refuse('missing', `Unknown artifact key: ${key}`);
        const path = relative(workspace, feedbackContainedPath(packDir, artifact.file))
          .split(sep)
          .join('/');
        return { key: `artifact:${key}`, path };
      }),
    ];
    if (new Set(selected.map((s) => s.path)).size !== selected.length)
      refuse('invalid', 'The same file was selected twice');
    snapshots = selected.map((target) => {
      if (!/\.md$/i.test(target.path))
        refuse('unavailable', 'Document review supports Markdown files');
      const file = sourcePath(workspace, packDir, target.path);
      const bytes = worktree(file);
      observations.push({ path: target.path, digest: bytes === null ? null : sha(bytes) });
      const oldRound = previous?.rounds.at(-1);
      const oldTarget = oldRound?.targets.find((t) => t.key === target.key);
      const before =
        oldTarget?.after && oldRound
          ? readFeedbackSnapshot(
              packDir,
              workspace,
              previous!.id,
              oldRound.id,
              oldTarget.id,
              'after',
            )
          : null;
      if (bytes === null && before === null) refuse('missing', 'Selected document is absent');
      return { ...target, before, after: bytes === null ? null : decode(bytes) };
    });
    const artifactPaths = artifacts.map((key) => loaded.value.doc.artifacts![key]!.file);
    checks.push(() => {
      const latest = loadFeedbackPack(packDir, workspace);
      if (
        !latest.ok ||
        artifacts.some((key, i) => latest.value.doc.artifacts?.[key]?.file !== artifactPaths[i])
      )
        refuse('conflict', 'Selected artifact reference changed');
    });
  } else {
    if (artifacts.length || !request.base)
      refuse('invalid', 'Diff review needs selected paths and an explicit Git baseline');
    const gitRoot = git(workspace, ['rev-parse', '--show-toplevel']).toString('utf8').trim();
    if (realpathSync(gitRoot) !== workspace)
      refuse('forbidden', 'Diff paths resolve from the enrolled Git root');
    const baseline = resolveFeedbackCommit(workspace, request.base);
    selection.base = baseline;
    const head = request.head ? resolveFeedbackCommit(workspace, request.head) : undefined;
    if (head) selection.head = head;
    checks.push(() => {
      if (
        resolveFeedbackCommit(workspace, request.base!) !== baseline ||
        (request.head && resolveFeedbackCommit(workspace, request.head) !== head)
      )
        refuse('conflict', 'Selected Git reference moved');
    });
    const beforeTree = tree(workspace, baseline, paths);
    const afterTree = head ? tree(workspace, head, paths) : null;
    const pairs = new Map<string, { before: Buffer | null; after: Buffer | null }>();
    for (const path of paths) {
      const file = sourcePath(workspace, packDir, path);
      const before = blob(workspace, beforeTree.get(path));
      const after = afterTree ? blob(workspace, afterTree.get(path)) : worktree(file);
      if (before === null && after === null)
        refuse('missing', `Selected diff file is absent: ${path}`);
      if (!afterTree) observations.push({ path, digest: after === null ? null : sha(after) });
      pairs.set(path, { before, after });
    }
    const renames = new Map<string, string>();
    const changes = git(
      workspace,
      head
        ? [
            'diff-tree',
            '-r',
            '-M',
            '--name-status',
            '-z',
            '--no-ext-diff',
            '--no-textconv',
            baseline,
            head,
            '--',
            ...paths,
          ]
        : [
            'diff',
            '--cached',
            '-M',
            '--name-status',
            '-z',
            '--no-ext-diff',
            '--no-textconv',
            baseline,
            '--',
            ...paths,
          ],
    )
      .toString('utf8')
      .split('\0');
    for (let i = 0; i < changes.length;) {
      const kind = changes[i++];
      if (!kind) break;
      const old = changes[i++];
      if (kind.startsWith('R') || kind.startsWith('C')) {
        const next = changes[i++];
        if (kind.startsWith('R') && old && next && pairs.has(old) && pairs.has(next))
          renames.set(next, old);
      }
    }
    for (const target of previous?.rounds.at(-1)?.targets ?? [])
      if (target.old_path && pairs.has(target.path) && pairs.has(target.old_path))
        renames.set(target.path, target.old_path);
    // Exact unstaged renames can be recognized without running worktree filters.
    for (const [next, n] of pairs)
      if (!n.before && n.after && !renames.has(next)) {
        const old = [...pairs].find(
          ([path, o]) =>
            path !== next &&
            o.before &&
            !o.after &&
            sha(o.before) === sha(n.after!) &&
            ![...renames.values()].includes(path),
        );
        if (old) renames.set(next, old[0]);
      }
    const used = new Set(renames.values());
    snapshots = [...pairs]
      .filter(([path]) => !used.has(path))
      .map(([path, pair]) => {
        const old = renames.get(path);
        const before = old ? pairs.get(old)!.before : pair.before;
        return {
          key: old ? `${old}->${path}` : path,
          path,
          ...(old ? { old_path: old } : {}),
          before: before === null ? null : decode(before),
          after: pair.after === null ? null : decode(pair.after),
        };
      });
  }
  if (
    snapshots.reduce(
      (n, t) => n + Buffer.byteLength(t.before ?? '') + Buffer.byteLength(t.after ?? ''),
      0,
    ) > FEEDBACK_LIMITS.round
  )
    refuse('bounds', 'Round snapshot bytes exceed 4 MiB');
  return {
    selection,
    snapshots,
    verify: () => {
      for (const check of checks) check();
      for (const observation of observations) {
        const bytes = worktree(sourcePath(workspace, packDir, observation.path));
        if ((bytes === null ? null : sha(bytes)) !== observation.digest)
          refuse('conflict', 'Selected source bytes changed before publication');
      }
    },
  };
}
