/**
 * Bundle conformance (validate, ported): frontmatter-invalid/missing are
 * errors; recommended fields, broken links, legacy keys, and 0.2 shape
 * drift are warnings; unknown keys are info. Consumers MUST NOT reject on
 * warnings (§11) — the validator surfaces drift, it does not police it.
 */
import { iterConceptFiles, parseConcept } from './parse.js';
import { brokenLinks, cidSegmentsValid } from './links.js';
import { resolve, relative } from 'node:path';

const KNOWN_KEYS = new Set([
  'type',
  'title',
  'description',
  'resource',
  'tags',
  'timestamp',
  'okf_version',
  'status',
  'generated',
  'verified',
  'sources',
  'stale_after',
]);
const STATUS_VALUES = new Set(['draft', 'stable', 'deprecated']);
const RECOMMENDED = ['title', 'description'] as const;

export interface Finding {
  readonly severity: 'error' | 'warning' | 'info';
  readonly code: string;
  readonly message: string;
  readonly cid: string | null;
}

export interface Report {
  readonly conformant: boolean;
  readonly errors: readonly Finding[];
  readonly warnings: readonly Finding[];
  readonly info: readonly Finding[];
}

export function validateBundle(root: string, opts: { now?: () => number } = {}): Report {
  const now = opts.now ?? Date.now;
  const rootR = resolve(root);
  const errors: Finding[] = [];
  const warnings: Finding[] = [];
  const info: Finding[] = [];
  let conceptCount = 0;
  let rootIndexSeen = false;
  let rootOkfVersion: string | null = null;
  // pre-scan: the declared version governs concept checks regardless of order
  const prePath = resolve(rootR, 'index.md');
  try {
    const pre = parseConcept(prePath, rootR);
    if (pre.frontmatter_present && typeof pre.frontmatter['okf_version'] === 'string') {
      rootOkfVersion = pre.frontmatter['okf_version'];
    }
  } catch {
    /* no root index */
  }

  for (const md of iterConceptFiles(rootR)) {
    const c = parseConcept(md, rootR);
    const rel = relative(rootR, md).split('\\').join('/');

    if (c.reserved === 'index') {
      if (rel === 'index.md') {
        rootIndexSeen = true;
        const v = c.frontmatter['okf_version'];
        rootOkfVersion = typeof v === 'string' ? v : rootOkfVersion;
        for (const key of Object.keys(c.frontmatter)) {
          if (key !== 'okf_version') {
            info.push({
              severity: 'info',
              code: 'index-extra-key',
              message: `root index.md has unexpected frontmatter key '${key}'`,
              cid: null,
            });
          }
        }
      } else if (Object.keys(c.frontmatter).length) {
        info.push({
          severity: 'info',
          code: 'nested-index-frontmatter',
          message: 'nested index.md carries frontmatter (possible sub-bundle marker)',
          cid: c.cid,
        });
      }
      if (c.frontmatter_error) {
        errors.push({
          severity: 'error',
          code: 'frontmatter-invalid',
          message: c.frontmatter_error,
          cid: c.cid,
        });
      }
      // §8 structure (a §11.3 conformance condition): sections of bullet links
      for (const bad of indexStructureIssues(c.body ?? '')) {
        errors.push({
          severity: 'error',
          code: 'index-structure',
          message: `${rel}: ${bad} (§8, §11.3)`,
          cid: c.cid,
        });
      }
      continue;
    }
    if (c.reserved === 'log') {
      if (c.frontmatter_error) {
        errors.push({
          severity: 'error',
          code: 'frontmatter-invalid',
          message: c.frontmatter_error,
          cid: c.cid,
        });
      } else if (Object.keys(c.frontmatter).length) {
        info.push({
          severity: 'info',
          code: 'log-frontmatter',
          message: 'log.md carries frontmatter',
          cid: c.cid,
        });
      }
      // §9 structure (a §11.3 conformance condition): ISO date headings, newest first
      for (const bad of logStructureIssues(c.body ?? '')) {
        errors.push({
          severity: 'error',
          code: 'log-structure',
          message: `${rel}: ${bad} (§9, §11.3)`,
          cid: c.cid,
        });
      }
      continue;
    }
    conceptCount += 1;
    if (c.frontmatter_error) {
      errors.push({
        severity: 'error',
        code: 'frontmatter-invalid',
        message: c.frontmatter_error,
        cid: c.cid,
      });
      continue;
    }
    if (!c.frontmatter_present) {
      errors.push({
        severity: 'error',
        code: 'frontmatter-missing',
        message: 'missing frontmatter block',
        cid: c.cid,
      });
      continue;
    }
    if (!cidSegmentsValid(c.cid)) {
      warnings.push({
        severity: 'warning',
        code: 'invalid-cid',
        message: `concept id '${c.cid}' violates the kit segment rules (unaddressable by read_concept / search-graph)`,
        cid: c.cid,
      });
    }
    const type = c.frontmatter['type'];
    if (typeof type !== 'string' || !type.trim()) {
      errors.push({
        severity: 'error',
        code: 'type-empty',
        message: "frontmatter missing non-empty 'type'",
        cid: c.cid,
      });
    }
    for (const name of RECOMMENDED) {
      const v = c.frontmatter[name];
      if (v === undefined || v === null || v === '') {
        warnings.push({
          severity: 'warning',
          code: `missing-${name}`,
          message: `missing recommended field '${name}'`,
          cid: c.cid,
        });
      }
    }
    for (const key of Object.keys(c.frontmatter)) {
      if (!KNOWN_KEYS.has(key)) {
        info.push({
          severity: 'info',
          code: 'extension-key',
          message: `extension frontmatter key '${key}'`,
          cid: c.cid,
        });
      }
    }
    // OKF 0.2 semantics — advisory warnings, never errors (gated on declared version)
    if (rootOkfVersion === '0.2') {
      const fm = c.frontmatter;
      if ('timestamp' in fm) {
        warnings.push({
          severity: 'warning',
          code: 'legacy-timestamp',
          message: "'timestamp' is superseded by 'generated: {by, at}' (§13.1)",
          cid: c.cid,
        });
      }
      if (/^#\s+Citations\b/m.test(c.body)) {
        warnings.push({
          severity: 'warning',
          code: 'legacy-citations',
          message: "body '# Citations' is superseded by frontmatter 'sources' (§13.1)",
          cid: c.cid,
        });
      }
      const status = fm['status'];
      if (status !== undefined && status !== null && !STATUS_VALUES.has(String(status))) {
        warnings.push({
          severity: 'warning',
          code: 'invalid-status',
          message: `'status' must be draft | stable | deprecated, got '${String(status)}' (§5.4)`,
          cid: c.cid,
        });
      }
      const generated = fm['generated'];
      if (generated !== undefined && generated !== null) {
        const ok =
          typeof generated === 'object' &&
          generated !== null &&
          !Array.isArray(generated) &&
          typeof (generated as Record<string, unknown>)['by'] === 'string' &&
          Boolean((generated as Record<string, unknown>)['by']);
        if (!ok) {
          warnings.push({
            severity: 'warning',
            code: 'invalid-generated',
            message: "'generated' must be a mapping with non-empty 'by' (§5.2)",
            cid: c.cid,
          });
        }
      }
      // §5.3 trust tier — advisory, surfaced, never a rejection (§11)
      const tier = trustTier(fm['verified']);
      if (tier !== 'unverified') {
        info.push({
          severity: 'info',
          code: 'trust-tier',
          message: `trust tier: ${tier} (§5.3, advisory)`,
          cid: c.cid,
        });
      }
      // §5.5 staleness — the comparison, with the injectable clock
      if (typeof fm['stale_after'] === 'string') {
        const until = Date.parse(fm['stale_after']);
        if (!Number.isNaN(until) && now() >= until) {
          warnings.push({
            severity: 'warning',
            code: 'stale-after-passed',
            message: `stale: now >= stale_after (${fm['stale_after']}) (§5.5)`,
            cid: c.cid,
          });
        }
      }
      const verified = fm['verified'];
      if (verified !== undefined && verified !== null) {
        const events = Array.isArray(verified) ? verified : [verified];
        const ok = events.every(
          (e) =>
            typeof e === 'object' &&
            e !== null &&
            typeof (e as Record<string, unknown>)['by'] === 'string' &&
            Boolean((e as Record<string, unknown>)['by']),
        );
        if (!ok) {
          warnings.push({
            severity: 'warning',
            code: 'invalid-verified',
            message: "'verified' must be (a list of) mappings with non-empty 'by' (§5.2)",
            cid: c.cid,
          });
        }
      }
      const sources = fm['sources'];
      if (sources !== undefined && sources !== null) {
        const ok =
          Array.isArray(sources) &&
          sources.every(
            (sv) =>
              typeof sv === 'object' &&
              sv !== null &&
              typeof (sv as Record<string, unknown>)['resource'] === 'string' && // id is OPTIONAL per SPEC §5.1
              Boolean((sv as Record<string, unknown>)['resource']),
          );
        if (!ok) {
          warnings.push({
            severity: 'warning',
            code: 'invalid-sources',
            message: "'sources' must be a list of mappings with 'id' and 'resource' (§5.1)",
            cid: c.cid,
          });
        }
      }
      // §10 admission: Attested Computation carries runtime (REQUIRED) + shaped fields
      if (fm['type'] === 'Attested Computation') {
        if (typeof fm['runtime'] !== 'string' || (fm['runtime'] as string).length === 0) {
          errors.push({
            severity: 'error',
            code: 'attested-runtime-required',
            message: "'runtime' is REQUIRED for type: Attested Computation (§10.2)",
            cid: c.cid,
          });
        }
        const params = fm['parameters'];
        if (params !== undefined) {
          const list = Array.isArray(params) ? params : [params];
          for (const entry of list) {
            const e = entry as Record<string, unknown>;
            if (typeof e['name'] !== 'string' || typeof e['type'] !== 'string') {
              errors.push({
                severity: 'error',
                code: 'attested-parameters-shape',
                message: "each 'parameters' entry needs { name, type } (§10.2)",
                cid: c.cid,
              });
            }
          }
        }
        for (const key of ['executor', 'attester'] as const) {
          const v = fm[key] as Record<string, unknown> | undefined;
          if (v !== undefined && (typeof v !== 'object' || typeof v['resource'] !== 'string')) {
            errors.push({
              severity: 'error',
              code: `attested-${key}-shape`,
              message: `'${key}' must carry a 'resource' naming run instructions or code (§10.2)`,
              cid: c.cid,
            });
          }
        }
        if (v_exec_receipt(fm) === false) {
          errors.push({
            severity: 'error',
            code: 'attested-executor-receipt',
            message:
              "'executor' must declare 'receipt' fields (the evidence the attester inspects) (§10.2)",
            cid: c.cid,
          });
        }
      }
      if ('stale_after' in fm && typeof fm['stale_after'] !== 'string') {
        // Date (unquoted YAML) warns too — python parity
        warnings.push({
          severity: 'warning',
          code: 'invalid-stale-after',
          message: "'stale_after' must be an absolute ISO-8601 instant (§5.5)",
          cid: c.cid,
        });
      }
    }
    for (const target of brokenLinks(rootR, c.path, c.body)) {
      warnings.push({
        severity: 'warning',
        code: 'broken-link',
        message: `broken internal link '${target}'`,
        cid: c.cid,
      });
    }
  }
  if (conceptCount === 0) {
    info.push({
      severity: 'info',
      code: 'empty-bundle',
      message: 'bundle has no concept files',
      cid: null,
    });
  }
  if (!rootIndexSeen || rootOkfVersion === null) {
    info.push({
      severity: 'info',
      code: 'okf-version-missing',
      message: 'root index.md missing okf_version',
      cid: null,
    });
  } else if (rootOkfVersion !== '0.1' && rootOkfVersion !== '0.2') {
    info.push({
      severity: 'info',
      code: 'okf-version-mismatch',
      message: `okf_version '${rootOkfVersion}' (supported: 0.1/0.2)`,
      cid: null,
    });
  }
  return { conformant: errors.length === 0, errors, warnings, info };
}

