import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { discoverAndRegisterTools, ensureToolInput } from '@/lib/mcp/registry';
import { createChatPostHandler } from '@/lib/chat/postHandler';

export const runtime = 'nodejs';

async function* modelStream(prompt: string): AsyncGenerator<string> {
  const result = streamText({
    model: openai('gpt-4.1-mini'),
    system: 'You are an orchestration assistant. Mention tool usage clearly and keep answers concise unless asked for detail.',
    prompt,
  });

  for await (const delta of result.textStream) {
    yield delta;
  }
}

export const POST = createChatPostHandler({
  discoverTools: discoverAndRegisterTools,
  ensureToolInput,
  streamModelText: modelStream,
  hasModelKey: () => Boolean(process.env.OPENAI_API_KEY),
});
