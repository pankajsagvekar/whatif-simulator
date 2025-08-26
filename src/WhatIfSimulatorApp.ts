import { WhatIfSimulator, SimulatorConfig, DEFAULT_SIMULATOR_CONFIG } from './services/WhatIfSimulator';
import { WhatIfAPI } from './api/WhatIfAPI';
import { WhatIfCLI } from './cli/WhatIfCLI';
import { WhatIfWebHandler } from './web/WhatIfWebHandler';
import { AIService } from './services/SeriousOutcomeGenerator';
import { ErrorHandler, WhatIfSimulatorError, ErrorType } from './utils/ErrorHandler';

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
export const DEFAULT_APP_CONFIG: AppConfig = {
  ...DEFAULT_SIMULATOR_CONFIG,
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
export class AppLogger {
  private logLevel: string;
  private enableLogging: boolean;

  constructor(logLevel: string = 'info', enableLogging: boolean = true) {
    this.logLevel = logLevel;
    this.enableLogging = enableLogging;
  }

  private shouldLog(level: string): boolean {
    if (!this.enableLogging) return false;
    
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex >= currentLevelIndex;
  }

  private formatMessage(level: string, message: string, ...args: any[]): string {
    const timestamp = new Date().toISOString();
    const formattedArgs = args.length > 0 ? ' ' + args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ') : '';
    
    return `[${timestamp}] [${level.toUpperCase()}] WhatIfApp: ${message}${formattedArgs}`;
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage('debug', message, ...args));
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.log(this.formatMessage('info', message, ...args));
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, ...args));
    }
  }

  error(message: string, error?: Error, ...args: any[]): void {
    if (this.shouldLog('error')) {
      const errorInfo = error ? ` Error: ${error.message}` : '';
      console.error(this.formatMessage('error', message + errorInfo, ...args));
      if (error && error.stack) {
        console.error('Stack trace:', error.stack);
      }
    }
  }
}

/**
 * Main application class that integrates and wires all components together
 * Implements comprehensive logging, error reporting, and configuration management
 * Requirements: 1.1, 2.1, 3.1, 4.1, 5.1
 */
export class WhatIfSimulatorApp {
  private config: AppConfig;
  private logger: AppLogger;
  private simulator?: WhatIfSimulator;
  private api?: WhatIfAPI;
  private cli?: WhatIfCLI;
  private webHandler?: WhatIfWebHandler;
  private aiService?: AIService;
  private isInitialized: boolean = false;

