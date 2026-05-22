import { mkdirSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildEndpoint, findSettingsPath, getSettingsCandidatePaths, loadSettings, SettingsError } from "../../src/settings-resolver.js";
import { resolveWorkspace } from "../../src/workspace-resolver.js";

describe("SmartVsMcp.UnitTests", () => {
  it("resuelve settings de .mcp con prioridad", () => {
    const root = tempDir();
    mkdirSync(path.join(root, ".mcp"), { recursive: true });
    writeFileSync(path.join(root, ".mcpserver.settings.json"), JSON.stringify({ port: 3110 }));
    writeFileSync(path.join(root, ".mcp", "mcpserver.settings.json"), JSON.stringify({ port: 3111 }));
    const result = loadSettings(root, {});
    expect(result.settings.port).toBe(3111);
  });

  it("normaliza endpoint", () => {
    expect(buildEndpoint({ port: 3015, host: "localhost", scheme: "http", sdkPath: "sdk", defaultPathFormat: "Windows", autoStart: false })).toBe(
      "http://localhost:3015/sdk/",
    );
  });

  it("falla con puerto invalido", () => {
    const root = tempDir();
    mkdirSync(path.join(root, ".mcp"), { recursive: true });
    writeFileSync(path.join(root, ".mcp", "mcpserver.settings.json"), JSON.stringify({ port: 70000 }));
    expect(() => loadSettings(root, {})).toThrow(SettingsError);
  });

  it("prioriza --workspace sobre entorno/cwd", () => {
    const root = tempDir();
    const arg = path.join(root, "arg");
    const envWs = path.join(root, "env");
    const cwd = path.join(root, "cwd");
    mkdirSync(arg, { recursive: true });
    mkdirSync(envWs, { recursive: true });
    mkdirSync(cwd, { recursive: true });
    const result = resolveWorkspace({ workspaceArg: arg, env: { CODEX_WORKSPACE: envWs }, cwd });
    expect(result.workspace).toBe(arg);
    expect(result.source).toBe("argument");
  });

  it("incluye LOCALAPPDATA como candidato", () => {
    const root = tempDir();
    const candidates = getSettingsCandidatePaths(root, { LOCALAPPDATA: path.join(root, "la") });
    expect(candidates[2]).toContain(path.join("la", "MsvcInfo", "mcpserver.settings.json"));
  });

  it("encuentra settings por SMART_VS_MCP_CONFIG", () => {
    const root = tempDir();
    const envPath = path.join(root, "env", "mcpserver.settings.json");
    mkdirSync(path.dirname(envPath), { recursive: true });
    writeFileSync(envPath, JSON.stringify({ port: 3120 }));
    expect(findSettingsPath(root, { SMART_VS_MCP_CONFIG: envPath })).toBe(envPath);
  });
});

function tempDir(): string {
  return path.join(os.tmpdir(), `smart-vs-mcp-ut-${crypto.randomUUID()}`);
}