// ── the debt helpers (§5.3, §8, §9, §10) ──

export function trustTier(
  verified: unknown,
): 'unverified' | 'machine-confirmed' | 'human-reviewed' {
  if (verified === undefined || verified === null) return 'unverified';
  const events = Array.isArray(verified) ? verified : [verified];
  const actors = events
    .map((e) =>
      typeof e === 'object' && e !== null ? (e as Record<string, unknown>)['by'] : undefined,
    )
    .filter((a): a is string => typeof a === 'string' && a.length > 0);
  if (actors.length === 0) return 'unverified';
  return actors.some((a) => a.startsWith('human:')) ? 'human-reviewed' : 'machine-confirmed';
}

function v_exec_receipt(fm: Record<string, unknown>): boolean | undefined {
  const ex = fm['executor'];
  if (ex === undefined) return undefined; // absent is §10.2-legal (no rule broken)
  if (typeof ex !== 'object' || ex === null) return false;
  const r = (ex as Record<string, unknown>)['receipt'];
  return (
    r !== undefined &&
    r !== null &&
    (Array.isArray(r) ? r.length > 0 : Object.keys(r as object).length > 0)
  );
}

/** §8: sections of `* [Title](url) - description` bullets. */
export function indexStructureIssues(body: string): string[] {
  const issues: string[] = [];
  const lines = body.split('\n');
  const headings = lines.filter((l) => /^#{1,6}\s+\S/.test(l));
  // §8 mandates sections grouping concepts — the MARKER GLYPH is not the rule
  // (`*` and `-` both group; the wiki itself uses `-` and is conformant)
  const bullets = lines.filter((l) => /^\s*[-*+]\s+\[.+\]\([^)]+\)/.test(l));
  if (headings.length === 0 && bullets.length === 0) return issues; // empty index carries no structure to violate
  if (headings.length === 0) issues.push('no section headings');
  if (headings.length > 0 && bullets.length === 0)
    issues.push('no bullet links under the headings');
  return issues;
}

/** §9: `## YYYY-MM-DD` date headings, newest first. */
export function logStructureIssues(body: string): string[] {
  const issues: string[] = [];
  const dates: string[] = [];
  for (const line of body.split('\n')) {
    const m = /^##\s+(\S+)/.exec(line);
    if (!m) continue;
    const d = m[1] ?? '';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) {
      issues.push(`date heading '${d}' is not ISO YYYY-MM-DD`);
    } else {
      dates.push(d);
    }
  }
  for (let i = 1; i < dates.length; i++) {
    if ((dates[i - 1] ?? '') < (dates[i] ?? '')) {
      issues.push('entries are not newest-first');
      break;
    }
  }
  return issues;
}
