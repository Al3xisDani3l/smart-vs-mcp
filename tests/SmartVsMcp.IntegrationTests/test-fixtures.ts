import { mkdirSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { createServer, type Server } from "node:http";

export function createTempWorkspace(): string {
  const workspace = path.join(os.tmpdir(), `smart-vs-mcp-it-${crypto.randomUUID()}`);
  mkdirSync(path.join(workspace, ".mcp"), { recursive: true });
  return workspace;
}

export function writeSettings(workspace: string, port: number): string {
  const settingsPath = path.join(workspace, ".mcp", "mcpserver.settings.json");
  writeFileSync(
    settingsPath,
    JSON.stringify({
      port,
      host: "127.0.0.1",
      scheme: "http",
      sdkPath: "/sdk/",
      defaultPathFormat: "Windows",
      autoStart: false,
    }),
  );
  return settingsPath;
}

export async function startStubServer(statusCode: number): Promise<{ server: Server; port: number }> {
  const server = createServer((_, response) => {
    response.statusCode = statusCode;
    response.end("stub");
  });

  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", () => resolve()));
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Cannot determine stub server port");
  }

  return { server, port: address.port };
}
