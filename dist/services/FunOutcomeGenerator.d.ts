import { ProcessedScenario } from '../models/interfaces';
/**
 * Interface for AI service integration
 */
export interface AIService {
    generateResponse(prompt: string): Promise<string>;
}
/**
 * FunOutcomeGenerator creates creative, entertaining interpretations
 * for "What if..." scenarios using AI integration
 */
export declare class FunOutcomeGenerator {
    private aiService;
    constructor(aiService: AIService);
    /**
     * Generates a fun, creative outcome analysis for a processed scenario
     * @param scenario - The processed scenario to analyze
     * @returns Promise resolving to humorous, entertaining analysis
     */
    generateFunOutcome(scenario: ProcessedScenario): Promise<string>;
    /**
     * Builds a creative prompt for fun outcome generation
     * @param scenario - The processed scenario
     * @returns Formatted prompt for AI service
     */
    private buildFunPrompt;
    /**
     * Filters content to ensure appropriateness
     * @param response - Raw AI response
     * @returns Filtered response with inappropriate content removed
     */
    private filterContent;
    /**
     * Formats the AI response into an entertaining, engaging output
     * @param response - Filtered AI response
     * @param scenario - Original processed scenario for context
     * @returns Formatted fun analysis
     */
    private formatFunResponse;
    /**
     * Generates a creative note based on scenario characteristics
     * @param scenario - The processed scenario
     * @returns Creative analysis note
     */
    private generateCreativeNote;
    /**
     * Enhances the formatting of the response for entertainment value
     * @param text - Text to format
     * @returns Enhanced formatted text with creative elements
     */
    private enhanceCreativeFormatting;
}
//# sourceMappingURL=FunOutcomeGenerator.d.ts.map