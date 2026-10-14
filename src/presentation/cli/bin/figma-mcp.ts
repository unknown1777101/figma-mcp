#!/usr/bin/env node
import { createProgram } from '../program.js';

async function run() {
  const program = createProgram();

  // If invoked bare without arguments, display full help menu cleanly
  if (process.argv.length <= 2) {
    console.log(program.helpInformation());
    return;
  }

  try {
    await program.parseAsync(process.argv);
  } catch (err: any) {
    console.error(`\x1b[31m✖ Error:\x1b[0m ${err.message || err}`);
    process.exitCode = 1;
  }
}

run();
