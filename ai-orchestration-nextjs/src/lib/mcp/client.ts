import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import type { MCPDiscoveredTool, MCPServerConfig } from './types';
import { MCPError } from './types';

type ServerSession = {
  config: MCPServerConfig;
  client: Client;
};

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new MCPError(`${label} timed out after ${ms}ms`, 'timeout')), ms);
    promise
      .then((value) => {
        clearTimeout(timeout);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timeout);
        reject(error);
      });
  });
}

function inferCapability(toolName: string): MCPDiscoveredTool['capability'] {
  const lowered = toolName.toLowerCase();
  if (lowered.includes('write') || lowered.includes('create') || lowered.includes('update')) return 'write';
  if (lowered.includes('delete') || lowered.includes('remove')) return 'delete';
  if (lowered.includes('move') || lowered.includes('rename')) return 'move';
  if (lowered.includes('read') || lowered.includes('list') || lowered.includes('search')) return 'read';
  return 'other';
}

export class MCPClientEngine {
  private sessions = new Map<string, ServerSession>();

  async connect(server: MCPServerConfig): Promise<void> {
    try {
      const transport = new StdioClientTransport({
        command: server.command,
        args: server.args,
      });
      const client = new Client({ name: 'ai-orchestration-nextjs', version: '0.1.0' }, { capabilities: {} });
      await withTimeout(client.connect(transport), server.timeouts.connectMs, `Connect to ${server.id}`);
      this.sessions.set(server.id, { config: server, client });
    } catch (error) {
      throw new MCPError(`Failed to connect to MCP server ${server.id}: ${String(error)}`, 'offline');
    }
  }

  async connectAll(servers: MCPServerConfig[]): Promise<void> {
    await Promise.allSettled(servers.map((server) => this.connect(server)));
  }

  async listTools(): Promise<MCPDiscoveredTool[]> {
    const tools: MCPDiscoveredTool[] = [];

    for (const [serverId, session] of this.sessions.entries()) {
      try {
        const result = await withTimeout(session.client.listTools(), session.config.timeouts.toolCallMs, `List tools ${serverId}`);
        const discovered = result.tools.map((tool) => ({
          serverId,
          name: tool.name,
          description: tool.description ?? '',
          inputSchema: tool.inputSchema ?? {},
          capability: inferCapability(tool.name),
        }));
        tools.push(...discovered);
      } catch (error) {
        console.error('[mcp] listTools failed', { serverId, error });
      }
    }

    return tools;
  }

  async callTool(serverId: string, name: string, args: Record<string, unknown>, timeoutMs: number): Promise<string> {
    const session = this.sessions.get(serverId);
    if (!session) {
      throw new MCPError(`MCP server ${serverId} not connected`, 'offline');
    }

    const response = await withTimeout(
      session.client.callTool({ name, arguments: args }),
      timeoutMs,
      `Tool call ${serverId}:${name}`
    );

    const content =
      typeof response === 'object' && response !== null && 'content' in response
        ? (response as { content: unknown }).content
        : [];

    const chunks = Array.isArray(content) ? content : [];
    const text = chunks
      .map((chunk: unknown) => {
        if (
          typeof chunk === 'object' &&
          chunk !== null &&
          'type' in chunk &&
          'text' in chunk &&
          (chunk as { type?: unknown }).type === 'text'
        ) {
          return String((chunk as { text: unknown }).text ?? '');
        }
        return JSON.stringify(chunk);
      })
      .join('\n');

    return text;
  }

  async disconnectAll(): Promise<void> {
    await Promise.allSettled(
      Array.from(this.sessions.values()).map(async ({ client }) => {
        await client.close();
      })
    );
    this.sessions.clear();
  }
}
