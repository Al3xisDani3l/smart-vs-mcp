# smart-vs-mcp Client Configs

## Codex App / Codex CLI

```toml
[mcp_servers.vs-mcp-smart]
type = "stdio"
command = "smart-vs-mcp"
```

## Claude Desktop

```json
{
  "mcpServers": {
    "vs-mcp-smart": {
      "command": "smart-vs-mcp",
      "args": []
    }
  }
}
```

## Claude Code

Use plugin install when published. For local testing, add the same stdio MCP command through Claude Code MCP settings.

## Workspace Settings

Place this at `<solution-root>/.mcp/mcpserver.settings.json`:

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
