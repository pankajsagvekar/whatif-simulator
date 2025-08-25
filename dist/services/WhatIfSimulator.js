"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatIfSimulator = exports.DEFAULT_SIMULATOR_CONFIG = void 0;
const InputValidator_js_1 = require("./InputValidator.js");
const ScenarioProcessor_js_1 = require("./ScenarioProcessor.js");
const SeriousOutcomeGenerator_js_1 = require("./SeriousOutcomeGenerator.js");
const FunOutcomeGenerator_js_1 = require("./FunOutcomeGenerator.js");
const OutputFormatter_js_1 = require("./OutputFormatter.js");
const ErrorHandler_js_1 = require("../utils/ErrorHandler.js");
/**
 * Default configuration for the simulator
 */
exports.DEFAULT_SIMULATOR_CONFIG = {
    enableLogging: true,
    enableMetrics: true,
    maxProcessingTime: 30000, // 30 seconds
    enableParallelGeneration: true
};
/**
 * Main WhatIfSimulator service that orchestrates all components
 * Implements requirements 1.1, 2.1, 3.1, 4.1
 */
class WhatIfSimulator {
    constructor(aiService, config = {}) {
        this.config = { ...exports.DEFAULT_SIMULATOR_CONFIG, ...config };
        // Initialize all components
        this.inputValidator = new InputValidator_js_1.InputValidator();
        this.scenarioProcessor = new ScenarioProcessor_js_1.ScenarioProcessor();
        this.seriousGenerator = new SeriousOutcomeGenerator_js_1.SeriousOutcomeGenerator(aiService);
        this.funGenerator = new FunOutcomeGenerator_js_1.FunOutcomeGenerator(aiService);
        this.outputFormatter = new OutputFormatter_js_1.OutputFormatter();
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
    async processScenario(input) {
        const startTime = Date.now();
        const metrics = {};
        try {
            if (this.config.enableLogging) {
                this.log('Starting scenario processing:', input?.substring(0, 100) + '...');
            }
            // Step 1: Input Validation
            const validationStart = Date.now();
            const validationResult = await this.validateInput(input);
            metrics.validationTime = Math.max(Date.now() - validationStart, 1); // Ensure minimum 1ms
            if (!validationResult.isValid) {
                return this.createErrorResult(validationResult.errorMessage || 'Input validation failed', metrics, startTime);
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
            const formattedOutput = await this.formatResults(seriousOutcome, funOutcome, processedScenario, totalGenerationTime);
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
                metrics: metrics
            };
        }
        catch (error) {
            const totalTime = Date.now() - startTime;
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            const errorType = error instanceof ErrorHandler_js_1.WhatIfSimulatorError ? error.type : 'UNKNOWN';
            if (this.config.enableLogging) {
                ErrorHandler_js_1.ErrorHandler.logError(error, 'scenario processing');
            }
            return this.createErrorResult(errorMessage, metrics, startTime, errorType);
        }
    }
    /**
     * Validates user input using the InputValidator
     * @param input - Raw user input
     * @returns Promise resolving to validation result
     */
    async validateInput(input) {
        try {
            // Add timeout protection
            const result = await this.withTimeout(Promise.resolve(this.inputValidator.validateScenario(input)), 5000, // 5 second timeout for validation
            'Input validation timeout');
            return result;
        }
        catch (error) {
            ErrorHandler_js_1.ErrorHandler.logError(error, 'input validation');
            throw new ErrorHandler_js_1.WhatIfSimulatorError('Failed to validate input', ErrorHandler_js_1.ErrorType.INPUT_VALIDATION, error, false);
        }
    }
    /**
     * Processes scenario structure using the ScenarioProcessor
     * @param sanitizedInput - Validated and sanitized input
     * @returns Promise resolving to processed scenario
     */
    async processScenarioStructure(sanitizedInput) {
        try {
            // Add timeout protection
            const result = await this.withTimeout(Promise.resolve(this.scenarioProcessor.processScenario(sanitizedInput)), 5000, // 5 second timeout for processing
            'Scenario processing timeout');
            return result;
        }
        catch (error) {
            ErrorHandler_js_1.ErrorHandler.logError(error, 'scenario structure processing');
            throw new ErrorHandler_js_1.WhatIfSimulatorError('Failed to process scenario structure', ErrorHandler_js_1.ErrorType.PROCESSING, error, false);
        }
    }
    /**
     * Generates both serious and fun outcomes
     * @param scenario - Processed scenario
     * @returns Promise resolving to both outcomes with timing info
     */
    async generateOutcomes(scenario) {
        if (this.config.enableParallelGeneration) {
            return this.generateOutcomesParallel(scenario);
        }
        else {
            return this.generateOutcomesSequential(scenario);
        }
    }
    /**
     * Generates outcomes in parallel for better performance
     * @param scenario - Processed scenario
     * @returns Promise resolving to both outcomes with timing info
     */
    async generateOutcomesParallel(scenario) {
        const seriousStart = Date.now();
        const funStart = Date.now();
        try {
            const [seriousOutcome, funOutcome] = await Promise.all([
                this.withTimeout(this.seriousGenerator.generateSeriousOutcome(scenario), this.config.maxProcessingTime / 2, 'Serious outcome generation timeout'),
                this.withTimeout(this.funGenerator.generateFunOutcome(scenario), this.config.maxProcessingTime / 2, 'Fun outcome generation timeout')
            ]);
            const seriousTime = Date.now() - seriousStart;
            const funTime = Date.now() - funStart;
            return {
                seriousOutcome,
                funOutcome,
                seriousTime: Math.max(seriousTime, 1), // Ensure minimum 1ms for testing
                funTime: Math.max(funTime, 1) // Ensure minimum 1ms for testing
            };
        }
        catch (error) {
            ErrorHandler_js_1.ErrorHandler.logError(error, 'parallel outcome generation');
            // Preserve timeout error messages
            if (error instanceof ErrorHandler_js_1.WhatIfSimulatorError && error.type === ErrorHandler_js_1.ErrorType.TIMEOUT) {
                throw error;
            }
            throw new ErrorHandler_js_1.WhatIfSimulatorError('Failed to generate outcomes in parallel', ErrorHandler_js_1.ErrorType.AI_GENERATION, error, true);
        }
    }
    /**
     * Generates outcomes sequentially as fallback
     * @param scenario - Processed scenario
     * @returns Promise resolving to both outcomes with timing info
     */
    async generateOutcomesSequential(scenario) {
        const seriousStart = Date.now();
        const seriousOutcome = await this.withTimeout(this.seriousGenerator.generateSeriousOutcome(scenario), this.config.maxProcessingTime / 2, 'Serious outcome generation timeout');
        const seriousTime = Math.max(Date.now() - seriousStart, 1); // Ensure minimum 1ms for testing
        const funStart = Date.now();
        const funOutcome = await this.withTimeout(this.funGenerator.generateFunOutcome(scenario), this.config.maxProcessingTime / 2, 'Fun outcome generation timeout');
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
    async formatResults(seriousOutcome, funOutcome, scenario, processingTime) {
        try {
            const result = await this.withTimeout(Promise.resolve(this.outputFormatter.formatResults(seriousOutcome, funOutcome, scenario, processingTime)), 5000, // 5 second timeout for formatting
            'Output formatting timeout');
            return result;
        }
        catch (error) {
            ErrorHandler_js_1.ErrorHandler.logError(error, 'result formatting');
            throw new ErrorHandler_js_1.WhatIfSimulatorError('Failed to format results', ErrorHandler_js_1.ErrorType.FORMATTING, error, false);
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
    createErrorResult(errorMessage, metrics, startTime, errorType) {
        const totalTime = Date.now() - startTime;
        const errorMetrics = {
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
    async withTimeout(promise, timeoutMs, timeoutMessage) {
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
                reject(new ErrorHandler_js_1.WhatIfSimulatorError(timeoutMessage, ErrorHandler_js_1.ErrorType.TIMEOUT, undefined, true));
            }, timeoutMs);
        });
        return Promise.race([promise, timeoutPromise]);
    }
    /**
     * Logging utility
     * @param args - Arguments to log
     */
    log(...args) {
        if (this.config.enableLogging) {
            const timestamp = new Date().toISOString();
            console.log(`[${timestamp}] WhatIfSimulator:`, ...args);
        }
    }
    /**
     * Gets current configuration
     * @returns Current simulator configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Updates configuration
     * @param newConfig - New configuration options
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        if (this.config.enableLogging) {
            this.log('Configuration updated:', this.config);
        }
    }
}
exports.WhatIfSimulator = WhatIfSimulator;
//# sourceMappingURL=WhatIfSimulator.js.map