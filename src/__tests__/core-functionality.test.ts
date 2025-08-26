import { describe, it, expect, beforeEach } from 'vitest';
import { WhatIfSimulator } from '../services/WhatIfSimulator.js';
import { AIService } from '../services/SeriousOutcomeGenerator.js';
import { getRandomScenarios, invalidScenarios } from './test-data.js';

// Robust AI Service for core functionality testing
class CoreTestAIService implements AIService {
  async generateResponse(prompt: string): Promise<string> {
    // Simulate realistic processing time
    await new Promise(resolve => setTimeout(resolve, 20 + Math.random() * 30));

    if (prompt.toLowerCase().includes('serious') || prompt.toLowerCase().includes('realistic')) {
      return "This scenario would have significant implications for society and individuals. The realistic consequences would include immediate behavioral changes, followed by longer-term adaptations in social structures, economic systems, and daily routines. Key considerations include practical challenges, resource allocation, and the need for new frameworks to manage these changes effectively.";
    } else {
      return "What a delightfully absurd and wonderful scenario! In this topsy-turvy world, the most unexpected and hilarious consequences would unfold. Imagine a reality where logic takes a vacation and creativity runs wild, leading to magical transformations, talking animals offering life advice, and everyday objects gaining personalities. The result would be a world of perpetual wonder and joy!";
    }
  }
}

