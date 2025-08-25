import { ValidationResult } from '../models/interfaces.js';
/**
 * InputValidator handles validation and sanitization of user input scenarios
 * Implements requirements 1.1, 1.2, 1.3, and 5.3
 */
export declare class InputValidator {
    private readonly minLength;
    private readonly maxLength;
    private readonly inappropriatePatterns;
    private readonly whatIfPatterns;
    /**
     * Validates a user-provided scenario
     * Requirements: 1.1 - Accept text input containing scenario
     *              1.2 - Validate meaningful scenario
     *              1.3 - Prompt for valid input if empty/invalid
     */
    validateScenario(input: string): ValidationResult;
    /**
     * Creates a consistent validation error result
     * @param sanitizedInput - The sanitized input (may be partial)
     * @param errorMessage - The error message to display
     * @returns ValidationResult with error details
     */
    private createValidationError;
    /**
     * Sanitizes input text by removing harmful characters and normalizing whitespace
     */
    private sanitizeInput;
    /**
     * Checks for inappropriate content in the input
     */
    private checkInappropriateContent;
    /**
     * Determines if the input represents a meaningful scenario
     * Requirements: 1.2 - Validate meaningful scenario
     *              5.3 - Request clarification for vague scenarios
     */
    private isMeaningfulScenario;
}
//# sourceMappingURL=InputValidator.d.ts.map