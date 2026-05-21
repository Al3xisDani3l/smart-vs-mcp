# Installing smart-vs-mcp for Codex CLI

## Quick Start

```powershell
# Step 1: Add marketplace (one time)
codex plugin marketplace add Al3xisDani3l/smart-vs-mcp

# Step 2: Install plugin
codex plugin add smart-vs-mcp
```

## Troubleshooting

### "plugin was not found in marketplace"

**Cause:** Marketplace snapshot hasn't refreshed.

**Fix:**
```powershell
codex plugin marketplace upgrade Al3xisDani3l-smart-vs-mcp
codex plugin add smart-vs-mcp --marketplace Al3xisDani3l-smart-vs-mcp
```

### "wrong syntax: @ = marketplace name"

❌ **Wrong:**
```powershell
codex plugin add smart-vs-mcp@smart-vs-mcp-dev
```

✅ **Right:**
```powershell
codex plugin marketplace add Al3xisDani3l/smart-vs-mcp --ref smart-vs-mcp-dev
codex plugin add smart-vs-mcp
```

In Codex, `@` separates plugin name from marketplace name (which must be pre-registered). It is NOT an npm dist-tag.

### "permission denied" during marketplace upgrade

This indicates a Codex cache issue. Try:

```powershell
# Remove and re-add marketplace
codex plugin marketplace remove <marketplace-name>
codex plugin marketplace add Al3xisDani3l/smart-vs-mcp
```

## Verification

After install, verify the plugin is available:

```powershell
codex plugin list
```

You should see `smart-vs-mcp` in the output.

## Next Steps

Configure your MCP server in Codex config or use the plugin's built-in `smart_vs_mcp_status` command to diagnose workspace routing.
