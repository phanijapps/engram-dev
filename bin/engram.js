#!/usr/bin/env node
/** Private source entry; portable/global runtimes use the nested CLI package. */
import("../treadle/packages/cli/dist/src/main.js")
  .then(({ buildProgram }) => buildProgram().parseAsync())
  .catch((error) => {
    console.error(error.message);
    if (error.code === "ERR_MODULE_NOT_FOUND") {
      console.error(
        "Run node scripts/setup.mjs from the source repository root, then retry.",
      );
    }
    process.exitCode = 1;
  });
