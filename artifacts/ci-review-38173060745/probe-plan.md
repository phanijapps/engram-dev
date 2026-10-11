# Bounded CI diagnosis probes

Declared before execution on 2026-10-11. Mode: bug analysis.

Question: Do aliased filesystem roots explain the macOS feedback and global
Codex hook failures without changing application code?

Method: Use temporary directories on Linux. Create a trusted-root alias and
invoke the current feedback containment helper with the equivalent absolute
pack path. Then invoke the current Codex hook through an aliased ancestor with
fixture stdin and a stub runtime. Compare physical-path and alias-path outcomes.
Record actual exit, stdout, stderr and elapsed time. Remove only temporary data.

Timebox: 5 minutes from the first probe. Stop once both outcomes are observed.
Keep probes as artifact authoring code; do not modify runtime or installed hooks.
A Linux alias reproduction cannot establish a native macOS or Windows pass.

For Windows, inspect the failed stack and the strict Git-root comparison.
Compare Windows path representations with Node's win32 path functions.
This illustrates a causal hypothesis; it does not substitute for native Git
root and filesystem identity measurements on a Windows runner.
