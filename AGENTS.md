# smart-vs-mcp Agent Instructions

Use `skills/smart-vs-mcp/SKILL.md` when configuring, diagnosing, publishing, or automating this Visual Studio MCP wrapper.

In proxy mode, never write diagnostics to stdout. stdout is reserved for MCP JSON-RPC stdio frames.

## Workspace Shape

This repo is a TypeScript/Node MCP proxy package published as `@al3xisdani3l/smart-vs-mcp`.

Important root files:

- `README.md`: primary user-facing install, usage, hooks, and recommended solution instructions.
- `package.json`: authoritative npm scripts, package name, files list, and CLI bin (`smart-vs-mcp` -> `dist/index.js`).
- `.mcp/mcpserver.settings.json`: local VS-MCP endpoint settings for this workspace.
- `.mcp.json`: MCP client entry for `vs-mcp-smart` using `npx -y @al3xisdani3l/smart-vs-mcp`.
- `.codex-plugin/`, `.claude-plugin/`, `.cursor-plugin/`, `gemini-extension.json`, `plugins/`, `hooks/`, `skills/`: multi-client plugin/distribution assets.
- `src/`, `index.ts`, `tests/`: implementation and validation surface.

Important docs:

- `docs/install-codex.md`: Codex CLI marketplace install and troubleshooting.
- `docs/release-playbook.md`: release pre-check, GitHub Action publish flow, post-release sync, stale-process cleanup, and smoke checks.
- `docs/test-validation-report.md`: current test suite inventory, command coverage, and known validation gaps.

Keep these files aligned when changing install, package, release, hook, or validation behavior.

## Development Commands

Use the scripts already defined in `package.json`:

```powershell
npm install
npm run typecheck
npm run build
npm test
npm run verify
```

Targeted suites:

```powershell
npm run test:unit
npm run test:integration
npm run test:functional
npm run test:all
```

`dotnet test` is not the validation path for this repo; the real test runner is `vitest`.

## Diagnostics And Release

For workspace routing checks:

```powershell
smart-vs-mcp status --workspace C:\Users\ahernandez\source\repos\SMART_VS_MCP
smart-vs-mcp doctor --workspace C:\Users\ahernandez\source\repos\SMART_VS_MCP
```

For Codex plugin install issues, follow `docs/install-codex.md`.
For release work, follow `docs/release-playbook.md`.
Before claiming test coverage status, check `docs/test-validation-report.md` for known gaps.

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
