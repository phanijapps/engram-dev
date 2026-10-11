## Inherited runtime finding

Independent red-foreman identified a DEFECT at
`treadle/packages/cli/src/serve/runtime.ts:311`: post-shutdown descriptor polling
can abort with Windows `EPERM`, causing the stop command to exit 1. The observed
failure is in the retained first Windows Node 22 CI attempt. Initial
pre-authentication descriptor reads must stay strict in any future repair.
The reviewer classified this as inherited runtime behavior and required the
failed attempt to be disclosed even if an identical-source retry passed.

## Final rename verdict

PASS — nothing to fix

Checked commit `33ebde12642fb3133238febcf495d95edebf6005`, the retained Windows22
failure log at `specs/wukong-rename/native-ci/attempt-1-windows22.log`,
`treadle/packages/cli/src/serve/runtime.ts:311`, and the rename diff against the
shutdown path. The Wukong rename PACK PASS remains appropriate with the failed
first Windows22 attempt disclosed as a separate inherited runtime shutdown
flake; the rename commit did not change `stopService()` polling behavior beyond
preserving the stable `brand.stateDirectory`.

Independent review by `agent:red_foreman_plan` at `2026-10-11T02:08:27Z`.
