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
exports.ImageGeneratorPlugin = void 0;
const types_1 = require("../domain/types");
const pluginManager_1 = require("../application/pluginManager");
const openai_1 = __importDefault(require("openai"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const https = __importStar(require("https"));
/**
 * Image Generator Plugin - Uses OpenAI DALL-E to generate images
 * Saves generated images to an images folder
 */
class ImageGeneratorPlugin extends pluginManager_1.BasePlugin {
    async initialize(container) {
        const commandRegistry = container.get('commandRegistry');
        const logger = container.get('logger');
        const configManager = container.get('configManager');
        logger.info('Initializing Image Generator Plugin');
        const apiKey = configManager.get('OPENAI_API_KEY');
        if (!apiKey) {
            throw new Error('OPENAI_API_KEY not found in configuration');
        }
        // Register image generation command
        commandRegistry.register(new GenerateImageCommand(apiKey, logger));
        logger.info('Image Generator plugin initialized');
    }
}
exports.ImageGeneratorPlugin = ImageGeneratorPlugin;
/**
 * Generate Image Command - Creates images using DALL-E
 */
class GenerateImageCommand extends types_1.Command {
    constructor(apiKey, logger) {
        super();
        this.name = 'generate-image';
        this.description = 'Generate an image using AI (DALL-E)';
        this.usage = 'generate-image <prompt> [--size <1024x1024|1024x1792|1792x1024>] [--quality <standard|hd>] [--output <filename>]';
        this.openai = new openai_1.default({ apiKey });
        this.logger = logger;
    }
    validate(context) {
        if (context.arguments.length < 1) {
            return { valid: false, errors: ['Image prompt required'] };
        }
        return { valid: true, errors: [] };
    }
    async execute(context) {
        const startTime = Date.now();
        try {
            // Parse arguments
            const args = context.arguments;
            let prompt = '';
            let size = '1024x1024';
            let quality = 'standard';
            let outputFile = null;
            for (let i = 0; i < args.length; i++) {
                if (args[i] === '--size' && i + 1 < args.length) {
                    const sizeArg = args[i + 1];
                    if (['1024x1024', '1024x1792', '1792x1024'].includes(sizeArg)) {
                        size = sizeArg;
                    }
                    i++;
                }
                else if (args[i] === '--quality' && i + 1 < args.length) {
                    const qualityArg = args[i + 1];
                    if (['standard', 'hd'].includes(qualityArg)) {
                        quality = qualityArg;
                    }
                    i++;
                }
                else if (args[i] === '--output' && i + 1 < args.length) {
                    outputFile = args[i + 1];
                    i++;
                }
                else {
                    prompt += (prompt ? ' ' : '') + args[i];
                }
            }
            this.logger.info(`Generating image: ${prompt}`);
            this.logger.info(`Size: ${size}, Quality: ${quality}`);
            // Estimate cost
            const costEstimate = quality === 'hd' ? '$0.08-$0.12' : '$0.04-$0.06';
            this.logger.info(`Estimated cost: ${costEstimate}`);
            // Generate image using DALL-E 3
            const response = await this.openai.images.generate({
                model: 'dall-e-3',
                prompt: prompt,
                n: 1,
                size: size,
                quality: quality,
                response_format: 'url',
            });
            if (!response.data || response.data.length === 0) {
                throw new Error('No image data returned');
            }
            const imageUrl = response.data[0].url;
            if (!imageUrl) {
                throw new Error('No image URL returned');
            }
            // Create images directory
            const imagesDir = path.join(process.cwd(), 'images');
            if (!fs.existsSync(imagesDir)) {
                fs.mkdirSync(imagesDir, { recursive: true });
            }
            // Generate filename
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = outputFile || `generated-${timestamp}.png`;
            const filePath = path.join(imagesDir, filename.endsWith('.png') ? filename : `${filename}.png`);
            // Download and save image
            await this.downloadImage(imageUrl, filePath);
            this.logger.info(`Image saved to: ${filePath}`);
            // Save metadata
            const metadataPath = filePath.replace('.png', '.json');
            const revisedPrompt = response.data[0].revised_prompt || prompt;
            const metadata = {
                prompt,
                size,
                quality,
                generatedAt: new Date().toISOString(),
                revisedPrompt,
                model: 'dall-e-3',
            };
            fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
            return {
                success: true,
                message: `Image generated successfully! Saved to: ${filePath}`,
                data: { filePath, prompt, revisedPrompt, size, quality, costEstimate },
                timestamp: new Date(),
                executionTimeMs: Date.now() - startTime,
            };
        }
        catch (error) {
            this.logger.error(`Image generation failed: ${error.message}`);
            return {
                success: false,
                error: `Image generation failed: ${error.message}`,
                timestamp: new Date(),
                executionTimeMs: Date.now() - startTime,
            };
        }
    }
    downloadImage(url, filePath) {
        return new Promise((resolve, reject) => {
            https.get(url, (response) => {
                if (response.statusCode !== 200) {
                    reject(new Error(`Failed to download image: ${response.statusCode}`));
                    return;
                }
                const fileStream = fs.createWriteStream(filePath);
                response.pipe(fileStream);
                fileStream.on('finish', () => {
                    fileStream.close();
                    resolve();
                });
                fileStream.on('error', (err) => {
                    fs.unlinkSync(filePath);
                    reject(err);
                });
            }).on('error', reject);
        });
    }
}
//# sourceMappingURL=imageGeneratorPlugin.js.map