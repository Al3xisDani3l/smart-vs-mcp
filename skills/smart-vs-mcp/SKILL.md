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
   command = "npx"
   args = ["-y", "@al3xisdani3l/smart-vs-mcp"]
   ```

Use `smart-vs-mcp` as command only when `@al3xisdani3l/smart-vs-mcp` is installed globally.

## Client Notes

- npm: publish/install as `@al3xisdani3l/smart-vs-mcp`; command remains `smart-vs-mcp`.
- skillfish: `npx skillfish add Al3xisDani3l/smart-vs-mcp --all`.
- Codex App and Codex CLI: install with `codex plugin marketplace add al3xisdani3l/smart-vs-mcp` then `codex plugin install smart-vs-mcp`; plugin autoconfigures MCP from `.mcp.json`.
- Claude Code: install plugin or add equivalent MCP stdio command. Hook can inject status, but server execution still happens through MCP client config.
- Claude Desktop: add an `mcpServers` entry using `npx -y @al3xisdani3l/smart-vs-mcp` unless global npm install exists.
- Cursor, Gemini, Windsurf, and other clients: use stdio command if supported; otherwise use their plugin manifest/extension format from this repo.

## Solution AGENTS.md Guidance

When adding guidance to a solution repo, refer to the MCP server as `vs-mcp-smart`, not hardcoded `vs-mcp`.

Use this block:

```markdown
## MCP Tools - ALWAYS PREFER

This solution uses `vs-mcp-smart`, a workspace-aware wrapper around Visual Studio MCP. It resolves the correct VS-MCP endpoint from `.mcp/mcpserver.settings.json`.

When `vs-mcp-smart` tools are available, ALWAYS use them before Grep/Glob/LS:

| Instead of | Use |
|------------|-----|
| `Grep` for symbols | `FindSymbols`, `FindSymbolUsages` |
| `LS` to explore projects | `GetSolutionTree` |
| Reading files to find code | `FindSymbolDefinition` then `Read` |
| Searching for method calls | `GetMethodCallers`, `GetMethodCalls` |

Why: `vs-mcp-smart` routes to the correct Visual Studio instance for this workspace. MCP tools use Roslyn semantic analysis, reduce token use, and avoid broad text scans.

If tools are missing, run `smart-vs-mcp doctor --workspace <repo>` before falling back to manual search.
```

## Troubleshooting

- Wrong Visual Studio instance: run `smart-vs-mcp doctor --workspace <path>` and confirm `Resolved Port`.
- Missing config: create `.mcp/mcpserver.settings.json` at solution root.
- Claude/Codex opens without workspace: the MCP server should stay alive and expose `smart_vs_mcp_status`; use it to see expected config paths.
- VS-MCP offline: start Visual Studio and its MCP extension for that solution, then rerun `doctor`.
- WSL path mismatch: pass `--workspace /mnt/c/...` or use a Windows-side shell when Visual Studio runs on Windows.
- Windows hook simulation: prefer Git for Windows Bash at `C:\Program Files\Git\bin\bash.exe`; WSL `bash.exe` can hang or misread Windows paths.
- Broken stdio: diagnostics must go to stderr in proxy mode; stdout must remain MCP JSON-RPC only.

## Publishing

Before MCP Market submission:

- Ensure repo contains `.codex-plugin`, `.claude-plugin`, `.cursor-plugin`, `hooks`, `skills`, `gemini-extension.json`, and README install docs.
- Confirm plugin manifests point to `https://github.com/Al3xisDani3l/smart-vs-mcp`.
- Submit the public GitHub repo URL at `https://mcpmarket.com/es/submit`.
