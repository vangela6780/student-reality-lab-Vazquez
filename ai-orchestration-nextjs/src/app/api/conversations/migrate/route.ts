import { z } from 'zod';
import {
  assertRateLimit,
  getClientIp,
  migrateGuestConversations,
  sanitizeUserId,
  type StoredConversation,
} from '@/lib/chat/persistence';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const payloadSchema = z.object({
  userId: z.string().min(1),
  guestSessionId: z.string().min(1),
  conversations: z.array(z.any()).max(200),
});

export async function POST(request: Request) {
  try {
    assertRateLimit(getClientIp(request), 60, 60_000);

    const payload = payloadSchema.parse(await request.json());
    const userId = sanitizeUserId(payload.userId);

    const migrated = migrateGuestConversations(
      userId,
      payload.guestSessionId,
      payload.conversations as StoredConversation[]
    );

    return new Response(JSON.stringify({ ok: true, migratedCount: migrated.length }), {
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
