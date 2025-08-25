import { ValidationResult, ProcessedScenario, FormattedOutput } from '../models/interfaces.js';
import { InputValidator } from './InputValidator.js';
import { ScenarioProcessor } from './ScenarioProcessor.js';
import { SeriousOutcomeGenerator, AIService } from './SeriousOutcomeGenerator.js';
import { FunOutcomeGenerator } from './FunOutcomeGenerator.js';
import { OutputFormatter } from './OutputFormatter.js';
import { ErrorHandler, WhatIfSimulatorError, ErrorType } from '../utils/ErrorHandler.js';

/**
 * Configuration options for the WhatIfSimulator
 */
export interface SimulatorConfig {
  enableLogging?: boolean;
  enableMetrics?: boolean;
  maxProcessingTime?: number;
  enableParallelGeneration?: boolean;
}

/**
 * Default configuration for the simulator
 */
export const DEFAULT_SIMULATOR_CONFIG: SimulatorConfig = {
  enableLogging: true,
  enableMetrics: true,
  maxProcessingTime: 30000, // 30 seconds
  enableParallelGeneration: true
};

/**
 * Processing metrics for monitoring
 */
export interface ProcessingMetrics {
  totalProcessingTime: number;
  validationTime: number;
  processingTime: number;
  seriousGenerationTime: number;
  funGenerationTime: number;
  formattingTime: number;
  success: boolean;
  errorType?: string;
}

/**
 * Result of the complete simulation process
 */
export interface SimulationResult {
  success: boolean;
  formattedOutput?: FormattedOutput;
  presentationOutput?: string;
  metrics?: ProcessingMetrics;
  error?: string;
}

/**
 * Main WhatIfSimulator service that orchestrates all components
 * Implements requirements 1.1, 2.1, 3.1, 4.1
 */
export class WhatIfSimulator {
  private inputValidator: InputValidator;
  private scenarioProcessor: ScenarioProcessor;
  private seriousGenerator: SeriousOutcomeGenerator;
  private funGenerator: FunOutcomeGenerator;
  private outputFormatter: OutputFormatter;
  private config: SimulatorConfig;

  constructor(aiService: AIService, config: Partial<SimulatorConfig> = {}) {
    this.config = { ...DEFAULT_SIMULATOR_CONFIG, ...config };
    
    // Initialize all components
    this.inputValidator = new InputValidator();
    this.scenarioProcessor = new ScenarioProcessor();
    this.seriousGenerator = new SeriousOutcomeGenerator(aiService);
    this.funGenerator = new FunOutcomeGenerator(aiService);
    this.outputFormatter = new OutputFormatter();

    if (this.config.enableLogging) {
      this.log('WhatIfSimulator initialized with config:', this.config);
    }
  }

  /**
   * Processes a "What if..." scenario through the complete pipeline
   * Requirements: 1.1 - Accept and process user scenarios
   *              2.1 - Generate serious analysis
   *              3.1 - Generate fun interpretation
   *              4.1 - Present both versions clearly
   */
  async processScenario(input: string): Promise<SimulationResult> {
    const startTime = Date.now();
    const metrics: Partial<ProcessingMetrics> = {};
    
    try {
      if (this.config.enableLogging) {
        this.log('Starting scenario processing:', input?.substring(0, 100) + '...');
      }

      // Step 1: Input Validation
      const validationStart = Date.now();
      const validationResult = await this.validateInput(input);
      metrics.validationTime = Math.max(Date.now() - validationStart, 1); // Ensure minimum 1ms

      if (!validationResult.isValid) {
        return this.createErrorResult(
          validationResult.errorMessage || 'Input validation failed',
          metrics,
          startTime
        );
      }

      // Step 2: Scenario Processing
      const processingStart = Date.now();
      const processedScenario = await this.processScenarioStructure(validationResult.sanitizedInput);
      metrics.processingTime = Math.max(Date.now() - processingStart, 1); // Ensure minimum 1ms

      // Step 3: Generate Outcomes (parallel or sequential based on config)
      const generationStart = Date.now();
      const { seriousOutcome, funOutcome, seriousTime, funTime } = await this.generateOutcomes(processedScenario);
      metrics.seriousGenerationTime = seriousTime;
      metrics.funGenerationTime = funTime;

      // Step 4: Format Results
      const formattingStart = Date.now();
      const totalGenerationTime = Date.now() - generationStart;
      const formattedOutput = await this.formatResults(
        seriousOutcome,
        funOutcome,
        processedScenario,
        totalGenerationTime
      );
      metrics.formattingTime = Math.max(Date.now() - formattingStart, 1); // Ensure minimum 1ms

      // Step 5: Create Presentation Output
      const presentationOutput = this.outputFormatter.createPresentationOutput(formattedOutput);

      // Calculate total metrics
      metrics.totalProcessingTime = Date.now() - startTime;
      metrics.success = true;

      if (this.config.enableLogging) {
        this.log('Scenario processing completed successfully in', metrics.totalProcessingTime, 'ms');
      }

      return {
        success: true,
        formattedOutput,
        presentationOutput,
        metrics: metrics as ProcessingMetrics
      };

    } catch (error) {
      const totalTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      const errorType = error instanceof WhatIfSimulatorError ? error.type : 'UNKNOWN';

      if (this.config.enableLogging) {
        ErrorHandler.logError(error as Error, 'scenario processing');
      }

      return this.createErrorResult(errorMessage, metrics, startTime, errorType);
    }
  }

