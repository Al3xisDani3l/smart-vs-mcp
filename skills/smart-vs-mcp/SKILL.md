---
name: smart-vs-mcp
description: Configure, diagnose, publish, or automate the smart-vs-mcp workspace-aware wrapper for Visual Studio MCP. Use when Codex needs to install the wrapper, add .mcp/mcpserver.settings.json, configure Codex App, Codex CLI, Claude Code, Claude Desktop, Cursor, Gemini, or other stdio MCP clients, troubleshoot wrong VS-MCP ports, package plugin manifests and hooks, or prepare this repository for MCP Market submission.
---

# smart-vs-mcp

Use this skill when working with the workspace-aware Visual Studio MCP wrapper in this repo.

## Workflow

1. Build wrapper first:
   ```powershell
   npm install
   npm run build
   ```
2. Add per-workspace VS-MCP config:
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
3. Verify endpoint:
   ```powershell
   smart-vs-mcp doctor --workspace C:\Repos\SILT
   ```
4. Configure MCP clients with one global stdio server:
   ```toml
   [mcp_servers.vs-mcp-smart]
   type = "stdio"
   command = "smart-vs-mcp"
   ```

## Client Notes

- Codex App and Codex CLI: prefer global stdio config above. Launch from target workspace so cwd/env resolves the right `.mcp` settings.
- Claude Code: install plugin or add equivalent MCP stdio command. Hook can inject status, but server execution still happens through MCP client config.
- Claude Desktop: add an `mcpServers` entry using `smart-vs-mcp` as command.
- Cursor, Gemini, Windsurf, and other clients: use stdio command if supported; otherwise use their plugin manifest/extension format from this repo.

## Troubleshooting

- Wrong Visual Studio instance: run `smart-vs-mcp doctor --workspace <path>` and confirm `Resolved Port`.
- Missing config: create `.mcp/mcpserver.settings.json` at solution root.
- VS-MCP offline: start Visual Studio and its MCP extension for that solution, then rerun `doctor`.
- WSL path mismatch: pass `--workspace /mnt/c/...` or use a Windows-side shell when Visual Studio runs on Windows.
- Windows hook simulation: prefer Git for Windows Bash at `C:\Program Files\Git\bin\bash.exe`; WSL `bash.exe` can hang or misread Windows paths.
- Broken stdio: diagnostics must go to stderr in proxy mode; stdout must remain MCP JSON-RPC only.

## Publishing

Before MCP Market submission:

- Ensure repo contains `.codex-plugin`, `.claude-plugin`, `.cursor-plugin`, `hooks`, `skills`, `gemini-extension.json`, and README install docs.
- Replace `https://github.com/<owner>/SMART_VS_MCP` placeholders after the public GitHub remote exists.
- Submit the public GitHub repo URL at `https://mcpmarket.com/es/submit`.
