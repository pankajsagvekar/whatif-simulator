import { ProcessedScenario } from '../models/interfaces';
import { ErrorHandler, WhatIfSimulatorError, ErrorType } from '../utils/ErrorHandler';

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
export class SeriousOutcomeGenerator {
  private aiService: AIService;

  constructor(aiService: AIService) {
    this.aiService = aiService;
  }

  /**
   * Generates a serious, realistic outcome analysis for a processed scenario
   * @param scenario - The processed scenario to analyze
   * @returns Promise resolving to structured, informative analysis
   */
  async generateSeriousOutcome(scenario: ProcessedScenario): Promise<string> {
    const context = `serious outcome for "${scenario.originalText}"`;
    
    try {
      return await ErrorHandler.withRetry(async () => {
        const prompt = this.buildSeriousPrompt(scenario);
        const response = await this.aiService.generateResponse(prompt);
        
        // Validate response quality
        if (!ErrorHandler.validateContent(response)) {
          throw new WhatIfSimulatorError(
            'AI response was too short or invalid',
            ErrorType.AI_GENERATION,
            undefined,
            true
          );
        }
        
        return this.formatSeriousResponse(response, scenario);
      });
    } catch (error) {
      ErrorHandler.logError(error as Error, context);
      
      // If it's a WhatIfSimulatorError and not retryable, provide fallback
      if (error instanceof WhatIfSimulatorError && !error.retryable) {
        return ErrorHandler.createFallbackContent('serious', scenario.originalText, error.message);
      }
      
      // For other errors, try to provide fallback content
      const fallbackReason = error instanceof Error ? error.message : 'Unknown error occurred';
      return ErrorHandler.createFallbackContent('serious', scenario.originalText, fallbackReason);
    }
  }

  /**
   * Builds a structured prompt for serious outcome generation
   * @param scenario - The processed scenario
   * @returns Formatted prompt for AI service
   */
  private buildSeriousPrompt(scenario: ProcessedScenario): string {
    const { originalText, scenarioType, keyElements, complexity } = scenario;
    
    let prompt = `You are a realistic analyst providing logical cause-and-effect analysis. `;
    
    // Add scenario type specific context
    switch (scenarioType) {
      case 'personal':
        prompt += `Analyze this personal scenario with consideration for individual psychology, relationships, and personal circumstances. `;
        break;
      case 'professional':
        prompt += `Analyze this professional scenario considering business dynamics, economic factors, and workplace relationships. `;
        break;
      case 'historical':
        prompt += `Analyze this historical scenario considering the social, political, and cultural context of the time period. `;
        break;
      case 'hypothetical':
        prompt += `Analyze this hypothetical scenario using logical reasoning and real-world principles. `;
        break;
    }

    // Add complexity-specific instructions
    switch (complexity) {
      case 'simple':
        prompt += `Provide a clear, direct analysis focusing on the most likely immediate consequences. `;
        break;
      case 'moderate':
        prompt += `Provide a structured analysis covering both immediate and secondary effects. `;
        break;
      case 'complex':
        prompt += `Provide a comprehensive analysis examining multiple interconnected consequences and long-term implications. `;
        break;
    }

    prompt += `\n\nScenario: "${originalText}"\n\n`;
    
    // Add key elements context
    if (keyElements.actors.length > 0) {
      prompt += `Key actors involved: ${keyElements.actors.join(', ')}\n`;
    }
    if (keyElements.actions.length > 0) {
      prompt += `Key actions/changes: ${keyElements.actions.join(', ')}\n`;
    }

    prompt += `\nProvide a realistic analysis that:\n`;
    prompt += `1. Considers practical constraints and real-world factors\n`;
    prompt += `2. Follows logical cause-and-effect reasoning\n`;
    prompt += `3. Addresses potential challenges and obstacles\n`;
    prompt += `4. Discusses likely outcomes and their probability\n`;
    prompt += `5. Maintains an objective, analytical tone\n\n`;
    
    prompt += `Structure your response with clear sections and avoid speculation beyond reasonable logical inference. `;
    prompt += `Focus on actionable insights and realistic consequences.`;

    return prompt;
  }

  /**
   * Formats the AI response into a structured, informative output
   * @param response - Raw AI response
   * @param scenario - Original processed scenario for context
   * @returns Formatted serious analysis
   */
  private formatSeriousResponse(response: string, scenario: ProcessedScenario): string {
    // Clean up the response
    let formatted = response.trim();
    
    // Ensure the response starts with a clear header if it doesn't already
    if (!formatted.toLowerCase().includes('analysis') && !formatted.toLowerCase().includes('outcome')) {
      formatted = `**Realistic Analysis:**\n\n${formatted}`;
    }
    
    // Add scenario context if the response is too brief
    if (formatted.length < 100) {
      const contextNote = this.generateContextualNote(scenario);
      formatted += `\n\n${contextNote}`;
    }
    
    // Ensure proper formatting and readability
    formatted = this.improveFormatting(formatted);
    
    return formatted;
  }

  /**
   * Generates a contextual note based on scenario characteristics
   * @param scenario - The processed scenario
   * @returns Contextual analysis note
   */
  private generateContextualNote(scenario: ProcessedScenario): string {
    const { scenarioType, complexity } = scenario;
    
    let note = `**Additional Considerations:** `;
    
    switch (scenarioType) {
      case 'personal':
        note += `Personal scenarios often involve emotional factors and individual circumstances that can significantly influence outcomes.`;
        break;
      case 'professional':
        note += `Professional scenarios typically involve multiple stakeholders and organizational dynamics that create complex interdependencies.`;
        break;
      case 'historical':
        note += `Historical scenarios must be understood within their specific time period and cultural context.`;
        break;
      case 'hypothetical':
        note += `Hypothetical scenarios require careful consideration of realistic constraints and logical progression.`;
        break;
    }
    
    if (complexity === 'complex') {
      note += ` The complexity of this scenario suggests multiple interconnected effects that may unfold over time.`;
    }
    
    return note;
  }

  /**
   * Improves the formatting of the response for better readability
   * @param text - Text to format
   * @returns Improved formatted text
   */
  private improveFormatting(text: string): string {
    let formatted = text;
    
    // Ensure proper paragraph spacing
    formatted = formatted.replace(/\n{3,}/g, '\n\n');
    
    // Add bullet points for lists if they're not already formatted
    formatted = formatted.replace(/^(\d+\.\s)/gm, '• ');
    
    // Ensure sentences end with proper punctuation
    formatted = formatted.replace(/([^.!?])\n/g, '$1.\n');
    
    return formatted.trim();
  }
}