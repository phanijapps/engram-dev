#!/usr/bin/env node
/** The root entry: ordinary package resolution through the installed
 *  dependency tree — no path guessing, works identically from the
 *  repository, a pack, and a global install. */
import("@treadle/cli/dist/src/main.js")
  .then(({ buildProgram }) => buildProgram().parseAsync())
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
