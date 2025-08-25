import { FormattedOutput, ProcessedScenario } from '../models/interfaces.js';
import { ErrorHandler, WhatIfSimulatorError, ErrorType } from '../utils/ErrorHandler.js';

/**
 * OutputFormatter handles the structuring and presentation of dual outcomes
 * from the What If Simulator, ensuring clear distinction between serious and fun versions
 */
export class OutputFormatter {
  private static readonly SERIOUS_LABEL = '🎯 Serious Analysis';
  private static readonly FUN_LABEL = '🎭 Fun Interpretation';
  private static readonly SEPARATOR = '\n' + '─'.repeat(50) + '\n';
  private static readonly SECTION_SPACING = '\n\n';

  /**
   * Formats the dual outcomes into a structured, readable output
   * @param seriousOutcome - The realistic analysis result
   * @param funOutcome - The creative/humorous interpretation
   * @param scenario - The processed scenario for metadata
   * @param processingTime - Time taken to generate outcomes in milliseconds
   * @returns FormattedOutput with structured presentation
   */
  public formatResults(
    seriousOutcome: string,
    funOutcome: string,
    scenario: ProcessedScenario,
    processingTime: number
  ): FormattedOutput {
    try {
      // Validate inputs
      if (!this.validateOutcomes(seriousOutcome, funOutcome)) {
        throw new WhatIfSimulatorError(
          'Invalid outcomes provided for formatting',
          ErrorType.FORMATTING,
          undefined,
          false
        );
      }

      if (!scenario || !scenario.scenarioType) {
        throw new WhatIfSimulatorError(
          'Invalid scenario data provided for formatting',
          ErrorType.FORMATTING,
          undefined,
          false
        );
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
    } catch (error) {
      const context = 'output formatting';
      ErrorHandler.logError(error as Error, context);
      
      if (error instanceof WhatIfSimulatorError) {
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
  private createFallbackFormattedOutput(
    seriousOutcome: string,
    funOutcome: string,
    scenario: ProcessedScenario | null,
    processingTime: number
  ): FormattedOutput {
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
  public createPresentationOutput(formattedOutput: FormattedOutput): string {
    try {
      if (!formattedOutput || !formattedOutput.seriousVersion || !formattedOutput.funVersion) {
        throw new WhatIfSimulatorError(
          'Invalid formatted output provided for presentation',
          ErrorType.FORMATTING,
          undefined,
          false
        );
      }

      const header = this.createHeader(formattedOutput.metadata);
      const seriousSection = this.createSection(
        OutputFormatter.SERIOUS_LABEL,
        formattedOutput.seriousVersion
      );
      const funSection = this.createSection(
        OutputFormatter.FUN_LABEL,
        formattedOutput.funVersion
      );

      return [
        header,
        seriousSection,
        OutputFormatter.SEPARATOR,
        funSection
      ].join('');
    } catch (error) {
      const context = 'presentation output creation';
      ErrorHandler.logError(error as Error, context);
      
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
  private formatSeriousVersion(outcome: string): string {
    // Clean and structure the serious outcome
    const cleaned = this.cleanText(outcome);
    return this.addStructuredFormatting(cleaned, 'serious');
  }

  /**
   * Formats the fun outcome with engaging presentation
   * @param outcome - Raw fun outcome text
   * @returns Formatted fun version
   */
  private formatFunVersion(outcome: string): string {
    // Clean and structure the fun outcome
    const cleaned = this.cleanText(outcome);
    return this.addStructuredFormatting(cleaned, 'fun');
  }

  /**
   * Creates a header with metadata information
   * @param metadata - Processing metadata
   * @returns Formatted header string
   */
  private createHeader(metadata: { processingTime: number; scenarioType: string }): string {
    const typeEmoji = this.getScenarioTypeEmoji(metadata.scenarioType);
    return `${typeEmoji} Scenario Type: ${this.capitalizeFirst(metadata.scenarioType)} | ⏱️ Generated in ${metadata.processingTime}ms\n\n`;
  }

  /**
   * Creates a labeled section with consistent formatting
   * @param label - Section label
   * @param content - Section content
   * @returns Formatted section
   */
  private createSection(label: string, content: string): string {
    return `${label}${OutputFormatter.SECTION_SPACING}${content}${OutputFormatter.SECTION_SPACING}`;
  }

  /**
   * Cleans and normalizes text content
   * @param text - Raw text to clean
   * @returns Cleaned text
   */
  private cleanText(text: string): string {
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
  private addStructuredFormatting(text: string, type: 'serious' | 'fun'): string {
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
  private getScenarioTypeEmoji(scenarioType: string): string {
    const emojiMap: Record<string, string> = {
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
  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Validates that both outcomes are present and meaningful
   * @param seriousOutcome - Serious outcome to validate
   * @param funOutcome - Fun outcome to validate
   * @returns True if both outcomes are valid
   */
  public validateOutcomes(seriousOutcome: string, funOutcome: string): boolean {
    const minLength = 10; // Minimum meaningful content length
    
    return (
      typeof seriousOutcome === 'string' &&
      typeof funOutcome === 'string' &&
      seriousOutcome.trim().length >= minLength &&
      funOutcome.trim().length >= minLength
    );
  }
}