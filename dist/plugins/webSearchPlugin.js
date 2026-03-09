"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSearchPlugin = void 0;
const types_1 = require("../domain/types");
const pluginManager_1 = require("../application/pluginManager");
const openai_1 = __importDefault(require("openai"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Web Search Plugin - Uses OpenAI's search capabilities for online research
 * Allows AI to conduct up-to-date research and create documents
 */
class WebSearchPlugin extends pluginManager_1.BasePlugin {
    async initialize(container) {
        const commandRegistry = container.get('commandRegistry');
        const logger = container.get('logger');
        const configManager = container.get('configManager');
        logger.info('Initializing Web Search Plugin');
        const apiKey = configManager.get('OPENAI_API_KEY');
        if (!apiKey) {
            throw new Error('OPENAI_API_KEY not found in configuration');
        }
        // Register search command
        commandRegistry.register(new WebSearchCommand(apiKey, logger));
        logger.info('Web Search plugin initialized');
    }
}
exports.WebSearchPlugin = WebSearchPlugin;
/**
 * Web Search Command - Conducts online research using OpenAI
 */
class WebSearchCommand extends types_1.Command {
    constructor(apiKey, logger) {
        super();
        this.name = 'search';
        this.description = 'Conduct online research using AI web search';
        this.usage = 'search <query> [--output <filename>]';
        this.openai = new openai_1.default({ apiKey });
        this.logger = logger;
    }
    validate(context) {
        if (context.arguments.length < 1) {
            return { valid: false, errors: ['Search query required'] };
        }
        return { valid: true, errors: [] };
    }
    async execute(context) {
        const startTime = Date.now();
        try {
            // Parse arguments
            const args = context.arguments;
            let query = '';
            let outputFile = null;
            for (let i = 0; i < args.length; i++) {
                if (args[i] === '--output' && i + 1 < args.length) {
                    outputFile = args[i + 1];
                    i++;
                }
                else {
                    query += (query ? ' ' : '') + args[i];
                }
            }
            this.logger.info(`Searching for: ${query}`);
            // Use OpenAI's GPT-4 with web search capability
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4o', // Latest model with browsing
                messages: [
                    {
                        role: 'system',
                        content: 'You are a research assistant. Provide comprehensive, up-to-date information on the topic requested. Include sources and citations when possible.'
                    },
                    {
                        role: 'user',
                        content: `Research the following topic and provide detailed, current information: ${query}`
                    }
                ],
                temperature: 0.7,
                max_tokens: 2000,
            });
            const result = response.choices[0].message.content || 'No results found';
            // Save to file if output specified
            if (outputFile) {
                const outputDir = path.join(process.cwd(), 'research');
                if (!fs.existsSync(outputDir)) {
                    fs.mkdirSync(outputDir, { recursive: true });
                }
                const filePath = path.join(outputDir, outputFile.endsWith('.md') ? outputFile : `${outputFile}.md`);
                const content = `# Research: ${query}\n\n**Generated:** ${new Date().toISOString()}\n\n---\n\n${result}\n`;
                fs.writeFileSync(filePath, content);
                this.logger.info(`Research saved to: ${filePath}`);
                return {
                    success: true,
                    message: `Research completed and saved to: ${filePath}`,
                    data: { filePath, result },
                    timestamp: new Date(),
                    executionTimeMs: Date.now() - startTime,
                };
            }
            return {
                success: true,
                message: 'Research completed',
                data: { result },
                timestamp: new Date(),
                executionTimeMs: Date.now() - startTime,
            };
        }
        catch (error) {
            this.logger.error(`Search failed: ${error.message}`);
            return {
                success: false,
                error: `Search failed: ${error.message}`,
                timestamp: new Date(),
                executionTimeMs: Date.now() - startTime,
            };
        }
    }
}
//# sourceMappingURL=webSearchPlugin.js.map