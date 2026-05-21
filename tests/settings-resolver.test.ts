import { mkdirSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildEndpoint, findSettingsPath, getSettingsCandidatePaths, loadSettings, SettingsError } from "../src/settings-resolver.js";

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

  it("includes LOCALAPPDATA MsvcInfo as third candidate", () => {
    const root = tempDir();
    const env = {
      LOCALAPPDATA: path.join(root, "LocalAppData"),
      SMART_VS_MCP_CONFIG: path.join(root, "env", "mcpserver.settings.json"),
    };

    const candidates = getSettingsCandidatePaths(root, env);

    expect(candidates[0]).toBe(path.join(root, ".mcp", "mcpserver.settings.json"));
    expect(candidates[1]).toBe(path.join(root, ".mcpserver.settings.json"));
    expect(candidates[2]).toBe(path.join(root, "LocalAppData", "MsvcInfo", "mcpserver.settings.json"));
    expect(candidates[3]).toBe(path.join(root, "env", "mcpserver.settings.json"));
  });

  it("prefers LOCALAPPDATA MsvcInfo over SMART_VS_MCP_CONFIG", () => {
    const root = tempDir();
    const localAppData = path.join(root, "LocalAppData");
    const localSettings = path.join(localAppData, "MsvcInfo", "mcpserver.settings.json");
    const envSettings = path.join(root, "env", "mcpserver.settings.json");

    mkdirSync(path.dirname(localSettings), { recursive: true });
    mkdirSync(path.dirname(envSettings), { recursive: true });
    writeFileSync(localSettings, JSON.stringify({ port: 3012 }));
    writeFileSync(envSettings, JSON.stringify({ port: 3013 }));

    const result = findSettingsPath(root, {
      LOCALAPPDATA: localAppData,
      SMART_VS_MCP_CONFIG: envSettings,
    });

    expect(result).toBe(localSettings);
  });

  it("still resolves when LOCALAPPDATA is missing", () => {
    const root = tempDir();
    const envSettings = path.join(root, "env", "mcpserver.settings.json");
    mkdirSync(path.dirname(envSettings), { recursive: true });
    writeFileSync(envSettings, JSON.stringify({ port: 3014 }));

    const candidates = getSettingsCandidatePaths(root, {
      SMART_VS_MCP_CONFIG: envSettings,
    });

    expect(candidates).not.toContain(path.join(root, "LocalAppData", "MsvcInfo", "mcpserver.settings.json"));
    expect(candidates[2]).toBe(envSettings);
    expect(findSettingsPath(root, { SMART_VS_MCP_CONFIG: envSettings })).toBe(envSettings);
  });
});

function tempDir(): string {
  return path.join(os.tmpdir(), `smart-vs-mcp-${crypto.randomUUID()}`);
}
