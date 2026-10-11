# Security policy — the harness (alpha, hardening toward beta)

## Reporting

Report vulnerabilities privately to the maintainers (SECURITY contact in
CODEOWNERS until a dedicated address exists). Coordinated disclosure; we
respond within 7 days.

## Local trust boundary

The shared service has two listeners bound to `127.0.0.1`: a private control
API and a browser application. Legacy foreground interview/library listeners
also bind localhost. These are local tools for one operating-system user;
do not forward or expose their ports.

Control health, enrollment and shutdown require a private bearer credential,
exact Host and no browser Origin. The descriptor binds protocol, instance
nonce, PID and reported addresses. Shutdown targets a verified instance through
its API; a PID alone never authorizes a kill. Startup ownership is published
atomically; stale-lock recovery requires a proven dead process, never age.
Private state uses POSIX owner permissions or Windows user ACLs. Another process
running as the same user can read these credentials and is outside isolation
guarantees. Credentials do not appear in public status or agent context.

Only the CLI/hooks enroll an explicit trusted real workspace. Browser requests
cannot enroll roots or stop the service. Project routes recheck realpath
containment; dot state/archive trees are excluded from wiki enumeration.
Browser owner writes require exact Origin, a separate page token, a held pack
revision and the core writer lock. Human actor claims record attribution;
they are not authentication. Agents must not perform owner acts.

The shared browser uses local vendored assets, CSP, nosniff and text rendering
for titles. Markdown previews run inside an opaque iframe with no sandbox
privileges and a restrictive document CSP. Source Markdown remains trusted
repository content. Legacy foreground Markdown rendering is unsanitized;
serve trusted trees only. The service sends no telemetry and makes no outbound
network calls. Host packages execute with the user's privileges and require
that host's trust/activation process.

## Supply chain

- `pnpm audit:prod` checks the complete production dependency graph at high
  severity; it does not establish that future releases are vulnerability-free.
- The 2026-10-11 cleanup updated development tooling to ESLint 10.12.0,
  Vitest/coverage 5.0.3, Vite 8.3.4 and Ajv 8.20.0. The full `pnpm audit --json`
  then reported 0 advisories. Retained audit results belong beside the cleanup
  evidence; rerun the audit when dependencies change.
- Lockfile committed; installs run with pnpm 9 (pinned via
  `packageManager`); `onlyBuiltDependencies` allowlist (esbuild only).
- No postinstall scripts from dependencies; no runtime network access in
  any package.

## Known accepted risks (alpha)

- Markdown rendered without HTML sanitization (trusted-on-disk posture).
  If the library ever serves untrusted trees, sanitize before render.
- The interview/library servers have no rate limiting (localhost
  single-user; not a DoS surface in the threat model).

## Platform durability

Pack bytes and journals are flushed before acknowledgement. POSIX additionally
flushes the parent directory; Windows Node cannot open directory handles for
fsync, so it flushes the published file after atomic rename. Failures retain
canonical pending receipts for recovery. This does not establish equivalent
power-loss behavior across filesystems; native fault-injection remains separate
from ordinary runtime and receipt recovery tests.
