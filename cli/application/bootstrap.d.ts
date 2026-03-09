import { PluginManager } from '../application/pluginManager';
import { ServiceContainer, CLIEngine, CommandRegistry } from '../domain/types';
/**
 * Factory for bootstrapping the CLI application
 * Follows the Single Responsibility principle by only handling setup
 */
export declare class CLIBootstrap {
    static create(): Promise<{
        engine: CLIEngine;
        container: ServiceContainer;
        registry: CommandRegistry;
        pluginManager: PluginManager;
    }>;
}
//# sourceMappingURL=bootstrap.d.ts.map