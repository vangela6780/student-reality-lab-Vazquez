export type ChatRole = 'user' | 'assistant' | 'tool';

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

export function Message({ message }: { message: ChatMessage }) {
  const bubbleClass =
    message.role === 'user'
      ? 'bg-accent/20 border-accent/50 ml-auto'
      : message.role === 'tool'
      ? 'bg-emerald-900/40 border-emerald-500/50'
      : 'bg-slate-800/70 border-slate-600/40';

  return (
    <div className={`max-w-[88%] rounded-xl border px-4 py-3 text-sm leading-relaxed ${bubbleClass}`}>
      <div className="mb-1 text-[10px] uppercase tracking-wide text-slate-300">{message.role}</div>
      <div className="whitespace-pre-wrap">{message.content}</div>
    </div>
  );
}
