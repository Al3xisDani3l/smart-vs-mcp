import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { mkdirSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";

const openClients: Client[] = [];
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

describe("stdio proxy diagnostics", () => {
  afterEach(async () => {
    await Promise.allSettled(openClients.splice(0).map((client) => client.close()));
  });

  it("stays alive and exposes status tool when no workspace settings exist", async () => {
    const cwd = path.join(os.tmpdir(), `smart-vs-mcp-empty-${crypto.randomUUID()}`);
    mkdirSync(cwd, { recursive: true });

    const client = new Client({ name: "diagnostic-test", version: "1.0.0" });
    openClients.push(client);

    const transport = new StdioClientTransport({
      command: process.execPath,
      args: [path.join(repoRoot, "dist", "index.js")],
      cwd,
      env: {
        ...process.env,
        CODEX_WORKSPACE: "",
        WORKSPACE: "",
        INIT_CWD: "",
        PWD: cwd,
      },
    });

    await client.connect(transport);

    const tools = await client.listTools();
    expect(tools.tools.map((tool) => tool.name)).toContain("smart_vs_mcp_status");

    const status = await client.callTool({ name: "smart_vs_mcp_status", arguments: {} });
    const text = status.content[0];
    expect(text.type).toBe("text");
    if (text.type === "text") {
      expect(text.text).toContain("Proxy: diagnostic mode");
      expect(text.text).toContain(".mcp");
    }
  }, 10000);
});
