import { ConfigManager } from '../domain/types';
/**
 * Concrete config manager implementation
 * Loads from .env files and provides key-value access
 * (D - Dependency Inversion: depends on ConfigManager interface)
 */
export declare class EnvConfigManager implements ConfigManager {
    private config;
    private readonly defaultPaths;
    constructor();
    load(filePath?: string): Promise<void>;
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    getAll(): Record<string, string>;
}
//# sourceMappingURL=configManager.d.ts.map