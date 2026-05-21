# smart-vs-mcp

Use the `smart-vs-mcp` skill before configuring this wrapper or debugging workspace-to-port resolution.

The wrapper is a local stdio MCP server that resolves the current workspace and proxies to the correct Visual Studio MCP HTTP endpoint.

## MCP Tools - ALWAYS PREFER

In solution repositories, use `vs-mcp-smart` as the MCP server name. It routes to the correct Visual Studio MCP port for the current workspace.

When `vs-mcp-smart` tools are available, ALWAYS prefer Roslyn-backed MCP tools over shell exploration:

| Instead of | Use |
|------------|-----|
| `Grep` for symbols | `FindSymbols`, `FindSymbolUsages` |
| `LS` to explore projects | `GetSolutionTree` |
| Reading files to find code | `FindSymbolDefinition` then `Read` |
| Searching for method calls | `GetMethodCallers`, `GetMethodCalls` |

Why: `vs-mcp-smart` preserves the Visual Studio MCP semantic workflow while removing hardcoded ports and wrong-solution collisions.
