import { motion } from 'framer-motion';
import { AlertTriangle, Bot, Hammer, Sparkles } from 'lucide-react';

export type ToolState = 'idle' | 'thinking' | 'tool-running' | 'error';

const STATUS_STYLE: Record<ToolState, { label: string; className: string; Icon: typeof Bot }> = {
  idle: { label: 'Idle', className: 'bg-slate-700 text-slate-100', Icon: Bot },
  thinking: { label: 'Thinking', className: 'bg-sky-700 text-sky-100', Icon: Sparkles },
  'tool-running': { label: 'Using Tool', className: 'bg-emerald-700 text-emerald-100', Icon: Hammer },
  error: { label: 'Error', className: 'bg-rose-700 text-rose-100', Icon: AlertTriangle },
};

export function ToolStatus({ state }: { state: ToolState }) {
  const style = STATUS_STYLE[state];
  return (
    <motion.div
      initial={{ opacity: 0.6, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${style.className}`}
    >
      <style.Icon className="h-3.5 w-3.5" />
      <span>{style.label}</span>
    </motion.div>
  );
}
