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
3. `%LOCALAPPDATA%/MsvcInfo/mcpserver.settings.json`
4. `SMART_VS_MCP_CONFIG` (env var)
5. `%USERPROFILE%/.smart-vs-mcp/mcpserver.settings.json` (legacy fallback)

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

## Plugin Package

This repository is prepared as a multi-client plugin package, following the same broad structure used by `obra/superpowers`:

```text
.codex-plugin/plugin.json
.claude-plugin/plugin.json
.cursor-plugin/plugin.json
gemini-extension.json
hooks/
skills/
```

The included `smart-vs-mcp` skill explains setup, client configuration, workspace settings, and troubleshooting.

## Client Installation

Choose your installation method:

- **[npm (global)](#npm)** — Standard Node.js package manager installation
- **[Codex CLI](#codex-app--codex-cli)** — Codex plugin marketplace or stdio server
- **[skillfish](#skillfish)** — Skill files for Claude repositories
- **[Claude Code](#claude-code)** — Plugin or stdio server configuration
- **[Claude Desktop](#claude-desktop)** — MCP server JSON configuration
- **[Cursor / Gemini / Other CLIs](#cursor--gemini--other-clis)** — Plugin or stdio command

For troubleshooting Codex plugin marketplace issues, see [Installing smart-vs-mcp for Codex CLI](docs/install-codex.md).

### npm

Install globally:

```powershell
npm install -g @al3xisdani3l/smart-vs-mcp
```

Or run without global install:

```powershell
npx -y @al3xisdani3l/smart-vs-mcp doctor --workspace C:\Repos\SILT
```

### skillfish

Install the skill files:

```powershell
npx skillfish add Al3xisDani3l/smart-vs-mcp --all
```

Submit/update discovery:

```powershell
npx skillfish submit Al3xisDani3l/smart-vs-mcp -y
```

### Codex App / Codex CLI

Install as a Codex plugin:

```powershell
codex plugin marketplace add Al3xisDani3l/smart-vs-mcp
codex plugin add smart-vs-mcp
```

⚠️ **Note:** In `codex plugin add`, `@` separates plugin name from **marketplace name**, not npm version tags. Example: `codex plugin add smart-vs-mcp@marketplace-name`. The marketplace must be pre-registered via `codex plugin marketplace add`. If installing a specific branch, add it when registering the marketplace: `codex plugin marketplace add Al3xisDani3l/smart-vs-mcp --ref branch-name`.

Use the plugin once published, or configure the stdio server directly:

```toml
[mcp_servers.vs-mcp-smart]
type = "stdio"
command = "npx"
args = ["-y", "@al3xisdani3l/smart-vs-mcp"]
```

Use `vs-mcp-smart` as the logical MCP server name in client configs and repo instructions. The executable remains `smart-vs-mcp` when globally installed.

### Claude Code

Use the plugin once published. For local testing, add a stdio MCP server with command `smart-vs-mcp`.

The plugin hook injects diagnostic context at session start. It does not edit your Claude configuration and does not start a persistent daemon.

### Claude Desktop

Add an MCP server entry:

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

If the package is installed globally, this also works:

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

### Cursor / Gemini / Other CLIs

Use their plugin/extension support when available, or configure the same stdio command:

```text
smart-vs-mcp
```

## Hooks

SessionStart hooks are diagnostic only. They:

- locate this plugin checkout
- run `node dist/index.js status` when the build exists
- report `npm install && npm run build` when the build is missing
- emit host-compatible context JSON
- never modify user config files
- never leave background processes running

Codex plugin installs use `hooks/hooks.codex.json`. Claude Code uses `hooks/hooks.json`.

On Windows, hook execution expects Git for Windows Bash. If `bash` resolves to WSL (`C:\Windows\system32\bash.exe`), use Git Bash explicitly for local simulation:

```powershell
& 'C:\Program Files\Git\bin\bash.exe' hooks/run-hook.cmd session-start
```

## Recommended Solution Instructions

Add this to solution-level `AGENTS.md`, `CLAUDE.md`, or equivalent context files:

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

## MCP Market Submission

When this repo has a public GitHub remote, replace placeholder URLs:

```text
https://github.com/Al3xisDani3l/smart-vs-mcp
```

Then submit the repository URL at:

```text
https://mcpmarket.com/es/submit
```
