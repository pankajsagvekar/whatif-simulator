import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InputValidator } from '../InputValidator';
import { ScenarioProcessor } from '../ScenarioProcessor';
import { SeriousOutcomeGenerator, AIService } from '../SeriousOutcomeGenerator';
import { FunOutcomeGenerator } from '../FunOutcomeGenerator';
import { OutputFormatter } from '../OutputFormatter';
import { ProcessedScenario } from '../../models/interfaces';
import { WhatIfSimulatorError, ErrorType } from '../../utils/ErrorHandler';

// Mock AI Service for testing error scenarios
class ErrorMockAIService implements AIService {
  private errorType: string | null = null;
  private callCount = 0;
  private maxCalls = 0;

  setError(errorType: string, maxCalls: number = 1): void {
    this.errorType = errorType;
    this.maxCalls = maxCalls;
    this.callCount = 0;
  }

  clearError(): void {
    this.errorType = null;
    this.callCount = 0;
    this.maxCalls = 0;
  }

  async generateResponse(prompt: string): Promise<string> {
    this.callCount++;

    if (this.errorType && this.callCount <= this.maxCalls) {
      switch (this.errorType) {
        case 'timeout':
          throw new Error('Request timeout occurred');
        case 'rate_limit':
          throw new Error('Rate limit exceeded (429)');
        case 'network':
          throw new Error('Network connection failed');
        case 'invalid':
          throw new Error('Invalid request format');
        case 'short_response':
          return 'Too short';
        case 'generic_error':
          return 'Error occurred';
        default:
          throw new Error('Unknown AI service error');
      }
    }

    return 'This is a valid AI response that meets the minimum length requirements for proper analysis and formatting.';
  }
}

