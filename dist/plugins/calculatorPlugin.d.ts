import { ServiceContainer } from '../domain/types';
import { BasePlugin } from '../application/pluginManager';
/**
 * Example plugin for calculator functionality
 * Demonstrates how to extend the CLI with custom commands
 */
export declare class CalculatorPlugin extends BasePlugin {
    initialize(container: ServiceContainer): Promise<void>;
}
//# sourceMappingURL=calculatorPlugin.d.ts.map