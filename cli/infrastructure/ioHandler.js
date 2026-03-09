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
exports.MockIOHandler = exports.CLIIOHandler = void 0;
const readline = __importStar(require("readline"));
/**
 * Concrete IO handler for CLI
 * Handles reading from stdin and writing to stdout/stderr
 * (D - Dependency Inversion: depends on IOHandler interface)
 */
class CLIIOHandler {
    constructor() {
        this.rl = null;
    }
    async readInput() {
        return new Promise((resolve) => {
            this.rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
            });
            this.rl.question('> ', (answer) => {
                this.rl?.close();
                this.rl = null;
                resolve(answer);
            });
        });
    }
    writeOutput(data, format) {
        if (format === 'json') {
            console.log(JSON.stringify(data, null, 2));
        }
        else {
            if (typeof data === 'string') {
                console.log(data);
            }
            else if (data && typeof data === 'object') {
                console.log(JSON.stringify(data, null, 2));
            }
            else {
                console.log(data);
            }
        }
    }
    writeError(error) {
        const message = error instanceof Error ? error.message : error;
        console.error(`❌ ${message}`);
    }
}
exports.CLIIOHandler = CLIIOHandler;
/**
 * Mock IO handler for testing
 */
class MockIOHandler {
    constructor() {
        this.inputQueue = [];
        this.outputs = [];
        this.errors = [];
    }
    enqueueInput(input) {
        this.inputQueue.push(input);
    }
    async readInput() {
        return this.inputQueue.shift() || '';
    }
    writeOutput(data, format) {
        const output = format === 'json' ? JSON.stringify(data, null, 2) : String(data);
        this.outputs.push(output);
    }
    writeError(error) {
        const message = error instanceof Error ? error.message : error;
        this.errors.push(message);
    }
}
exports.MockIOHandler = MockIOHandler;
//# sourceMappingURL=ioHandler.js.map