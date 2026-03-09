import { Logger } from '../domain/types';
/**
 * Concrete logger implementation with file and console output
 * (D - Dependency Inversion: depends on Logger interface)
 */
export declare class CLILogger implements Logger {
    private logFile;
    private verbose;
    constructor(logFile?: string, verbose?: boolean);
    private formatMessage;
    private writeToFile;
    info(message: string, data?: any): void;
    warn(message: string, data?: any): void;
    error(message: string, error?: any): void;
    debug(message: string, data?: any): void;
}
//# sourceMappingURL=logger.d.ts.map