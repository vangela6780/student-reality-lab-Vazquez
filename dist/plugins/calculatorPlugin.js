"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalculatorPlugin = void 0;
const types_1 = require("../domain/types");
const pluginManager_1 = require("../application/pluginManager");
/**
 * Example plugin for calculator functionality
 * Demonstrates how to extend the CLI with custom commands
 */
class CalculatorPlugin extends pluginManager_1.BasePlugin {
    async initialize(container) {
        const commandRegistry = container.get('commandRegistry');
        const logger = container.get('logger');
        logger.info('Initializing Calculator Plugin');
        // Register calculator commands
        commandRegistry.register(new AddCommand());
        commandRegistry.register(new SubtractCommand());
        commandRegistry.register(new MultiplyCommand());
        logger.info('Calculator plugin initialized');
    }
}
exports.CalculatorPlugin = CalculatorPlugin;
/**
 * Addition command
 */
class AddCommand extends types_1.Command {
    constructor() {
        super(...arguments);
        this.name = 'add';
        this.description = 'Add two numbers';
        this.usage = 'add <num1> <num2>';
    }
    validate(context) {
        if (context.arguments.length < 2) {
            return { valid: false, errors: ['Two numbers required'] };
        }
        return { valid: true, errors: [] };
    }
    async execute(context) {
        try {
            const num1 = parseFloat(context.arguments[0]);
            const num2 = parseFloat(context.arguments[1]);
            if (isNaN(num1) || isNaN(num2)) {
                return {
                    success: false,
                    error: 'Invalid numbers provided',
                    timestamp: new Date(),
                    executionTimeMs: 0,
                };
            }
            const result = num1 + num2;
            return {
                success: true,
                data: { num1, num2, result },
                message: `${num1} + ${num2} = ${result}`,
                timestamp: new Date(),
                executionTimeMs: 0,
            };
        }
        catch (error) {
            return {
                success: false,
                error: String(error),
                timestamp: new Date(),
                executionTimeMs: 0,
            };
        }
    }
}
/**
 * Subtraction command
 */
class SubtractCommand extends types_1.Command {
    constructor() {
        super(...arguments);
        this.name = 'subtract';
        this.description = 'Subtract two numbers';
        this.usage = 'subtract <num1> <num2>';
    }
    validate(context) {
        if (context.arguments.length < 2) {
            return { valid: false, errors: ['Two numbers required'] };
        }
        return { valid: true, errors: [] };
    }
    async execute(context) {
        try {
            const num1 = parseFloat(context.arguments[0]);
            const num2 = parseFloat(context.arguments[1]);
            if (isNaN(num1) || isNaN(num2)) {
                return {
                    success: false,
                    error: 'Invalid numbers provided',
                    timestamp: new Date(),
                    executionTimeMs: 0,
                };
            }
            const result = num1 - num2;
            return {
                success: true,
                data: { num1, num2, result },
                message: `${num1} - ${num2} = ${result}`,
                timestamp: new Date(),
                executionTimeMs: 0,
            };
        }
        catch (error) {
            return {
                success: false,
                error: String(error),
                timestamp: new Date(),
                executionTimeMs: 0,
            };
        }
    }
}
/**
 * Multiplication command
 */
class MultiplyCommand extends types_1.Command {
    constructor() {
        super(...arguments);
        this.name = 'multiply';
        this.description = 'Multiply two numbers';
        this.usage = 'multiply <num1> <num2>';
    }
    validate(context) {
        if (context.arguments.length < 2) {
            return { valid: false, errors: ['Two numbers required'] };
        }
        return { valid: true, errors: [] };
    }
    async execute(context) {
        try {
            const num1 = parseFloat(context.arguments[0]);
            const num2 = parseFloat(context.arguments[1]);
            if (isNaN(num1) || isNaN(num2)) {
                return {
                    success: false,
                    error: 'Invalid numbers provided',
                    timestamp: new Date(),
                    executionTimeMs: 0,
                };
            }
            const result = num1 * num2;
            return {
                success: true,
                data: { num1, num2, result },
                message: `${num1} × ${num2} = ${result}`,
                timestamp: new Date(),
                executionTimeMs: 0,
            };
        }
        catch (error) {
            return {
                success: false,
                error: String(error),
                timestamp: new Date(),
                executionTimeMs: 0,
            };
        }
    }
}
//# sourceMappingURL=calculatorPlugin.js.map