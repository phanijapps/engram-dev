# Copilot hooks execution observations

The owner accepted D-1/D-2 and started plan digest `cec6d1dcad85ee74b4b48070da21c63fb1feccb761a1afbc8ababf6ddcc31194` at canonical revision 7.
T-1 was admitted through `do next --expected-revision 7`, producing revision 8.

T-1 implementation detail: a separate wrapper reuses bounded stdin and eventContext, and keeps Copilot output separate from existing hosts.
The first file-write attempt used repository-prefixed paths from `treadle` and failed; its subsequent empty test selection exited 1.
No task pass was recorded for that failure; the retained log is `checks/T-1-path-failure.log`.
The corrected task expectation is running against the actual wrapper and protocol fixtures.
Approved proposal documents remain unchanged.
