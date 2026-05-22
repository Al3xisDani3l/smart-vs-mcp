import { describe, expect, it } from "vitest";
import { getCandidateEndpoints } from "../../src/vs-mcp-proxy.js";

describe("vs-mcp-proxy endpoint candidates", () => {
  it("expande variantes cuando endpoint termina en /sdk/", () => {
    const candidates = getCandidateEndpoints("http://localhost:3025/sdk/");
    expect(candidates).toContain("http://localhost:3025/sdk/");
    expect(candidates).toContain("http://localhost:3025/");
    expect(candidates).toContain("http://localhost:3025/mcp/");
    expect(candidates).toContain("http://localhost:3025/sdk/mcp/");
  });

  it("agrega sdk/mcp cuando endpoint base no tiene sufijo", () => {
    const candidates = getCandidateEndpoints("http://localhost:3025");
    expect(candidates).toContain("http://localhost:3025/");
    expect(candidates).toContain("http://localhost:3025/sdk/");
    expect(candidates).toContain("http://localhost:3025/mcp/");
  });
});
