"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatIfSimulatorApp = exports.AppLogger = exports.DEFAULT_APP_CONFIG = void 0;
exports.createWhatIfSimulatorApp = createWhatIfSimulatorApp;
exports.createAppConfigFromEnvironment = createAppConfigFromEnvironment;
const WhatIfSimulator_1 = require("./services/WhatIfSimulator");
const WhatIfAPI_1 = require("./api/WhatIfAPI");
const WhatIfCLI_1 = require("./cli/WhatIfCLI");
const WhatIfWebHandler_1 = require("./web/WhatIfWebHandler");
const ErrorHandler_1 = require("./utils/ErrorHandler");
/**
 * Default application configuration
 */
exports.DEFAULT_APP_CONFIG = {
    ...WhatIfSimulator_1.DEFAULT_SIMULATOR_CONFIG,
    environment: {
        NODE_ENV: 'development',
        LOG_LEVEL: 'info',
        AI_SERVICE_TIMEOUT: 30000,
        MAX_CONCURRENT_REQUESTS: 10,
        ENABLE_METRICS: true,
        ENABLE_CACHING: false
    },
    aiService: {
        timeout: 30000,
        retryAttempts: 3,
        rateLimitPerMinute: 60
    },
    server: {
        port: 3000,
        host: 'localhost',
        enableCors: true
    }
};
/**
 * Application logger with different levels
 */
class AppLogger {
    constructor(logLevel = 'info', enableLogging = true) {
        this.logLevel = logLevel;
        this.enableLogging = enableLogging;
    }
    shouldLog(level) {
        if (!this.enableLogging)
            return false;
        const levels = ['debug', 'info', 'warn', 'error'];
        const currentLevelIndex = levels.indexOf(this.logLevel);
        const messageLevelIndex = levels.indexOf(level);
        return messageLevelIndex >= currentLevelIndex;
    }
    formatMessage(level, message, ...args) {
        const timestamp = new Date().toISOString();
        const formattedArgs = args.length > 0 ? ' ' + args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ') : '';
        return `[${timestamp}] [${level.toUpperCase()}] WhatIfApp: ${message}${formattedArgs}`;
    }
    debug(message, ...args) {
        if (this.shouldLog('debug')) {
            console.log(this.formatMessage('debug', message, ...args));
        }
    }
    info(message, ...args) {
        if (this.shouldLog('info')) {
            console.log(this.formatMessage('info', message, ...args));
        }
    }
    warn(message, ...args) {
        if (this.shouldLog('warn')) {
            console.warn(this.formatMessage('warn', message, ...args));
        }
    }
    error(message, error, ...args) {
        if (this.shouldLog('error')) {
            const errorInfo = error ? ` Error: ${error.message}` : '';
            console.error(this.formatMessage('error', message + errorInfo, ...args));
            if (error && error.stack) {
                console.error('Stack trace:', error.stack);
            }
        }
    }
}
exports.AppLogger = AppLogger;
/**
 * Main application class that integrates and wires all components together
 * Implements comprehensive logging, error reporting, and configuration management
 * Requirements: 1.1, 2.1, 3.1, 4.1, 5.1
 */
