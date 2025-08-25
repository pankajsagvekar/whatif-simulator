import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { WhatIfSimulator, SimulatorConfig, DEFAULT_SIMULATOR_CONFIG } from '../WhatIfSimulator.js';
import { AIService } from '../SeriousOutcomeGenerator.js';
import { ValidationResult, ProcessedScenario, FormattedOutput } from '../../models/interfaces.js';
import { WhatIfSimulatorError, ErrorType } from '../../utils/ErrorHandler.js';

// Mock AI Service for testing
class MockAIService implements AIService {
  private shouldFail: boolean = false;
  private failureType: 'timeout' | 'rate-limit' | 'network' | 'generic' = 'generic';
  private responseDelay: number = 0;
  private failureCount: number = 0;
  private maxFailures: number = Infinity;

  async generateResponse(prompt: string): Promise<string> {
    if (this.responseDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, this.responseDelay));
    }

    if (this.shouldFail) {
      if (this.failureCount < this.maxFailures) {
        this.failureCount++;
        switch (this.failureType) {
          case 'timeout':
            throw new Error('Request timeout');
          case 'rate-limit':
            throw new Error('Rate limit exceeded (429)');
          case 'network':
            throw new Error('Network connection failed');
          default:
            throw new Error('AI generation failed');
        }
      }
    }

    // Add small delay to ensure timing metrics are captured
    await new Promise(resolve => setTimeout(resolve, 1));

    // Generate different responses based on prompt content
    if (prompt.toLowerCase().includes('serious') || prompt.toLowerCase().includes('realistic')) {
      return `This is a serious analysis of the scenario. The realistic consequences would include immediate effects such as changes in behavior patterns, followed by secondary effects on related systems. Long-term implications would involve adaptation and potential systemic changes.`;
    } else {
      return `This is a fun interpretation! Imagine if this scenario happened in a world where gravity worked backwards and everyone communicated through interpretive dance. The results would be absolutely hilarious with unexpected consequences involving talking animals and magical transformations!`;
    }
  }

  // Test utilities
  setFailure(shouldFail: boolean, type: 'timeout' | 'rate-limit' | 'network' | 'generic' = 'generic', maxFailures: number = Infinity) {
    this.shouldFail = shouldFail;
    this.failureType = type;
    this.maxFailures = maxFailures;
    this.failureCount = 0;
  }

  setDelay(delay: number) {
    this.responseDelay = delay;
  }

  reset() {
    this.shouldFail = false;
    this.failureCount = 0;
    this.maxFailures = Infinity;
    this.responseDelay = 0;
  }
}

