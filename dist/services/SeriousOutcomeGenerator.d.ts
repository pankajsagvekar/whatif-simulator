import { ProcessedScenario } from '../models/interfaces';
/**
 * Interface for AI service integration
 */
export interface AIService {
    generateResponse(prompt: string): Promise<string>;
}
/**
 * SeriousOutcomeGenerator creates realistic, logical consequence analysis
 * for "What if..." scenarios using AI integration
 */
export declare class SeriousOutcomeGenerator {
    private aiService;
    constructor(aiService: AIService);
    /**
     * Generates a serious, realistic outcome analysis for a processed scenario
     * @param scenario - The processed scenario to analyze
     * @returns Promise resolving to structured, informative analysis
     */
    generateSeriousOutcome(scenario: ProcessedScenario): Promise<string>;
    /**
     * Builds a structured prompt for serious outcome generation
     * @param scenario - The processed scenario
     * @returns Formatted prompt for AI service
     */
    private buildSeriousPrompt;
    /**
     * Formats the AI response into a structured, informative output
     * @param response - Raw AI response
     * @param scenario - Original processed scenario for context
     * @returns Formatted serious analysis
     */
    private formatSeriousResponse;
    /**
     * Generates a contextual note based on scenario characteristics
     * @param scenario - The processed scenario
     * @returns Contextual analysis note
     */
    private generateContextualNote;
    /**
     * Improves the formatting of the response for better readability
     * @param text - Text to format
     * @returns Improved formatted text
     */
    private improveFormatting;
}
//# sourceMappingURL=SeriousOutcomeGenerator.d.ts.map