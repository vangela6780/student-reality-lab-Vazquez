import { ErrorHandler, CommandResult, CLIContext } from '../domain/types';
/**
 * Concrete implementation of error handler
 * (D - Dependency Inversion: CLI depends on ErrorHandler interface, not this class)
 */
export declare class CLIErrorHandler implements ErrorHandler {
    handle(error: Error, context?: CLIContext): CommandResult;
    format(error: Error): string;
}
/**
 * Custom error types for type safety
 */
export declare class ValidationError extends Error {
    details: string[];
    constructor(message: string, details?: string[]);
}
export declare class CommandNotFoundError extends Error {
    constructor(commandName: string);
}
export declare class ConfigError extends Error {
    cause: string;
    constructor(message: string, cause: string);
}
export declare class ToolError extends Error {
    details?: any | undefined;
    constructor(message: string, details?: any | undefined);
}
//# sourceMappingURL=errorHandler.d.ts.map