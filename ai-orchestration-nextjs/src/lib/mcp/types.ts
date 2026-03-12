export type MCPToolCapability = 'read' | 'write' | 'delete' | 'move' | 'other';

export type MCPServerConfig = {
  id: string;
  transport: 'stdio';
  command: string;
  args: string[];
  capabilities: {
    defaultMode: 'read-only' | 'read-write';
    requiresConfirmationFor: MCPToolCapability[];
  };
  timeouts: {
    connectMs: number;
    toolCallMs: number;
  };
};

export type MCPConfig = {
  servers: MCPServerConfig[];
};

export type MCPDiscoveredTool = {
  serverId: string;
  name: string;
  description: string;
  inputSchema: unknown;
  capability: MCPToolCapability;
};

export class MCPError extends Error {
  constructor(message: string, readonly code: 'offline' | 'timeout' | 'validation' | 'unknown') {
    super(message);
    this.name = 'MCPError';
  }
}
