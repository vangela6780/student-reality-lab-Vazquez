import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { assertRateLimit, getClientIp } from '@/lib/chat/persistence';

export const runtime = 'nodejs';

// Add CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function POST(request: Request) {
  try {
    assertRateLimit(getClientIp(request), 90, 60_000);

    const body = await request.json();
    const message = String(body.message || '').trim();

    if (!message) {
      return new Response(JSON.stringify({ error: 'Missing message' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (message.length > 4000) {
      return new Response(JSON.stringify({ error: 'Message too long (max 4000 characters)' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY not configured');
      return new Response(JSON.stringify({ 
        error: 'API not configured: OPENAI_API_KEY is missing on server' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`📨 Processing chat message: "${message}"`);

    const { text } = await generateText({
      model: openai('gpt-3.5-turbo'), // Use standard OpenAI model (most affordable and reliable)
      system: 'You are a helpful assistant for spec-driven development. Keep your answers concise and practical.',
      prompt: message,
      maxTokens: 500,
    });

    console.log(`✅ Generated response: ${text.substring(0, 100)}...`);

    return new Response(JSON.stringify({ reply: text }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Chat API Error:', errorMessage);

    if (errorMessage === 'RATE_LIMITED') {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please wait and try again.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Provide specific error messages for common issues
    let userMessage = 'Failed to generate response';
    if (errorMessage.includes('API key')) {
      userMessage = 'API key error: Check server configuration';
    } else if (errorMessage.includes('rate limit')) {
      userMessage = 'Rate limit exceeded: Please try again in a moment';
    } else if (errorMessage.includes('model')) {
      userMessage = 'Model error: Check API configuration';
    } else if (errorMessage.includes('network')) {
      userMessage = 'Network error: Check internet connection';
    }

    return new Response(JSON.stringify({ 
      error: userMessage,
      detail: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}
