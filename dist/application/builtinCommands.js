"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EchoCommand = exports.StatusCommand = exports.VersionCommand = exports.HelpCommand = void 0;
const types_1 = require("../domain/types");
/**
 * Help command - lists all available commands
 */
class HelpCommand extends types_1.Command {
    constructor(commandRegistry) {
        super();
        this.commandRegistry = commandRegistry;
        this.name = 'help';
        this.description = 'Display help information for available commands';
        this.usage = 'help [command-name]';
    }
    async execute(context) {
        const specificCommand = context.arguments[0];
        if (specificCommand) {
            const command = this.commandRegistry.get(specificCommand);
            if (!command) {
                return {
                    success: false,
                    error: `Command not found: ${specificCommand}`,
                    timestamp: new Date(),
                    executionTimeMs: 0,
                };
            }
            return {
                success: true,
                data: {
                    name: command.name,
                    description: command.description,
                    usage: command.usage,
                },
                timestamp: new Date(),
                executionTimeMs: 0,
            };
        }
        // List all commands
        const commands = this.commandRegistry.getAll();
        const commandList = commands.map((cmd) => ({
            name: cmd.name,
            description: cmd.description,
            usage: cmd.usage,
        }));
        return {
            success: true,
            data: {
                totalCommands: commandList.length,
                commands: commandList,
            },
            message: `Found ${commandList.length} available commands`,
            timestamp: new Date(),
            executionTimeMs: 0,
        };
    }
}
exports.HelpCommand = HelpCommand;
/**
 * Version command - displays CLI version
 */
class VersionCommand extends types_1.Command {
    constructor(version) {
        super();
        this.version = version;
        this.name = 'version';
        this.description = 'Display CLI version';
        this.usage = 'version';
    }
    async execute(context) {
        return {
            success: true,
            data: { version: this.version },
            message: `AI CLI Engine v${this.version}`,
            timestamp: new Date(),
            executionTimeMs: 0,
        };
    }
}
exports.VersionCommand = VersionCommand;
/**
 * Status command - displays CLI status
 */
class StatusCommand extends types_1.Command {
    constructor(commandRegistry) {
        super();
        this.commandRegistry = commandRegistry;
        this.name = 'status';
        this.description = 'Display CLI status and loaded modules';
        this.usage = 'status';
    }
    async execute(context) {
        const commands = this.commandRegistry.getAll();
        return {
            success: true,
            data: {
                status: 'running',
                loadedCommands: commands.length,
                commands: commands.map((cmd) => cmd.name),
                uptime: process.uptime(),
                memory: process.memoryUsage(),
            },
            message: 'CLI is operational',
            timestamp: new Date(),
            executionTimeMs: 0,
        };
    }
}
exports.StatusCommand = StatusCommand;
/**
 * Echo command - echoes back input (useful for testing)
 */
class EchoCommand extends types_1.Command {
    constructor() {
        super(...arguments);
        this.name = 'echo';
        this.description = 'Echo back the provided input (useful for testing)';
        this.usage = 'echo <message>';
    }
    validate(context) {
        if (context.arguments.length === 0) {
            return { valid: false, errors: ['Message is required'] };
        }
        return { valid: true, errors: [] };
    }
    async execute(context) {
        const message = context.arguments.join(' ');
        return {
            success: true,
            data: { message },
            message: 'Echo successful',
            timestamp: new Date(),
            executionTimeMs: 0,
        };
    }
}
exports.EchoCommand = EchoCommand;
//# sourceMappingURL=builtinCommands.js.map