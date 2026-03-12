# SPEC-001: Core AI Orchestration and MCP Integration

- Version: 1.1.0
- Status: Ready for implementation
- Date: 2026-03-12

## Functional Requirements
- FR-1 Documentation source of truth under `docs/specs` and `docs/sprints`.
- FR-2 Persistent browser-session chat with streaming assistant responses.
- FR-3 MCP discovery and tool registry from `mcp-config/mcp-config.json`.
- FR-4 Dynamic tool invocation with real-time tool status indicators.
- FR-5 Safety gate for write-capable tools requiring explicit user confirmation.
- FR-6 Resilience for MCP offline, timeout, malformed payload, and no-tool fallback.

## Technical Constraints
- Next.js 14+ App Router and strict TypeScript.
- Vercel AI SDK for streaming response handling.
- `@modelcontextprotocol/sdk` for MCP client-server communication.
- Tailwind CSS, `lucide-react`, and `framer-motion` in UI.

## Acceptance Criteria
- AC-1 Sprint tasks map to FR IDs.
- AC-2 Streaming chat works with status updates.
- AC-3 At least one MCP server can be discovered.
- AC-4 Timeout/offline behavior is user-visible and non-fatal.
- AC-5 Write-capable tool operations cannot execute without approval.

## QA Recursion Protocol
Run 4 passes: completeness, consistency, resilience, and diminishing returns.
