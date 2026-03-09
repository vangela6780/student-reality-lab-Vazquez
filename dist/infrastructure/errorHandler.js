"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolError = exports.ConfigError = exports.CommandNotFoundError = exports.ValidationError = exports.CLIErrorHandler = void 0;
/**
 * Concrete implementation of error handler
 * (D - Dependency Inversion: CLI depends on ErrorHandler interface, not this class)
 */
class CLIErrorHandler {
    handle(error, context) {
        return {
            success: false,
            error: error.message,
            timestamp: new Date(),
            executionTimeMs: 0,
        };
    }
    format(error) {
        if (error instanceof ValidationError) {
            return `Validation Error: ${error.message}\nDetails: ${error.details.join('\n  - ')}`;
        }
        if (error instanceof CommandNotFoundError) {
            return `Command Error: ${error.message}\nRun 'help' to see available commands.`;
        }
        if (error instanceof ConfigError) {
            return `Configuration Error: ${error.message}\nDetails: ${error.cause}`;
        }
        return `Error: ${error.message}`;
    }
}
exports.CLIErrorHandler = CLIErrorHandler;
/**
 * Custom error types for type safety
 */
class ValidationError extends Error {
    constructor(message, details = []) {
        super(message);
        this.details = details;
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
class CommandNotFoundError extends Error {
    constructor(commandName) {
        super(`Command not found: '${commandName}'`);
        this.name = 'CommandNotFoundError';
    }
}
exports.CommandNotFoundError = CommandNotFoundError;
class ConfigError extends Error {
    constructor(message, cause) {
        super(message);
        this.cause = cause;
        this.name = 'ConfigError';
    }
}
exports.ConfigError = ConfigError;
class ToolError extends Error {
    constructor(message, details) {
        super(message);
        this.details = details;
        this.name = 'ToolError';
    }
}
exports.ToolError = ToolError;
//# sourceMappingURL=errorHandler.js.map