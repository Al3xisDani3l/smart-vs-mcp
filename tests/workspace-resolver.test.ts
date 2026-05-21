import { mkdirSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { resolveWorkspace } from "../src/workspace-resolver.js";

describe("resolveWorkspace", () => {
  it("uses env workspace before cwd", () => {
    const root = tempDir();
    const envWorkspace = path.join(root, "env");
    const cwdWorkspace = path.join(root, "cwd");
    mkdirSync(envWorkspace, { recursive: true });
    mkdirSync(cwdWorkspace, { recursive: true });

    const result = resolveWorkspace({
      env: { CODEX_WORKSPACE: envWorkspace },
      cwd: cwdWorkspace,
    });

    expect(result.workspace).toBe(envWorkspace);
    expect(result.source).toBe("env:CODEX_WORKSPACE");
  });

  it("finds nearest solution root", () => {
    const root = tempDir();
    const nested = path.join(root, "src", "Project");
    mkdirSync(nested, { recursive: true });
    writeFileSync(path.join(root, "App.sln"), "");

    const result = resolveWorkspace({
      env: {},
      cwd: nested,
    });

    expect(result.workspace).toBe(root);
    expect(result.solutionPath).toBe(path.join(root, "App.sln"));
  });
});

function tempDir(): string {
  return path.join(os.tmpdir(), `smart-vs-mcp-${crypto.randomUUID()}`);
}
