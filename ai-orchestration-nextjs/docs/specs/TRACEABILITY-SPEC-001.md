# Traceability Matrix

| Requirement | Implementation |
|---|---|
| FR-1 | `docs/specs/*`, `docs/sprints/*` |
| FR-2 | `src/app/page.tsx`, session storage persistence |
| FR-3 | `src/lib/mcp/config.ts`, `src/lib/mcp/client.ts`, `src/lib/mcp/registry.ts` |
| FR-4 | `src/app/api/chat/route.ts`, `src/components/ToolStatus.tsx` |
| FR-5 | `src/app/api/chat/route.ts` (`approval_required`) and approval UI in `src/app/page.tsx` |
| FR-6 | Timeout wrapper + error status + chat fallback in route and MCP engine |
| AC-2 | SSE events: `status`, `tool_call`, `tool_result`, `text_delta` |
| AC-3 | Discovery call: `discoverAndRegisterTools()` |
| AC-4 | Non-fatal error path with status transitions and fallback response |
| AC-5 | Guard blocks write-capable tool run without explicit approval |
