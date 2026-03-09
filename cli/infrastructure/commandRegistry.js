"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandRecordRegistry = void 0;
/**
 * Concrete command registry implementation
 * (S - Single Responsibility: only manages command registration)
 * (O - Open/Closed: can register new commands without modifying existing code)
 */
class CommandRecordRegistry {
    constructor() {
        this.commands = new Map();
    }
    register(command) {
        this.commands.set(command.name.toLowerCase(), command);
    }
    unregister(commandName) {
        this.commands.delete(commandName.toLowerCase());
    }
    get(commandName) {
        return this.commands.get(commandName.toLowerCase()) || null;
    }
    getAll() {
        return Array.from(this.commands.values());
    }
    exists(commandName) {
        return this.commands.has(commandName.toLowerCase());
    }
}
exports.CommandRecordRegistry = CommandRecordRegistry;
//# sourceMappingURL=commandRegistry.js.map