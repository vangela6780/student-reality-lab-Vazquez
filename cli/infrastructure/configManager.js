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
exports.EnvConfigManager = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const dotenv_1 = require("dotenv");
const errorHandler_1 = require("./errorHandler");
/**
 * Concrete config manager implementation
 * Loads from .env files and provides key-value access
 * (D - Dependency Inversion: depends on ConfigManager interface)
 */
class EnvConfigManager {
    constructor() {
        this.defaultPaths = [
            path.join(process.cwd(), '.env'),
            path.join(process.cwd(), '.env.local'),
        ];
        this.config = new Map();
    }
    async load(filePath) {
        const pathsToTry = filePath ? [filePath] : this.defaultPaths;
        for (const envPath of pathsToTry) {
            if (fs.existsSync(envPath)) {
                try {
                    const envConfig = (0, dotenv_1.config)({ path: envPath });
                    if (envConfig.parsed) {
                        Object.entries(envConfig.parsed || {}).forEach(([key, value]) => {
                            this.config.set(key, String(value));
                        });
                    }
                    return;
                }
                catch (error) {
                    throw new errorHandler_1.ConfigError(`Failed to load config from ${envPath}`, String(error));
                }
            }
        }
        // Also load from environment variables
        Object.entries(process.env).forEach(([key, value]) => {
            if (value) {
                this.config.set(key, value);
            }
        });
    }
    get(key) {
        return this.config.get(key);
    }
    set(key, value) {
        this.config.set(key, value);
    }
    getAll() {
        const result = {};
        this.config.forEach((value, key) => {
            result[key] = value;
        });
        return result;
    }
}
exports.EnvConfigManager = EnvConfigManager;
//# sourceMappingURL=configManager.js.map