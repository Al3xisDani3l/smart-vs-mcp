import { afterEach, describe, expect, it } from "vitest";
import { getStatus } from "../../src/status.js";
import { createTempWorkspace, startStubServer, writeSettings } from "./test-fixtures.js";

describe("SmartVsMcp.IntegrationTests", () => {
  const servers: Array<{ close: () => void }> = [];

  afterEach(() => {
    for (const server of servers.splice(0)) {
      server.close();
    }
  });

  it("doctor/status: marca online con 405", async () => {
    const workspace = createTempWorkspace();
    const { server, port } = await startStubServer(405);
    servers.push(server);
    writeSettings(workspace, port);

    const result = await getStatus({ cwd: workspace, env: {}, workspaceArg: workspace });
    expect(result.error).toBeUndefined();
    expect(result.health?.online).toBe(true);
    expect(result.health?.status).toBe(405);
  });

  it("marca offline por timeout/puerto no alcanzable", async () => {
    const workspace = createTempWorkspace();
    writeSettings(workspace, 65534);
    const result = await getStatus({ cwd: workspace, env: {}, workspaceArg: workspace });
    expect(result.health?.online ?? false).toBe(false);
  });

  it("reporta error accionable si settings faltan", async () => {
    const workspace = createTempWorkspace();
    const result = await getStatus({ cwd: workspace, env: {}, workspaceArg: workspace });
    expect(result.error).toContain("No VS-MCP settings found");
  });
});
