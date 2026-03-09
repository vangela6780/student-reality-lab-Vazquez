/**
 * Core domain entities and interfaces following SOLID principles
 * This layer is independent of any framework or external dependencies
 */
/**
 * Represents the context of CLI execution (I - Interface Segregation)
 */
export interface CLIContext {
    arguments: string[];
    options: Record<string, string | boolean | string[]>;
    outputFormat: 'text' | 'json';
    verbose: boolean;
}
/**
 * Represents the result of executing a command
 */
export interface CommandResult {
    success: boolean;
    data?: any;
    error?: string;
    message?: string;
    timestamp: Date;
    executionTimeMs: number;
}
/**
 * Represents a single CLI command (O - Open/Closed Principle)
 * New commands can be added without modifying existing code
 */
export declare abstract class Command {
    abstract readonly name: string;
    abstract readonly description: string;
    abstract readonly usage: string;
    abstract execute(context: CLIContext): Promise<CommandResult>;
    /**
     * Validate input before execution
     * (S - Single Responsibility: validation is separate)
     */
    validate(context: CLIContext): {
        valid: boolean;
        errors: string[];
    };
}
/**
 * Handles dependencies for commands (D - Dependency Inversion)
 * Commands depend on this abstraction, not concrete implementations
 */
export interface CommandDependencies {
    logger: Logger;
    errorHandler: ErrorHandler;
    configManager: ConfigManager;
    [key: string]: any;
}
/**
 * Logging abstraction (I - Interface Segregation)
 */
export interface Logger {
    info(message: string, data?: any): void;
    warn(message: string, data?: any): void;
    error(message: string, error?: any): void;
    debug(message: string, data?: any): void;
}
/**
 * Error handling abstraction (I - Interface Segregation)
 */
export interface ErrorHandler {
    handle(error: Error, context?: CLIContext): CommandResult;
    format(error: Error): string;
}
/**
 * Configuration management abstraction (I - Interface Segregation)
 */
export interface ConfigManager {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    getAll(): Record<string, string>;
    load(filePath?: string): Promise<void>;
}
/**
 * Input/Output handler (D - Dependency Inversion)
 * Abstracts how input is received and output is delivered
 */
export interface IOHandler {
    readInput(): Promise<string>;
    writeOutput(data: any, format: 'text' | 'json'): void;
    writeError(error: string | Error): void;
}
/**
 * Registry for managing commands (S - Single Responsibility)
 * Only responsible for command registration and retrieval
 */
export interface CommandRegistry {
    register(command: Command): void;
    unregister(commandName: string): void;
    get(commandName: string): Command | null;
    getAll(): Command[];
    exists(commandName: string): boolean;
}
/**
 * Plugin system for extending functionality (O - Open/Closed Principle)
 */
export interface Plugin {
    initialize(container: ServiceContainer): Promise<void>;
    shutdown(): Promise<void>;
}
/**
 * Service container for dependency injection (D - Dependency Inversion)
 */
export interface ServiceContainer {
    register(key: string, service: any): void;
    get(key: string): any;
    has(key: string): boolean;
}
/**
 * Main CLI engine (S - Single Responsibility)
 * Only responsible for orchestrating command execution
 */
export interface CLIEngine {
    execute(args: string[]): Promise<CommandResult>;
    executeCommand(commandName: string, context: CLIContext): Promise<CommandResult>;
}
/**
 * Validator for CLI input (I - Interface Segregation)
 */
export interface InputValidator {
    validate(input: string): {
        valid: boolean;
        errors: string[];
    };
    parseArguments(args: string[]): CLIContext;
}
/**
 * Transformer for command output (I - Interface Segregation)
 */
export interface OutputFormatter {
    format(result: CommandResult, format: 'text' | 'json'): string;
}
/**
 * Event emitter for CLI lifecycle events (O - Open/Closed Principle)
 */
export interface EventEmitter {
    emit(event: string, data?: any): void;
    on(event: string, callback: (data: any) => void): void;
    off(event: string, callback: (data: any) => void): void;
}
/**
 * Tools available for agents to use
 */
export interface Tool {
    readonly name: string;
    readonly description: string;
    execute(input: any): Promise<any>;
}
//# sourceMappingURL=types.d.ts.map