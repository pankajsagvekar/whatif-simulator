"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONFIG_PROFILES = void 0;
exports.getConfigForEnvironment = getConfigForEnvironment;
exports.validateConfig = validateConfig;
exports.getConfigSummary = getConfigSummary;
const WhatIfSimulatorApp_1 = require("./WhatIfSimulatorApp");
/**
 * Configuration profiles for different environments
 */
exports.CONFIG_PROFILES = {
    development: {
        ...WhatIfSimulatorApp_1.DEFAULT_APP_CONFIG,
        environment: {
            NODE_ENV: 'development',
            LOG_LEVEL: 'debug',
            AI_SERVICE_TIMEOUT: 30000,
            MAX_CONCURRENT_REQUESTS: 5,
            ENABLE_METRICS: true,
            ENABLE_CACHING: false
        },
        enableLogging: true,
        enableMetrics: true,
        maxProcessingTime: 30000,
        enableParallelGeneration: true
    },
    production: {
        ...WhatIfSimulatorApp_1.DEFAULT_APP_CONFIG,
        environment: {
            NODE_ENV: 'production',
            LOG_LEVEL: 'warn',
            AI_SERVICE_TIMEOUT: 20000,
            MAX_CONCURRENT_REQUESTS: 20,
            ENABLE_METRICS: true,
            ENABLE_CACHING: true
        },
        enableLogging: true,
        enableMetrics: true,
        maxProcessingTime: 20000,
        enableParallelGeneration: true
    },
    test: {
        ...WhatIfSimulatorApp_1.DEFAULT_APP_CONFIG,
        environment: {
            NODE_ENV: 'test',
            LOG_LEVEL: 'error',
            AI_SERVICE_TIMEOUT: 10000,
            MAX_CONCURRENT_REQUESTS: 3,
            ENABLE_METRICS: false,
            ENABLE_CACHING: false
        },
        enableLogging: false,
        enableMetrics: false,
        maxProcessingTime: 10000,
        enableParallelGeneration: false
    }
};
/**
 * Gets configuration for the specified environment
 */
function getConfigForEnvironment(env) {
    const environment = env || process.env.NODE_ENV || 'development';
    let baseConfig;
    switch (environment) {
        case 'production':
            baseConfig = exports.CONFIG_PROFILES.production;
            break;
        case 'test':
            baseConfig = exports.CONFIG_PROFILES.test;
            break;
        case 'development':
        default:
            baseConfig = exports.CONFIG_PROFILES.development;
            break;
    }
    // Override with environment variables
    const envConfig = (0, WhatIfSimulatorApp_1.createAppConfigFromEnvironment)();
    return mergeConfigs(baseConfig, envConfig);
}
/**
 * Validates configuration for required settings
 */
function validateConfig(config) {
    const errors = [];
    // Validate timeouts
    if (config.maxProcessingTime && config.maxProcessingTime < 1000) {
        errors.push('maxProcessingTime must be at least 1000ms');
    }
    if (config.aiService.timeout < 1000) {
        errors.push('AI service timeout must be at least 1000ms');
    }
    // Validate retry attempts
    if (config.aiService.retryAttempts < 1 || config.aiService.retryAttempts > 10) {
        errors.push('AI service retry attempts must be between 1 and 10');
    }
    // Validate rate limits
    if (config.aiService.rateLimitPerMinute < 1) {
        errors.push('AI service rate limit must be at least 1 per minute');
    }
    // Validate server config if present
    if (config.server && config.server.port !== undefined) {
        if (config.server.port < 1 || config.server.port > 65535) {
            errors.push('Server port must be between 1 and 65535');
        }
    }
    return {
        valid: errors.length === 0,
        errors
    };
}
/**
 * Deep merges two configuration objects
 */
function mergeConfigs(base, override) {
    const merged = { ...base };
    Object.keys(override).forEach(key => {
        const value = override[key];
        if (value !== undefined) {
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                merged[key] = { ...merged[key], ...value };
            }
            else {
                merged[key] = value;
            }
        }
    });
    return merged;
}
/**
 * Creates a configuration summary for logging
 */
function getConfigSummary(config) {
    return {
        environment: config.environment.NODE_ENV,
        logLevel: config.environment.LOG_LEVEL,
        enableLogging: config.enableLogging,
        enableMetrics: config.enableMetrics,
        maxProcessingTime: config.maxProcessingTime,
        enableParallelGeneration: config.enableParallelGeneration,
        aiServiceTimeout: config.aiService.timeout,
        aiServiceRetries: config.aiService.retryAttempts,
        serverPort: config.server?.port,
        serverHost: config.server?.host
    };
}
//# sourceMappingURL=config.js.map