describe('Core Functionality Tests - Comprehensive Coverage', () => {
  let simulator: WhatIfSimulator;

  beforeEach(() => {
    const aiService = new CoreTestAIService();
    simulator = new WhatIfSimulator(aiService, { enableLogging: false });
  });

  describe('End-to-End Processing - All Scenario Types', () => {
    it('should successfully process diverse scenarios from all categories', async () => {
      const testScenarios = [
        "What if I could read people's minds?", // Personal
        "What if companies switched to a 4-day work week?", // Professional  
        "What if Napoleon had won the Battle of Waterloo?", // Historical
        "What if gravity suddenly became half as strong?", // Hypothetical
        "What if everyone could fly?", // Simple
        "What if artificial intelligence achieved consciousness?", // Complex
        "What if animals could talk to humans?", // Creative
        "What if time moved backwards for one day?", // Abstract
      ];

      for (const scenario of testScenarios) {
        const result = await simulator.processScenario(scenario);
        
        // Core success validation
        expect(result.success).toBe(true);
        expect(result.error).toBeUndefined();
        
        // Output structure validation
        expect(result.formattedOutput).toBeDefined();
        expect(result.presentationOutput).toBeDefined();
        expect(result.metrics).toBeDefined();
        
        // Content quality validation
        expect(result.formattedOutput!.seriousVersion.length).toBeGreaterThan(50);
        expect(result.formattedOutput!.funVersion.length).toBeGreaterThan(50);
        
        // Metadata validation
        expect(result.formattedOutput!.metadata.processingTime).toBeGreaterThan(0);
        expect(['personal', 'professional', 'historical', 'hypothetical']).toContain(
          result.formattedOutput!.metadata.scenarioType
        );
        
        // Presentation validation
        expect(result.presentationOutput).toContain('Serious Analysis');
        expect(result.presentationOutput).toContain('Fun Interpretation');
        expect(result.presentationOutput).toContain('Generated in');
        
        // Performance validation
        expect(result.metrics!.totalProcessingTime).toBeLessThan(3000);
        expect(result.metrics!.success).toBe(true);
      }
    });

    it('should produce distinct serious and fun outputs', async () => {
      const scenarios = [
        "What if everyone could teleport instantly?",
        "What if robots became our teachers?",
        "What if money grew on trees?"
      ];

      for (const scenario of scenarios) {
        const result = await simulator.processScenario(scenario);
        
        expect(result.success).toBe(true);
        
        const serious = result.formattedOutput!.seriousVersion.toLowerCase();
        const fun = result.formattedOutput!.funVersion.toLowerCase();
        
        // Should be substantially different
        expect(serious).not.toBe(fun);
        
        // Serious should contain analytical language
        const seriousIndicators = ['implications', 'consequences', 'realistic', 'society', 'systems', 'challenges'];
        const hasSeriousLanguage = seriousIndicators.some(indicator => serious.includes(indicator));
        expect(hasSeriousLanguage).toBe(true);
        
        // Fun should contain creative language
        const funIndicators = ['delightful', 'absurd', 'wonderful', 'magical', 'hilarious', 'creative', 'joy'];
        const hasFunLanguage = funIndicators.some(indicator => fun.includes(indicator));
        expect(hasFunLanguage).toBe(true);
      }
    });
  });

  describe('Input Validation and Content Appropriateness', () => {
    it('should reject empty and invalid inputs', async () => {
      const invalidInputs = [
        ...invalidScenarios.empty,
        ...invalidScenarios.tooShort,
        ...invalidScenarios.nonScenarios
      ];

      for (const invalidInput of invalidInputs) {
        const result = await simulator.processScenario(invalidInput);
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.metrics!.success).toBe(false);
      }
    });

    it('should handle too-long inputs appropriately', async () => {
      for (const longInput of invalidScenarios.tooLong) {
        const result = await simulator.processScenario(longInput);
        expect(result.success).toBe(false);
        expect(result.error).toContain('too long');
      }
    });

    it('should maintain family-friendly content standards', async () => {
      const testScenarios = getRandomScenarios(5); // Reduced for performance

      for (const scenario of testScenarios) {
        const result = await simulator.processScenario(scenario.input);
        
        if (result.success) {
          const serious = result.formattedOutput!.seriousVersion.toLowerCase();
          const fun = result.formattedOutput!.funVersion.toLowerCase();
          
          // Check for inappropriate content
          const inappropriateTerms = ['violent', 'harmful', 'explicit', 'disturbing'];
          inappropriateTerms.forEach(term => {
            expect(serious).not.toContain(term);
            expect(fun).not.toContain(term);
          });
        }
      }
    }, 10000); // Increased timeout
  });

  describe('Performance and Concurrent Processing', () => {
    it('should handle multiple concurrent requests', async () => {
      const scenarios = [
        "What if everyone could fly?",
        "What if robots took over all jobs?",
        "What if time stood still?",
        "What if animals could talk?",
        "What if gravity was reversed?"
      ];

      const startTime = Date.now();
      const promises = scenarios.map(scenario => simulator.processScenario(scenario));
      const results = await Promise.all(promises);
      const totalTime = Date.now() - startTime;

      // All requests should succeed
      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.formattedOutput).toBeDefined();
      });

      // Should complete in reasonable time
      expect(totalTime).toBeLessThan(5000);
    });

    it('should maintain performance under moderate load', async () => {
      const scenarios = Array.from({ length: 15 }, (_, i) => 
        `What if performance test scenario ${i + 1} occurred?`
      );

      const results = await Promise.all(
        scenarios.map(scenario => simulator.processScenario(scenario))
      );

      const successful = results.filter(result => result.success).length;
      expect(successful).toBeGreaterThan(scenarios.length * 0.8); // At least 80% success

      // Check average response time
      const avgResponseTime = results
        .filter(result => result.success)
        .reduce((sum, result) => sum + result.metrics!.totalProcessingTime, 0) / successful;
      
      expect(avgResponseTime).toBeLessThan(2000); // Average under 2 seconds
    });
  });

  describe('Output Quality and Formatting', () => {
    it('should provide comprehensive presentation output', async () => {
      const result = await simulator.processScenario("What if everyone worked from home permanently?");
      
      expect(result.success).toBe(true);
      expect(result.presentationOutput).toBeDefined();
      
      const presentation = result.presentationOutput!;
      
      // Should contain all required sections
      expect(presentation).toContain('Scenario Type:');
      expect(presentation).toContain('Generated in');
      expect(presentation).toContain('Serious Analysis');
      expect(presentation).toContain('Fun Interpretation');
      
      // Should have substantial content
      expect(presentation.length).toBeGreaterThan(200);
      
      // Should contain proper formatting
      expect(presentation).toContain('🎯');
      expect(presentation).toContain('🎭');
      expect(presentation).toContain('─'.repeat(50));
    });

    it('should maintain consistent output structure', async () => {
      const scenarios = [
        "What if books could read themselves?",
        "What if colors had personalities?",
        "What if plants could walk around?"
      ];

      for (const scenario of scenarios) {
        const result = await simulator.processScenario(scenario);
        
        expect(result.success).toBe(true);
        
        // Validate structure consistency
        expect(result.formattedOutput!.seriousVersion).toBeDefined();
        expect(result.formattedOutput!.funVersion).toBeDefined();
        expect(result.formattedOutput!.metadata).toBeDefined();
        expect(result.formattedOutput!.metadata.processingTime).toBeGreaterThan(0);
        expect(result.formattedOutput!.metadata.scenarioType).toBeDefined();
        
        // Validate content quality
        expect(result.formattedOutput!.seriousVersion.length).toBeGreaterThan(50);
        expect(result.formattedOutput!.funVersion.length).toBeGreaterThan(50);
      }
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should provide meaningful error messages for invalid inputs', async () => {
      const testCases = [
        { input: '', expectedError: 'What if' },
        { input: 'hello', expectedError: 'more specific' },
        { input: 'What if?', expectedError: 'detailed' }
      ];

      for (const testCase of testCases) {
        const result = await simulator.processScenario(testCase.input);
        expect(result.success).toBe(false);
        expect(result.error).toContain(testCase.expectedError);
      }
    });

    it('should track metrics even for failed requests', async () => {
      const result = await simulator.processScenario('');
      
      expect(result.success).toBe(false);
      expect(result.metrics).toBeDefined();
      expect(result.metrics!.success).toBe(false);
      expect(result.metrics!.totalProcessingTime).toBeGreaterThanOrEqual(0);
      expect(result.metrics!.validationTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Integration Validation', () => {
    it('should integrate all components successfully', async () => {
      const result = await simulator.processScenario("What if integration testing was perfect?");
      
      expect(result.success).toBe(true);
      
      // Validate all components worked together
      expect(result.metrics!.validationTime).toBeGreaterThan(0); // InputValidator
      expect(result.metrics!.processingTime).toBeGreaterThan(0); // ScenarioProcessor
      expect(result.metrics!.seriousGenerationTime).toBeGreaterThan(0); // SeriousOutcomeGenerator
      expect(result.metrics!.funGenerationTime).toBeGreaterThan(0); // FunOutcomeGenerator
      expect(result.metrics!.formattingTime).toBeGreaterThan(0); // OutputFormatter
      
      // Validate complete workflow
      expect(result.formattedOutput).toBeDefined();
      expect(result.presentationOutput).toBeDefined();
      expect(result.metrics!.totalProcessingTime).toBeGreaterThan(0);
    });

    it('should handle various scenario complexities', async () => {
      const scenarios = [
        "What if I could fly?", // Simple
        "What if everyone could read minds and communicate telepathically?", // Moderate
        "What if artificial intelligence achieved consciousness and demanded equal rights while simultaneously solving climate change?", // Complex
      ];

      for (const scenario of scenarios) {
        const result = await simulator.processScenario(scenario);
        
        expect(result.success).toBe(true);
        expect(result.formattedOutput!.seriousVersion.length).toBeGreaterThan(50);
        expect(result.formattedOutput!.funVersion.length).toBeGreaterThan(50);
        
        // More complex scenarios might take longer but should still complete
        expect(result.metrics!.totalProcessingTime).toBeLessThan(5000);
      }
    });
  });

  describe('Requirements Validation', () => {
    it('should satisfy Requirement 1.1 - Input acceptance and validation', async () => {
      // Valid input should be accepted
      const validResult = await simulator.processScenario("What if everyone could teleport?");
      expect(validResult.success).toBe(true);
      
      // Invalid input should be rejected
      const invalidResult = await simulator.processScenario("");
      expect(invalidResult.success).toBe(false);
    });

    it('should satisfy Requirement 2.1 - Serious realistic analysis', async () => {
      const result = await simulator.processScenario("What if remote work became mandatory worldwide?");
      
      expect(result.success).toBe(true);
      const serious = result.formattedOutput!.seriousVersion;
      
      // Should contain realistic analysis
      expect(serious.length).toBeGreaterThan(100);
      expect(serious.toLowerCase()).toMatch(/(realistic|practical|consequences|implications|society|systems)/);
    });

    it('should satisfy Requirement 3.1 - Fun creative interpretation', async () => {
      const result = await simulator.processScenario("What if animals could talk to humans?");
      
      expect(result.success).toBe(true);
      const fun = result.formattedOutput!.funVersion;
      
      // Should contain creative interpretation
      expect(fun.length).toBeGreaterThan(100);
      expect(fun.toLowerCase()).toMatch(/(delightful|wonderful|magical|creative|hilarious|absurd)/);
    });

    it('should satisfy Requirement 4.1 - Clear distinction between versions', async () => {
      const result = await simulator.processScenario("What if everyone worked only 3 days per week?");
      
      expect(result.success).toBe(true);
      
      // Should have clear labels and formatting
      expect(result.presentationOutput).toContain('🎯 Serious Analysis');
      expect(result.presentationOutput).toContain('🎭 Fun Interpretation');
      expect(result.presentationOutput).toContain('─'.repeat(50));
      
      // Versions should be different
      expect(result.formattedOutput!.seriousVersion).not.toBe(result.formattedOutput!.funVersion);
    });

    it('should satisfy Requirement 5.1 - Various scenario types handling', async () => {
      const diverseScenarios = [
        "What if I never needed to sleep?", // Personal
        "What if all meetings were in VR?", // Professional
        "What if the Library of Alexandria survived?", // Historical
        "What if gravity was weaker?", // Hypothetical
      ];

      for (const scenario of diverseScenarios) {
        const result = await simulator.processScenario(scenario);
        
        expect(result.success).toBe(true);
        expect(result.formattedOutput!.metadata.scenarioType).toBeDefined();
        expect(['personal', 'professional', 'historical', 'hypothetical']).toContain(
          result.formattedOutput!.metadata.scenarioType
        );
      }
    });
  });
});