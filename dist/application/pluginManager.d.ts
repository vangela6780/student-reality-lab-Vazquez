import { Plugin, ServiceContainer, CommandRegistry, EventEmitter } from '../domain/types';
/**
 * Plugin manager for loading and managing plugins
 * (O - Open/Closed: open for extension through plugins)
 */
export declare class PluginManager {
    private container;
    private commandRegistry;
    private eventEmitter;
    private loadedPlugins;
    constructor(container: ServiceContainer, commandRegistry: CommandRegistry, eventEmitter: EventEmitter);
    loadPlugin(name: string, plugin: Plugin): Promise<void>;
    unloadPlugin(name: string): Promise<void>;
    getLoadedPlugins(): string[];
    isPluginLoaded(name: string): boolean;
}
/**
 * Base plugin class for creating custom plugins
 */
export declare abstract class BasePlugin implements Plugin {
    abstract initialize(container: ServiceContainer): Promise<void>;
    shutdown(): Promise<void>;
}
//# sourceMappingURL=pluginManager.d.ts.map