describe('Error Handling Integration Tests', () => {
  let inputValidator: InputValidator;
  let scenarioProcessor: ScenarioProcessor;
  let seriousGenerator: SeriousOutcomeGenerator;
  let funGenerator: FunOutcomeGenerator;
  let outputFormatter: OutputFormatter;
  let mockAIService: ErrorMockAIService;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    
    inputValidator = new InputValidator();
    scenarioProcessor = new ScenarioProcessor();
    mockAIService = new ErrorMockAIService();
    seriousGenerator = new SeriousOutcomeGenerator(mockAIService);
    funGenerator = new FunOutcomeGenerator(mockAIService);
    outputFormatter = new OutputFormatter();
  });

  describe('InputValidator Error Handling', () => {
    it('should handle sanitization errors gracefully', () => {
      // Test with problematic input that might cause sanitization issues
      const problematicInput = '\u0000\u0001\u0002What if I could fly?';
      
      const result = inputValidator.validateScenario(problematicInput);
      
      // Should either succeed with sanitized input or provide helpful error
      expect(result.isValid).toBeDefined();
      if (!result.isValid) {
        expect(result.errorMessage).toContain('try rephrasing');
      }
    });

    it('should handle non-string input gracefully', () => {
      const result = inputValidator.validateScenario(null as any);
      
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('Please provide a "What if..." question to explore.');
    });

    it('should provide fallback for content checking failures', () => {
      // Mock a scenario where content checking might fail
      const validator = new InputValidator();
      
      // Test with edge case input
      const edgeCaseInput = 'What if ' + 'a'.repeat(500) + '?';
      const result = validator.validateScenario(edgeCaseInput);
      
      expect(result.isValid).toBeDefined();
      if (!result.isValid) {
        expect(result.errorMessage).toBeDefined();
      }
    });
  });

  describe('ScenarioProcessor Error Handling', () => {
    it('should handle null/undefined input', () => {
      expect(() => scenarioProcessor.processScenario(null as any)).toThrow(WhatIfSimulatorError);
      expect(() => scenarioProcessor.processScenario(undefined as any)).toThrow(WhatIfSimulatorError);
    });

    it('should handle empty string input', () => {
      expect(() => scenarioProcessor.processScenario('')).toThrow(WhatIfSimulatorError);
      expect(() => scenarioProcessor.processScenario('   ')).toThrow(WhatIfSimulatorError);
    });

    it('should provide fallback processing for edge cases', () => {
      // Test with input that might cause processing issues
      const edgeCaseInput = '\n\t\r   What if...   \n\r\t';
      
      const result = scenarioProcessor.processScenario(edgeCaseInput);
      
      expect(result).toBeDefined();
      expect(result.originalText).toBeDefined();
      expect(result.scenarioType).toBeDefined();
      expect(result.keyElements).toBeDefined();
      expect(result.complexity).toBeDefined();
    });

    it('should handle processing errors with fallback', () => {
      // Create a scenario that might cause issues in processing
      const problematicScenario = 'What if ' + '🚀'.repeat(100) + ' happened?';
      
      const result = scenarioProcessor.processScenario(problematicScenario);
      
      expect(result).toBeDefined();
      expect(result.scenarioType).toBeDefined();
      expect(result.keyElements.actors).toBeInstanceOf(Array);
      expect(result.keyElements.actions).toBeInstanceOf(Array);
    });
  });

  describe('SeriousOutcomeGenerator Error Handling', () => {
    const testScenario: ProcessedScenario = {
      originalText: 'What if I could fly?',
      scenarioType: 'personal',
      keyElements: {
        actors: ['I'],
        actions: ['fly'],
        context: 'I could fly?'
      },
      complexity: 'simple'
    };

    it('should retry on timeout errors', async () => {
      mockAIService.setError('timeout', 2);
      
      const result = await seriousGenerator.generateSeriousOutcome(testScenario);
      
      expect(result).toContain('valid AI response');
    });

    it('should retry on network errors', async () => {
      mockAIService.setError('network', 1);
      
      const result = await seriousGenerator.generateSeriousOutcome(testScenario);
      
      expect(result).toContain('valid AI response');
    });

    it('should provide fallback for non-retryable errors', async () => {
      mockAIService.setError('invalid', 5); // More than max retries
      
      const result = await seriousGenerator.generateSeriousOutcome(testScenario);
      
      expect(result).toContain('Analysis Framework');
      expect(result).toContain('What if I could fly?');
      expect(result).toContain('immediate consequences');
    });

    it('should handle short AI responses with retry', async () => {
      mockAIService.setError('short_response', 1);
      
      const result = await seriousGenerator.generateSeriousOutcome(testScenario);
      
      expect(result).toContain('valid AI response');
    });

    it('should provide fallback after max retries', async () => {
      mockAIService.setError('timeout', 10); // More than max retries
      
      const result = await seriousGenerator.generateSeriousOutcome(testScenario);
      
      expect(result).toContain('Analysis Framework');
      expect(result).toContain('Suggested Analysis Approach');
    });
  });

  describe('FunOutcomeGenerator Error Handling', () => {
    const testScenario: ProcessedScenario = {
      originalText: 'What if robots took over?',
      scenarioType: 'hypothetical',
      keyElements: {
        actors: ['robots'],
        actions: ['took over'],
        context: 'robots took over?'
      },
      complexity: 'moderate'
    };

    it('should retry on rate limit errors', async () => {
      mockAIService.setError('rate_limit', 1);
      
      const result = await funGenerator.generateFunOutcome(testScenario);
      
      expect(result).toContain('valid AI response');
    });

    it('should provide creative fallback for failures', async () => {
      mockAIService.setError('invalid', 5);
      
      const result = await funGenerator.generateFunOutcome(testScenario);
      
      expect(result).toContain('Creative Prompt');
      expect(result).toContain('What if robots took over?');
      expect(result).toContain('cartoon world');
      expect(result).toContain('Imagination Starters');
    });

    it('should handle generic error responses', async () => {
      mockAIService.setError('generic_error', 1);
      
      const result = await funGenerator.generateFunOutcome(testScenario);
      
      expect(result).toContain('valid AI response');
    });
  });

  describe('OutputFormatter Error Handling', () => {
    const testScenario: ProcessedScenario = {
      originalText: 'What if time stopped?',
      scenarioType: 'hypothetical',
      keyElements: {
        actors: ['time'],
        actions: ['stopped'],
        context: 'time stopped?'
      },
      complexity: 'complex'
    };

    it('should handle invalid serious outcome', () => {
      expect(() => {
        outputFormatter.formatResults(
          '', // Invalid serious outcome
          'This is a valid fun outcome with sufficient length for testing purposes.',
          testScenario,
          1000
        );
      }).toThrow(WhatIfSimulatorError);
    });

    it('should handle invalid fun outcome', () => {
      expect(() => {
        outputFormatter.formatResults(
          'This is a valid serious outcome with sufficient length for testing purposes.',
          '', // Invalid fun outcome
          testScenario,
          1000
        );
      }).toThrow(WhatIfSimulatorError);
    });

    it('should handle null scenario gracefully', () => {
      expect(() => {
        outputFormatter.formatResults(
          'Valid serious outcome with sufficient length for testing.',
          'Valid fun outcome with sufficient length for testing.',
          null as any,
          1000
        );
      }).toThrow(WhatIfSimulatorError);
    });

    it('should handle negative processing time', () => {
      const result = outputFormatter.formatResults(
        'Valid serious outcome with sufficient length for testing.',
        'Valid fun outcome with sufficient length for testing.',
        testScenario,
        -500
      );
      
      expect(result.metadata.processingTime).toBe(0);
    });

    it('should provide fallback presentation for invalid formatted output', () => {
      const invalidOutput = {
        seriousVersion: '',
        funVersion: '',
        metadata: { processingTime: 1000, scenarioType: 'test' }
      };
      
      const result = outputFormatter.createPresentationOutput(invalidOutput);
      
      expect(result).toContain('Error');
      expect(result).toContain('Unable to format presentation');
      expect(result).toContain('Not available');
    });
  });

  describe('End-to-End Error Recovery', () => {
    it('should handle complete AI service failure gracefully', async () => {
      mockAIService.setError('timeout', 10); // Persistent failure
      
      const validationResult = inputValidator.validateScenario('What if I could teleport?');
      expect(validationResult.isValid).toBe(true);
      
      const processedScenario = scenarioProcessor.processScenario(validationResult.sanitizedInput);
      expect(processedScenario).toBeDefined();
      
      const seriousOutcome = await seriousGenerator.generateSeriousOutcome(processedScenario);
      const funOutcome = await funGenerator.generateFunOutcome(processedScenario);
      
      expect(seriousOutcome).toContain('Analysis Framework');
      expect(funOutcome).toContain('Creative Prompt');
      
      const formattedOutput = outputFormatter.formatResults(
        seriousOutcome,
        funOutcome,
        processedScenario,
        2000
      );
      
      expect(formattedOutput.seriousVersion).toBeDefined();
      expect(formattedOutput.funVersion).toBeDefined();
      
      const presentation = outputFormatter.createPresentationOutput(formattedOutput);
      expect(presentation).toContain('Serious Analysis');
      expect(presentation).toContain('Fun Interpretation');
    }, 10000);

    it('should handle partial failures with mixed success', async () => {
      // Serious generator fails, fun generator succeeds
      const seriousService = new ErrorMockAIService();
      const funService = new ErrorMockAIService();
      
      seriousService.setError('invalid', 10);
      // funService works normally
      
      const seriousGen = new SeriousOutcomeGenerator(seriousService);
      const funGen = new FunOutcomeGenerator(funService);
      
      const scenario: ProcessedScenario = {
        originalText: 'What if gravity reversed?',
        scenarioType: 'hypothetical',
        keyElements: {
          actors: ['gravity'],
          actions: ['reversed'],
          context: 'gravity reversed?'
        },
        complexity: 'complex'
      };
      
      const seriousResult = await seriousGen.generateSeriousOutcome(scenario);
      const funResult = await funGen.generateFunOutcome(scenario);
      
      expect(seriousResult).toContain('Analysis Framework'); // Fallback
      expect(funResult).toContain('valid AI response'); // Success
      
      const formatted = outputFormatter.formatResults(seriousResult, funResult, scenario, 1500);
      expect(formatted.seriousVersion).toBeDefined();
      expect(formatted.funVersion).toBeDefined();
    });
  });
});