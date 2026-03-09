import { ServiceContainer } from '../domain/types';
import { BasePlugin } from '../application/pluginManager';
/**
 * Image Generator Plugin - Uses OpenAI DALL-E to generate images
 * Saves generated images to an images folder
 */
export declare class ImageGeneratorPlugin extends BasePlugin {
    initialize(container: ServiceContainer): Promise<void>;
}
//# sourceMappingURL=imageGeneratorPlugin.d.ts.map