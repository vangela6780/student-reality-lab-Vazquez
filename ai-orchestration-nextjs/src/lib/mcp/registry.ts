import { z } from 'zod';
import { MCPClientEngine } from './client';
import { loadMCPConfig } from './config';
import type { MCPDiscoveredTool } from './types';

export type RegisteredTool = MCPDiscoveredTool & {
  requiresConfirmation: boolean;
  inputValidator: z.ZodTypeAny;
};

type JsonSchema = {
  type?: string | string[];
  properties?: Record<string, JsonSchema>;
  required?: string[];
  items?: JsonSchema;
  enum?: Array<string | number | boolean | null>;
  anyOf?: JsonSchema[];
  oneOf?: JsonSchema[];
};

function isJsonSchema(value: unknown): value is JsonSchema {
  return typeof value === 'object' && value !== null;
}

function toPrimitive(schemaType: string): z.ZodTypeAny {
  switch (schemaType) {
    case 'string':
      return z.string();
    case 'number':
      return z.number();
    case 'integer':
      return z.number().int();
    case 'boolean':
      return z.boolean();
    case 'null':
      return z.null();
    case 'array':
      return z.array(z.unknown());
    case 'object':
      return z.object({}).passthrough();
    default:
      return z.unknown();
  }
}

function fromSchema(schema: JsonSchema): z.ZodTypeAny {
  if (Array.isArray(schema.anyOf) && schema.anyOf.length > 0) {
    const alternatives = schema.anyOf.map(fromSchema);
    return z.union(alternatives as [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]);
  }

  if (Array.isArray(schema.oneOf) && schema.oneOf.length > 0) {
    const alternatives = schema.oneOf.map(fromSchema);
    return z.union(alternatives as [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]);
  }

  if (Array.isArray(schema.enum) && schema.enum.length > 0) {
    return z.union(schema.enum.map((value) => z.literal(value)) as [z.ZodLiteral<unknown>, z.ZodLiteral<unknown>, ...z.ZodLiteral<unknown>[]]);
  }

  if (Array.isArray(schema.type)) {
    const choices = schema.type.map((entry) => toPrimitive(entry));
    if (choices.length === 1) return choices[0];
    return z.union(choices as [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]);
  }

  if (schema.type === 'array') {
    const inner = schema.items && isJsonSchema(schema.items) ? fromSchema(schema.items) : z.unknown();
    return z.array(inner);
  }

  if (schema.type === 'object' || schema.properties) {
    const required = new Set(schema.required ?? []);
    const properties = schema.properties ?? {};
    const shape = Object.fromEntries(
      Object.entries(properties).map(([key, value]) => {
        const validator = fromSchema(value);
        return [key, required.has(key) ? validator : validator.optional()];
      })
    );
    return z.object(shape).passthrough();
  }

  if (schema.type) {
    return toPrimitive(schema.type);
  }

  return z.object({}).passthrough();
}

function toValidator(schema: unknown): z.ZodTypeAny {
  if (!isJsonSchema(schema)) return z.object({}).passthrough();
  return fromSchema(schema);
}

let cached: { tools: RegisteredTool[]; engine: MCPClientEngine } | null = null;

export async function discoverAndRegisterTools(): Promise<{ tools: RegisteredTool[]; engine: MCPClientEngine }> {
  if (cached) return cached;

  const config = await loadMCPConfig();
  const engine = new MCPClientEngine();
  await engine.connectAll(config.servers);

  const discovered = await engine.listTools();
  const tools = discovered.map((tool) => {
    const server = config.servers.find((entry) => entry.id === tool.serverId);
    const requiresConfirmation = server?.capabilities.requiresConfirmationFor.includes(tool.capability) ?? false;
    return {
      ...tool,
      requiresConfirmation,
      inputValidator: toValidator(tool.inputSchema),
    };
  });

  cached = { tools, engine };
  return cached;
}

export async function ensureToolInput(tool: RegisteredTool, payload: unknown): Promise<void> {
  const parsed = await tool.inputValidator.safeParseAsync(payload);
  if (!parsed.success) {
    throw new Error(`Invalid tool payload for ${tool.name}`);
  }
}
