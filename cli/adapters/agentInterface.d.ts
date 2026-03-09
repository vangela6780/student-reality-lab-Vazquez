/**
 * Agent-specific interfaces for AI tool integration
 * These allow AI agents to interact with the CLI programmatically
 */
/**
 * Tool definition that agents can use
 */
export interface AgentTool {
    name: string;
    description: string;
    parameters: ToolParameter[];
    execute(params: Record<string, any>): Promise<ToolResult>;
}
/**
 * Parameter definition for a tool
 */
export interface ToolParameter {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    description: string;
    required: boolean;
    enum?: string[] | number[];
    schema?: any;
}
/**
 * Result returned by a tool
 */
export interface ToolResult {
    success: boolean;
    data?: any;
    error?: string;
    message?: string;
}
/**
 * Agent interface for programmatic CLI interaction
 */
export interface CLIAgent {
    /**
     * Execute a command programmatically
     */
    execute(commandName: string, args: Record<string, any>): Promise<ToolResult>;
    /**
     * Get available tools
     */
    getTools(): AgentTool[];
    /**
     * Get tool information
     */
    getTool(toolName: string): AgentTool | null;
    /**
     * Process a natural language request (for future AI integration)
     */
    processRequest(request: string): Promise<ToolResult>;
}
/**
 * Concrete implementation of CLIAgent for programmatic access
 */
export declare class ProgrammaticCLIAgent implements CLIAgent {
    private cliEngine;
    private commandRegistry;
    private tools;
    constructor(cliEngine: any, // CLIEngine type
    commandRegistry: any);
    private buildToolsFromCommands;
    private parseUsageToParameters;
    execute(commandName: string, args: Record<string, any>): Promise<ToolResult>;
    getTools(): AgentTool[];
    getTool(toolName: string): AgentTool | null;
    processRequest(request: string): Promise<ToolResult>;
}
/**
 * Builder for creating custom agent tools
 */
export declare class CustomToolBuilder {
    private parameters;
    private name;
    private description;
    private executeFunc;
    setName(name: string): CustomToolBuilder;
    setDescription(description: string): CustomToolBuilder;
    addParameter(param: ToolParameter): CustomToolBuilder;
    setExecutor(fn: (params: Record<string, any>) => Promise<ToolResult>): CustomToolBuilder;
    build(): AgentTool;
}
//# sourceMappingURL=agentInterface.d.ts.map