'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Message, type ChatMessage } from '@/components/Message';
import { ToolStatus, type ToolState } from '@/components/ToolStatus';

const SESSION_KEY = 'orchestration-chat-session-v1';

type SSEvent =
  | { event: 'status'; data: { state: ToolState } }
  | { event: 'text_delta'; data: { text: string } }
  | { event: 'tool_result'; data: { toolName: string; content: string } }
  | { event: 'approval_required'; data: { toolName: string; serverId: string; reason: string } }
  | { event: 'error'; data: { message: string } }
  | { event: 'done'; data: { ok: boolean } }
  | { event: string; data: Record<string, unknown> };

function parseSSEChunk(chunk: string): SSEvent[] {
  const packets = chunk.split('\n\n').map((entry) => entry.trim()).filter(Boolean);
  return packets
    .map((packet) => {
      const lines = packet.split('\n');
      const event = lines.find((line) => line.startsWith('event:'))?.replace('event:', '').trim() ?? 'message';
      const dataLine = lines.find((line) => line.startsWith('data:'))?.replace('data:', '').trim() ?? '{}';
      try {
        return { event, data: JSON.parse(dataLine) } as SSEvent;
      } catch {
        return { event: 'error', data: { message: 'Failed to parse stream payload.' } } as SSEvent;
      }
    })
    .filter(Boolean);
}

function newMessage(role: ChatMessage['role'], content: string): ChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role,
    content,
  };
}

export default function Page() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [toolState, setToolState] = useState<ToolState>('idle');
  const [isStreaming, setIsStreaming] = useState(false);
  const [approvalPending, setApprovalPending] = useState<{ toolName: string; reason: string } | null>(null);
  const [lastPrompt, setLastPrompt] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      try {
        setMessages(JSON.parse(stored) as ChatMessage[]);
      } catch {
        sessionStorage.removeItem(SESSION_KEY);
      }
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(messages));
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const canSubmit = useMemo(() => input.trim().length > 0 && !isStreaming, [input, isStreaming]);

  async function runChat(message: string, approved = false): Promise<void> {
    setLastPrompt(message);
    setIsStreaming(true);
    setToolState('thinking');
    setApprovalPending(null);

    setMessages((prev) => [...prev, newMessage('user', message), newMessage('assistant', '')]);

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, pendingApproval: { approved } }),
    });

    if (!response.ok || !response.body) {
      setToolState('error');
      setIsStreaming(false);
      setMessages((prev) => {
        const copy = [...prev];
        copy.push(newMessage('assistant', `Request failed with status ${response.status}.`));
        return copy;
      });
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let done = false;
    while (!done) {
      const result = await reader.read();
      done = result.done;
      if (!result.value) continue;

      const chunk = decoder.decode(result.value, { stream: true });
      const events = parseSSEChunk(chunk);

      for (const event of events) {
        if (event.event === 'status') {
          setToolState(event.data.state as ToolState);
        }

        if (event.event === 'text_delta') {
          setMessages((prev) => {
            const copy = [...prev];
            const last = copy[copy.length - 1];
            if (last && last.role === 'assistant') {
              last.content += String((event.data as { text: string }).text ?? '');
            }
            return copy;
          });
        }

        if (event.event === 'tool_result') {
          const payload = event.data as { toolName: string; content: string };
          setMessages((prev) => [...prev, newMessage('tool', `[${payload.toolName}]\n${payload.content}`)]);
        }

        if (event.event === 'approval_required') {
          const payload = event.data as { toolName: string; reason: string };
          setApprovalPending({ toolName: payload.toolName, reason: payload.reason });
          setToolState('idle');
        }

        if (event.event === 'error') {
          setToolState('error');
          const payload = event.data as { message: string };
          setMessages((prev) => [...prev, newMessage('assistant', `Error: ${payload.message}`)]);
        }

        if (event.event === 'done') {
          setIsStreaming(false);
          if (toolState !== 'error') setToolState('idle');
        }
      }
    }

    setIsStreaming(false);
  }

  async function onSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    if (!canSubmit) return;
    const message = input.trim();
    setInput('');
    await runChat(message, false);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-6 md:px-8">
      <header className="mb-4 flex items-center justify-between rounded-2xl border border-slate-700/50 bg-slate-900/60 px-4 py-3 backdrop-blur">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">AI Orchestration Console</h1>
          <p className="text-xs text-slate-300">Next.js + MCP tool-aware streaming chat</p>
        </div>
        <ToolStatus state={toolState} />
      </header>

      <section ref={listRef} className="flex-1 space-y-3 overflow-y-auto rounded-2xl border border-slate-700/50 bg-slate-950/40 p-4">
        {messages.length === 0 ? (
          <p className="text-sm text-slate-400">Ask something like: "list tools" or "use filesystem tool".</p>
        ) : (
          messages.map((message) => <Message key={message.id} message={message} />)
        )}
      </section>

      {approvalPending ? (
        <section className="mt-4 rounded-xl border border-amber-500/40 bg-amber-950/30 p-3 text-sm">
          <p className="font-medium text-amber-100">Approval required for tool: {approvalPending.toolName}</p>
          <p className="mt-1 text-amber-200/90">{approvalPending.reason}</p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => runChat(lastPrompt || 'Continue with approved tool execution', true)}
              className="rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-slate-900"
            >
              Approve tool action
            </button>
            <button
              type="button"
              onClick={() => setApprovalPending(null)}
              className="rounded-md border border-amber-300/50 px-3 py-1.5 text-xs text-amber-100"
            >
              Cancel
            </button>
          </div>
        </section>
      ) : null}

      <form onSubmit={onSubmit} className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Send a message..."
          className="flex-1 rounded-xl border border-slate-700/60 bg-slate-900/70 px-4 py-3 text-sm outline-none ring-sky-500 transition focus:ring-2"
        />
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          Send
        </button>
      </form>
    </main>
  );
}
