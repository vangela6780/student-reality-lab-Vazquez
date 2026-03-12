# MCP Profiles

These profiles let you switch MCP server sets without changing code.

## Recommended profiles

- `filesystem-only.json`
  - Safe default for local file inspection and basic write-gate flows.
- `filesystem-plus-fetch.json`
  - Adds HTTP fetch tools for external content retrieval.
- `filesystem-plus-sqlite.json`
  - Adds local SQLite tools for query and update workflows.

## How to activate a profile

Set `MCP_CONFIG_PATH` in `.env.local` to the selected profile file:

```env
MCP_CONFIG_PATH=./mcp-config/profiles/filesystem-plus-fetch.json
```

Then restart `npm.cmd run dev`.

## Notes

- Some MCP server packages may need manual install or first-run download by `npx`.
- Write-capable tools are gated by confirmation in the UI.
