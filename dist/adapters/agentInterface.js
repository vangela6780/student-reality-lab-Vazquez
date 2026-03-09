"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomToolBuilder = exports.ProgrammaticCLIAgent = void 0;
/**
 * Concrete implementation of CLIAgent for programmatic access
 */
class ProgrammaticCLIAgent {
    constructor(cliEngine, // CLIEngine type
    commandRegistry // CommandRegistry type
    ) {
        this.cliEngine = cliEngine;
        this.commandRegistry = commandRegistry;
        this.tools = new Map();
        this.buildToolsFromCommands();
    }
    buildToolsFromCommands() {
        const commands = this.commandRegistry.getAll();
        for (const command of commands) {
            const tool = {
                name: command.name,
                description: command.description,
                parameters: this.parseUsageToParameters(command.usage),
                execute: async (params) => {
                    const context = {
                        arguments: Object.values(params).filter((v) => v),
                        options: params,
                        outputFormat: 'json',
                        verbose: params.verbose === true,
                    };
                    const result = await this.cliEngine.executeCommand(command.name, context);
                    return {
                        success: result.success,
                        data: result.data,
                        error: result.error,
                        message: result.message,
                    };
                },
            };
            this.tools.set(command.name, tool);
        }
    }
    parseUsageToParameters(usage) {
        // Parse usage string like "add <num1> <num2>" to extract parameters
        const parts = usage.split(/\s+/).slice(1); // Skip command name
        return parts
            .filter((part) => part.startsWith('<') && part.endsWith('>'))
            .map((part) => {
            const paramName = part.replace(/[<>]/g, '');
            return {
                name: paramName,
                type: 'string',
                description: `Parameter: ${paramName}`,
                required: true,
            };
        });
    }
    async execute(commandName, args) {
        const tool = this.tools.get(commandName);
        if (!tool) {
            return {
                success: false,
                error: `Tool '${commandName}' not found`,
            };
        }
        try {
            return await tool.execute(args);
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }
    getTools() {
        return Array.from(this.tools.values());
    }
    getTool(toolName) {
        return this.tools.get(toolName) || null;
    }
    async processRequest(request) {
        // This would be implemented with NLP/AI integration in the future
        // For now, return a placeholder
        return {
            success: false,
            error: 'Natural language processing not yet implemented',
        };
    }
}
exports.ProgrammaticCLIAgent = ProgrammaticCLIAgent;
/**
 * Builder for creating custom agent tools
 */
class CustomToolBuilder {
    constructor() {
        this.parameters = [];
    }
    setName(name) {
        this.name = name;
        return this;
    }
    setDescription(description) {
        this.description = description;
        return this;
    }
    addParameter(param) {
        this.parameters.push(param);
        return this;
    }
    setExecutor(fn) {
        this.executeFunc = fn;
        return this;
    }
    build() {
        if (!this.name || !this.description || !this.executeFunc) {
            throw new Error('Tool name, description, and executor are required');
        }
        return {
            name: this.name,
            description: this.description,
            parameters: this.parameters,
            execute: this.executeFunc,
        };
    }
}
exports.CustomToolBuilder = CustomToolBuilder;
//# sourceMappingURL=agentInterface.js.map