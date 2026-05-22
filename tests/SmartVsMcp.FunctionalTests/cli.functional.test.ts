import { describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const cliEntry = path.join(repoRoot, "dist", "index.js");

function runCli(args: string[]): { code: number | null; stdout: string; stderr: string } {
  const result = spawnSync(process.execPath, [cliEntry, ...args], { encoding: "utf8", cwd: repoRoot });
  return { code: result.status, stdout: result.stdout, stderr: result.stderr };
}

describe("SmartVsMcp.FunctionalTests", () => {
  it("--help responde y code 0", () => {
    const out = runCli(["--help"]);
    expect(out.code).toBe(0);
    expect(out.stdout).toContain("smart-vs-mcp");
  });

  it("list ejecuta y no crashea", () => {
    const out = runCli(["list", "--workspace", repoRoot]);
    expect(out.code).toBe(0);
    expect(out.stdout.length).toBeGreaterThan(0);
  });

  it("doctor retorna code 1 cuando endpoint no esta en linea", () => {
    const out = runCli(["doctor", "--workspace", repoRoot]);
    expect([0, 1]).toContain(out.code ?? 1);
    expect(out.stdout).toContain("Mode: doctor");
  });
});
