import { existsSync, readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { z } from "zod";
import type { LoadedSettings, VsMcpSettings } from "./types.js";

const settingsSchema = z.object({
  port: z.number().int().min(1).max(65535),
  host: z.string().min(1).default("localhost"),
  scheme: z.enum(["http", "https"]).default("http"),
  sdkPath: z.string().min(1).default("/sdk/"),
  defaultPathFormat: z.enum(["Windows", "Posix"]).default("Windows"),
  autoStart: z.boolean().default(false),
});

export class SettingsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SettingsError";
  }
}

export function loadSettings(workspace: string, env: NodeJS.ProcessEnv = process.env): LoadedSettings {
  const sourcePath = findSettingsPath(workspace, env);
  if (!sourcePath) {
    throw new SettingsError(
      `No VS-MCP settings found. Expected ${path.join(workspace, ".mcp", "mcpserver.settings.json")} or ${path.join(workspace, ".mcpserver.settings.json")}.`,
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(sourcePath, "utf8"));
  } catch (error) {
    throw new SettingsError(`Cannot read settings at ${sourcePath}: ${errorMessage(error)}`);
  }

  const result = settingsSchema.safeParse(parsed);
  if (!result.success) {
    throw new SettingsError(`Invalid settings at ${sourcePath}: ${result.error.issues.map((issue) => issue.message).join("; ")}`);
  }

  const settings = normalizeSettings(result.data);
  return {
    settings,
    sourcePath,
    endpoint: buildEndpoint(settings),
  };
}

export function findSettingsPath(workspace: string, env: NodeJS.ProcessEnv = process.env): string | undefined {
  return getSettingsCandidatePaths(workspace, env).find((candidate) => existsSync(candidate));
}

export function getSettingsCandidatePaths(workspace: string, env: NodeJS.ProcessEnv = process.env): string[] {
  return [
    path.join(workspace, ".mcp", "mcpserver.settings.json"),
    path.join(workspace, ".mcpserver.settings.json"),
    env.SMART_VS_MCP_CONFIG,
    path.join(os.homedir(), ".smart-vs-mcp", "mcpserver.settings.json"),
  ].filter(Boolean) as string[];
}

export function buildEndpoint(settings: VsMcpSettings): string {
  const sdkPath = settings.sdkPath.startsWith("/") ? settings.sdkPath : `/${settings.sdkPath}`;
  const normalizedPath = sdkPath.endsWith("/") ? sdkPath : `${sdkPath}/`;
  return `${settings.scheme}://${settings.host}:${settings.port}${normalizedPath}`;
}

function normalizeSettings(settings: z.infer<typeof settingsSchema>): VsMcpSettings {
  return {
    ...settings,
    sdkPath: settings.sdkPath.startsWith("/") ? settings.sdkPath : `/${settings.sdkPath}`,
  };
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
