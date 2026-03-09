"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLIBootstrap = void 0;
const bootstrap_1 = require("./application/bootstrap");
Object.defineProperty(exports, "CLIBootstrap", { enumerable: true, get: function () { return bootstrap_1.CLIBootstrap; } });
const validators_1 = require("./infrastructure/validators");
const webSearchPlugin_1 = require("./plugins/webSearchPlugin");
const imageGeneratorPlugin_1 = require("./plugins/imageGeneratorPlugin");
const screenshotAnalyzerPlugin_1 = require("./plugins/screenshotAnalyzerPlugin");
const calculatorPlugin_1 = require("./plugins/calculatorPlugin");
/**
 * Main entry point for the CLI application
 */
async function main() {
    try {
        // Bootstrap the CLI application
        const { engine, container, pluginManager } = await bootstrap_1.CLIBootstrap.create();
        const logger = container.get('logger');
        const ioHandler = container.get('ioHandler');
        const configManager = container.get('configManager');
        const outputFormatter = new validators_1.CLIOutputFormatter();
        // Load plugins without hard-failing startup when optional API keys are missing.
        logger.info('Loading plugins...');
        const loadPluginSafely = async (name, plugin, requiredEnv) => {
            if (requiredEnv && !configManager.get(requiredEnv)) {
                logger.warn(`Skipping ${name}: missing ${requiredEnv}`);
                return;
            }
            try {
                await pluginManager.loadPlugin(name, plugin);
            }
            catch (error) {
                const err = error;
                const message = err && err.message ? err.message : String(err);
                logger.error(`Failed to load plugin ${name}: ${message}`);
                throw err;
            }
        };
        await loadPluginSafely('webSearch', new webSearchPlugin_1.WebSearchPlugin(), 'OPENAI_API_KEY');
        await loadPluginSafely('imageGenerator', new imageGeneratorPlugin_1.ImageGeneratorPlugin(), 'OPENAI_API_KEY');
        await loadPluginSafely('screenshotAnalyzer', new screenshotAnalyzerPlugin_1.ScreenshotAnalyzerPlugin(), 'GEMINI_API_KEY');
        await loadPluginSafely('calculator', new calculatorPlugin_1.CalculatorPlugin());
        logger.info('Plugin loading finished');
        // Get command-line arguments (skip node and script path)
        const args = process.argv.slice(2);
        // Display help if no arguments provided
        if (args.length === 0) {
            const result = await engine.executeCommand('help', {
                arguments: [],
                options: {},
                outputFormat: 'text',
                verbose: false,
            });
            const formattedOutput = outputFormatter.format(result, 'text');
            ioHandler.writeOutput(formattedOutput, 'text');
            process.exit(0);
        }
        // Execute the command
        const result = await engine.execute(args);
        // Format and output the result
        const outputFormat = args.includes('--json') || args.includes('-j') ? 'json' : 'text';
        const formattedOutput = outputFormatter.format(result, outputFormat);
        if (result.success) {
            ioHandler.writeOutput(formattedOutput, 'text');
        }
        else {
            ioHandler.writeError(formattedOutput);
            process.exit(1);
        }
        // Shutdown gracefully
        // Shutdown complete
        process.exit(result.success ? 0 : 1);
    }
    catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    }
}
// Run the CLI
if (require.main === module) {
    main().catch((error) => {
        console.error('Uncaught error:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=index.js.map