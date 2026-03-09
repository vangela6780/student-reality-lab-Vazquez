import { ServiceContainer } from '../domain/types';
import { BasePlugin } from '../application/pluginManager';
/**
 * Screenshot Analyzer Plugin - Takes website screenshots and analyzes them with Gemini AI
 * Provides design feedback and suggestions
 */
export declare class ScreenshotAnalyzerPlugin extends BasePlugin {
    initialize(container: ServiceContainer): Promise<void>;
}
//# sourceMappingURL=screenshotAnalyzerPlugin.d.ts.map