#!/usr/bin/env node
import process from "node:process";
import { reExport } from "./re-export.js";

const args = process.argv;
args.shift();
args.shift();

const options = {
  "-d": undefined,
  "-e": undefined,
  "-q": undefined,
  "--dir": undefined,
  "--ext": undefined,
  "--quiet": undefined,
};

let key;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (key) {
    options[key] = arg;
    key = undefined;
  } else {
    if (Object.hasOwn(options, arg)) {
      if (arg === "-q" || arg === "--quiet") options[arg] = true;
      else key = arg;
    } else throw Error(`Option "${arg}" not found.\n`);
  }
}

reExport({
  dir: options["-d"] ?? options["--dir"],
  ext: options["-e"] ?? options["--ext"],
  quiet: options["-q"] ?? options["--quiet"],
});
