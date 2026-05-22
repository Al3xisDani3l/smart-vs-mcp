# smart-vs-mcp Release Playbook (Fast Path)

## Pre-check

```powershell
git status --short
npm run sync:version
npm run build
```

Expected:
- only intended changes
- versions aligned
- build OK

## Publish

Run GitHub Action `Release`:
- `version=patch`
- `dry_run=false`

CLI option:

```powershell
gh workflow run Release --repo Al3xisDani3l/smart-vs-mcp -f version=patch -f dry_run=false
gh run watch <run-id> --repo Al3xisDani3l/smart-vs-mcp --exit-status
```

## Post-release sync

```powershell
git fetch --all --tags
git pull --rebase origin main
npm i -g @al3xisdani3l/smart-vs-mcp@latest
```

## Plugin refresh (Codex)

```powershell
codex plugin marketplace remove smart-vs-mcp-dev
codex plugin marketplace add C:\Users\ahernandez\Documents\SMART_VS_MCP
codex plugin add smart-vs-mcp@smart-vs-mcp-dev
```

## Clean stale smart-vs-mcp processes

Detect and stop only orphan `node.exe` processes running `smart-vs-mcp`:

```powershell
$p = Get-CimInstance Win32_Process |
  Where-Object { $_.Name -eq 'node.exe' -and $_.CommandLine -match 'smart-vs-mcp|dist/index.js' }
$p | Select-Object ProcessId, CommandLine
$p | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
```

Use when `codex plugin add` fails with cache lock or access denied.

## Smoke checks

```powershell
smart-vs-mcp --version
smart-vs-mcp doctor --workspace C:\Users\ahernandez\source\repos\SILT
codex plugin list
```

Expected:
- CLI responds
- doctor resolves workspace/settings/endpoint
- plugin shows `smart-vs-mcp@smart-vs-mcp-dev (installed, enabled)`
