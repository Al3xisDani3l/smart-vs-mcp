import { existsSync, type Dirent, readdirSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "./arg-parser.js";
import { getStatus } from "./status.js";
import type { StatusResult } from "./types.js";
import { getCliVersion } from "./version.js";

export async function runCli(args: string[], env: NodeJS.ProcessEnv, cwd: string): Promise<void> {
  const parsed = parseArgs(args);

  if (parsed.help) {
    printHelp();
    return;
  }

  if (parsed.version) {
    process.stdout.write(`${getCliVersion()}\n`);
    return;
  }

  if (parsed.command === "serve") {
    const { runProxyServer } = await import("./vs-mcp-proxy.js");
    await runProxyServer({ workspaceArg: parsed.workspaceArg, env, cwd });
    return;
  }

  if (parsed.command === "list" || parsed.command === "scan") {
    await runScan(parsed.workspaceArg ? path.resolve(parsed.workspaceArg) : cwd);
    return;
  }

  const status = await getStatus({ workspaceArg: parsed.workspaceArg, env, cwd });
  printStatus(status, parsed.command);

  if (status.error || status.health?.online === false) {
    process.exitCode = 1;
  }
}

function printHelp(): void {
  process.stdout.write(`smart-vs-mcp

Usage:
  smart-vs-mcp [--workspace <path>]
  smart-vs-mcp --version
  smart-vs-mcp -v
  smart-vs-mcp doctor [--workspace <path>]
  smart-vs-mcp status [--workspace <path>]
  smart-vs-mcp list [--workspace <path>]
  smart-vs-mcp scan [--workspace <path>]
`);
}

function printStatus(status: StatusResult, command: "doctor" | "status"): void {
  const lines = [
    `Version: ${getCliVersion()}`,
    `Mode: ${command}`,
    `Workspace: ${status.workspace.workspace}`,
    `Workspace Source: ${status.workspace.source}`,
  ];

  if (status.workspace.solutionPath) {
    lines.push(`Solution: ${status.workspace.solutionPath}`);
  }

  if (status.settings) {
    lines.push(`Settings: ${status.settings.sourcePath}`);
    lines.push(`Resolved Port: ${status.settings.settings.port}`);
    lines.push(`SDK: ${status.settings.endpoint}`);
  }

  if (status.health) {
    lines.push(`VS-MCP: ${status.health.online ? "Online" : "Offline"}`);
    if (status.health.status) {
      lines.push(`HTTP Status: ${status.health.status}`);
    }
    if (status.health.error) {
      lines.push(`Health Error: ${status.health.error}`);
    }
  }

  if (status.error) {
    lines.push(`Error: ${status.error}`);
  }

  process.stdout.write(`${lines.join("\n")}\n`);
}

async function runScan(root: string): Promise<void> {
  const found: string[] = [];
  scanForSettings(path.resolve(root), found, 4);

  if (found.length === 0) {
    process.stdout.write(`No VS-MCP settings found under ${root}\n`);
    return;
  }

  process.stdout.write(`${found.join("\n")}\n`);
}

function scanForSettings(directory: string, found: string[], remainingDepth: number): void {
  if (remainingDepth < 0) {
    return;
  }

  let entries: Dirent<string>[];
  try {
    entries = readdirSync(directory, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    if (entry.name === "node_modules" || entry.name === ".git" || entry.name === "dist") {
      continue;
    }

    const child = path.join(directory, entry.name);
    if (entry.name === ".mcp") {
      const settingsPath = path.join(child, "mcpserver.settings.json");
      if (existsSync(settingsPath)) {
        found.push(settingsPath);
      }
      continue;
    }

    scanForSettings(child, found, remainingDepth - 1);
  }
}
