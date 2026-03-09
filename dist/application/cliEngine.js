"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StandardCLIEngine = void 0;
const errorHandler_1 = require("../infrastructure/errorHandler");
/**
 * Main CLI engine that orchestrates command execution
 * (S - Single Responsibility: only responsible for orchestration)
 * (D - Dependency Inversion: depends on abstractions, not concrete implementations)
 */
class StandardCLIEngine {
    constructor(commandRegistry, logger, errorHandler, eventEmitter, inputValidator, outputFormatter) {
        this.commandRegistry = commandRegistry;
        this.logger = logger;
        this.errorHandler = errorHandler;
        this.eventEmitter = eventEmitter;
        this.inputValidator = inputValidator;
        this.outputFormatter = outputFormatter;
    }
    async execute(args) {
        const startTime = Date.now();
        try {
            // Parse arguments into context
            const context = this.inputValidator.parseArguments(args);
            // Extract command name
            if (context.arguments.length === 0) {
                throw new errorHandler_1.CommandNotFoundError('No command specified');
            }
            const commandName = context.arguments[0];
            const commandArgs = context.arguments.slice(1);
            // Update context with remaining arguments
            context.arguments = commandArgs;
            return await this.executeCommand(commandName, context);
        }
        catch (error) {
            const result = this.errorHandler.handle(error);
            result.executionTimeMs = Date.now() - startTime;
            this.logger.error('CLI execution failed', error);
            this.eventEmitter.emit('command:failed', { error });
            return result;
        }
    }
    async executeCommand(commandName, context) {
        const startTime = Date.now();
        try {
            // Find command
            const command = this.commandRegistry.get(commandName);
            if (!command) {
                throw new errorHandler_1.CommandNotFoundError(commandName);
            }
            // Validate input
            const validation = command.validate(context);
            if (!validation.valid) {
                return {
                    success: false,
                    error: 'Validation failed',
                    message: validation.errors.join('; '),
                    timestamp: new Date(),
                    executionTimeMs: Date.now() - startTime,
                };
            }
            this.logger.debug(`Executing command: ${commandName}`, context);
            // Execute command
            const result = await command.execute(context);
            result.executionTimeMs = Date.now() - startTime;
            this.logger.info(`Command executed: ${commandName}`, {
                success: result.success,
                executionTime: result.executionTimeMs,
            });
            this.eventEmitter.emit('command:executed', { commandName, result });
            return result;
        }
        catch (error) {
            const result = this.errorHandler.handle(error, context);
            result.executionTimeMs = Date.now() - startTime;
            this.logger.error(`Command execution failed: ${commandName}`, error);
            this.eventEmitter.emit('command:failed', { commandName, error });
            return result;
        }
    }
}
exports.StandardCLIEngine = StandardCLIEngine;
//# sourceMappingURL=cliEngine.js.map