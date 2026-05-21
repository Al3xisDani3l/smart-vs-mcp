import { mkdirSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildEndpoint, loadSettings, SettingsError } from "../src/settings-resolver.js";

describe("loadSettings", () => {
  it("prefers .mcp settings before root settings", () => {
    const root = tempDir();
    mkdirSync(path.join(root, ".mcp"), { recursive: true });
    writeFileSync(path.join(root, ".mcpserver.settings.json"), JSON.stringify({ port: 3010 }));
    writeFileSync(path.join(root, ".mcp", "mcpserver.settings.json"), JSON.stringify({ port: 3011 }));

    const result = loadSettings(root, {});

    expect(result.settings.port).toBe(3011);
    expect(result.sourcePath).toBe(path.join(root, ".mcp", "mcpserver.settings.json"));
  });

  it("builds normalized endpoint", () => {
    expect(
      buildEndpoint({
        port: 3015,
        host: "localhost",
        scheme: "http",
        sdkPath: "sdk",
        defaultPathFormat: "Windows",
        autoStart: false,
      }),
    ).toBe("http://localhost:3015/sdk/");
  });

  it("rejects missing or invalid port", () => {
    const root = tempDir();
    mkdirSync(path.join(root, ".mcp"), { recursive: true });
    writeFileSync(path.join(root, ".mcp", "mcpserver.settings.json"), JSON.stringify({ port: 70000 }));

    expect(() => loadSettings(root, {})).toThrow(SettingsError);
  });
});

function tempDir(): string {
  return path.join(os.tmpdir(), `smart-vs-mcp-${crypto.randomUUID()}`);
}
