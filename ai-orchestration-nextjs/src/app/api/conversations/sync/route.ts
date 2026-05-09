import { z } from 'zod';
import {
  assertRateLimit,
  getClientIp,
  sanitizeUserId,
  upsertConversation,
  type StoredConversation,
} from '@/lib/chat/persistence';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const payloadSchema = z.object({
  userId: z.string().min(1),
  conversation: z.any(),
});

export async function POST(request: Request) {
  try {
    assertRateLimit(getClientIp(request), 80, 60_000);

    const payload = payloadSchema.parse(await request.json());
    const userId = sanitizeUserId(payload.userId);
    const saved = upsertConversation(userId, payload.conversation as StoredConversation);

    return new Response(JSON.stringify({ ok: true, conversation: saved }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const status = message === 'RATE_LIMITED' ? 429 : 400;

    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders });
}
