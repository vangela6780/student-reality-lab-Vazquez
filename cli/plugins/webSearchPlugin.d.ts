import { ServiceContainer } from '../domain/types';
import { BasePlugin } from '../application/pluginManager';
/**
 * Web Search Plugin - Uses OpenAI's search capabilities for online research
 * Allows AI to conduct up-to-date research and create documents
 */
export declare class WebSearchPlugin extends BasePlugin {
    initialize(container: ServiceContainer): Promise<void>;
}
//# sourceMappingURL=webSearchPlugin.d.ts.map