"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasePlugin = exports.PluginManager = void 0;
/**
 * Plugin manager for loading and managing plugins
 * (O - Open/Closed: open for extension through plugins)
 */
class PluginManager {
    constructor(container, commandRegistry, eventEmitter) {
        this.container = container;
        this.commandRegistry = commandRegistry;
        this.eventEmitter = eventEmitter;
        this.loadedPlugins = new Map();
    }
    async loadPlugin(name, plugin) {
        const logger = this.container.get('logger');
        try {
            logger.info(`Loading plugin: ${name}`);
            await plugin.initialize(this.container);
            this.loadedPlugins.set(name, plugin);
            logger.info(`Plugin loaded: ${name}`);
            this.eventEmitter.emit('plugin:loaded', { pluginName: name });
        }
        catch (error) {
            logger.error(`Failed to load plugin ${name}`, error);
            throw error;
        }
    }
    async unloadPlugin(name) {
        const logger = this.container.get('logger');
        const plugin = this.loadedPlugins.get(name);
        if (!plugin) {
            logger.warn(`Plugin not found: ${name}`);
            return;
        }
        try {
            logger.info(`Unloading plugin: ${name}`);
            await plugin.shutdown();
            this.loadedPlugins.delete(name);
            logger.info(`Plugin unloaded: ${name}`);
            this.eventEmitter.emit('plugin:unloaded', { pluginName: name });
        }
        catch (error) {
            logger.error(`Failed to unload plugin ${name}`, error);
            throw error;
        }
    }
    getLoadedPlugins() {
        return Array.from(this.loadedPlugins.keys());
    }
    isPluginLoaded(name) {
        return this.loadedPlugins.has(name);
    }
}
exports.PluginManager = PluginManager;
/**
 * Base plugin class for creating custom plugins
 */
class BasePlugin {
    async shutdown() {
        // Default implementation: do nothing
    }
}
exports.BasePlugin = BasePlugin;
//# sourceMappingURL=pluginManager.js.map