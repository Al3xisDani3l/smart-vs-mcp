# smart-vs-mcp

Workspace-aware stdio wrapper for Visual Studio MCP HTTP endpoints.

## Goal

MCP clients can use one global server command instead of hardcoding a Visual Studio MCP port:

```toml
[mcp_servers.vs-mcp-smart]
type = "stdio"
command = "smart-vs-mcp"
```

The wrapper resolves the current workspace, reads that workspace's VS-MCP settings, then proxies MCP traffic to the right endpoint.

## Workspace Settings

Lookup order:

1. `<workspace>/.mcp/mcpserver.settings.json`
2. `<workspace>/.mcpserver.settings.json`
3. `%USERPROFILE%/.smart-vs-mcp/mcpserver.settings.json`

Example:

```json
{
  "port": 3011,
  "host": "localhost",
  "scheme": "http",
  "sdkPath": "/sdk/",
  "defaultPathFormat": "Windows",
  "autoStart": false
}
```

## Commands

```powershell
smart-vs-mcp
smart-vs-mcp doctor --workspace C:\Repos\SILT
smart-vs-mcp status --workspace C:\Repos\SILT
smart-vs-mcp list --workspace C:\Repos
smart-vs-mcp scan --workspace C:\Repos
```

Default command starts stdio MCP proxy. Diagnostics write human-readable output to stdout only for diagnostic commands. Proxy mode writes diagnostics to stderr so stdout stays valid MCP stdio.

## Development

```powershell
npm install
npm run typecheck
npm test
npm run build
```
