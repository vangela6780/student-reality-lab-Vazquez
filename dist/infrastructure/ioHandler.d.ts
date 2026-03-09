import { IOHandler } from '../domain/types';
/**
 * Concrete IO handler for CLI
 * Handles reading from stdin and writing to stdout/stderr
 * (D - Dependency Inversion: depends on IOHandler interface)
 */
export declare class CLIIOHandler implements IOHandler {
    private rl;
    readInput(): Promise<string>;
    writeOutput(data: any, format: 'text' | 'json'): void;
    writeError(error: string | Error): void;
}
/**
 * Mock IO handler for testing
 */
export declare class MockIOHandler implements IOHandler {
    private inputQueue;
    outputs: string[];
    errors: string[];
    enqueueInput(input: string): void;
    readInput(): Promise<string>;
    writeOutput(data: any, format: 'text' | 'json'): void;
    writeError(error: string | Error): void;
}
//# sourceMappingURL=ioHandler.d.ts.map