class WhatIfSimulatorApp {
    constructor(config = {}) {
        this.isInitialized = false;
        // Merge with default configuration
        this.config = this.mergeConfig(exports.DEFAULT_APP_CONFIG, config);
        // Initialize logger
        this.logger = new AppLogger(this.config.environment.LOG_LEVEL, this.config.enableLogging);
        this.logger.info('WhatIfSimulatorApp created with configuration:', {
            environment: this.config.environment.NODE_ENV,
            logLevel: this.config.environment.LOG_LEVEL,
            enableMetrics: this.config.enableMetrics,
            enableParallelGeneration: this.config.enableParallelGeneration
        });
    }
    /**
     * Initializes the application with dependency injection
     * Connects all services and ensures proper configuration
     */
    async initialize(aiService) {
        try {
            this.logger.info('Initializing WhatIfSimulatorApp...');
            // Store AI service reference
            this.aiService = aiService;
            // Initialize core simulator with configuration
            this.simulator = new WhatIfSimulator_1.WhatIfSimulator(aiService, {
                enableLogging: this.config.enableLogging,
                enableMetrics: this.config.enableMetrics,
                maxProcessingTime: this.config.maxProcessingTime,
                enableParallelGeneration: this.config.enableParallelGeneration
            });
            // Initialize API layer
            this.api = new WhatIfAPI_1.WhatIfAPI(aiService, {
                enableLogging: this.config.enableLogging,
                enableMetrics: this.config.enableMetrics,
                maxProcessingTime: this.config.maxProcessingTime,
                enableParallelGeneration: this.config.enableParallelGeneration
            });
            // Initialize CLI interface
            this.cli = new WhatIfCLI_1.WhatIfCLI(aiService);
            // Initialize web handler
            this.webHandler = new WhatIfWebHandler_1.WhatIfWebHandler(aiService, {
                enableLogging: this.config.enableLogging,
                enableMetrics: this.config.enableMetrics,
                maxProcessingTime: this.config.maxProcessingTime,
                enableParallelGeneration: this.config.enableParallelGeneration
            });
            this.isInitialized = true;
            this.logger.info('WhatIfSimulatorApp initialized successfully');
            // Set up error handling
            this.setupErrorHandling();
        }
        catch (error) {
            this.logger.error('Failed to initialize WhatIfSimulatorApp', error);
            throw new ErrorHandler_1.WhatIfSimulatorError('Application initialization failed', ErrorHandler_1.ErrorType.PROCESSING, error, false);
        }
    }
    /**
     * Gets the core simulator instance
     */
    getSimulator() {
        this.ensureInitialized();
        return this.simulator;
    }
    /**
     * Gets the API interface
     */
    getAPI() {
        this.ensureInitialized();
        return this.api;
    }
    /**
     * Gets the CLI interface
     */
    getCLI() {
        this.ensureInitialized();
        return this.cli;
    }
    /**
     * Gets the web handler
     */
    getWebHandler() {
        this.ensureInitialized();
        return this.webHandler;
    }
    /**
     * Starts the CLI interface
     */
    async startCLI() {
        this.ensureInitialized();
        this.logger.info('Starting CLI interface...');
        try {
            await this.cli.start();
        }
        catch (error) {
            this.logger.error('CLI interface error', error);
            throw error;
        }
    }
    /**
     * Processes a scenario using the core simulator
     */
    async processScenario(scenario) {
        this.ensureInitialized();
        this.logger.debug('Processing scenario:', scenario.substring(0, 100) + '...');
        try {
            const result = await this.simulator.processScenario(scenario);
            if (result.success) {
                this.logger.info('Scenario processed successfully', {
                    processingTime: result.metrics?.totalProcessingTime,
                    scenarioType: result.formattedOutput?.metadata.scenarioType
                });
            }
            else {
                this.logger.warn('Scenario processing failed:', result.error);
            }
            return result;
        }
        catch (error) {
            this.logger.error('Unexpected error during scenario processing', error);
            throw error;
        }
    }
    /**
     * Updates application configuration
     */
    updateConfig(newConfig) {
        this.logger.info('Updating application configuration');
        const oldConfig = { ...this.config };
        this.config = this.mergeConfig(this.config, newConfig);
        // Update logger if log level changed
        if (oldConfig.environment.LOG_LEVEL !== this.config.environment.LOG_LEVEL) {
            this.logger = new AppLogger(this.config.environment.LOG_LEVEL, this.config.enableLogging);
        }
        // Update component configurations if initialized
        if (this.isInitialized) {
            const simulatorConfig = {
                enableLogging: this.config.enableLogging,
                enableMetrics: this.config.enableMetrics,
                maxProcessingTime: this.config.maxProcessingTime,
                enableParallelGeneration: this.config.enableParallelGeneration
            };
            this.simulator?.updateConfig(simulatorConfig);
            this.api?.updateConfig(simulatorConfig);
        }
        this.logger.info('Configuration updated successfully');
    }
    /**
     * Gets current application configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Gets application health status
     */
    getHealthStatus() {
        return {
            status: this.isInitialized ? 'healthy' : 'unhealthy',
            initialized: this.isInitialized,
            components: {
                simulator: !!this.simulator,
                api: !!this.api,
                cli: !!this.cli,
                webHandler: !!this.webHandler,
                aiService: !!this.aiService
            },
            config: {
                environment: this.config.environment.NODE_ENV || 'unknown',
                logLevel: this.config.environment.LOG_LEVEL || 'info',
                enableMetrics: this.config.enableMetrics || false
            },
            timestamp: new Date().toISOString()
        };
    }
    /**
     * Performs comprehensive integration testing
     */
    async runIntegrationTest() {
        this.logger.info('Running integration tests...');
        const results = {
            simulator: false,
            api: false,
            webHandler: false
        };
        const errors = [];
        // Test simulator
        try {
            const testResult = await this.simulator.processScenario('What if this is a test?');
            results.simulator = testResult.success;
            if (!testResult.success) {
                errors.push(`Simulator test failed: ${testResult.error}`);
            }
        }
        catch (error) {
            errors.push(`Simulator test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        // Test API
        try {
            const apiResult = await this.api.processScenario({
                scenario: 'What if this is an API test?'
            });
            results.api = apiResult.success;
            if (!apiResult.success) {
                errors.push(`API test failed: ${apiResult.error}`);
            }
        }
        catch (error) {
            errors.push(`API test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        // Test web handler
        try {
            const webResult = await this.webHandler.handleRequest({
                method: 'POST',
                path: '/process',
                body: { scenario: 'What if this is a web test?' }
            });
            results.webHandler = webResult.statusCode === 200;
            if (webResult.statusCode !== 200) {
                errors.push(`Web handler test failed: Status ${webResult.statusCode}`);
            }
        }
        catch (error) {
            errors.push(`Web handler test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        const success = results.simulator && results.api && results.webHandler;
        this.logger.info('Integration tests completed', {
            success,
            results,
            errorCount: errors.length
        });
        if (errors.length > 0) {
            this.logger.warn('Integration test errors:', errors);
        }
        return { success, results, errors };
    }
    /**
     * Gracefully shuts down the application
     */
    async shutdown() {
        this.logger.info('Shutting down WhatIfSimulatorApp...');
        try {
            // Close CLI if active
            if (this.cli) {
                this.cli.close();
            }
            this.isInitialized = false;
            this.logger.info('WhatIfSimulatorApp shut down successfully');
        }
        catch (error) {
            this.logger.error('Error during shutdown', error);
            throw error;
        }
    }
    /**
     * Sets up global error handling
     */
    setupErrorHandling() {
        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            this.logger.error('Uncaught exception', error);
            // In production, you might want to gracefully shut down
            if (this.config.environment.NODE_ENV === 'production') {
                this.shutdown().finally(() => process.exit(1));
            }
        });
        // Handle unhandled promise rejections
        process.on('unhandledRejection', (reason, promise) => {
            this.logger.error('Unhandled promise rejection', reason);
            // In production, you might want to gracefully shut down
            if (this.config.environment.NODE_ENV === 'production') {
                this.shutdown().finally(() => process.exit(1));
            }
        });
    }
    /**
     * Ensures the application is initialized before operations
     */
    ensureInitialized() {
        if (!this.isInitialized) {
            throw new ErrorHandler_1.WhatIfSimulatorError('Application not initialized. Call initialize() first.', ErrorHandler_1.ErrorType.PROCESSING, undefined, false);
        }
    }
    /**
     * Deep merges configuration objects
     */
    mergeConfig(base, override) {
        const merged = { ...base };
        // Merge top-level properties
        Object.keys(override).forEach(key => {
            const value = override[key];
            if (value !== undefined) {
                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    // Deep merge objects
                    merged[key] = { ...merged[key], ...value };
                }
                else {
                    // Direct assignment for primitives and arrays
                    merged[key] = value;
                }
            }
        });
        return merged;
    }
}
exports.WhatIfSimulatorApp = WhatIfSimulatorApp;
/**
 * Factory function to create and initialize the application
 */
async function createWhatIfSimulatorApp(aiService, config = {}) {
    const app = new WhatIfSimulatorApp(config);
    await app.initialize(aiService);
    return app;
}
/**
 * Utility function to create app with environment-based configuration
 */
function createAppConfigFromEnvironment() {
    return {
        environment: {
            NODE_ENV: process.env.NODE_ENV || 'development',
            LOG_LEVEL: process.env.LOG_LEVEL || 'info',
            AI_SERVICE_TIMEOUT: process.env.AI_SERVICE_TIMEOUT ?
                parseInt(process.env.AI_SERVICE_TIMEOUT) : undefined,
            MAX_CONCURRENT_REQUESTS: process.env.MAX_CONCURRENT_REQUESTS ?
                parseInt(process.env.MAX_CONCURRENT_REQUESTS) : undefined,
            ENABLE_METRICS: process.env.ENABLE_METRICS === 'true',
            ENABLE_CACHING: process.env.ENABLE_CACHING === 'true'
        },
        enableLogging: process.env.ENABLE_LOGGING !== 'false',
        maxProcessingTime: process.env.MAX_PROCESSING_TIME ?
            parseInt(process.env.MAX_PROCESSING_TIME) : undefined,
        enableParallelGeneration: process.env.ENABLE_PARALLEL_GENERATION !== 'false',
        ...(process.env.PORT || process.env.HOST ? {
            server: {
                ...(process.env.PORT ? { port: parseInt(process.env.PORT) } : {}),
                ...(process.env.HOST ? { host: process.env.HOST } : {}),
                enableCors: process.env.ENABLE_CORS !== 'false'
            }
        } : {})
    };
}
//# sourceMappingURL=WhatIfSimulatorApp.js.map