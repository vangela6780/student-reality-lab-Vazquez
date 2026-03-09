"use strict";
/**
 * Core domain entities and interfaces following SOLID principles
 * This layer is independent of any framework or external dependencies
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Command = void 0;
/**
 * Represents a single CLI command (O - Open/Closed Principle)
 * New commands can be added without modifying existing code
 */
class Command {
    /**
     * Validate input before execution
     * (S - Single Responsibility: validation is separate)
     */
    validate(context) {
        return { valid: true, errors: [] };
    }
}
exports.Command = Command;
//# sourceMappingURL=types.js.map