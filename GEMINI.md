# smart-vs-mcp

Use the `smart-vs-mcp` skill for setup, diagnostics, client configuration, and MCP Market packaging of this workspace-aware Visual Studio MCP wrapper.

## MCP Tools - ALWAYS PREFER

Use `vs-mcp-smart` in solution repositories. It resolves the workspace-specific Visual Studio MCP endpoint.

When `vs-mcp-smart` tools are available, prefer semantic MCP operations:

| Instead of | Use |
|------------|-----|
| `Grep` for symbols | `FindSymbols`, `FindSymbolUsages` |
| `LS` to explore projects | `GetSolutionTree` |
| Reading files to find code | `FindSymbolDefinition` then `Read` |
| Searching for method calls | `GetMethodCallers`, `GetMethodCalls` |

Why: Roslyn semantic analysis is more precise and lower-token than broad text scans.
