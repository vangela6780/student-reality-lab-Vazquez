import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { z } from 'zod';
import type { MCPConfig } from './types';

const CapabilitySchema = z.enum(['read', 'write', 'delete', 'move', 'other']);

const MCPConfigSchema = z.object({
  servers: z.array(
    z.object({
      id: z.string().min(1),
      transport: z.literal('stdio'),
      command: z.string().min(1),
      args: z.array(z.string()),
      capabilities: z.object({
        defaultMode: z.enum(['read-only', 'read-write']),
        requiresConfirmationFor: z.array(CapabilitySchema),
      }),
      timeouts: z.object({
        connectMs: z.number().int().positive(),
        toolCallMs: z.number().int().positive(),
      }),
    })
  ),
});

export async function loadMCPConfig(): Promise<MCPConfig> {
  const filePath = process.env.MCP_CONFIG_PATH ?? './mcp-config/mcp-config.json';
  const absolutePath = resolve(process.cwd(), filePath);
  const raw = await readFile(absolutePath, 'utf8');
  const parsed = JSON.parse(raw);
  return MCPConfigSchema.parse(parsed);
}
