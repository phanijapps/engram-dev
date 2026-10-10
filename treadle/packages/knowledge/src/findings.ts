/**
 * The findings ledger (ported): normative proposals wait for human
 * acceptance. Dedupe key (source, destination, kind) — re-proposing is
 * idempotent; a declined key is never re-raised; terminal states immutable.
 * The ledger is TOML at <bundle>/.okf/findings.toml; our writer's shape is
 * the only shape we parse back (JSON-escaped basic strings).
 */
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const STATE_DIR = '.okf';
const LEDGER = 'findings.toml';

export interface LedgerEntry {
  readonly id: string;
  readonly source: string;
  readonly destination: string;
  readonly kind: string;
  readonly status: 'pending' | 'accepted' | 'declined';
  readonly rationale: string;
  readonly proposed_at: string;
  readonly resolved_at: string | null;
}

export interface ProposeResult extends LedgerEntry {
  readonly deduped: boolean;
  readonly refused: boolean;
}

export function findingsPath(bundle: string): string {
  return join(bundle, STATE_DIR, LEDGER);
}

function findingId(source: string, destination: string, kind: string): string {
  const digest = createHash('sha1')
    .update(`${source}|${destination}|${kind}`, 'utf8')
    .digest('hex')
    .slice(0, 8);
  return `${kind}-${digest}`;
}

function load(ledger: string): LedgerEntry[] {
  if (!existsSync(ledger)) return [];
  const out: LedgerEntry[] = [];
  let current: Partial<LedgerEntry> | null = null;
  for (const line of readFileSync(ledger, 'utf8').split('\n')) {
    if (line.trim() === '[[findings]]') {
      if (current?.id) out.push(coerce(current));
      current = {};
      continue;
    }
    const m = /^(\w+)\s*=\s*(.+)$/.exec(line.trim());
    if (m && current) {
      const raw = m[2]!;
      let value: string;
      if (raw.startsWith('"')) {
        try {
          value = String(JSON.parse(raw) ?? '');
        } catch {
          value = '';
        }
      } else if (raw.startsWith("'")) {
        value = raw.slice(1, -1); // literal string: coerce, never emit back undefined
      } else {
        value = raw; // bare token (number/bool written by a foreign tool): coerce
      }
      (current as Record<string, unknown>)[m[1]!] = value;
    }
  }
  if (current?.id) out.push(coerce(current));
  return out;
}

/** every field a string, resolved_at null-or-string: the file is valid TOML
 *  for BOTH engines no matter what a foreign tool wrote into it. */
function coerce(e: Partial<LedgerEntry>): LedgerEntry {
  return {
    id: String(e.id ?? ''),
    source: String(e.source ?? ''),
    destination: String(e.destination ?? ''),
    kind: String(e.kind ?? ''),
    status: (['pending', 'accepted', 'declined'].includes(String(e.status))
      ? String(e.status)
      : 'pending') as LedgerEntry['status'],
    rationale: String(e.rationale ?? ''),
    proposed_at: String(e.proposed_at ?? ''),
    resolved_at:
      e.resolved_at === undefined || e.resolved_at === null ? null : String(e.resolved_at),
  };
}

/** python datetime.now(UTC).isoformat(): microseconds + "+00:00" — the
 *  cross-engine ledger diffs depend on it (D10). */
export function pythonNow(): string {
  const d = new Date();
  const ms = d.getMilliseconds().toString().padStart(3, '0');
  const us = ms + '000'; // python keeps microseconds; we pad millis to that width
  const base = d.toISOString().replace(/\.\d{3}Z$/, '');
  return `${base}.${us}+00:00`;
}

function dump(findings: readonly LedgerEntry[], ledger: string): void {
  const q = (v: string) => JSON.stringify(v);
  const lines: string[] = ['# okf findings ledger (managed)', ''];
  for (const f of findings) {
    lines.push('[[findings]]');
    lines.push(`id = ${q(f.id)}`);
    lines.push(`source = ${q(f.source)}`);
    lines.push(`destination = ${q(f.destination)}`);
    lines.push(`kind = ${q(f.kind)}`);
    lines.push(`status = ${q(f.status)}`);
    lines.push(`rationale = ${q(f.rationale)}`);
    lines.push(`proposed_at = ${q(f.proposed_at)}`);
    lines.push(`resolved_at = ${q(f.resolved_at ?? '')}`);
    lines.push('');
  }
  mkdirSync(join(ledger, '..'), { recursive: true });
  writeFileSync(ledger, lines.join('\n'), 'utf8');
}

export function proposeFinding(
  source: string,
  destination: string,
  kind: string,
  opts: { rationale?: string | undefined; bundle: string; at?: string | undefined },
): ProposeResult {
  const ledger = findingsPath(opts.bundle);
  const findings = load(ledger);
  const existing = findings.find(
    (f) => f.source === source && f.destination === destination && f.kind === kind,
  );
  if (existing) {
    return { ...existing, deduped: true, refused: existing.status === 'declined' };
  }
  const entry: LedgerEntry = {
    id: findingId(source, destination, kind),
    source,
    destination,
    kind,
    status: 'pending',
    rationale: opts.rationale ?? '',
    proposed_at: opts.at ?? pythonNow(),
    resolved_at: null,
  };
  findings.push(entry);
  findings.sort((a, b) => (a.kind < b.kind ? -1 : a.kind > b.kind ? 1 : a.id < b.id ? -1 : 1));
  dump(findings, ledger);
  return { ...entry, deduped: false, refused: false };
}

export type ResolveDecision = 'accepted' | 'declined';

export function resolveFinding(
  findingId_: string,
  decision: ResolveDecision,
  opts: { bundle: string; at?: string },
): LedgerEntry {
  const ledger = findingsPath(opts.bundle);
  const findings = load(ledger);
  for (const f of findings) {
    if (f.id === findingId_) {
      if (f.status !== 'pending') {
        throw new Error(`finding ${findingId_} is already ${f.status}`);
      }
      const resolved: LedgerEntry = {
        ...f,
        status: decision,
        resolved_at: opts.at ?? new Date().toISOString(),
      };
      const i = findings.indexOf(f);
      findings[i] = resolved;
      dump(findings, ledger);
      return resolved;
    }
  }
  throw new Error(`no finding with id ${findingId_}`);
}

export function listFindings(opts: {
  status?: 'pending' | 'accepted' | 'declined' | undefined;
  bundle: string;
}): LedgerEntry[] {
  const findings = load(findingsPath(opts.bundle));
  return findings.filter((f) => !opts.status || f.status === opts.status);
}
