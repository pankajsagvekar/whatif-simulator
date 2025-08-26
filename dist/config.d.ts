import { AppConfig } from './WhatIfSimulatorApp';
/**
 * Configuration profiles for different environments
 */
export declare const CONFIG_PROFILES: {
    readonly development: {
        readonly environment: {
            readonly NODE_ENV: "development";
            readonly LOG_LEVEL: "debug";
            readonly AI_SERVICE_TIMEOUT: 30000;
            readonly MAX_CONCURRENT_REQUESTS: 5;
            readonly ENABLE_METRICS: true;
            readonly ENABLE_CACHING: false;
        };
        readonly enableLogging: true;
        readonly enableMetrics: true;
        readonly maxProcessingTime: 30000;
        readonly enableParallelGeneration: true;
        readonly aiService: {
            timeout: number;
            retryAttempts: number;
            rateLimitPerMinute: number;
        };
        readonly server?: {
            port?: number;
            host?: string;
            enableCors?: boolean;
        };
    };
    readonly production: {
        readonly environment: {
            readonly NODE_ENV: "production";
            readonly LOG_LEVEL: "warn";
            readonly AI_SERVICE_TIMEOUT: 20000;
            readonly MAX_CONCURRENT_REQUESTS: 20;
            readonly ENABLE_METRICS: true;
            readonly ENABLE_CACHING: true;
        };
        readonly enableLogging: true;
        readonly enableMetrics: true;
        readonly maxProcessingTime: 20000;
        readonly enableParallelGeneration: true;
        readonly aiService: {
            timeout: number;
            retryAttempts: number;
            rateLimitPerMinute: number;
        };
        readonly server?: {
            port?: number;
            host?: string;
            enableCors?: boolean;
        };
    };
    readonly test: {
        readonly environment: {
            readonly NODE_ENV: "test";
            readonly LOG_LEVEL: "error";
            readonly AI_SERVICE_TIMEOUT: 10000;
            readonly MAX_CONCURRENT_REQUESTS: 3;
            readonly ENABLE_METRICS: false;
            readonly ENABLE_CACHING: false;
        };
        readonly enableLogging: false;
        readonly enableMetrics: false;
        readonly maxProcessingTime: 10000;
        readonly enableParallelGeneration: false;
        readonly aiService: {
            timeout: number;
            retryAttempts: number;
            rateLimitPerMinute: number;
        };
        readonly server?: {
            port?: number;
            host?: string;
            enableCors?: boolean;
        };
    };
};
/**
 * Gets configuration for the specified environment
 */
export declare function getConfigForEnvironment(env?: string): AppConfig;
/**
 * Validates configuration for required settings
 */
export declare function validateConfig(config: AppConfig): {
    valid: boolean;
    errors: string[];
};
/**
 * Creates a configuration summary for logging
 */
export declare function getConfigSummary(config: AppConfig): Record<string, any>;
//# sourceMappingURL=config.d.ts.map