#!/usr/bin/env node
import { pathToFileURL } from "node:url";
import { runCli } from "./src/cli.js";

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await runCli(process.argv.slice(2), process.env, process.cwd());
}
