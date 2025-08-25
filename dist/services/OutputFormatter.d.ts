import { FormattedOutput, ProcessedScenario } from '../models/interfaces.js';
/**
 * OutputFormatter handles the structuring and presentation of dual outcomes
 * from the What If Simulator, ensuring clear distinction between serious and fun versions
 */
export declare class OutputFormatter {
    private static readonly SERIOUS_LABEL;
    private static readonly FUN_LABEL;
    private static readonly SEPARATOR;
    private static readonly SECTION_SPACING;
    /**
     * Formats the dual outcomes into a structured, readable output
     * @param seriousOutcome - The realistic analysis result
     * @param funOutcome - The creative/humorous interpretation
     * @param scenario - The processed scenario for metadata
     * @param processingTime - Time taken to generate outcomes in milliseconds
     * @returns FormattedOutput with structured presentation
     */
    formatResults(seriousOutcome: string, funOutcome: string, scenario: ProcessedScenario, processingTime: number): FormattedOutput;
    /**
     * Creates fallback formatted output when normal formatting fails
     * @param seriousOutcome - The serious outcome (may be invalid)
     * @param funOutcome - The fun outcome (may be invalid)
     * @param scenario - The scenario (may be invalid)
     * @param processingTime - Processing time
     * @returns Basic FormattedOutput
     */
    private createFallbackFormattedOutput;
    /**
     * Creates a complete presentation combining both versions with clear separation
     * @param formattedOutput - The formatted output object
     * @returns Complete formatted string ready for presentation
     */
    createPresentationOutput(formattedOutput: FormattedOutput): string;
    /**
     * Formats the serious outcome with structured presentation
     * @param outcome - Raw serious outcome text
     * @returns Formatted serious version
     */
    private formatSeriousVersion;
    /**
     * Formats the fun outcome with engaging presentation
     * @param outcome - Raw fun outcome text
     * @returns Formatted fun version
     */
    private formatFunVersion;
    /**
     * Creates a header with metadata information
     * @param metadata - Processing metadata
     * @returns Formatted header string
     */
    private createHeader;
    /**
     * Creates a labeled section with consistent formatting
     * @param label - Section label
     * @param content - Section content
     * @returns Formatted section
     */
    private createSection;
    /**
     * Cleans and normalizes text content
     * @param text - Raw text to clean
     * @returns Cleaned text
     */
    private cleanText;
    /**
     * Adds structured formatting based on version type
     * @param text - Text to format
     * @param type - Version type ('serious' or 'fun')
     * @returns Formatted text
     */
    private addStructuredFormatting;
    /**
     * Gets appropriate emoji for scenario type
     * @param scenarioType - Type of scenario
     * @returns Emoji representation
     */
    private getScenarioTypeEmoji;
    /**
     * Capitalizes the first letter of a string
     * @param str - String to capitalize
     * @returns Capitalized string
     */
    private capitalizeFirst;
    /**
     * Validates that both outcomes are present and meaningful
     * @param seriousOutcome - Serious outcome to validate
     * @param funOutcome - Fun outcome to validate
     * @returns True if both outcomes are valid
     */
    validateOutcomes(seriousOutcome: string, funOutcome: string): boolean;
}
//# sourceMappingURL=OutputFormatter.d.ts.map