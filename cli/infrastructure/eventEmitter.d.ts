import { EventEmitter } from '../domain/types';
/**
 * Event emitter implementation for CLI lifecycle events
 * (O - Open/Closed: open for extension through event listeners)
 */
export declare class CLIEventEmitter implements EventEmitter {
    private listeners;
    emit(event: string, data?: any): void;
    on(event: string, callback: (data: any) => void): void;
    off(event: string, callback: (data: any) => void): void;
}
/**
 * Standard CLI events
 */
export declare const CLIEvents: {
    readonly COMMAND_REGISTERED: "command:registered";
    readonly COMMAND_EXECUTED: "command:executed";
    readonly COMMAND_FAILED: "command:failed";
    readonly PLUGIN_LOADED: "plugin:loaded";
    readonly PLUGIN_UNLOADED: "plugin:unloaded";
    readonly ERROR: "error";
    readonly STARTUP: "startup";
    readonly SHUTDOWN: "shutdown";
};
//# sourceMappingURL=eventEmitter.d.ts.map