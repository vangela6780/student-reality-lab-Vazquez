"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLILogger = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Concrete logger implementation with file and console output
 * (D - Dependency Inversion: depends on Logger interface)
 */
class CLILogger {
    constructor(logFile, verbose = false) {
        this.logFile = logFile || null;
        this.verbose = verbose;
        if (this.logFile) {
            const dir = path.dirname(this.logFile);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        }
    }
    formatMessage(level, message, data) {
        const timestamp = new Date().toISOString();
        const dataStr = data ? `\n${JSON.stringify(data, null, 2)}` : '';
        return `[${timestamp}] [${level}] ${message}${dataStr}`;
    }
    writeToFile(formatted) {
        if (!this.logFile)
            return;
        try {
            fs.appendFileSync(this.logFile, formatted + '\n');
        }
        catch (err) {
            console.error('Failed to write to log file:', err);
        }
    }
    info(message, data) {
        const formatted = this.formatMessage('INFO', message, data);
        console.log(formatted);
        this.writeToFile(formatted);
    }
    warn(message, data) {
        const formatted = this.formatMessage('WARN', message, data);
        console.warn(formatted);
        this.writeToFile(formatted);
    }
    error(message, error) {
        const formatted = this.formatMessage('ERROR', message, error ? error.stack || error : undefined);
        console.error(formatted);
        this.writeToFile(formatted);
    }
    debug(message, data) {
        if (!this.verbose)
            return;
        const formatted = this.formatMessage('DEBUG', message, data);
        console.log(formatted);
        this.writeToFile(formatted);
    }
}
exports.CLILogger = CLILogger;
//# sourceMappingURL=logger.js.map