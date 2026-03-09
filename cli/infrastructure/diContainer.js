"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DIContainer = void 0;
/**
 * Concrete service container for dependency injection
 * (D - Dependency Inversion: enables loose coupling through DI)
 */
class DIContainer {
    constructor() {
        this.services = new Map();
        this.singletons = new Map();
    }
    register(key, service) {
        this.services.set(key, service);
    }
    get(key) {
        if (this.services.has(key)) {
            const service = this.services.get(key);
            // If it's a factory function, call it
            if (typeof service === 'function' && !this.singletons.has(key)) {
                const instance = service();
                this.singletons.set(key, instance);
                return instance;
            }
            return service;
        }
        throw new Error(`Service '${key}' not found in container`);
    }
    has(key) {
        return this.services.has(key);
    }
    /**
     * Register a service as a singleton
     */
    registerSingleton(key, instance) {
        this.services.set(key, instance);
        this.singletons.set(key, instance);
    }
    /**
     * Register a factory function
     */
    registerFactory(key, factory) {
        this.services.set(key, factory);
    }
    /**
     * Clear all registrations
     */
    clear() {
        this.services.clear();
        this.singletons.clear();
    }
}
exports.DIContainer = DIContainer;
//# sourceMappingURL=diContainer.js.map