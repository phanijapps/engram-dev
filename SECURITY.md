# Security policy — the harness (alpha, hardening toward beta)

## Reporting

Report vulnerabilities privately to the maintainers (SECURITY contact in
CODEOWNERS until a dedicated address exists). Coordinated disclosure; we
respond within 7 days.

## Threat model (v1, written down — not folklore)

- **Surfaces:** two localhost-only HTTP servers (the room, the library) and
  one CLI. No network exposure by design: both bind 127.0.0.1.
- **Trust boundaries:** (1) the filesystem — packs, bundles, and their `.md`
  artifacts are **trusted-on-disk** (owner-authored repo content); the
  pages render them with markdown-to-HTML **without sanitization** — do
  not point the library at untrusted directories. (2) the browser — the
  pages are same-origin, CSP-pinned (`default-src 'self'`), nosniff,
  same-origin framing only. (3) the network — none; no telemetry, no
  outbound calls, no CDN (assets vendored).
- **Guards, tested:** path traversal (component + realpath, both directions),
  symlink escapes, overlong-UTF-8 decodes (404, never 500), non-`.md`
  artifact refusals, `.okf` state dir never enumerated, port default
  ephemeral for tests.
- **Admission is claim-gated:** every write path requires a `human:` claim;
  agents cannot approve, close, or accept.
- **Auth:** deliberately absent in v1 (localhost single-user). Auth is a
  platform-adapter concern — the adapter contract says so. Do not expose
  the ports.

## Supply chain

- **Production chain: ZERO known vulnerabilities** — `pnpm audit:prod`
  (commander + yaml only) is the CI gate at high severity.
- Dev chain (vitest/tinypool/vite) carries 8 audit advisories — all local
  test-runner gadgets whose exploits require attacker-controlled vitest/vite
  CONFIG inside this repo, which is already a trusted boundary (any such
  attacker can edit source). ACCEPTED + MONITORED: upgrade to vitest ≥4
  when its tinypool/vite pins are patched; revisit quarterly.
- Lockfile committed; installs run with pnpm 9 (pinned via
  `packageManager`); `onlyBuiltDependencies` allowlist (esbuild only).
- No postinstall scripts from dependencies; no runtime network access in
  any package.

## Known accepted risks (alpha)

- Markdown rendered without HTML sanitization (trusted-on-disk posture).
  If the library ever serves untrusted trees, sanitize before render.
- The interview/library servers have no rate limiting (localhost
  single-user; not a DoS surface in the threat model).