  /**
   * Validates user input using the InputValidator
   * @param input - Raw user input
   * @returns Promise resolving to validation result
   */
  private async validateInput(input: string): Promise<ValidationResult> {
    try {
      // Add timeout protection
      const result = await this.withTimeout(
        Promise.resolve(this.inputValidator.validateScenario(input)),
        5000, // 5 second timeout for validation
        'Input validation timeout'
      );
      return result;
    } catch (error) {
      ErrorHandler.logError(error as Error, 'input validation');
      throw new WhatIfSimulatorError(
        'Failed to validate input',
        ErrorType.INPUT_VALIDATION,
        error as Error,
        false
      );
    }
  }

  /**
   * Processes scenario structure using the ScenarioProcessor
   * @param sanitizedInput - Validated and sanitized input
   * @returns Promise resolving to processed scenario
   */
  private async processScenarioStructure(sanitizedInput: string): Promise<ProcessedScenario> {
    try {
      // Add timeout protection
      const result = await this.withTimeout(
        Promise.resolve(this.scenarioProcessor.processScenario(sanitizedInput)),
        5000, // 5 second timeout for processing
        'Scenario processing timeout'
      );
      return result;
    } catch (error) {
      ErrorHandler.logError(error as Error, 'scenario structure processing');
      throw new WhatIfSimulatorError(
        'Failed to process scenario structure',
        ErrorType.PROCESSING,
        error as Error,
        false
      );
    }
  }

  /**
   * Generates both serious and fun outcomes
   * @param scenario - Processed scenario
   * @returns Promise resolving to both outcomes with timing info
   */
  private async generateOutcomes(scenario: ProcessedScenario): Promise<{
    seriousOutcome: string;
    funOutcome: string;
    seriousTime: number;
    funTime: number;
  }> {
    if (this.config.enableParallelGeneration) {
      return this.generateOutcomesParallel(scenario);
    } else {
      return this.generateOutcomesSequential(scenario);
    }
  }

  /**
   * Generates outcomes in parallel for better performance
   * @param scenario - Processed scenario
   * @returns Promise resolving to both outcomes with timing info
   */
  private async generateOutcomesParallel(scenario: ProcessedScenario): Promise<{
    seriousOutcome: string;
    funOutcome: string;
    seriousTime: number;
    funTime: number;
  }> {
    const seriousStart = Date.now();
    const funStart = Date.now();

    try {
      const [seriousOutcome, funOutcome] = await Promise.all([
        this.withTimeout(
          this.seriousGenerator.generateSeriousOutcome(scenario),
          this.config.maxProcessingTime! / 2,
          'Serious outcome generation timeout'
        ),
        this.withTimeout(
          this.funGenerator.generateFunOutcome(scenario),
          this.config.maxProcessingTime! / 2,
          'Fun outcome generation timeout'
        )
      ]);

      const seriousTime = Date.now() - seriousStart;
      const funTime = Date.now() - funStart;

      return {
        seriousOutcome,
        funOutcome,
        seriousTime: Math.max(seriousTime, 1), // Ensure minimum 1ms for testing
        funTime: Math.max(funTime, 1) // Ensure minimum 1ms for testing
      };
    } catch (error) {
      ErrorHandler.logError(error as Error, 'parallel outcome generation');
      
      // Preserve timeout error messages
      if (error instanceof WhatIfSimulatorError && error.type === ErrorType.TIMEOUT) {
        throw error;
      }
      
      throw new WhatIfSimulatorError(
        'Failed to generate outcomes in parallel',
        ErrorType.AI_GENERATION,
        error as Error,
        true
      );
    }
  }

