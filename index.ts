#!/usr/bin/env node
import { runCli } from "./src/cli.js";

await runCli(process.argv.slice(2), process.env, process.cwd());
