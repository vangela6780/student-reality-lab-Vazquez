import { CLIEngine, CommandRegistry, CommandResult, CLIContext, Logger, ErrorHandler, EventEmitter, InputValidator, OutputFormatter } from '../domain/types';
/**
 * Main CLI engine that orchestrates command execution
 * (S - Single Responsibility: only responsible for orchestration)
 * (D - Dependency Inversion: depends on abstractions, not concrete implementations)
 */
export declare class StandardCLIEngine implements CLIEngine {
    private commandRegistry;
    private logger;
    private errorHandler;
    private eventEmitter;
    private inputValidator;
    private outputFormatter;
    constructor(commandRegistry: CommandRegistry, logger: Logger, errorHandler: ErrorHandler, eventEmitter: EventEmitter, inputValidator: InputValidator, outputFormatter: OutputFormatter);
    execute(args: string[]): Promise<CommandResult>;
    executeCommand(commandName: string, context: CLIContext): Promise<CommandResult>;
}
//# sourceMappingURL=cliEngine.d.ts.map