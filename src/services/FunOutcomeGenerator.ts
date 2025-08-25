import { ProcessedScenario } from '../models/interfaces';
import { ErrorHandler, WhatIfSimulatorError, ErrorType } from '../utils/ErrorHandler';

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
export class FunOutcomeGenerator {
  private aiService: AIService;

  constructor(aiService: AIService) {
    this.aiService = aiService;
  }

  /**
   * Generates a fun, creative outcome analysis for a processed scenario
   * @param scenario - The processed scenario to analyze
   * @returns Promise resolving to humorous, entertaining analysis
   */
  async generateFunOutcome(scenario: ProcessedScenario): Promise<string> {
    const context = `fun outcome for "${scenario.originalText}"`;
    
    try {
      return await ErrorHandler.withRetry(async () => {
        const prompt = this.buildFunPrompt(scenario);
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
        
        const filteredResponse = this.filterContent(response);
        return this.formatFunResponse(filteredResponse, scenario);
      });
    } catch (error) {
      ErrorHandler.logError(error as Error, context);
      
      // If it's a WhatIfSimulatorError and not retryable, provide fallback
      if (error instanceof WhatIfSimulatorError && !error.retryable) {
        return ErrorHandler.createFallbackContent('fun', scenario.originalText, error.message);
      }
      
      // For other errors, try to provide fallback content
      const fallbackReason = error instanceof Error ? error.message : 'Unknown error occurred';
      return ErrorHandler.createFallbackContent('fun', scenario.originalText, fallbackReason);
    }
  }

  /**
   * Builds a creative prompt for fun outcome generation
   * @param scenario - The processed scenario
   * @returns Formatted prompt for AI service
   */
  private buildFunPrompt(scenario: ProcessedScenario): string {
    const { originalText, scenarioType, keyElements, complexity } = scenario;
    
    let prompt = `You are a creative storyteller with a humorous and imaginative perspective. `;
    prompt += `Create an entertaining, exaggerated, or surreal interpretation that is fun and engaging while remaining appropriate. `;
    
    // Add scenario type specific creative context
    switch (scenarioType) {
      case 'personal':
        prompt += `Transform this personal scenario into a whimsical adventure with unexpected twists and delightful consequences. `;
        break;
      case 'professional':
        prompt += `Reimagine this professional scenario with absurd office dynamics, quirky characters, and hilarious workplace situations. `;
        break;
      case 'historical':
        prompt += `Retell this historical scenario with anachronistic elements, time-traveling mishaps, or alternate history comedy. `;
        break;
      case 'hypothetical':
        prompt += `Explore this hypothetical scenario with magical realism, cartoon physics, or wonderfully impossible outcomes. `;
        break;
    }

    // Add complexity-specific creative instructions
    switch (complexity) {
      case 'simple':
        prompt += `Keep it playful and straightforward with one main comedic twist or exaggeration. `;
        break;
      case 'moderate':
        prompt += `Develop multiple layers of humor with interconnected funny consequences and character reactions. `;
        break;
      case 'complex':
        prompt += `Create an elaborate comedic narrative with multiple plot threads, recurring gags, and escalating absurdity. `;
        break;
    }

    prompt += `\n\nScenario: "${originalText}"\n\n`;
    
    // Add key elements context for creative interpretation
    if (keyElements.actors.length > 0) {
      prompt += `Transform these characters: ${keyElements.actors.join(', ')}\n`;
    }
    if (keyElements.actions.length > 0) {
      prompt += `Make these actions hilariously unexpected: ${keyElements.actions.join(', ')}\n`;
    }

    prompt += `\nCreate a fun interpretation that:\n`;
    prompt += `1. Uses humor, exaggeration, or surreal elements\n`;
    prompt += `2. Maintains creativity while staying appropriate and family-friendly\n`;
    prompt += `3. Includes unexpected but delightful consequences\n`;
    prompt += `4. Uses vivid, entertaining language and imagery\n`;
    prompt += `5. Brings joy and laughter to the reader\n\n`;
    
    prompt += `Avoid offensive content, inappropriate themes, or harmful stereotypes. `;
    prompt += `Focus on clever wordplay, absurd situations, and positive humor that entertains without offending.`;

    return prompt;
  }