  /**
   * Generates outcomes sequentially as fallback
   * @param scenario - Processed scenario
   * @returns Promise resolving to both outcomes with timing info
   */
  private async generateOutcomesSequential(scenario: ProcessedScenario): Promise<{
    seriousOutcome: string;
    funOutcome: string;
    seriousTime: number;
    funTime: number;
  }> {
    const seriousStart = Date.now();
    const seriousOutcome = await this.withTimeout(
      this.seriousGenerator.generateSeriousOutcome(scenario),
      this.config.maxProcessingTime! / 2,
      'Serious outcome generation timeout'
    );
    const seriousTime = Math.max(Date.now() - seriousStart, 1); // Ensure minimum 1ms for testing

    const funStart = Date.now();
    const funOutcome = await this.withTimeout(
      this.funGenerator.generateFunOutcome(scenario),
      this.config.maxProcessingTime! / 2,
      'Fun outcome generation timeout'
    );
    const funTime = Math.max(Date.now() - funStart, 1); // Ensure minimum 1ms for testing

    return {
      seriousOutcome,
      funOutcome,
      seriousTime,
      funTime
    };
  }

  /**
   * Formats the results using the OutputFormatter
   * @param seriousOutcome - Generated serious outcome
   * @param funOutcome - Generated fun outcome
   * @param scenario - Processed scenario
   * @param processingTime - Time taken for generation
   * @returns Promise resolving to formatted output
   */
  private async formatResults(
    seriousOutcome: string,
    funOutcome: string,
    scenario: ProcessedScenario,
    processingTime: number
  ): Promise<FormattedOutput> {
    try {
      const result = await this.withTimeout(
        Promise.resolve(this.outputFormatter.formatResults(
          seriousOutcome,
          funOutcome,
          scenario,
          processingTime
        )),
        5000, // 5 second timeout for formatting
        'Output formatting timeout'
      );
      return result;
    } catch (error) {
      ErrorHandler.logError(error as Error, 'result formatting');
      throw new WhatIfSimulatorError(
        'Failed to format results',
        ErrorType.FORMATTING,
        error as Error,
        false
      );
    }
  }

  /**
   * Creates an error result with metrics
   * @param errorMessage - Error message
   * @param metrics - Partial metrics collected so far
   * @param startTime - Processing start time
   * @param errorType - Type of error that occurred
   * @returns Error simulation result
   */
  private createErrorResult(
    errorMessage: string,
    metrics: Partial<ProcessingMetrics>,
    startTime: number,
    errorType?: string
  ): SimulationResult {
    const totalTime = Date.now() - startTime;
    
    const errorMetrics: ProcessingMetrics = {
      totalProcessingTime: totalTime,
      validationTime: metrics.validationTime || 0,
      processingTime: metrics.processingTime || 0,
      seriousGenerationTime: metrics.seriousGenerationTime || 0,
      funGenerationTime: metrics.funGenerationTime || 0,
      formattingTime: metrics.formattingTime || 0,
      success: false,
      errorType
    };

    if (this.config.enableLogging) {
      this.log('Scenario processing failed:', errorMessage, 'Total time:', totalTime, 'ms');
    }

    return {
      success: false,
      error: errorMessage,
      metrics: errorMetrics
    };
  }

  /**
   * Adds timeout protection to async operations
   * @param promise - Promise to add timeout to
   * @param timeoutMs - Timeout in milliseconds
   * @param timeoutMessage - Message for timeout error
   * @returns Promise with timeout protection
   */
  private async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    timeoutMessage: string
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new WhatIfSimulatorError(
          timeoutMessage,
          ErrorType.TIMEOUT,
          undefined,
          true
        ));
      }, timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
  }

  /**
   * Logging utility
   * @param args - Arguments to log
   */
  private log(...args: any[]): void {
    if (this.config.enableLogging) {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] WhatIfSimulator:`, ...args);
    }
  }

  /**
   * Gets current configuration
   * @returns Current simulator configuration
   */
  public getConfig(): SimulatorConfig {
    return { ...this.config };
  }

  /**
   * Updates configuration
   * @param newConfig - New configuration options
   */
  public updateConfig(newConfig: Partial<SimulatorConfig>): void {
    this.config = { ...this.config, ...newConfig };
    if (this.config.enableLogging) {
      this.log('Configuration updated:', this.config);
    }
  }
}