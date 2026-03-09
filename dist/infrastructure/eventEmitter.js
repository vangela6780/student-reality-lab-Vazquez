"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLIEvents = exports.CLIEventEmitter = void 0;
/**
 * Event emitter implementation for CLI lifecycle events
 * (O - Open/Closed: open for extension through event listeners)
 */
class CLIEventEmitter {
    constructor() {
        this.listeners = new Map();
    }
    emit(event, data) {
        if (!this.listeners.has(event))
            return;
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.forEach((callback) => {
                try {
                    callback(data);
                }
                catch (error) {
                    console.error(`Error in event listener for '${event}':`, error);
                }
            });
        }
    }
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
    }
    off(event, callback) {
        if (!this.listeners.has(event))
            return;
        this.listeners.get(event).delete(callback);
    }
}
exports.CLIEventEmitter = CLIEventEmitter;
/**
 * Standard CLI events
 */
exports.CLIEvents = {
    COMMAND_REGISTERED: 'command:registered',
    COMMAND_EXECUTED: 'command:executed',
    COMMAND_FAILED: 'command:failed',
    PLUGIN_LOADED: 'plugin:loaded',
    PLUGIN_UNLOADED: 'plugin:unloaded',
    ERROR: 'error',
    STARTUP: 'startup',
    SHUTDOWN: 'shutdown',
};
//# sourceMappingURL=eventEmitter.js.map