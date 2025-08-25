"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputValidator = void 0;
const ErrorHandler_js_1 = require("../utils/ErrorHandler.js");
/**
 * InputValidator handles validation and sanitization of user input scenarios
 * Implements requirements 1.1, 1.2, 1.3, and 5.3
 */
class InputValidator {
    constructor() {
        this.minLength = 10;
        this.maxLength = 1000;
        // Common inappropriate content patterns
        this.inappropriatePatterns = [
            /\b(hate|violence|harm|kill|death|suicide|violent)\b/gi,
            /\b(explicit|sexual|nsfw)\b/gi,
            /\b(racist|sexist|discriminatory)\b/gi
        ];
        // Common "what if" variations to detect
        this.whatIfPatterns = [
            /^what\s+if\b/i,
            /^suppose\b/i,
            /^imagine\s+if\b/i,
            /^let's\s+say\b/i,
            /^hypothetically\b/i
        ];
    }
    /**
     * Validates a user-provided scenario
     * Requirements: 1.1 - Accept text input containing scenario
     *              1.2 - Validate meaningful scenario
     *              1.3 - Prompt for valid input if empty/invalid
     */
    validateScenario(input) {
        try {
            // Handle null/undefined input
            if (!input) {
                return this.createValidationError('', 'Please provide a "What if..." question to explore.');
            }
            // Sanitize the input first with error handling
            let sanitizedInput;
            try {
                sanitizedInput = this.sanitizeInput(input);
            }
            catch (error) {
                ErrorHandler_js_1.ErrorHandler.logError(error, 'input sanitization');
                return this.createValidationError(input, 'Unable to process input. Please try rephrasing your scenario.');
            }
            // Check if sanitized input is empty (was just whitespace)
            if (sanitizedInput.trim().length === 0) {
                return this.createValidationError('', 'Please provide a "What if..." question to explore.');
            }
            // Check minimum length requirement
            if (sanitizedInput.trim().length < this.minLength) {
                return this.createValidationError(sanitizedInput, 'Please provide a more detailed "What if..." scenario (at least 10 characters).');
            }
            // Check maximum length requirement
            if (sanitizedInput.length > this.maxLength) {
                return this.createValidationError(sanitizedInput.substring(0, this.maxLength), 'Scenario is too long. Please keep it under 1000 characters.');
            }
            // Check for inappropriate content with error handling
            let inappropriateCheck;
            try {
                inappropriateCheck = this.checkInappropriateContent(sanitizedInput);
            }
            catch (error) {
                ErrorHandler_js_1.ErrorHandler.logError(error, 'inappropriate content check');
                // If content checking fails, err on the side of caution
                return this.createValidationError(sanitizedInput, 'Unable to verify content appropriateness. Please try rephrasing your scenario.');
            }
            if (!inappropriateCheck.isAppropriate) {
                return this.createValidationError(sanitizedInput, 'Please rephrase your scenario to avoid inappropriate content.');
            }
            // Check if it's a meaningful scenario with error handling
            let isMeaningful;
            try {
                isMeaningful = this.isMeaningfulScenario(sanitizedInput);
            }
            catch (error) {
                ErrorHandler_js_1.ErrorHandler.logError(error, 'meaningful scenario check');
                // If meaningfulness check fails, provide helpful guidance
                return this.createValidationError(sanitizedInput, 'Please provide a more specific "What if..." scenario. Try starting with "What if..." followed by a clear situation.');
            }
            if (!isMeaningful) {
                return this.createValidationError(sanitizedInput, 'Please provide a more specific "What if..." scenario that can be analyzed.');
            }
            return {
                isValid: true,
                sanitizedInput,
            };
        }
        catch (error) {
            // Catch-all error handler for unexpected validation failures
            ErrorHandler_js_1.ErrorHandler.logError(error, 'input validation');
            return this.createValidationError(input || '', 'An error occurred while validating your input. Please try again with a different scenario.');
        }
    }
    /**
     * Creates a consistent validation error result
     * @param sanitizedInput - The sanitized input (may be partial)
     * @param errorMessage - The error message to display
     * @returns ValidationResult with error details
     */
    createValidationError(sanitizedInput, errorMessage) {
        return {
            isValid: false,
            sanitizedInput,
            errorMessage
        };
    }
    /**
     * Sanitizes input text by removing harmful characters and normalizing whitespace
     */
    sanitizeInput(input) {
        try {
            if (typeof input !== 'string') {
                throw new ErrorHandler_js_1.WhatIfSimulatorError('Input must be a string', ErrorHandler_js_1.ErrorType.INPUT_VALIDATION, undefined, false);
            }
            return input
                .trim()
                // Remove potentially harmful characters
                .replace(/[<>]/g, '')
                // Normalize whitespace
                .replace(/\s+/g, ' ')
                // Remove leading/trailing quotes if present
                .replace(/^["']|["']$/g, '');
        }
        catch (error) {
            if (error instanceof ErrorHandler_js_1.WhatIfSimulatorError) {
                throw error;
            }
            throw new ErrorHandler_js_1.WhatIfSimulatorError('Failed to sanitize input', ErrorHandler_js_1.ErrorType.INPUT_VALIDATION, error, false);
        }
    }
    /**
     * Checks for inappropriate content in the input
     */
    checkInappropriateContent(input) {
        for (const pattern of this.inappropriatePatterns) {
            // Reset the regex lastIndex to avoid issues with global flag
            pattern.lastIndex = 0;
            if (pattern.test(input)) {
                return {
                    isAppropriate: false,
                    reason: 'Contains inappropriate content'
                };
            }
        }
        return { isAppropriate: true };
    }
    /**
     * Determines if the input represents a meaningful scenario
     * Requirements: 1.2 - Validate meaningful scenario
     *              5.3 - Request clarification for vague scenarios
     */
    isMeaningfulScenario(input) {
        const lowerInput = input.toLowerCase();
        // Check if it starts with a "what if" pattern
        const hasWhatIfPattern = this.whatIfPatterns.some(pattern => pattern.test(lowerInput));
        // If it has a "what if" pattern, it's likely meaningful
        if (hasWhatIfPattern) {
            return true;
        }
        // For scenarios without "what if", require both subject AND action for meaningful structure
        const hasSubject = /\b(i|you|we|they|people|someone|everyone|nobody|animals|humans|robots)\b/.test(lowerInput) ||
            /\b(the|a|an)\s+(internet|world|gravity|time|money|government|system)\b/.test(lowerInput);
        const hasAction = /\b(could|would|might|can|will|became|become|change|changed|stop|stopped|start|started|disappear|disappeared|teleport|fly|talk|speak|need|needed|only)\b/.test(lowerInput);
        // For non-"what if" scenarios, require both subject AND action
        const hasMeaningfulStructure = hasSubject && hasAction;
        // Check it's not just a single word or very basic phrase
        const wordCount = input.trim().split(/\s+/).length;
        const hasMinimumComplexity = wordCount >= 3;
        // Avoid common non-scenarios
        const isNotQuestion = !/^(who|when|where|why|how)\b/i.test(lowerInput);
        const isNotGreeting = !/^(hello|hi|hey|good|thanks)\b/i.test(lowerInput);
        const isNotRandomText = !/\b(random|just|some|text|words|without|meaning|structure|together|here)\b/i.test(lowerInput);
        return hasMeaningfulStructure && hasMinimumComplexity && isNotQuestion && isNotGreeting && isNotRandomText;
    }
}
exports.InputValidator = InputValidator;
//# sourceMappingURL=InputValidator.js.map