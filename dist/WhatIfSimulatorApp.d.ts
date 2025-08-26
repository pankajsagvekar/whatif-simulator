import { WhatIfSimulator, SimulatorConfig } from './services/WhatIfSimulator';
import { WhatIfAPI } from './api/WhatIfAPI';
import { WhatIfCLI } from './cli/WhatIfCLI';
import { WhatIfWebHandler } from './web/WhatIfWebHandler';
import { AIService } from './services/SeriousOutcomeGenerator';
/**
 * Environment configuration options
 */
export interface EnvironmentConfig {
    NODE_ENV?: 'development' | 'production' | 'test';
    LOG_LEVEL?: 'debug' | 'info' | 'warn' | 'error';
    AI_SERVICE_TIMEOUT?: number;
    MAX_CONCURRENT_REQUESTS?: number;
    ENABLE_METRICS?: boolean;
    ENABLE_CACHING?: boolean;
}
/**
 * Application configuration combining simulator and environment settings
 */
export interface AppConfig extends SimulatorConfig {
    environment: EnvironmentConfig;
    aiService: {
        timeout: number;
        retryAttempts: number;
        rateLimitPerMinute: number;
    };
    server?: {
        port?: number;
        host?: string;
        enableCors?: boolean;
    };
}
/**
 * Default application configuration
 */
export declare const DEFAULT_APP_CONFIG: AppConfig;
/**
 * Application logger with different levels
 */
export declare class AppLogger {
    private logLevel;
    private enableLogging;
    constructor(logLevel?: string, enableLogging?: boolean);
    private shouldLog;
    private formatMessage;
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(message: string, error?: Error, ...args: any[]): void;
}
/**
 * Main application class that integrates and wires all components together
 * Implements comprehensive logging, error reporting, and configuration management
 * Requirements: 1.1, 2.1, 3.1, 4.1, 5.1
 */
export declare class WhatIfSimulatorApp {
    private config;
    private logger;
    private simulator?;
    private api?;
    private cli?;
    private webHandler?;
    private aiService?;
    private isInitialized;
    constructor(config?: Partial<AppConfig>);
    /**
     * Initializes the application with dependency injection
     * Connects all services and ensures proper configuration
     */
    initialize(aiService: AIService): Promise<void>;
    /**
     * Gets the core simulator instance
     */
    getSimulator(): WhatIfSimulator;
    /**
     * Gets the API interface
     */
    getAPI(): WhatIfAPI;
    /**
     * Gets the CLI interface
     */
    getCLI(): WhatIfCLI;
    /**
     * Gets the web handler
     */
    getWebHandler(): WhatIfWebHandler;
    /**
     * Starts the CLI interface
     */
    startCLI(): Promise<void>;
    /**
     * Processes a scenario using the core simulator
     */
    processScenario(scenario: string): Promise<any>;
    /**
     * Updates application configuration
     */
    updateConfig(newConfig: Partial<AppConfig>): void;
    /**
     * Gets current application configuration
     */
    getConfig(): AppConfig;
    /**
     * Gets application health status
     */
    getHealthStatus(): {
        status: 'healthy' | 'unhealthy';
        initialized: boolean;
        components: {
            simulator: boolean;
            api: boolean;
            cli: boolean;
            webHandler: boolean;
            aiService: boolean;
        };
        config: {
            environment: string;
            logLevel: string;
            enableMetrics: boolean;
        };
        timestamp: string;
    };
    /**
     * Performs comprehensive integration testing
     */
    runIntegrationTest(): Promise<{
        success: boolean;
        results: {
            simulator: boolean;
            api: boolean;
            webHandler: boolean;
        };
        errors: string[];
    }>;
    /**
     * Gracefully shuts down the application
     */
    shutdown(): Promise<void>;
    /**
     * Sets up global error handling
     */
    private setupErrorHandling;
    /**
     * Ensures the application is initialized before operations
     */
    private ensureInitialized;
    /**
     * Deep merges configuration objects
     */
    private mergeConfig;
}
/**
 * Factory function to create and initialize the application
 */
export declare function createWhatIfSimulatorApp(aiService: AIService, config?: Partial<AppConfig>): Promise<WhatIfSimulatorApp>;
/**
 * Utility function to create app with environment-based configuration
 */
export declare function createAppConfigFromEnvironment(): Partial<AppConfig>;
//# sourceMappingURL=WhatIfSimulatorApp.d.ts.map