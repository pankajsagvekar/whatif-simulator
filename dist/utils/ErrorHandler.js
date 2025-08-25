"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = exports.DEFAULT_RETRY_OPTIONS = exports.WhatIfSimulatorError = exports.ErrorType = void 0;
/**
 * Error types for the What If Simulator
 */
var ErrorType;
(function (ErrorType) {
    ErrorType["INPUT_VALIDATION"] = "INPUT_VALIDATION";
    ErrorType["AI_GENERATION"] = "AI_GENERATION";
    ErrorType["PROCESSING"] = "PROCESSING";
    ErrorType["FORMATTING"] = "FORMATTING";
    ErrorType["NETWORK"] = "NETWORK";
    ErrorType["TIMEOUT"] = "TIMEOUT";
    ErrorType["RATE_LIMIT"] = "RATE_LIMIT";
})(ErrorType || (exports.ErrorType = ErrorType = {}));
/**
 * Custom error class for What If Simulator errors
 */
class WhatIfSimulatorError extends Error {
    constructor(message, type, originalError, retryable = false) {
        super(message);
        this.name = 'WhatIfSimulatorError';
        this.type = type;
        this.originalError = originalError;
        this.retryable = retryable;
    }
}
exports.WhatIfSimulatorError = WhatIfSimulatorError;
/**
 * Default retry configuration
 */
exports.DEFAULT_RETRY_OPTIONS = {
    maxAttempts: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 10000, // 10 seconds
    backoffMultiplier: 2
};
/**
 * Error handler utility class with retry logic and fallback strategies
 */
class ErrorHandler {
    /**
     * Executes a function with retry logic for retryable errors
     */
    static async withRetry(operation, options = {}) {
        const config = { ...exports.DEFAULT_RETRY_OPTIONS, ...options };
        let lastError;
        for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
            try {
                return await operation();
            }
            catch (error) {
                lastError = error;
                // Check if error is retryable
                if (error instanceof WhatIfSimulatorError && !error.retryable) {
                    throw error;
                }
                // Don't retry on the last attempt
                if (attempt === config.maxAttempts) {
                    break;
                }
                // Calculate delay with exponential backoff
                const delay = Math.min(config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1), config.maxDelay);
                // Add jitter to prevent thundering herd
                const jitteredDelay = delay + Math.random() * 1000;
                await this.sleep(jitteredDelay);
            }
        }
        // lastError should always be defined here since we only reach this point after catching an error
        const finalError = lastError || new Error('Unknown error occurred');
        throw new WhatIfSimulatorError(`Operation failed after ${config.maxAttempts} attempts: ${finalError.message}`, ErrorType.PROCESSING, finalError, false);
    }
    /**
     * Handles AI generation errors with specific retry logic
     */
    static handleAIGenerationError(error, context) {
        let errorType = ErrorType.AI_GENERATION;
        let retryable = true;
        // Classify error types
        const lowerMessage = error.message.toLowerCase();
        if (lowerMessage.includes('timeout')) {
            errorType = ErrorType.TIMEOUT;
        }
        else if (lowerMessage.includes('rate limit') || lowerMessage.includes('429')) {
            errorType = ErrorType.RATE_LIMIT;
        }
        else if (lowerMessage.includes('network') || lowerMessage.includes('connection')) {
            errorType = ErrorType.NETWORK;
        }
        else if (lowerMessage.includes('invalid') || lowerMessage.includes('malformed')) {
            errorType = ErrorType.AI_GENERATION;
            retryable = false;
        }
        return new WhatIfSimulatorError(`AI generation failed for ${context}: ${error.message}`, errorType, error, retryable);
    }
    /**
     * Creates fallback content when AI generation fails
     */
    static createFallbackContent(type, scenario, reason) {
        const baseMessage = `Unable to generate ${type} analysis due to: ${reason}`;
        if (type === 'serious') {
            return `**Analysis Framework:**

${baseMessage}

**Suggested Analysis Approach:**
• Consider the immediate consequences of: "${scenario}"
• Evaluate potential challenges and obstacles
• Think about short-term and long-term effects
• Assess the likelihood of different outcomes
• Consider real-world constraints and factors

**Next Steps:**
Please try rephrasing your scenario or try again later. You can also analyze this scenario manually using the framework above.`;
        }
        else {
            return `**Creative Prompt:**

${baseMessage}

**Imagination Starters:**
• What if "${scenario}" happened in a cartoon world?
• How would this scenario play out with magical elements?
• What unexpected characters might get involved?
• What humorous complications could arise?
• How could this lead to delightfully absurd consequences?

**Next Steps:**
Please try rephrasing your scenario or try again later. Use the creative prompts above to spark your own imagination and interpretation!`;
        }
    }
    /**
     * Validates that content meets minimum quality standards
     */
    static validateContent(content, minLength = 50) {
        if (!content || typeof content !== 'string') {
            return false;
        }
        const trimmed = content.trim();
        return trimmed.length >= minLength && !this.isGenericError(trimmed);
    }
    /**
     * Checks if content appears to be a generic error message
     */
    static isGenericError(content) {
        const errorPatterns = [
            /^error/i,
            /^failed/i,
            /^unable/i,
            /^sorry/i,
            /^i cannot/i,
            /^i can't/i
        ];
        return errorPatterns.some(pattern => pattern.test(content.trim()));
    }
    /**
     * Sleep utility for retry delays
     */
    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * Logs errors with appropriate detail level
     */
    static logError(error, context) {
        const timestamp = new Date().toISOString();
        const errorInfo = {
            timestamp,
            context,
            message: error.message,
            type: error instanceof WhatIfSimulatorError ? error.type : 'UNKNOWN',
            retryable: error instanceof WhatIfSimulatorError ? error.retryable : false,
            stack: error.stack
        };
        // In a real application, this would use a proper logging service
        console.error('WhatIfSimulator Error:', errorInfo);
    }
}
exports.ErrorHandler = ErrorHandler;
//# sourceMappingURL=ErrorHandler.js.map