# Portable feedback protocol

Run from an enrolled project with a running shared application. Use the canonical
pack directory. These examples use `do` after the installed executable; replace
placeholders with observed values and generated UUIDs, never literal placeholders.

```text
do feedback open <packDir> --mode documents --file <relative.md> --artifact <key> --expected-revision <n> --operation-id <uuid> --by agent:<host> --json
do feedback open <packDir> --mode diff --base <ref> --file <path1> <path2> --expected-revision <n> --operation-id <uuid> --by agent:<host> --json
do feedback read <packDir> --session <uuid> --after <cursor> --json
do feedback wait <packDir> --session <uuid> --after <cursor> --timeout 30 --json
do feedback reply <packDir> --session <uuid> --thread <uuid> --body-file <utf8-file> --expected-revision <n> --operation-id <uuid> --by agent:<host> --json
do feedback round <packDir> --session <uuid> --expected-revision <n> --operation-id <uuid> --by agent:<host> --json
```

`--file` and `--artifact` accept explicit lists. Choose one or both in document
mode; Git refs apply only to diff mode. Code comparisons need a local Git root;
optional `--head <ref>` selects a committed after-side instead of worktree bytes.
Baseline/head resolve once to immutable commit IDs; original ref strings remain
bound to open-request identity for retry. Renames need both old and new paths
selected. No configured external diff/text conversion/filter/transport is run;
missing local objects fail without a network fetch.

Prefer the default worktree after-side when the agent should revise the selected
files across rounds. `--head` fixes the after-side for the lifetime of that session;
`round` reads that committed SHA again, even if the worktree changed. To review a
new commit or worktree revision, open a new session with that explicit comparison,
reply with its URL in the original thread and retain the old history. A document
plus diff request can use two sessions, with the feedback revision from the first
open passed to the second; do not mix artifact keys into diff mode.

The `feedback-result/1` result identifies project, pack/session, revision and cursor.
Open returns the original cursor0 even on replay. Read/wait returns
`pending|submitted|closed`; command refusals emit `unavailable`, `code`, `message`
and exit1. A pending timeout exits0 and is not permission. Ctrl-C cancels a wait
without changing feedback state. Wait bounds are1–60 seconds.

Submitted batches retain stable ID, monotonically increasing cursor and items.
An item is `comment` or `reattach`, with stable item/thread ID, reviewed anchor,
body, author and observation time; reattachment also preserves original anchor
and human event ID. Disposition contains resolved/stale state; resolved batches
are retained rather than consumed. Draft bodies never appear in read/wait output.

Mutations require the held **feedback** revision, distinct from canonical pack
revision. A session operation result and a subsequent read expose that revision.
Use the same operation UUID, claim and payload when recovering a lost response.
An identical committed retry returns the original receipt before checking the old
revision. Reusing its UUID for a changed payload conflicts. After a genuine stale
revision refusal, refresh first; a still-uncommitted identical operation can use
the refreshed revision. Do not generate duplicate operations after a lost response.

Bodies and snapshots are UTF-8, preserving reviewed bytes. Limits:32 targets,
256KiB/file,4MiB/round including both sides,20rounds/session,4MiB ledger,
8KiB/comment or reply,84MiB total feedback storage. Refusals retain old snapshots;
no truncated or binary review is silently accepted. Source movement before
publication conflicts. Corrupt state/pending pack recovery needs explicit recovery,
not deleted history or silent retry that invents success.

Only agent CLI actions create sessions/rounds/replies. Human browser actions save
drafts, Submit, Resolve and Reattach. Submit seals a round; another agent round
reopens drafting. Reattach is delivered only after a new Submit. Human resolution
never retracts a submitted batch. None of these actions writes canonical owner
approval/Start/Finish receipts or task evidence. Completed packs are read-only;
legacy packs require a separate owner adoption before feedback use.

Before edits, hash the selected current bytes and compare them with the stored
anchor/manifest hashes. Use stored snapshot GETs only through the returned project
view or read the contained immutable snapshot paths. Do not assume a stale thread
can be retargeted by matching text. Reply stale, publish refreshed selected bytes,
then let the human explicitly reattach and submit. If publication is refused,
return control with that error instead of waiting against inaccessible bytes.
