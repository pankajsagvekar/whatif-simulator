/**
 * Error types for the What If Simulator
 */
export declare enum ErrorType {
    INPUT_VALIDATION = "INPUT_VALIDATION",
    AI_GENERATION = "AI_GENERATION",
    PROCESSING = "PROCESSING",
    FORMATTING = "FORMATTING",
    NETWORK = "NETWORK",
    TIMEOUT = "TIMEOUT",
    RATE_LIMIT = "RATE_LIMIT"
}
/**
 * Custom error class for What If Simulator errors
 */
export declare class WhatIfSimulatorError extends Error {
    readonly type: ErrorType;
    readonly originalError?: Error;
    readonly retryable: boolean;
    constructor(message: string, type: ErrorType, originalError?: Error, retryable?: boolean);
}
/**
 * Retry configuration options
 */
export interface RetryOptions {
    maxAttempts: number;
    baseDelay: number;
    maxDelay: number;
    backoffMultiplier: number;
}
/**
 * Default retry configuration
 */
export declare const DEFAULT_RETRY_OPTIONS: RetryOptions;
/**
 * Error handler utility class with retry logic and fallback strategies
 */
export declare class ErrorHandler {
    /**
     * Executes a function with retry logic for retryable errors
     */
    static withRetry<T>(operation: () => Promise<T>, options?: Partial<RetryOptions>): Promise<T>;
    /**
     * Handles AI generation errors with specific retry logic
     */
    static handleAIGenerationError(error: Error, context: string): WhatIfSimulatorError;
    /**
     * Creates fallback content when AI generation fails
     */
    static createFallbackContent(type: 'serious' | 'fun', scenario: string, reason: string): string;
    /**
     * Validates that content meets minimum quality standards
     */
    static validateContent(content: string, minLength?: number): boolean;
    /**
     * Checks if content appears to be a generic error message
     */
    private static isGenericError;
    /**
     * Sleep utility for retry delays
     */
    private static sleep;
    /**
     * Logs errors with appropriate detail level
     */
    static logError(error: Error, context: string): void;
}
//# sourceMappingURL=ErrorHandler.d.ts.map