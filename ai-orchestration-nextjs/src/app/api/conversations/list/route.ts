import {
  assertRateLimit,
  getClientIp,
  listConversations,
  sanitizeUserId,
} from '@/lib/chat/persistence';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function GET(request: Request) {
  try {
    assertRateLimit(getClientIp(request), 120, 60_000);

    const url = new URL(request.url);
    const userId = sanitizeUserId(url.searchParams.get('userId') || '');
    const search = (url.searchParams.get('search') || '').trim().toLowerCase();

    const conversations = listConversations(userId).filter((conversation) => {
      if (!search) return true;
      return conversation.title.toLowerCase().includes(search);
    });

    return new Response(JSON.stringify({ conversations }), {
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
