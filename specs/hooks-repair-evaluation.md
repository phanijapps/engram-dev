# Hook repairs — 2026-10-11

The user authorized repairs to the three defects from the installed-hook audit.
These changes are uncommitted. The base revision and dirty source hashes are in
[the evidence record](hooks-repair-evidence.json).

## Result

Claude now uses current lifecycle callbacks and their shared context helper.
Project callbacks find their relative payload through the nearest ancestor
`.claude/settings.json`. They preserve stdin and the session directory.
Global callbacks retain absolute paths. Codex command definitions remain unchanged.

The guard now covers real corpus `expected.*` witnesses and legacy generated directories.
Pi blocks supported file-tool writes before execution. Reads remain permitted.
Claude PostToolUse reads stdin and reports advisory context after the completed call.

The authoritative compiler and guard changed first. The canonical installer then
refreshed Claude, Pi and Codex hooks. No installed payload or settings file was
patched independently. The exact three observed legacy Claude callbacks were
recorded in local installer ownership before replacement. Foreign settings and
callbacks remain outside that reconciliation. Claude has one current callback per event.

## Verification

| Check | Actual result |
| --- | --- |
| Installed Codex and Claude lifecycle commands | 8 root/subdirectory checks passed; valid connected context |
| Installed Claude PostToolUse commands | 6 checks passed; Read empty, managed-path Write advisory |
| Installed Pi handlers | Registered once; connected context; reads allowed; wiki and corpus writes blocked |
| New regression cases | Relocation, subdirectories, stdin, ownership upgrade, reinstall, removal, global paths and real corpus filenames |
| `pnpm check` | Exit 0; 179 tests in 42 files |
| `pnpm coverage` | Exit 0; statements 86.52%, branches 76.45%, functions 95.06%, lines 86.52% |
| `pnpm corpus:check` | Exit 0; committed corpus unchanged |
| `pnpm brand:check` | Exit 0 |
| `pnpm audit:prod` | Exit 0 |
| `pnpm links` | Exit 0 |
| Wiki fingerprints, stamp, anchors, validation and status | Each exit 0; 0 errors, 0 warnings, 0 anchors needing review; fresh stamp |

The first focused run exposed a misplaced test boundary fixture and an old
argument-position assertion. Both were corrected before the passing rerun.
Independent review also found an old assertion in init-engine; that was corrected.
The final full gate includes these corrections. Original installed-command failures
remain in the evidence record for comparison.

## Documentation impact

The hook README and architecture page describe the current callback paths,
event input, output, guard coverage and operational limits. The bounded knowledge
refresh covers architecture, dependencies, interfaces, events, operations and history.
Host events feed the launcher; the launcher resolves the installed callback;
the callback uses the runtime pointer and CLI to connect and read context.
Product intent and domain entities did not change. Installer ownership semantics
and the runtime pointer format did not change. No normative finding was resolved.

## Limits

Context still uses the exact event directory as the workspace. A session under
`treadle/` therefore looks for `treadle/wiki` and `treadle/specs`. Start at the
repository root for the canonical knowledge and work context.

The smoke checks exercise actual configured commands and installed Pi handlers.
They do not establish native host activation, reload or Windows execution.
Claude PostToolUse remains advisory. The file-tool guard is not a shell sandbox.

The wiki stamp compares Git HEAD. Fingerprints cover Python only. Dirty TypeScript
and Markdown claims were inspected directly; a fresh stamp does not establish that
coverage. The wiki reports one existing pending finding, which remains pending.
No owner action, task admission, historical pack alteration or commit occurred.

Independent read-only verdict: see [red-foreman](hooks-repair-red-foreman.md).