  constructor(config: Partial<AppConfig> = {}) {
    // Merge with default configuration
    this.config = this.mergeConfig(DEFAULT_APP_CONFIG, config);
    
    // Initialize logger
    this.logger = new AppLogger(
      this.config.environment.LOG_LEVEL,
      this.config.enableLogging
    );

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
  async initialize(aiService: AIService): Promise<void> {
    try {
      this.logger.info('Initializing WhatIfSimulatorApp...');

      // Store AI service reference
      this.aiService = aiService;

      // Initialize core simulator with configuration
      this.simulator = new WhatIfSimulator(aiService, {
        enableLogging: this.config.enableLogging,
        enableMetrics: this.config.enableMetrics,
        maxProcessingTime: this.config.maxProcessingTime,
        enableParallelGeneration: this.config.enableParallelGeneration
      });

      // Initialize API layer
      this.api = new WhatIfAPI(aiService, {
        enableLogging: this.config.enableLogging,
        enableMetrics: this.config.enableMetrics,
        maxProcessingTime: this.config.maxProcessingTime,
        enableParallelGeneration: this.config.enableParallelGeneration
      });

      // Initialize CLI interface
      this.cli = new WhatIfCLI(aiService);

      // Initialize web handler
      this.webHandler = new WhatIfWebHandler(aiService, {
        enableLogging: this.config.enableLogging,
        enableMetrics: this.config.enableMetrics,
        maxProcessingTime: this.config.maxProcessingTime,
        enableParallelGeneration: this.config.enableParallelGeneration
      });

      this.isInitialized = true;
      this.logger.info('WhatIfSimulatorApp initialized successfully');

      // Set up error handling
      this.setupErrorHandling();

    } catch (error) {
      this.logger.error('Failed to initialize WhatIfSimulatorApp', error as Error);
      throw new WhatIfSimulatorError(
        'Application initialization failed',
        ErrorType.PROCESSING,
        error as Error,
        false
      );
    }
  }

  /**
   * Gets the core simulator instance
   */
  getSimulator(): WhatIfSimulator {
    this.ensureInitialized();
    return this.simulator!;
  }

  /**
   * Gets the API interface
   */
  getAPI(): WhatIfAPI {
    this.ensureInitialized();
    return this.api!;
  }

  /**
   * Gets the CLI interface
   */
  getCLI(): WhatIfCLI {
    this.ensureInitialized();
    return this.cli!;
  }

  /**
   * Gets the web handler
   */
  getWebHandler(): WhatIfWebHandler {
    this.ensureInitialized();
    return this.webHandler!;
  }

  /**
   * Starts the CLI interface
   */
  async startCLI(): Promise<void> {
    this.ensureInitialized();
    this.logger.info('Starting CLI interface...');
    
    try {
      await this.cli!.start();
    } catch (error) {
      this.logger.error('CLI interface error', error as Error);
      throw error;
    }
  }

  /**
   * Processes a scenario using the core simulator
   */
  async processScenario(scenario: string): Promise<any> {
    this.ensureInitialized();
    this.logger.debug('Processing scenario:', scenario.substring(0, 100) + '...');
    
    try {
      const result = await this.simulator!.processScenario(scenario);
      
      if (result.success) {
        this.logger.info('Scenario processed successfully', {
          processingTime: result.metrics?.totalProcessingTime,
          scenarioType: result.formattedOutput?.metadata.scenarioType
        });
      } else {
        this.logger.warn('Scenario processing failed:', result.error);
      }
      
      return result;
    } catch (error) {
      this.logger.error('Unexpected error during scenario processing', error as Error);
      throw error;
    }
  }

  /**
   * Updates application configuration
   */
  updateConfig(newConfig: Partial<AppConfig>): void {
    this.logger.info('Updating application configuration');
    
    const oldConfig = { ...this.config };
    this.config = this.mergeConfig(this.config, newConfig);
    
    // Update logger if log level changed
    if (oldConfig.environment.LOG_LEVEL !== this.config.environment.LOG_LEVEL) {
      this.logger = new AppLogger(
        this.config.environment.LOG_LEVEL,
        this.config.enableLogging
      );
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
  getConfig(): AppConfig {
    return { ...this.config };
  }

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
  } {
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
  async runIntegrationTest(): Promise<{
    success: boolean;
    results: {
      simulator: boolean;
      api: boolean;
      webHandler: boolean;
    };
    errors: string[];
  }> {
    this.logger.info('Running integration tests...');
    
    const results = {
      simulator: false,
      api: false,
      webHandler: false
    };
    const errors: string[] = [];

    // Test simulator
    try {
      const testResult = await this.simulator!.processScenario('What if this is a test?');
      results.simulator = testResult.success;
      if (!testResult.success) {
        errors.push(`Simulator test failed: ${testResult.error}`);
      }
    } catch (error) {
      errors.push(`Simulator test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test API
    try {
      const apiResult = await this.api!.processScenario({
        scenario: 'What if this is an API test?'
      });
      results.api = apiResult.success;
      if (!apiResult.success) {
        errors.push(`API test failed: ${apiResult.error}`);
      }
    } catch (error) {
      errors.push(`API test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test web handler
    try {
      const webResult = await this.webHandler!.handleRequest({
        method: 'POST',
        path: '/process',
        body: { scenario: 'What if this is a web test?' }
      });
      results.webHandler = webResult.statusCode === 200;
      if (webResult.statusCode !== 200) {
        errors.push(`Web handler test failed: Status ${webResult.statusCode}`);
      }
    } catch (error) {
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
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down WhatIfSimulatorApp...');
    
    try {
      // Close CLI if active
      if (this.cli) {
        this.cli.close();
      }
      
      this.isInitialized = false;
      this.logger.info('WhatIfSimulatorApp shut down successfully');
    } catch (error) {
      this.logger.error('Error during shutdown', error as Error);
      throw error;
    }
  }

  /**
   * Sets up global error handling
   */
  private setupErrorHandling(): void {
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
      this.logger.error('Unhandled promise rejection', reason as Error);
      // In production, you might want to gracefully shut down
      if (this.config.environment.NODE_ENV === 'production') {
        this.shutdown().finally(() => process.exit(1));
      }
    });
  }

  /**
   * Ensures the application is initialized before operations
   */
  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new WhatIfSimulatorError(
        'Application not initialized. Call initialize() first.',
        ErrorType.PROCESSING,
        undefined,
        false
      );
    }
  }

  /**
   * Deep merges configuration objects
   */
  private mergeConfig(base: AppConfig, override: Partial<AppConfig>): AppConfig {
    const merged = { ...base };
    
    // Merge top-level properties
    Object.keys(override).forEach(key => {
      const value = (override as any)[key];
      if (value !== undefined) {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          // Deep merge objects
          (merged as any)[key] = { ...(merged as any)[key], ...value };
        } else {
          // Direct assignment for primitives and arrays
          (merged as any)[key] = value;
        }
      }
    });
    
    return merged;
  }
}

/**
 * Factory function to create and initialize the application
 */
export async function createWhatIfSimulatorApp(
  aiService: AIService,
  config: Partial<AppConfig> = {}
): Promise<WhatIfSimulatorApp> {
  const app = new WhatIfSimulatorApp(config);
  await app.initialize(aiService);
  return app;
}

/**
 * Utility function to create app with environment-based configuration
 */
export function createAppConfigFromEnvironment(): Partial<AppConfig> {
  return {
    environment: {
      NODE_ENV: (process.env.NODE_ENV as any) || 'development',
      LOG_LEVEL: (process.env.LOG_LEVEL as any) || 'info',
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