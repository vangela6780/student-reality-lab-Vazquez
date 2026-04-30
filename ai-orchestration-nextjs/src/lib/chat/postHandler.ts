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

function pickWebResearchIntent(message: string): boolean {
  const lowered = message.toLowerCase();
  return /\bwar|conflict|invasion|ceasefire|frontline|battle|latest|current|today|news\b/.test(lowered);
}

type WikiOpenSearchResponse = [string, string[], string[], string[]];

async function fetchWarWebContext(query: string): Promise<string> {
  const searchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&limit=3&namespace=0&format=json&search=${encodeURIComponent(query)}`;
  const response = await fetch(searchUrl, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'student-reality-lab-war-impact/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`Web research search failed (${response.status})`);
  }

  const payload = (await response.json()) as WikiOpenSearchResponse;
  const titles = payload[1] ?? [];
  const links = payload[3] ?? [];

  if (titles.length === 0) {
    return 'No relevant public web references were found for this query.';
  }

  const snippets: string[] = [];
  for (let index = 0; index < Math.min(3, titles.length); index += 1) {
    const rawTitle = titles[index];
    const encodedTitle = encodeURIComponent(rawTitle.replace(/\s+/g, '_'));
    const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodedTitle}`;

    try {
      const summaryResponse = await fetch(summaryUrl, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'student-reality-lab-war-impact/1.0',
        },
      });

      if (!summaryResponse.ok) continue;

      const summaryJson = (await summaryResponse.json()) as { extract?: string };
      const extract = (summaryJson.extract ?? '').trim();
      if (!extract) continue;

      snippets.push(`- ${rawTitle}: ${extract} Source: ${links[index] ?? `https://en.wikipedia.org/wiki/${encodedTitle}`}`);
    } catch {
      continue;
    }
  }

  if (snippets.length === 0) {
    return 'Web references were found but detailed summaries were unavailable.';
  }

  return snippets.join('\n');
}

async function* fallbackText(message: string, webSummary?: string): AsyncGenerator<string> {
  const content = webSummary
    ? `Fallback response (no model key): I could not use the hosted model, but I found public web references for \"${message}\".\n${webSummary}\nWould you like a concise text summary or a regional breakdown?`
    : `Fallback response (no model key): You said \"${message}\". MCP tool integration is active, and you can ask me to list available tools.`;
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
          let webSummary = '';
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

          if (pickWebResearchIntent(message)) {
            write('status', { state: 'tool-running' as ToolState });
            write('tool_call', { toolName: 'web_war_research', serverId: 'builtin-web' });

            try {
              webSummary = await fetchWarWebContext(message);
              write('tool_result', {
                toolName: 'web_war_research',
                content: webSummary,
              });
            } catch (error) {
              webSummary = `Web research failed: ${String(error)}`;
              write('tool_result', {
                toolName: 'web_war_research',
                content: webSummary,
              });
            }

            write('status', { state: 'thinking' as ToolState });
          }

          if (deps.hasModelKey()) {
            const contextBlocks = [
              toolSummary ? `MCP Tool Output:\n${toolSummary}` : '',
              webSummary ? `Web Research Output:\n${webSummary}` : '',
            ]
              .filter(Boolean)
              .join('\n\n');

            const prompt = contextBlocks
              ? `User: ${message}\n\n${contextBlocks}\n\nRespond using the available tool context, cite web claims as public reference summaries when relevant, and mention uncertainty for rapidly changing events.`
              : message;
            let deltaCount = 0;
            for await (const delta of deps.streamModelText(prompt)) {
              deltaCount += 1;
              write('text_delta', { text: delta });
            }
            if (deltaCount === 0) {
              write('text_delta', {
                text: 'No model output was returned. Verify OPENAI_API_KEY in ai-orchestration-nextjs/.env.local and try again.',
              });
            }
          } else {
            for await (const delta of fallbackText(message, webSummary)) {
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
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  };
}
