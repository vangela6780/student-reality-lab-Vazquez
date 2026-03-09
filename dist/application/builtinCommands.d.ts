import { Command, CLIContext, CommandResult, CommandRegistry } from '../domain/types';
/**
 * Help command - lists all available commands
 */
export declare class HelpCommand extends Command {
    private commandRegistry;
    readonly name = "help";
    readonly description = "Display help information for available commands";
    readonly usage = "help [command-name]";
    constructor(commandRegistry: CommandRegistry);
    execute(context: CLIContext): Promise<CommandResult>;
}
/**
 * Version command - displays CLI version
 */
export declare class VersionCommand extends Command {
    private version;
    readonly name = "version";
    readonly description = "Display CLI version";
    readonly usage = "version";
    constructor(version: string);
    execute(context: CLIContext): Promise<CommandResult>;
}
/**
 * Status command - displays CLI status
 */
export declare class StatusCommand extends Command {
    private commandRegistry;
    readonly name = "status";
    readonly description = "Display CLI status and loaded modules";
    readonly usage = "status";
    constructor(commandRegistry: CommandRegistry);
    execute(context: CLIContext): Promise<CommandResult>;
}
/**
 * Echo command - echoes back input (useful for testing)
 */
export declare class EchoCommand extends Command {
    readonly name = "echo";
    readonly description = "Echo back the provided input (useful for testing)";
    readonly usage = "echo <message>";
    validate(context: CLIContext): {
        valid: boolean;
        errors: string[];
    };
    execute(context: CLIContext): Promise<CommandResult>;
}
//# sourceMappingURL=builtinCommands.d.ts.map