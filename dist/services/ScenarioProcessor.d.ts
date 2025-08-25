import { ProcessedScenario } from '../models/interfaces';
/**
 * ScenarioProcessor analyzes and structures "What if..." scenarios
 * for further processing by outcome generators
 */
export declare class ScenarioProcessor {
    /**
     * Processes a scenario to extract structure and context
     * @param scenario - The sanitized scenario text to process
     * @returns ProcessedScenario with analyzed structure
     */
    processScenario(scenario: string): ProcessedScenario;
    /**
     * Creates a fallback processed scenario when normal processing fails
     * @param scenario - The original scenario text
     * @returns Basic ProcessedScenario with minimal analysis
     */
    private createFallbackProcessedScenario;
    /**
     * Identifies the type of scenario based on content analysis
     * @param scenario - The scenario text to analyze
     * @returns The identified scenario type
     */
    private identifyScenarioType;
    /**
     * Extracts key elements from the scenario text
     * @param scenario - The scenario text to analyze
     * @returns Object containing actors, actions, and context
     */
    private extractKeyElements;
    /**
     * Extracts potential actors/entities from the scenario
     * @param scenario - The scenario text
     * @returns Array of identified actors
     */
    private extractActors;
    /**
     * Extracts key actions from the scenario
     * @param scenario - The scenario text
     * @returns Array of identified actions
     */
    private extractActions;
    /**
     * Extracts contextual information from the scenario
     * @param scenario - The scenario text
     * @returns Contextual summary
     */
    private extractContext;
    /**
     * Assesses the complexity of the scenario
     * @param scenario - The scenario text
     * @param keyElements - Extracted key elements
     * @returns Complexity level
     */
    private assessComplexity;
}
//# sourceMappingURL=ScenarioProcessor.d.ts.map