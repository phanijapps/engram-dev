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

export function validateBundle(root: string): Report {
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
              typeof (sv as Record<string, unknown>)['id'] === 'string' &&
              typeof (sv as Record<string, unknown>)['resource'] === 'string',
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
      if ('stale_after' in fm && typeof fm['stale_after'] !== 'string') {
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
