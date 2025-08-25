"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutputFormatter = void 0;
const ErrorHandler_js_1 = require("../utils/ErrorHandler.js");
/**
 * OutputFormatter handles the structuring and presentation of dual outcomes
 * from the What If Simulator, ensuring clear distinction between serious and fun versions
 */
class OutputFormatter {
    /**
     * Formats the dual outcomes into a structured, readable output
     * @param seriousOutcome - The realistic analysis result
     * @param funOutcome - The creative/humorous interpretation
     * @param scenario - The processed scenario for metadata
     * @param processingTime - Time taken to generate outcomes in milliseconds
     * @returns FormattedOutput with structured presentation
     */
    formatResults(seriousOutcome, funOutcome, scenario, processingTime) {
        try {
            // Validate inputs
            if (!this.validateOutcomes(seriousOutcome, funOutcome)) {
                throw new ErrorHandler_js_1.WhatIfSimulatorError('Invalid outcomes provided for formatting', ErrorHandler_js_1.ErrorType.FORMATTING, undefined, false);
            }
            if (!scenario || !scenario.scenarioType) {
                throw new ErrorHandler_js_1.WhatIfSimulatorError('Invalid scenario data provided for formatting', ErrorHandler_js_1.ErrorType.FORMATTING, undefined, false);
            }
            const formattedSerious = this.formatSeriousVersion(seriousOutcome);
            const formattedFun = this.formatFunVersion(funOutcome);
            return {
                seriousVersion: formattedSerious,
                funVersion: formattedFun,
                metadata: {
                    processingTime: Math.max(0, processingTime || 0),
                    scenarioType: scenario.scenarioType
                }
            };
        }
        catch (error) {
            const context = 'output formatting';
            ErrorHandler_js_1.ErrorHandler.logError(error, context);
            if (error instanceof ErrorHandler_js_1.WhatIfSimulatorError) {
                throw error;
            }
            // Provide fallback formatting
            return this.createFallbackFormattedOutput(seriousOutcome, funOutcome, scenario, processingTime);
        }
    }
    /**
     * Creates fallback formatted output when normal formatting fails
     * @param seriousOutcome - The serious outcome (may be invalid)
     * @param funOutcome - The fun outcome (may be invalid)
     * @param scenario - The scenario (may be invalid)
     * @param processingTime - Processing time
     * @returns Basic FormattedOutput
     */
    createFallbackFormattedOutput(seriousOutcome, funOutcome, scenario, processingTime) {
        const safeSeriousOutcome = seriousOutcome || 'Unable to generate serious analysis due to formatting error.';
        const safeFunOutcome = funOutcome || 'Unable to generate fun interpretation due to formatting error.';
        const safeScenarioType = scenario?.scenarioType || 'unknown';
        const safeProcessingTime = Math.max(0, processingTime || 0);
        return {
            seriousVersion: `**Serious Analysis:**\n\n${safeSeriousOutcome}`,
            funVersion: `**Fun Interpretation:**\n\n${safeFunOutcome}`,
            metadata: {
                processingTime: safeProcessingTime,
                scenarioType: safeScenarioType
            }
        };
    }
    /**
     * Creates a complete presentation combining both versions with clear separation
     * @param formattedOutput - The formatted output object
     * @returns Complete formatted string ready for presentation
     */
    createPresentationOutput(formattedOutput) {
        try {
            if (!formattedOutput || !formattedOutput.seriousVersion || !formattedOutput.funVersion) {
                throw new ErrorHandler_js_1.WhatIfSimulatorError('Invalid formatted output provided for presentation', ErrorHandler_js_1.ErrorType.FORMATTING, undefined, false);
            }
            const header = this.createHeader(formattedOutput.metadata);
            const seriousSection = this.createSection(OutputFormatter.SERIOUS_LABEL, formattedOutput.seriousVersion);
            const funSection = this.createSection(OutputFormatter.FUN_LABEL, formattedOutput.funVersion);
            return [
                header,
                seriousSection,
                OutputFormatter.SEPARATOR,
                funSection
            ].join('');
        }
        catch (error) {
            const context = 'presentation output creation';
            ErrorHandler_js_1.ErrorHandler.logError(error, context);
            // Provide minimal fallback presentation
            return `**What If Simulator Results**

**Error:** Unable to format presentation properly.

**Serious Version:**
${formattedOutput?.seriousVersion || 'Not available'}

${OutputFormatter.SEPARATOR}

**Fun Version:**
${formattedOutput?.funVersion || 'Not available'}`;
        }
    }
    /**
     * Formats the serious outcome with structured presentation
     * @param outcome - Raw serious outcome text
     * @returns Formatted serious version
     */
    formatSeriousVersion(outcome) {
        // Clean and structure the serious outcome
        const cleaned = this.cleanText(outcome);
        return this.addStructuredFormatting(cleaned, 'serious');
    }
    /**
     * Formats the fun outcome with engaging presentation
     * @param outcome - Raw fun outcome text
     * @returns Formatted fun version
     */
    formatFunVersion(outcome) {
        // Clean and structure the fun outcome
        const cleaned = this.cleanText(outcome);
        return this.addStructuredFormatting(cleaned, 'fun');
    }
    /**
     * Creates a header with metadata information
     * @param metadata - Processing metadata
     * @returns Formatted header string
     */
    createHeader(metadata) {
        const typeEmoji = this.getScenarioTypeEmoji(metadata.scenarioType);
        return `${typeEmoji} Scenario Type: ${this.capitalizeFirst(metadata.scenarioType)} | ⏱️ Generated in ${metadata.processingTime}ms\n\n`;
    }
    /**
     * Creates a labeled section with consistent formatting
     * @param label - Section label
     * @param content - Section content
     * @returns Formatted section
     */
    createSection(label, content) {
        return `${label}${OutputFormatter.SECTION_SPACING}${content}${OutputFormatter.SECTION_SPACING}`;
    }
    /**
     * Cleans and normalizes text content
     * @param text - Raw text to clean
     * @returns Cleaned text
     */
    cleanText(text) {
        return text
            .trim()
            .replace(/\n{3,}/g, '\n\n') // Normalize excessive line breaks
            .replace(/^\s*[\-\*]\s*/gm, '• ') // Normalize bullet points first
            .replace(/\s{2,}/g, ' '); // Normalize excessive spaces after bullet normalization
    }
    /**
     * Adds structured formatting based on version type
     * @param text - Text to format
     * @param type - Version type ('serious' or 'fun')
     * @returns Formatted text
     */
    addStructuredFormatting(text, type) {
        // Ensure proper paragraph spacing
        let formatted = text.replace(/\n(?!\n)/g, '\n\n');
        // Add emphasis for key points in serious version
        if (type === 'serious') {
            formatted = formatted.replace(/\b(Therefore|However|Additionally|Furthermore|In conclusion)\b/g, '**$1**');
        }
        // Add playful formatting for fun version
        if (type === 'fun') {
            formatted = formatted.replace(/(!{1,3})/g, '$1 ✨');
        }
        return formatted;
    }
    /**
     * Gets appropriate emoji for scenario type
     * @param scenarioType - Type of scenario
     * @returns Emoji representation
     */
    getScenarioTypeEmoji(scenarioType) {
        const emojiMap = {
            personal: '👤',
            professional: '💼',
            historical: '📚',
            hypothetical: '🤔'
        };
        return emojiMap[scenarioType] || '❓';
    }
    /**
     * Capitalizes the first letter of a string
     * @param str - String to capitalize
     * @returns Capitalized string
     */
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    /**
     * Validates that both outcomes are present and meaningful
     * @param seriousOutcome - Serious outcome to validate
     * @param funOutcome - Fun outcome to validate
     * @returns True if both outcomes are valid
     */
    validateOutcomes(seriousOutcome, funOutcome) {
        const minLength = 10; // Minimum meaningful content length
        return (typeof seriousOutcome === 'string' &&
            typeof funOutcome === 'string' &&
            seriousOutcome.trim().length >= minLength &&
            funOutcome.trim().length >= minLength);
    }
}
exports.OutputFormatter = OutputFormatter;
OutputFormatter.SERIOUS_LABEL = '🎯 Serious Analysis';
OutputFormatter.FUN_LABEL = '🎭 Fun Interpretation';
OutputFormatter.SEPARATOR = '\n' + '─'.repeat(50) + '\n';
OutputFormatter.SECTION_SPACING = '\n\n';
//# sourceMappingURL=OutputFormatter.js.map