# smart-vs-mcp Agent Instructions

Use `skills/smart-vs-mcp/SKILL.md` when configuring, diagnosing, publishing, or automating this Visual Studio MCP wrapper.

In proxy mode, never write diagnostics to stdout. stdout is reserved for MCP JSON-RPC stdio frames.

## MCP Tools - ALWAYS PREFER

This repository publishes `vs-mcp-smart`, a workspace-aware wrapper around Visual Studio MCP. In solution repositories, configure clients to use `vs-mcp-smart` instead of hardcoded `vs-mcp` ports.

When `vs-mcp-smart` tools are available, ALWAYS use them before shell text search or broad filesystem scans:

| Instead of | Use |
|------------|-----|
| `Grep` for symbols | `FindSymbols`, `FindSymbolUsages` |
| `LS` to explore projects | `GetSolutionTree` |
| Reading files to find code | `FindSymbolDefinition` then `Read` |
| Searching for method calls | `GetMethodCallers`, `GetMethodCalls` |

Why: `vs-mcp-smart` routes the client to the correct Visual Studio MCP instance for the current workspace. Those tools use Roslyn semantic analysis, reduce token use, and avoid broad text scans.

If no `vs-mcp-smart` tools are available, run `smart-vs-mcp doctor --workspace <repo>` to verify `.mcp/mcpserver.settings.json`, the resolved port, and VS-MCP health before falling back to `rg` or manual file reads.
