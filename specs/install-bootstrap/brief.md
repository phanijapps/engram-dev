# Reliable source setup and Copilot initialization

The owner cloned Wukong and started Copilot. Its committed hook configuration
referenced an absent `.harness/hooks/copilot-context.js`. Root pnpm installation
then failed with a missing lockfile or a missing workspace package.

Provide a durable source setup entry at the repository root. Keep the active
TypeScript workspace under `treadle/`. Make both remote installers select merged
code and use the same setup mechanism. Verify that project init creates every
local hook dependency in a clone without local installation state.

The proposed source flow is `pnpm install --frozen-lockfile` from either the root
or `treadle/`. Root installation delegates dependency installation and build to
`treadle/`. An explicit `pnpm run setup` provides the same root operation.

The project flow uses an installed `wukong` executable. Full Copilot init copies
skills, agents, hook configuration, wrapper, helper, and local runtime pointer.
It also creates the project guide under its existing backup safeguards.
Hooks-only init repairs local hooks without changing project instructions.
Neither operation installs application dependencies in the target repository.

This is a new proposal. The completed install-paths, copilot-hooks, and search-kb
packs remain unchanged. Provider authentication, cloud bootstrap, global Copilot
hooks, and host trust remain outside scope.
