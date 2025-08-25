import { FormattedOutput } from '../models/interfaces.js';
import { AIService } from './SeriousOutcomeGenerator.js';
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
export declare const DEFAULT_SIMULATOR_CONFIG: SimulatorConfig;
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
export declare class WhatIfSimulator {
    private inputValidator;
    private scenarioProcessor;
    private seriousGenerator;
    private funGenerator;
    private outputFormatter;
    private config;
    constructor(aiService: AIService, config?: Partial<SimulatorConfig>);
    /**
     * Processes a "What if..." scenario through the complete pipeline
     * Requirements: 1.1 - Accept and process user scenarios
     *              2.1 - Generate serious analysis
     *              3.1 - Generate fun interpretation
     *              4.1 - Present both versions clearly
     */
    processScenario(input: string): Promise<SimulationResult>;
    /**
     * Validates user input using the InputValidator
     * @param input - Raw user input
     * @returns Promise resolving to validation result
     */
    private validateInput;
    /**
     * Processes scenario structure using the ScenarioProcessor
     * @param sanitizedInput - Validated and sanitized input
     * @returns Promise resolving to processed scenario
     */
    private processScenarioStructure;
    /**
     * Generates both serious and fun outcomes
     * @param scenario - Processed scenario
     * @returns Promise resolving to both outcomes with timing info
     */
    private generateOutcomes;
    /**
     * Generates outcomes in parallel for better performance
     * @param scenario - Processed scenario
     * @returns Promise resolving to both outcomes with timing info
     */
    private generateOutcomesParallel;
    /**
     * Generates outcomes sequentially as fallback
     * @param scenario - Processed scenario
     * @returns Promise resolving to both outcomes with timing info
     */
    private generateOutcomesSequential;
    /**
     * Formats the results using the OutputFormatter
     * @param seriousOutcome - Generated serious outcome
     * @param funOutcome - Generated fun outcome
     * @param scenario - Processed scenario
     * @param processingTime - Time taken for generation
     * @returns Promise resolving to formatted output
     */
    private formatResults;
    /**
     * Creates an error result with metrics
     * @param errorMessage - Error message
     * @param metrics - Partial metrics collected so far
     * @param startTime - Processing start time
     * @param errorType - Type of error that occurred
     * @returns Error simulation result
     */
    private createErrorResult;
    /**
     * Adds timeout protection to async operations
     * @param promise - Promise to add timeout to
     * @param timeoutMs - Timeout in milliseconds
     * @param timeoutMessage - Message for timeout error
     * @returns Promise with timeout protection
     */
    private withTimeout;
    /**
     * Logging utility
     * @param args - Arguments to log
     */
    private log;
    /**
     * Gets current configuration
     * @returns Current simulator configuration
     */
    getConfig(): SimulatorConfig;
    /**
     * Updates configuration
     * @param newConfig - New configuration options
     */
    updateConfig(newConfig: Partial<SimulatorConfig>): void;
}
//# sourceMappingURL=WhatIfSimulator.d.ts.map