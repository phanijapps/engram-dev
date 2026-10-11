/** Feedback has its own revision and never admits canonical owner actions. */
import {
  FeedbackError,
  feedbackContainedPath,
  readFeedback,
  readFeedbackSnapshot,
  mutateFeedback,
  feedbackThreadState,
  loadFeedbackPack,
  type FeedbackAction,
  type FeedbackAnchor,
} from '@treadle/core';
import type { ProjectSource } from './project-server.js';
interface FeedbackResponse {
  status: number;
  body: unknown;
  text?: boolean;
}
const object = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === 'object' && !Array.isArray(v);
function invalid(message: string): never {
  throw new FeedbackError('invalid', message);
}
function strings(body: Record<string, unknown>, key: string): string {
  const value = body[key];
  if (typeof value !== 'string') invalid(`Missing text field: ${key}`);
  return value;
}
function anchor(value: unknown): FeedbackAnchor {
  if (
    !object(value) ||
    Object.keys(value).some(
      (key) => !['round', 'target', 'side', 'sha256', 'start', 'end', 'quote'].includes(key),
    )
  )
    invalid('Malformed anchor');
  return value as unknown as FeedbackAnchor;
}
function action(kind: string, body: Record<string, unknown>): FeedbackAction {
  const session = strings(body, 'session');
  const fields: Record<string, string[]> = {
    comment: ['anchor', 'body'],
    submit: ['round'],
    resolve: ['thread'],
    reattach: ['thread', 'anchor'],
  };
  if (
    Object.keys(body).some(
      (key) =>
        !['session', 'by', 'operation_id', 'expected_revision', ...(fields[kind] ?? [])].includes(
          key,
        ),
    )
  )
    invalid('Unexpected feedback fields');
  switch (kind) {
    case 'comment':
      return { kind, session, anchor: anchor(body['anchor']), body: strings(body, 'body') };
    case 'submit':
      return { kind, session, round: strings(body, 'round') };
    case 'resolve':
      return { kind, session, thread: strings(body, 'thread') };
    case 'reattach':
      return { kind, session, thread: strings(body, 'thread'), anchor: anchor(body['anchor']) };
    default:
      throw new FeedbackError(
        'forbidden',
        'Agent actions are available only through the local CLI',
      );
  }
}
export function feedbackRoute(
  project: ProjectSource,
  path: string,
  query: URLSearchParams,
  method: string,
  bodyText: string,
): FeedbackResponse | undefined {
  if (!path.startsWith('/feedback/')) return;
  try {
    const match = /^\/feedback\/([A-Za-z0-9][A-Za-z0-9_.-]*)\/([a-z]+)$/.exec(path);
    if (!match || match[1] === 'archive')
      throw new FeedbackError('missing', 'No such feedback route');
    const dir = feedbackContainedPath(project.workspace, `${project.specs}/${match[1]}`);
    const loaded = loadFeedbackPack(dir, project.workspace);
    if (!loaded.ok) throw new FeedbackError('missing', 'No such spec');
    const kind = match[2]!;
    if (method === 'GET') {
      if (kind === 'snapshot')
        return {
          status: 200,
          text: true,
          body: readFeedbackSnapshot(
            dir,
            project.workspace,
            query.get('session') ?? '',
            query.get('round') ?? '',
            query.get('target') ?? '',
            query.get('side') ?? '',
          ),
        };
      if (kind !== 'state') throw new FeedbackError('missing', 'No such feedback read route');
      const state = readFeedback(dir, project.workspace);
      const id = query.get('session');
      if (id && !state?.sessions.some((s) => s.id === id))
        throw new FeedbackError('missing', 'Unknown feedback session');
      const sessions = (state?.sessions ?? []).filter((s) => !id || s.id === id);
      const ids = new Set(sessions.map((s) => s.id));
      const threads = (state?.threads ?? [])
        .filter((t) => ids.has(t.session))
        .map((t) => ({
          ...t,
          ...feedbackThreadState(
            sessions.find((s) => s.id === t.session)!,
            t,
          ),
        }));
      return {
        status: 200,
        body: {
          format: 'feedback/1',
          project: project.id,
          pack_id: loaded.value.doc.id ?? loaded.value.doc.name,
          revision: state?.revision ?? 0,
          closed: loaded.value.doc.status === 'complete',
          sessions,
          threads,
          batches: (state?.batches ?? []).filter((b) => ids.has(b.session)),
        },
      };
    }
    if (!['comment', 'submit', 'resolve', 'reattach'].includes(kind))
      throw new FeedbackError(
        'forbidden',
        'Browser feedback cannot create rounds, reply as an agent, or record owner workflow acts',
      );
    let body: unknown;
    try {
      body = JSON.parse(bodyText);
    } catch {
      invalid('Send a JSON feedback object');
    }
    if (!object(body)) invalid('Send a JSON feedback object');
    if (typeof body['expected_revision'] !== 'number') invalid('Supply the held feedback revision');
    const result = mutateFeedback(dir, project.workspace, {
      operation_id: strings(body, 'operation_id'),
      expected_revision: body['expected_revision'],
      by: strings(body, 'by'),
      action: action(kind, body),
    });
    return { status: 200, body: { format: 'feedback/1', project: project.id, ...result } };
  } catch (error) {
    const code = error instanceof FeedbackError ? error.code : 'unavailable';
    const status = {
      invalid: 400,
      forbidden: 403,
      missing: 404,
      conflict: 409,
      bounds: 413,
      unavailable: 409,
    }[code];
    return {
      status,
      body: {
        format: 'feedback/1',
        error: error instanceof Error ? error.message : String(error),
        code,
      },
    };
  }
}
