import { Command, CommandRegistry } from '../domain/types';
/**
 * Concrete command registry implementation
 * (S - Single Responsibility: only manages command registration)
 * (O - Open/Closed: can register new commands without modifying existing code)
 */
export declare class CommandRecordRegistry implements CommandRegistry {
    private commands;
    register(command: Command): void;
    unregister(commandName: string): void;
    get(commandName: string): Command | null;
    getAll(): Command[];
    exists(commandName: string): boolean;
}
//# sourceMappingURL=commandRegistry.d.ts.map