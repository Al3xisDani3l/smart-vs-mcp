# smart-vs-mcp Client Configs

## Codex App / Codex CLI

```toml
[mcp_servers.vs-mcp-smart]
type = "stdio"
command = "npx"
args = ["-y", "@al3xisdani3l/smart-vs-mcp"]
```

## Claude Desktop

```json
{
  "mcpServers": {
    "vs-mcp-smart": {
      "command": "npx",
      "args": [
        "-y",
        "@al3xisdani3l/smart-vs-mcp"
      ]
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
