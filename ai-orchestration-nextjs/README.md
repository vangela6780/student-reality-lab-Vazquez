# AI Orchestration Next.js Chat (Sprint 001)

This folder contains a standalone Sprint 001 implementation of a Next.js chat interface with MCP integration.

## Run

1. Install dependencies:

```bash
npm.cmd install
```

2. Configure env:

```bash
copy .env.example .env.local
```

Optional: choose an MCP profile (default is `mcp-config/mcp-config.json`):

```env
MCP_CONFIG_PATH=./mcp-config/profiles/filesystem-plus-fetch.json
```

3. Start dev server:

```bash
npm.cmd run dev
```

Open http://localhost:3000.

## Notes
- If `OPENAI_API_KEY` is missing, the app uses a fallback streaming responder.
- MCP server configuration is loaded from `mcp-config/mcp-config.json`.
- Write-capable tools require explicit user approval in UI.

## Test

```bash
npm.cmd run test
```