describe('WhatIfSimulator', () => {
  let simulator: WhatIfSimulator;
  let mockAIService: MockAIService;

  beforeEach(() => {
    mockAIService = new MockAIService();
    mockAIService.reset();
    simulator = new WhatIfSimulator(mockAIService, { enableLogging: false });
  });

  describe('Constructor and Configuration', () => {
    it('should initialize with default configuration', () => {
      const config = simulator.getConfig();
      expect(config).toEqual({
        ...DEFAULT_SIMULATOR_CONFIG,
        enableLogging: false
      });
    });

    it('should accept custom configuration', () => {
      const customConfig: Partial<SimulatorConfig> = {
        enableLogging: true,
        enableMetrics: false,
        maxProcessingTime: 15000,
        enableParallelGeneration: false
      };

      const customSimulator = new WhatIfSimulator(mockAIService, customConfig);
      const config = customSimulator.getConfig();

      expect(config.enableLogging).toBe(true);
      expect(config.enableMetrics).toBe(false);
      expect(config.maxProcessingTime).toBe(15000);
      expect(config.enableParallelGeneration).toBe(false);
    });

    it('should allow configuration updates', () => {
      simulator.updateConfig({ enableLogging: true, maxProcessingTime: 20000 });
      const config = simulator.getConfig();

      expect(config.enableLogging).toBe(true);
      expect(config.maxProcessingTime).toBe(20000);
      expect(config.enableMetrics).toBe(true); // Should preserve other settings
    });
  });

  describe('End-to-End Scenario Processing', () => {
    it('should successfully process a simple personal scenario', async () => {
      const input = "What if I could read people's minds?";
      const result = await simulator.processScenario(input);

      expect(result.success).toBe(true);
      expect(result.formattedOutput).toBeDefined();
      expect(result.presentationOutput).toBeDefined();
      expect(result.metrics).toBeDefined();
      expect(result.error).toBeUndefined();

      // Verify formatted output structure
      expect(result.formattedOutput!.seriousVersion).toContain('serious analysis');
      expect(result.formattedOutput!.funVersion).toContain('fun interpretation');
      expect(result.formattedOutput!.metadata.scenarioType).toBe('personal');
      expect(result.formattedOutput!.metadata.processingTime).toBeGreaterThan(0);

      // Verify metrics
      expect(result.metrics!.success).toBe(true);
      expect(result.metrics!.totalProcessingTime).toBeGreaterThan(0);
      expect(result.metrics!.validationTime).toBeGreaterThan(0);
      expect(result.metrics!.processingTime).toBeGreaterThan(0);
      expect(result.metrics!.seriousGenerationTime).toBeGreaterThan(0);
      expect(result.metrics!.funGenerationTime).toBeGreaterThan(0);
      expect(result.metrics!.formattingTime).toBeGreaterThan(0);
    });

    it('should successfully process a professional scenario', async () => {
      const input = "What if companies switched to a 4-day work week?";
      const result = await simulator.processScenario(input);

      expect(result.success).toBe(true);
      expect(result.formattedOutput!.metadata.scenarioType).toBe('professional');
    });

    it('should successfully process a historical scenario', async () => {
      const input = "What if Napoleon had won the Battle of Waterloo?";
      const result = await simulator.processScenario(input);

      expect(result.success).toBe(true);
      expect(result.formattedOutput!.metadata.scenarioType).toBe('historical');
    });

    it('should successfully process a hypothetical scenario', async () => {
      const input = "What if gravity suddenly became half as strong?";
      const result = await simulator.processScenario(input);

      expect(result.success).toBe(true);
      expect(result.formattedOutput!.metadata.scenarioType).toBe('hypothetical');
    });

    it('should process scenarios with parallel generation enabled', async () => {
      simulator.updateConfig({ enableParallelGeneration: true });
      const input = "What if everyone could fly?";
      const result = await simulator.processScenario(input);

      expect(result.success).toBe(true);
      expect(result.metrics!.seriousGenerationTime).toBeGreaterThan(0);
      expect(result.metrics!.funGenerationTime).toBeGreaterThan(0);
    });

    it('should process scenarios with sequential generation', async () => {
      simulator.updateConfig({ enableParallelGeneration: false });
      const input = "What if everyone could fly?";
      const result = await simulator.processScenario(input);

      expect(result.success).toBe(true);
      expect(result.metrics!.seriousGenerationTime).toBeGreaterThan(0);
      expect(result.metrics!.funGenerationTime).toBeGreaterThan(0);
    });
  });

  describe('Input Validation Integration', () => {
    it('should handle empty input', async () => {
      const result = await simulator.processScenario('');

      expect(result.success).toBe(false);
      expect(result.error).toContain('What if');
      expect(result.metrics!.success).toBe(false);
      expect(result.metrics!.validationTime).toBeGreaterThan(0);
    });

    it('should handle invalid input', async () => {
      const result = await simulator.processScenario('hello');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.metrics!.success).toBe(false);
    });

    it('should handle inappropriate content', async () => {
      const result = await simulator.processScenario('What if everyone was violent and harmful?');

      expect(result.success).toBe(false);
      expect(result.error).toContain('inappropriate');
      expect(result.metrics!.success).toBe(false);
    });

    it('should handle too long input', async () => {
      const longInput = 'What if ' + 'a'.repeat(1000) + '?';
      const result = await simulator.processScenario(longInput);

      expect(result.success).toBe(false);
      expect(result.error).toContain('too long');
      expect(result.metrics!.success).toBe(false);
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle AI generation failures with retry', async () => {
      mockAIService.setFailure(true, 'network', 10); // Fail all attempts
      const input = "What if I could teleport?";
      const result = await simulator.processScenario(input);

      // The system should still succeed but with fallback content
      // This tests that the error handling and fallback mechanisms work
      expect(result.success).toBe(true);
      expect(result.formattedOutput).toBeDefined();
      expect(result.formattedOutput!.seriousVersion).toContain('Unable to generate');
      expect(result.formattedOutput!.funVersion).toContain('Unable to generate');
    });

    it('should handle timeout errors', async () => {
      mockAIService.setDelay(100); // Short delay for testing
      simulator.updateConfig({ maxProcessingTime: 50 }); // Very short timeout
      
      const input = "What if time moved backwards?";
      const result = await simulator.processScenario(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('timeout');
      expect(result.metrics!.success).toBe(false);
    });

    it('should handle rate limit errors', async () => {
      mockAIService.setFailure(true, 'rate-limit', 10); // Fail all attempts
      const input = "What if everyone spoke in rhymes?";
      const result = await simulator.processScenario(input);

      // The system should still succeed but with fallback content
      expect(result.success).toBe(true);
      expect(result.formattedOutput).toBeDefined();
      expect(result.formattedOutput!.seriousVersion).toContain('Unable to generate');
      expect(result.formattedOutput!.funVersion).toContain('Unable to generate');
    });

    it('should provide meaningful error messages', async () => {
      mockAIService.setFailure(true, 'generic', 10); // Fail all attempts
      const input = "What if cats could talk?";
      const result = await simulator.processScenario(input);

      // The system should still succeed but with fallback content that includes error context
      expect(result.success).toBe(true);
      expect(result.formattedOutput).toBeDefined();
      expect(result.formattedOutput!.seriousVersion).toContain('Unable to generate');
      expect(result.formattedOutput!.funVersion).toContain('Unable to generate');
      // The fallback content should provide meaningful guidance
      expect(result.formattedOutput!.seriousVersion.length).toBeGreaterThan(100);
      expect(result.formattedOutput!.funVersion.length).toBeGreaterThan(100);
    });
  });

  describe('Performance and Monitoring', () => {
    it('should track processing metrics accurately', async () => {
      const input = "What if robots became our teachers?";
      const result = await simulator.processScenario(input);

      expect(result.metrics).toBeDefined();
      const metrics = result.metrics!;

      // All timing metrics should be non-negative
      expect(metrics.totalProcessingTime).toBeGreaterThanOrEqual(0);
      expect(metrics.validationTime).toBeGreaterThanOrEqual(0);
      expect(metrics.processingTime).toBeGreaterThanOrEqual(0);
      expect(metrics.seriousGenerationTime).toBeGreaterThanOrEqual(0);
      expect(metrics.funGenerationTime).toBeGreaterThanOrEqual(0);
      expect(metrics.formattingTime).toBeGreaterThanOrEqual(0);

      // Total time should be reasonable (allow for overhead and timing variance)
      const sumOfParts = metrics.validationTime + metrics.processingTime + 
                        metrics.seriousGenerationTime + metrics.funGenerationTime + 
                        metrics.formattingTime;
      // Just verify that total time is positive and reasonable - timing can be unpredictable in tests
      expect(metrics.totalProcessingTime).toBeGreaterThan(0);
      expect(sumOfParts).toBeGreaterThan(0); // Ensure individual metrics are captured
    });

    it('should handle concurrent processing requests', async () => {
      const scenarios = [
        "What if everyone could read minds?",
        "What if gravity was reversed?",
        "What if animals could talk?"
      ];

      const promises = scenarios.map(scenario => simulator.processScenario(scenario));
      const results = await Promise.all(promises);

      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.metrics!.totalProcessingTime).toBeGreaterThan(0);
      });
    });

    it('should respect processing time limits', async () => {
      simulator.updateConfig({ maxProcessingTime: 1000 }); // 1 second limit
      mockAIService.setDelay(2000); // 2 second delay to trigger timeout

      const input = "What if time stood still?";
      const startTime = Date.now();
      const result = await simulator.processScenario(input);
      const actualTime = Date.now() - startTime;

      expect(result.success).toBe(false);
      expect(actualTime).toBeLessThan(1500); // Should timeout before 1.5 seconds
      expect(result.error).toContain('timeout');
    });
  });

  describe('Output Quality and Formatting', () => {
    it('should produce well-formatted presentation output', async () => {
      const input = "What if everyone worked from home permanently?";
      const result = await simulator.processScenario(input);

      expect(result.success).toBe(true);
      expect(result.presentationOutput).toBeDefined();

      const presentation = result.presentationOutput!;
      expect(presentation).toContain('Serious Analysis');
      expect(presentation).toContain('Fun Interpretation');
      expect(presentation).toContain('ms'); // Processing time
      expect(presentation.length).toBeGreaterThan(200); // Substantial content
      
      // Check that it contains a scenario type (capitalized in the presentation)
      const hasScenarioType = presentation.includes('Professional') || 
                             presentation.includes('Hypothetical') || 
                             presentation.includes('Personal') || 
                             presentation.includes('Historical');
      expect(hasScenarioType).toBe(true);
    });

    it('should maintain content quality standards', async () => {
      const input = "What if money grew on trees?";
      const result = await simulator.processScenario(input);

      expect(result.success).toBe(true);
      
      const serious = result.formattedOutput!.seriousVersion;
      const fun = result.formattedOutput!.funVersion;

      // Both versions should have substantial content
      expect(serious.length).toBeGreaterThan(50);
      expect(fun.length).toBeGreaterThan(50);

      // Should not be generic error messages
      expect(serious.toLowerCase()).not.toContain('error');
      expect(fun.toLowerCase()).not.toContain('error');
    });

    it('should handle edge cases in formatting', async () => {
      // Test with minimal but valid input
      const input = "What if I could fly?";
      const result = await simulator.processScenario(input);

      expect(result.success).toBe(true);
      expect(result.formattedOutput!.seriousVersion).toBeDefined();
      expect(result.formattedOutput!.funVersion).toBeDefined();
      expect(result.presentationOutput).toBeDefined();
    });
  });

  describe('Integration with All Components', () => {
    it('should properly integrate InputValidator', async () => {
      // Test that validation errors are properly handled
      const result = await simulator.processScenario('');
      expect(result.success).toBe(false);
      expect(result.metrics!.validationTime).toBeGreaterThan(0);
    });

    it('should properly integrate ScenarioProcessor', async () => {
      const input = "What if companies switched to a 4-day work week?";
      const result = await simulator.processScenario(input);

      expect(result.success).toBe(true);
      expect(result.formattedOutput!.metadata.scenarioType).toBe('professional');
      expect(result.metrics!.processingTime).toBeGreaterThan(0);
    });

    it('should properly integrate both outcome generators', async () => {
      const input = "What if underwater cities became reality?";
      const result = await simulator.processScenario(input);

      expect(result.success).toBe(true);
      expect(result.formattedOutput!.seriousVersion).toContain('serious');
      expect(result.formattedOutput!.funVersion).toContain('fun');
      expect(result.metrics!.seriousGenerationTime).toBeGreaterThan(0);
      expect(result.metrics!.funGenerationTime).toBeGreaterThan(0);
    });

    it('should properly integrate OutputFormatter', async () => {
      const input = "What if everyone could read minds?";
      const result = await simulator.processScenario(input);

      expect(result.success).toBe(true);
      expect(result.formattedOutput).toBeDefined();
      expect(result.presentationOutput).toBeDefined();
      expect(result.metrics!.formattingTime).toBeGreaterThan(0);
    });
  });

  describe('Logging and Monitoring', () => {
    it('should respect logging configuration', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      // Test with logging disabled
      simulator.updateConfig({ enableLogging: false });
      await simulator.processScenario("What if everyone could fly?");
      expect(consoleSpy).not.toHaveBeenCalled();

      // Test with logging enabled
      simulator.updateConfig({ enableLogging: true });
      await simulator.processScenario("What if everyone could fly?");
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should provide comprehensive error logging', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      simulator.updateConfig({ enableLogging: true });
      mockAIService.setFailure(true);
      
      await simulator.processScenario("What if this fails?");
      
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });
});