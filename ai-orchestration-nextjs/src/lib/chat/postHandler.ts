import type { RegisteredTool } from '@/lib/mcp/registry';

export type ToolState = 'idle' | 'thinking' | 'tool-running' | 'error';

export type ChatBody = {
  message: string;
  pendingApproval?: {
    approved: boolean;
  };
};

export type DiscoverToolsResult = {
  tools: RegisteredTool[];
  engine: {
    callTool: (serverId: string, name: string, args: Record<string, unknown>, timeoutMs: number) => Promise<string>;
  };
};

export type ChatHandlerDeps = {
  discoverTools: () => Promise<DiscoverToolsResult>;
  ensureToolInput: (tool: RegisteredTool, payload: unknown) => Promise<void>;
  streamModelText: (prompt: string) => AsyncGenerator<string>;
  hasModelKey: () => boolean;
};

function sse(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

function pickToolIntent(message: string): boolean {
  const lowered = message.toLowerCase();
  return lowered.includes('tool') || lowered.includes('list files') || lowered.includes('filesystem');
}

async function* fallbackText(message: string): AsyncGenerator<string> {
  const content = `Fallback response (no model key): You said \"${message}\". MCP tool integration is active, and you can ask me to list available tools.`;
  for (const part of content.split(' ')) {
    await new Promise((resolve) => setTimeout(resolve, 4));
    yield `${part} `;
  }
}

export function createChatPostHandler(deps: ChatHandlerDeps) {
  return async function POST(request: Request): Promise<Response> {
    const body = (await request.json()) as ChatBody;
    const message = body.message?.trim();

    if (!message) {
      return new Response('Missing message', { status: 400 });
    }

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const encoder = new TextEncoder();
        const write = (event: string, data: unknown) => controller.enqueue(encoder.encode(sse(event, data)));

        try {
          write('status', { state: 'thinking' as ToolState });

          const { tools, engine } = await deps.discoverTools();
          write('tools', { count: tools.length, tools: tools.map((t) => ({ name: t.name, serverId: t.serverId })) });

          let toolSummary = '';
          if (pickToolIntent(message) && tools.length > 0) {
            const targetTool = tools[0];
            if (targetTool.requiresConfirmation && !body.pendingApproval?.approved) {
              write('approval_required', {
                toolName: targetTool.name,
                serverId: targetTool.serverId,
                reason: 'This tool may perform write-capable actions.',
              });
              write('status', { state: 'idle' as ToolState });
              return;
            }

            write('status', { state: 'tool-running' as ToolState });
            write('tool_call', { toolName: targetTool.name, serverId: targetTool.serverId });

            await deps.ensureToolInput(targetTool, {});
            const output = await engine.callTool(targetTool.serverId, targetTool.name, {}, 15000);
            toolSummary = output.slice(0, 1200);

            write('tool_result', {
              toolName: targetTool.name,
              content: toolSummary || 'Tool returned no text output.',
            });
            write('status', { state: 'thinking' as ToolState });
          }

          if (deps.hasModelKey()) {
            const prompt = toolSummary
              ? `User: ${message}\n\nTool Output:\n${toolSummary}\n\nRespond using the tool output when useful.`
              : message;
            for await (const delta of deps.streamModelText(prompt)) {
              write('text_delta', { text: delta });
            }
          } else {
            for await (const delta of fallbackText(message)) {
              write('text_delta', { text: delta });
            }
          }

          write('status', { state: 'idle' as ToolState });
          write('done', { ok: true });
        } catch (error) {
          write('status', { state: 'error' as ToolState });
          write('error', { message: String(error) });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  };
}