  /**
   * Filters content to ensure appropriateness
   * @param response - Raw AI response
   * @returns Filtered response with inappropriate content removed
   */
  private filterContent(response: string): string {
    let filtered = response.trim();
    
    // List of inappropriate content patterns to filter
    const inappropriatePatterns = [
      /\b(hate|violence|discrimination|offensive)\b/gi,
      /\b(inappropriate|harmful|dangerous)\b/gi,
      // Add more patterns as needed for content filtering
    ];

    // Check for inappropriate content
    for (const pattern of inappropriatePatterns) {
      if (pattern.test(filtered)) {
        // Replace with more appropriate alternatives
        filtered = filtered.replace(pattern, (match) => {
          switch (match.toLowerCase()) {
            case 'hate': return 'dislike';
            case 'violence': return 'chaos';
            case 'discrimination': return 'unfairness';
            case 'offensive': return 'silly';
            case 'inappropriate': return 'unusual';
            case 'harmful': return 'mischievous';
            case 'dangerous': return 'adventurous';
            default: return 'amusing';
          }
        });
      }
    }

    return filtered;
  }

  /**
   * Formats the AI response into an entertaining, engaging output
   * @param response - Filtered AI response
   * @param scenario - Original processed scenario for context
   * @returns Formatted fun analysis
   */
  private formatFunResponse(response: string, scenario: ProcessedScenario): string {
    // Clean up the response
    let formatted = response.trim();
    
    // Ensure the response starts with a clear header if it doesn't already
    if (!formatted.toLowerCase().includes('fun') && !formatted.toLowerCase().includes('creative') && !formatted.toLowerCase().includes('imagine')) {
      formatted = `**Creative Interpretation:**\n\n${formatted}`;
    }
    
    // Add creative flourishes if the response is too brief
    if (formatted.length < 100) {
      const creativeNote = this.generateCreativeNote(scenario);
      formatted += `\n\n${creativeNote}`;
    }
    
    // Enhance formatting for entertainment value
    formatted = this.enhanceCreativeFormatting(formatted);
    
    return formatted;
  }

  /**
   * Generates a creative note based on scenario characteristics
   * @param scenario - The processed scenario
   * @returns Creative analysis note
   */
  private generateCreativeNote(scenario: ProcessedScenario): string {
    const { scenarioType, complexity } = scenario;
    
    let note = `**Plot Twist:** `;
    
    switch (scenarioType) {
      case 'personal':
        note += `Personal adventures often lead to discovering hidden superpowers or meeting talking animals who become unlikely advisors!`;
        break;
      case 'professional':
        note += `Office scenarios frequently involve secret underground lairs beneath the break room or coworkers who are actually time-traveling consultants!`;
        break;
      case 'historical':
        note += `Historical events get much more interesting when you add dinosaurs, alien visitors, or interdimensional pizza delivery!`;
        break;
      case 'hypothetical':
        note += `Hypothetical situations are perfect for introducing magical elements, cartoon physics, or universes where everything is made of cheese!`;
        break;
    }
    
    if (complexity === 'complex') {
      note += ` The complexity opens up possibilities for multiple parallel dimensions where each choice creates increasingly hilarious alternatives!`;
    }
    
    return note;
  }

  /**
   * Enhances the formatting of the response for entertainment value
   * @param text - Text to format
   * @returns Enhanced formatted text with creative elements
   */
  private enhanceCreativeFormatting(text: string): string {
    let formatted = text;
    
    // Ensure proper paragraph spacing
    formatted = formatted.replace(/\n{3,}/g, '\n\n');
    
    // Add creative bullet points for lists
    formatted = formatted.replace(/^(\d+\.\s)/gm, '🎭 ');
    formatted = formatted.replace(/^(•\s)/gm, '✨ ');
    
    // Add emphasis to exciting words
    const excitingWords = ['amazing', 'incredible', 'fantastic', 'wonderful', 'hilarious', 'absurd', 'magical', 'extraordinary'];
    excitingWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      formatted = formatted.replace(regex, `**${word}**`);
    });
    
    // Ensure sentences end with appropriate punctuation (more exclamation points for fun)
    formatted = formatted.replace(/([^.!?])\n/g, '$1!\n');
    
    return formatted.trim();
  }
}