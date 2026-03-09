import { InputValidator, OutputFormatter, CommandResult, CLIContext } from '../domain/types';
/**
 * Input validator for CLI arguments
 * (I - Interface Segregation: focused only on validation)
 */
export declare class CLIInputValidator implements InputValidator {
    validate(input: string): {
        valid: boolean;
        errors: string[];
    };
    parseArguments(args: string[]): CLIContext;
}
/**
 * Output formatter for CLI results
 * (I - Interface Segregation: focused only on formatting)
 */
export declare class CLIOutputFormatter implements OutputFormatter {
    format(result: CommandResult, format: 'text' | 'json'): string;
}
//# sourceMappingURL=validators.d.ts.map