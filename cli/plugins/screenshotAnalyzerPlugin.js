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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScreenshotAnalyzerPlugin = void 0;
const types_1 = require("../domain/types");
const pluginManager_1 = require("../application/pluginManager");
const playwright_1 = require("playwright");
const generative_ai_1 = require("@google/generative-ai");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Screenshot Analyzer Plugin - Takes website screenshots and analyzes them with Gemini AI
 * Provides design feedback and suggestions
 */
class ScreenshotAnalyzerPlugin extends pluginManager_1.BasePlugin {
    async initialize(container) {
        const commandRegistry = container.get('commandRegistry');
        const logger = container.get('logger');
        const configManager = container.get('configManager');
        logger.info('Initializing Screenshot Analyzer Plugin');
        const geminiApiKey = configManager.get('GEMINI_API_KEY');
        if (!geminiApiKey) {
            throw new Error('GEMINI_API_KEY not found in configuration');
        }
        // Register screenshot command
        commandRegistry.register(new ScreenshotAnalyzeCommand(geminiApiKey, logger));
        logger.info('Screenshot Analyzer plugin initialized');
    }
}
exports.ScreenshotAnalyzerPlugin = ScreenshotAnalyzerPlugin;
/**
 * Screenshot and Analyze Command - Captures website screenshots and gets AI feedback
 */
class ScreenshotAnalyzeCommand extends types_1.Command {
    constructor(apiKey, logger) {
        super();
        this.name = 'analyze-website';
        this.description = 'Take a screenshot of a website and get AI design feedback';
        this.usage = 'analyze-website <url> [--fullpage] [--output <filename>]';
        this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        this.logger = logger;
    }
    validate(context) {
        if (context.arguments.length < 1) {
            return { valid: false, errors: ['Website URL required'] };
        }
        const url = context.arguments[0];
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return { valid: false, errors: ['URL must start with http:// or https://'] };
        }
        return { valid: true, errors: [] };
    }
    async execute(cliContext) {
        const startTime = Date.now();
        let browser = null;
        try {
            // Parse arguments
            const args = cliContext.arguments;
            const url = args[0];
            let fullPage = false;
            let outputFile = null;
            for (let i = 1; i < args.length; i++) {
                if (args[i] === '--fullpage') {
                    fullPage = true;
                }
                else if (args[i] === '--output' && i + 1 < args.length) {
                    outputFile = args[i + 1];
                    i++;
                }
            }
            this.logger.info(`Analyzing website: ${url}`);
            // Create screenshots directory
            const screenshotsDir = path.join(process.cwd(), 'screenshots');
            if (!fs.existsSync(screenshotsDir)) {
                fs.mkdirSync(screenshotsDir, { recursive: true });
            }
            // Generate filename
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = outputFile || `screenshot-${timestamp}.png`;
            const screenshotPath = path.join(screenshotsDir, filename.endsWith('.png') ? filename : `${filename}.png`);
            // Launch browser and take screenshot
            this.logger.info('Launching browser...');
            browser = await playwright_1.chromium.launch({ headless: true });
            const browserContext = await browser.newContext({
                viewport: { width: 1920, height: 1080 }
            });
            const page = await browserContext.newPage();
            this.logger.info('Navigating to URL...');
            await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
            this.logger.info('Taking screenshot...');
            await page.screenshot({
                path: screenshotPath,
                fullPage: fullPage
            });
            await browser.close();
            browser = null;
            this.logger.info(`Screenshot saved to: ${screenshotPath}`);
            // Read screenshot as base64
            const imageBuffer = fs.readFileSync(screenshotPath);
            const base64Image = imageBuffer.toString('base64');
            // Analyze with Gemini
            this.logger.info('Analyzing design with Gemini AI...');
            const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            const prompt = `Analyze this website screenshot and provide detailed feedback on the following aspects:

1. **Overall Design**: First impressions, visual appeal, and professionalism
2. **Layout & Structure**: Organization, hierarchy, and use of whitespace
3. **Color Scheme**: Color choices, contrast, and visual harmony
4. **Typography**: Font choices, readability, and text hierarchy
5. **User Experience**: Navigation, accessibility, and usability
6. **Responsive Design**: How well it appears to adapt to different screen sizes
7. **Strengths**: What works well
8. **Improvements**: Specific suggestions for enhancement

Please be specific and actionable in your feedback.`;
            const result = await model.generateContent([
                prompt,
                {
                    inlineData: {
                        mimeType: 'image/png',
                        data: base64Image
                    }
                }
            ]);
            const response = result.response;
            const analysis = response.text();
            // Save analysis to file
            const analysisPath = screenshotPath.replace('.png', '-analysis.md');
            const analysisContent = `# Website Analysis: ${url}\n\n**Analyzed:** ${new Date().toISOString()}\n**Screenshot:** ${path.basename(screenshotPath)}\n\n---\n\n${analysis}\n`;
            fs.writeFileSync(analysisPath, analysisContent);
            this.logger.info(`Analysis saved to: ${analysisPath}`);
            return {
                success: true,
                message: `Website analysis completed! Analysis saved to: ${analysisPath}`,
                data: { url, screenshotPath, analysisPath, analysis },
                timestamp: new Date(),
                executionTimeMs: Date.now() - startTime,
            };
        }
        catch (error) {
            if (browser) {
                await browser.close();
            }
            this.logger.error(`Website analysis failed: ${error.message}`);
            return {
                success: false,
                error: `Website analysis failed: ${error.message}`,
                timestamp: new Date(),
                executionTimeMs: Date.now() - startTime,
            };
        }
    }
}
//# sourceMappingURL=screenshotAnalyzerPlugin.js.map