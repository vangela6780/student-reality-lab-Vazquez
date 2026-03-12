import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Orchestration MCP Chat',
  description: 'Next.js chat interface with MCP orchestration and tool visibility.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
