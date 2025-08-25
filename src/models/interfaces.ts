/**
 * Result of input validation process
 */
export interface ValidationResult {
  isValid: boolean;
  sanitizedInput: string;
  errorMessage?: string;
}

/**
 * Processed scenario with structured analysis
 */
export interface ProcessedScenario {
  originalText: string;
  scenarioType: 'personal' | 'professional' | 'historical' | 'hypothetical';
  keyElements: {
    actors: string[];
    actions: string[];
    context: string;
  };
  complexity: 'simple' | 'moderate' | 'complex';
}

/**
 * Formatted output containing both serious and fun versions
 */
export interface FormattedOutput {
  seriousVersion: string;
  funVersion: string;
  metadata: {
    processingTime: number;
    scenarioType: string;
  };
}