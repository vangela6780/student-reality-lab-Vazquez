import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { createChatPostHandler } from './postHandler';
import type { RegisteredTool } from '@/lib/mcp/registry';

function buildTool(overrides: Partial<RegisteredTool> = {}): RegisteredTool {
  return {
    serverId: 'filesystem-local',
    name: 'write_file',
    description: 'Write a file',
    inputSchema: {},
    capability: 'write',
    requiresConfirmation: true,
    inputValidator: z.object({}).passthrough(),
    ...overrides,
  };
}

function getEvents(payload: string): string[] {
  return payload
    .split('\n\n')
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => chunk.split('\n').find((line) => line.startsWith('event:'))?.replace('event:', '').trim() ?? '');
}

describe('createChatPostHandler', () => {
  it('returns 400 for missing message', async () => {
    const POST = createChatPostHandler({
      discoverTools: async () => ({ tools: [], engine: { callTool: async () => '' } }),
      ensureToolInput: async () => undefined,
      streamModelText: async function* () {
        yield 'ok';
      },
      hasModelKey: () => false,
    });

    const response = await POST(new Request('http://localhost/api/chat', { method: 'POST', body: JSON.stringify({}) }));
    expect(response.status).toBe(400);
  });

  it('emits approval_required before write tool execution', async () => {
    const POST = createChatPostHandler({
      discoverTools: async () => ({ tools: [buildTool()], engine: { callTool: async () => 'should-not-run' } }),
      ensureToolInput: async () => undefined,
      streamModelText: async function* () {
        yield 'ok';
      },
      hasModelKey: () => false,
    });

    const response = await POST(
      new Request('http://localhost/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: 'please use tool now' }),
      })
    );

    const text = await response.text();
    const events = getEvents(text);
    expect(events).toContain('approval_required');
    expect(events).not.toContain('tool_call');
  });

  it('emits error state when tool call fails (timeout/offline path)', async () => {
    const POST = createChatPostHandler({
      discoverTools: async () => ({
        tools: [buildTool({ requiresConfirmation: false, capability: 'read', name: 'list_files' })],
        engine: {
          callTool: async () => {
            throw new Error('timeout while calling tool');
          },
        },
      }),
      ensureToolInput: async () => undefined,
      streamModelText: async function* () {
        yield 'ok';
      },
      hasModelKey: () => false,
    });

    const response = await POST(
      new Request('http://localhost/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: 'list files with tool' }),
      })
    );

    const text = await response.text();
    const events = getEvents(text);
    expect(events).toContain('status');
    expect(events).toContain('error');
    expect(events).not.toContain('done');
  });

  it('streams fallback text when model key is absent and no tools exist', async () => {
    const POST = createChatPostHandler({
      discoverTools: async () => ({ tools: [], engine: { callTool: async () => '' } }),
      ensureToolInput: async () => undefined,
      streamModelText: async function* () {
        yield 'llm';
      },
      hasModelKey: () => false,
    });

    const response = await POST(
      new Request('http://localhost/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: 'hello world' }),
      })
    );

    const text = await response.text();
    const events = getEvents(text);
    expect(events).toContain('text_delta');
    expect(events).toContain('done');
  });

  it('emits error when tool payload validation fails', async () => {
    const POST = createChatPostHandler({
      discoverTools: async () => ({
        tools: [buildTool({ requiresConfirmation: false, capability: 'read', name: 'list_files' })],
        engine: { callTool: async () => 'should-not-run' },
      }),
      ensureToolInput: async () => {
        throw new Error('Invalid tool payload for list_files');
      },
      streamModelText: async function* () {
        yield 'ok';
      },
      hasModelKey: () => false,
    });

    const response = await POST(
      new Request('http://localhost/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: 'list files with tool' }),
      })
    );

    const text = await response.text();
    const events = getEvents(text);
    expect(events).toContain('error');
    expect(events).not.toContain('tool_result');
  });
});
