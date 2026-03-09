"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLIBootstrap = void 0;
const diContainer_1 = require("../infrastructure/diContainer");
const logger_1 = require("../infrastructure/logger");
const errorHandler_1 = require("../infrastructure/errorHandler");
const configManager_1 = require("../infrastructure/configManager");
const ioHandler_1 = require("../infrastructure/ioHandler");
const commandRegistry_1 = require("../infrastructure/commandRegistry");
const validators_1 = require("../infrastructure/validators");
const eventEmitter_1 = require("../infrastructure/eventEmitter");
const cliEngine_1 = require("../application/cliEngine");
const pluginManager_1 = require("../application/pluginManager");
const builtinCommands_1 = require("../application/builtinCommands");
/**
 * Factory for bootstrapping the CLI application
 * Follows the Single Responsibility principle by only handling setup
 */
class CLIBootstrap {
    static async create() {
        // Initialize DI Container
        const container = new diContainer_1.DIContainer();
        // Register infrastructure services
        const logger = new logger_1.CLILogger(process.env.LOG_FILE_PATH || undefined, process.env.VERBOSE === 'true');
        const errorHandler = new errorHandler_1.CLIErrorHandler();
        const configManager = new configManager_1.EnvConfigManager();
        const ioHandler = new ioHandler_1.CLIIOHandler();
        const commandRegistry = new commandRegistry_1.CommandRecordRegistry();
        const inputValidator = new validators_1.CLIInputValidator();
        const outputFormatter = new validators_1.CLIOutputFormatter();
        const eventEmitter = new eventEmitter_1.CLIEventEmitter();
        // Load configuration
        await configManager.load();
        // Register services in container
        container.registerSingleton('logger', logger);
        container.registerSingleton('errorHandler', errorHandler);
        container.registerSingleton('configManager', configManager);
        container.registerSingleton('ioHandler', ioHandler);
        container.registerSingleton('commandRegistry', commandRegistry);
        container.registerSingleton('inputValidator', inputValidator);
        container.registerSingleton('outputFormatter', outputFormatter);
        container.registerSingleton('eventEmitter', eventEmitter);
        // Create CLI Engine
        const engine = new cliEngine_1.StandardCLIEngine(commandRegistry, logger, errorHandler, eventEmitter, inputValidator, outputFormatter);
        // Register built-in commands
        const helpCommand = new builtinCommands_1.HelpCommand(commandRegistry);
        const versionCommand = new builtinCommands_1.VersionCommand('1.0.0');
        const statusCommand = new builtinCommands_1.StatusCommand(commandRegistry);
        const echoCommand = new builtinCommands_1.EchoCommand();
        commandRegistry.register(helpCommand);
        commandRegistry.register(versionCommand);
        commandRegistry.register(statusCommand);
        commandRegistry.register(echoCommand);
        logger.info('Built-in commands registered', {
            commands: [
                helpCommand.name,
                versionCommand.name,
                statusCommand.name,
                echoCommand.name,
            ],
        });
        // Create plugin manager
        const pluginManager = new pluginManager_1.PluginManager(container, commandRegistry, eventEmitter);
        // Emit startup event
        eventEmitter.emit('startup', { timestamp: new Date() });
        logger.info('CLI Engine bootstrapped successfully');
        return { engine, container, registry: commandRegistry, pluginManager };
    }
}
exports.CLIBootstrap = CLIBootstrap;
//# sourceMappingURL=bootstrap.js.map