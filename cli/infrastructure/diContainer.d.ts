import { ServiceContainer } from '../domain/types';
/**
 * Concrete service container for dependency injection
 * (D - Dependency Inversion: enables loose coupling through DI)
 */
export declare class DIContainer implements ServiceContainer {
    private services;
    private singletons;
    register(key: string, service: any): void;
    get(key: string): any;
    has(key: string): boolean;
    /**
     * Register a service as a singleton
     */
    registerSingleton(key: string, instance: any): void;
    /**
     * Register a factory function
     */
    registerFactory(key: string, factory: () => any): void;
    /**
     * Clear all registrations
     */
    clear(): void;
}
//# sourceMappingURL=diContainer.d.ts.map