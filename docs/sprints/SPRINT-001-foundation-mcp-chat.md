# SPRINT-001: Foundation and MCP Handshake

- Parent Spec: `SPEC-001-core-ai-orchestration-mcp.md`
- Status: Draft for execution
- Target Outcome: MVP chat + MCP discovery + tool status UI

## 1. Scope
Deliver the minimal architecture required to stream chat responses and discover MCP tools with resilient error handling.

## 2. Task Plan

## Phase 1: Environment and Baseline
- [ ] T1.1 Initialize Next.js App Router with TypeScript + Tailwind.
- [ ] T1.2 Add `docs/specs`, `docs/sprints`, `mcp-config`, `references`.
- [ ] T1.3 Verify strict TypeScript and server runtime compatibility in config.

Traceability:
- T1.1 -> FR-2, FR-4, NFR-4
- T1.2 -> FR-1
- T1.3 -> NFR-2, NFR-4

## Phase 2: MCP Client Engine
- [ ] T2.1 Install `@modelcontextprotocol/sdk`, `ai`, `zod`, `lucide-react`, `framer-motion`.
- [ ] T2.2 Implement `src/lib/mcp/client.ts` for connect/disconnect/listTools/callTool.
- [ ] T2.3 Implement `src/lib/mcp/registry.ts` to transform tool schemas for AI SDK use.
- [ ] T2.4 Add timeout and offline handling with explicit error types.
- [ ] T2.5 Validate tool schema and reject malformed payloads.

Traceability:
- T2.1 -> FR-3, FR-4
- T2.2 -> FR-3, FR-6
- T2.3 -> FR-3, NFR-4
- T2.4 -> FR-6, NFR-2
- T2.5 -> FR-6, NFR-2

## Phase 3: Chat UI and API Streaming
- [ ] T3.1 Build `src/app/page.tsx` chat layout (message list, input, status rail).
- [ ] T3.2 Build `src/components/ToolStatus.tsx` indicator (`idle`, `thinking`, `tool-running`, `error`).
- [ ] T3.3 Implement `src/app/api/chat/route.ts` streaming endpoint with tool call events.
- [ ] T3.4 Add write-action confirmation flow before executing write-capable tools.
- [ ] T3.5 Persist chat session state for active browser session.

Traceability:
- T3.1 -> FR-2
- T3.2 -> FR-4
- T3.3 -> FR-2, FR-4
- T3.4 -> FR-5
- T3.5 -> FR-2

## Phase 4: QA Alignment and Hardening
- [ ] T4.1 Verify at least one MCP server can be discovered from config.
- [ ] T4.2 Test timeout, offline, malformed payload, and no-tool fallback cases.
- [ ] T4.3 Produce traceability evidence between completed tasks and FR/NFR IDs.
- [ ] T4.4 Run 4-pass QA recursion; log each pass outcome.

Traceability:
- T4.1 -> AC-3
- T4.2 -> AC-4, FR-6
- T4.3 -> AC-1
- T4.4 -> SPEC Section 8

## 3. Exit Criteria
- [ ] All tasks complete with links to code artifacts.
- [ ] All acceptance criteria AC-1..AC-5 satisfied or explicitly deferred.
- [ ] QA recursion log contains no unresolved blocking issues.

## 4. Test Checklist
- [ ] MCP server online: tools discovered and listed.
- [ ] MCP server offline: chat remains functional without tools.
- [ ] Tool timeout: user sees actionable error and retry path.
- [ ] Write tool blocked until confirmation.
- [ ] Streaming events shown in chronological order.
