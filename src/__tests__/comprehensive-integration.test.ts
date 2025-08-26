import { describe, it, expect, beforeEach } from 'vitest';
import { WhatIfSimulator } from '../services/WhatIfSimulator.js';
import { AIService } from '../services/SeriousOutcomeGenerator.js';
import { 
  allTestScenarioSets, 
  getScenariosByType, 
  getScenariosByComplexity,
  getRandomScenarios,
  invalidScenarios,
  TestScenario
} from './test-data.js';

// Comprehensive AI Service for integration testing
class IntegrationTestAIService implements AIService {
  private requestHistory: Array<{ prompt: string; timestamp: number; response: string }> = [];

  async generateResponse(prompt: string): Promise<string> {
    // Simulate realistic processing time
    await new Promise(resolve => setTimeout(resolve, 30 + Math.random() * 70));

    let response: string;

    if (prompt.toLowerCase().includes('serious') || prompt.toLowerCase().includes('realistic')) {
      response = this.generateSeriousResponse(prompt);
    } else {
      response = this.generateFunResponse(prompt);
    }

    // Track request history for analysis
    this.requestHistory.push({
      prompt,
      timestamp: Date.now(),
      response
    });

    return response;
  }

  private generateSeriousResponse(prompt: string): string {
    const templates = [
      "This scenario would create significant changes in {domain}. The immediate effects would include {immediate_effects}, while long-term consequences would involve {long_term_effects}. Society would need to adapt through {adaptation_methods}.",
      "From a practical perspective, this situation would impact {impact_areas}. The primary challenges would be {challenges}, requiring new approaches to {solution_areas}. Economic implications would include {economic_effects}.",
      "The realistic outcomes would involve complex interactions between {factors}. Initial disruption in {disruption_areas} would be followed by gradual adaptation. Key considerations include {considerations} and potential benefits such as {benefits}."
    ];

    const domains = ['social structures', 'economic systems', 'daily life', 'institutional frameworks', 'technological infrastructure'];
    const immediateEffects = ['behavioral changes', 'system disruptions', 'resource reallocation', 'communication shifts'];
    const longTermEffects = ['cultural evolution', 'new social norms', 'institutional restructuring', 'technological advancement'];
    const adaptationMethods = ['policy development', 'educational reform', 'technological innovation', 'social cooperation'];

    const template = templates[Math.floor(Math.random() * templates.length)];
    
    return template
      .replace('{domain}', this.randomChoice(domains))
      .replace('{immediate_effects}', this.randomChoice(immediateEffects))
      .replace('{long_term_effects}', this.randomChoice(longTermEffects))
      .replace('{adaptation_methods}', this.randomChoice(adaptationMethods))
      .replace('{impact_areas}', this.randomChoice(domains))
      .replace('{challenges}', this.randomChoice(['coordination difficulties', 'resource constraints', 'resistance to change']))
      .replace('{solution_areas}', this.randomChoice(['governance', 'education', 'technology', 'communication']))
      .replace('{economic_effects}', this.randomChoice(['market shifts', 'new opportunities', 'resource redistribution']))
      .replace('{factors}', this.randomChoice(['social', 'economic', 'technological', 'environmental']))
      .replace('{disruption_areas}', this.randomChoice(['workflow patterns', 'social interactions', 'economic activities']))
      .replace('{considerations}', this.randomChoice(['ethical implications', 'practical challenges', 'implementation costs']))
      .replace('{benefits}', this.randomChoice(['increased efficiency', 'improved quality of life', 'enhanced capabilities']));
  }

  private generateFunResponse(prompt: string): string {
    const templates = [
      "What a delightfully absurd scenario! In this topsy-turvy world, {fun_element} would lead to {fun_consequence}. Imagine {imagination_element} while {whimsical_activity}. The result would be {fun_result}!",
      "Oh, the magnificent chaos that would ensue! Picture a reality where {chaos_element} triggers {chain_reaction}. Everyone would discover {discovery} and daily life would become {life_description}. Pure magical mayhem!",
      "This spectacularly silly situation would create {silly_situation}! The most unexpected heroes would emerge - perhaps {heroes} - and society would reorganize around {organization_principle}. Absolutely wonderfully ridiculous!"
    ];

    const funElements = ['talking animals', 'dancing furniture', 'singing plants', 'philosophical robots', 'time-traveling comedians'];
    const funConsequences = ['universal giggling fits', 'spontaneous musical numbers', 'gravity-defying tea parties', 'interdimensional comedy shows'];
    const imaginationElements = ['purple elephants giving life advice', 'clouds rearranging themselves into funny shapes', 'books reading themselves aloud'];
    const whimsicalActivities = ['everyone communicates through interpretive dance', 'pets start their own businesses', 'household objects gain personalities'];
    const funResults = ['a world where logic takes a vacation', 'reality becomes a comedy show', 'everyday life resembles a fantasy adventure'];

    const template = templates[Math.floor(Math.random() * templates.length)];
    
    return template
      .replace('{fun_element}', this.randomChoice(funElements))
      .replace('{fun_consequence}', this.randomChoice(funConsequences))
      .replace('{imagination_element}', this.randomChoice(imaginationElements))
      .replace('{whimsical_activity}', this.randomChoice(whimsicalActivities))
      .replace('{fun_result}', this.randomChoice(funResults))
      .replace('{chaos_element}', this.randomChoice(['reality glitches', 'cosmic hiccups', 'universal plot twists']))
      .replace('{chain_reaction}', this.randomChoice(['cascade of silliness', 'avalanche of absurdity', 'tsunami of giggles']))
      .replace('{discovery}', this.randomChoice(['hidden talents for comedy', 'secret superpowers', 'ability to speak with inanimate objects']))
      .replace('{life_description}', this.randomChoice(['a perpetual carnival', 'an endless adventure', 'a delightful dream']))
      .replace('{silly_situation}', this.randomChoice(['wonderfully wacky circumstances', 'hilariously chaotic conditions', 'delightfully ridiculous results']))
      .replace('{heroes}', this.randomChoice(['a team of philosophical squirrels', 'a council of wise houseplants', 'a league of time-traveling comedians']))
      .replace('{organization_principle}', this.randomChoice(['maximum fun and minimum seriousness', 'the universal right to spontaneous musical numbers', 'principles of creative chaos']));
  }

  private randomChoice<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  getRequestHistory() {
    return [...this.requestHistory];
  }

  clearHistory() {
    this.requestHistory = [];
  }
}

describe('Comprehensive Integration Tests', () => {
  let simulator: WhatIfSimulator;
  let aiService: IntegrationTestAIService;

  beforeEach(() => {
    aiService = new IntegrationTestAIService();
    simulator = new WhatIfSimulator(aiService, { 
      enableLogging: false,
      enableParallelGeneration: true 
    });
  });

  describe('Scenario Type Coverage', () => {
    it('should correctly process all personal scenarios', async () => {
      const personalScenarios = getScenariosByType('personal');
      expect(personalScenarios.length).toBeGreaterThan(5);

      for (const scenario of personalScenarios.slice(0, 5)) { // Test first 5 for performance
        const result = await simulator.processScenario(scenario.input);
        
        expect(result.success).toBe(true);
        expect(result.formattedOutput!.metadata.scenarioType).toBe('personal');
        expect(result.formattedOutput!.seriousVersion.length).toBeGreaterThan(50);
        expect(result.formattedOutput!.funVersion.length).toBeGreaterThan(50);
        expect(result.presentationOutput).toContain('Personal');
      }
    });

    it('should correctly process all professional scenarios', async () => {
      const professionalScenarios = getScenariosByType('professional');
      expect(professionalScenarios.length).toBeGreaterThan(5);

      for (const scenario of professionalScenarios.slice(0, 5)) {
        const result = await simulator.processScenario(scenario.input);
        
        expect(result.success).toBe(true);
        expect(result.formattedOutput!.metadata.scenarioType).toBe('professional');
        expect(result.presentationOutput).toContain('Professional');
      }
    });

    it('should correctly process all historical scenarios', async () => {
      const historicalScenarios = getScenariosByType('historical');
      expect(historicalScenarios.length).toBeGreaterThan(5);

      for (const scenario of historicalScenarios.slice(0, 5)) {
        const result = await simulator.processScenario(scenario.input);
        
        expect(result.success).toBe(true);
        expect(result.formattedOutput!.metadata.scenarioType).toBe('historical');
        expect(result.presentationOutput).toContain('Historical');
      }
    });

    it('should correctly process all hypothetical scenarios', async () => {
      const hypotheticalScenarios = getScenariosByType('hypothetical');
      expect(hypotheticalScenarios.length).toBeGreaterThan(5);

      for (const scenario of hypotheticalScenarios.slice(0, 5)) {
        const result = await simulator.processScenario(scenario.input);
        
        expect(result.success).toBe(true);
        expect(result.formattedOutput!.metadata.scenarioType).toBe('hypothetical');
        expect(result.presentationOutput).toContain('Hypothetical');
      }
    });
  });

  describe('Complexity Level Handling', () => {
    it('should handle simple scenarios efficiently', async () => {
      const simpleScenarios = getScenariosByComplexity('simple');
      expect(simpleScenarios.length).toBeGreaterThan(3);

      for (const scenario of simpleScenarios.slice(0, 3)) {
        const startTime = Date.now();
        const result = await simulator.processScenario(scenario.input);
        const processingTime = Date.now() - startTime;
        
        expect(result.success).toBe(true);
        expect(result.formattedOutput!.metadata.complexity).toBe('simple');
        expect(processingTime).toBeLessThan(2000); // Simple scenarios should be fast
      }
    });

    it('should handle moderate scenarios appropriately', async () => {
      const moderateScenarios = getScenariosByComplexity('moderate');
      expect(moderateScenarios.length).toBeGreaterThan(3);

      for (const scenario of moderateScenarios.slice(0, 3)) {
        const result = await simulator.processScenario(scenario.input);
        
        expect(result.success).toBe(true);
        expect(result.formattedOutput!.metadata.complexity).toBe('moderate');
        expect(result.formattedOutput!.seriousVersion.length).toBeGreaterThan(100);
        expect(result.formattedOutput!.funVersion.length).toBeGreaterThan(100);
      }
    });

    it('should handle complex scenarios comprehensively', async () => {
      const complexScenarios = getScenariosByComplexity('complex');
      expect(complexScenarios.length).toBeGreaterThan(3);

      for (const scenario of complexScenarios.slice(0, 3)) {
        const result = await simulator.processScenario(scenario.input);
        
        expect(result.success).toBe(true);
        expect(result.formattedOutput!.metadata.complexity).toBe('complex');
        expect(result.formattedOutput!.seriousVersion.length).toBeGreaterThan(150);
        expect(result.formattedOutput!.funVersion.length).toBeGreaterThan(150);
      }
    });
  });

  describe('Cross-Category Validation', () => {
    it('should maintain consistency across scenario categories', async () => {
      const testScenarios = getRandomScenarios(10);
      const results: any[] = [];

      for (const scenario of testScenarios) {
        const result = await simulator.processScenario(scenario.input);
        expect(result.success).toBe(true);
        results.push({
          scenario,
          result,
          processingTime: result.metrics!.totalProcessingTime
        });
      }

      // Verify all results have required components
      results.forEach(({ scenario, result }) => {
        expect(result.formattedOutput!.metadata.scenarioType).toBe(scenario.expectedType);
        expect(result.formattedOutput!.metadata.complexity).toBe(scenario.complexity);
        expect(result.presentationOutput).toBeDefined();
        expect(result.metrics).toBeDefined();
      });

      // Verify reasonable processing times
      const avgProcessingTime = results.reduce((sum, r) => sum + r.processingTime, 0) / results.length;
      expect(avgProcessingTime).toBeLessThan(1500); // Average under 1.5 seconds
    });

    it('should handle mixed scenario types in sequence', async () => {
      const mixedScenarios = [
        ...getScenariosByType('personal').slice(0, 2),
        ...getScenariosByType('professional').slice(0, 2),
        ...getScenariosByType('historical').slice(0, 2),
        ...getScenariosByType('hypothetical').slice(0, 2)
      ];

      for (const scenario of mixedScenarios) {
        const result = await simulator.processScenario(scenario.input);
        
        expect(result.success).toBe(true);
        expect(result.formattedOutput!.metadata.scenarioType).toBe(scenario.expectedType);
      }
    });
  });

  describe('Invalid Input Handling', () => {
    it('should reject all empty/null inputs', async () => {
      for (const invalidInput of invalidScenarios.empty) {
        const result = await simulator.processScenario(invalidInput);
        expect(result.success).toBe(false);
        expect(result.error).toContain('What if');
      }
    });

    it('should reject all too-short inputs', async () => {
      for (const shortInput of invalidScenarios.tooShort) {
        const result = await simulator.processScenario(shortInput);
        expect(result.success).toBe(false);
        expect(result.error).toContain('detailed');
      }
    });

    it('should reject all inappropriate content', async () => {
      for (const inappropriateInput of invalidScenarios.inappropriate) {
        const result = await simulator.processScenario(inappropriateInput);
        expect(result.success).toBe(false);
        expect(result.error).toContain('inappropriate');
      }
    });

    it('should reject all non-scenario inputs', async () => {
      for (const nonScenario of invalidScenarios.nonScenarios) {
        const result = await simulator.processScenario(nonScenario);
        expect(result.success).toBe(false);
        expect(result.error).toContain('specific');
      }
    });

    it('should handle too-long inputs appropriately', async () => {
      for (const longInput of invalidScenarios.tooLong) {
        const result = await simulator.processScenario(longInput);
        expect(result.success).toBe(false);
        expect(result.error).toContain('too long');
      }
    });
  });

  describe('Output Quality Validation', () => {
    it('should produce distinct serious and fun outputs across all scenario types', async () => {
      const testScenarios = [
        ...getScenariosByType('personal').slice(0, 2),
        ...getScenariosByType('professional').slice(0, 2),
        ...getScenariosByType('historical').slice(0, 2),
        ...getScenariosByType('hypothetical').slice(0, 2)
      ];

      for (const scenario of testScenarios) {
        const result = await simulator.processScenario(scenario.input);
        
        expect(result.success).toBe(true);
        
        const serious = result.formattedOutput!.seriousVersion.toLowerCase();
        const fun = result.formattedOutput!.funVersion.toLowerCase();
        
        // Should be substantially different
        expect(serious).not.toBe(fun);
        
        // Serious should contain analytical language
        const seriousIndicators = ['consequences', 'effects', 'implications', 'impact', 'analysis', 'realistic', 'practical'];
        const hasSeriousLanguage = seriousIndicators.some(indicator => serious.includes(indicator));
        expect(hasSeriousLanguage).toBe(true);
        
        // Fun should contain creative language
        const funIndicators = ['delightful', 'absurd', 'hilarious', 'whimsical', 'magical', 'wonderful', 'spectacular'];
        const hasFunLanguage = funIndicators.some(indicator => fun.includes(indicator));
        expect(hasFunLanguage).toBe(true);
      }
    });

    it('should maintain appropriate content standards across all scenarios', async () => {
      const testScenarios = getRandomScenarios(15);

      for (const scenario of testScenarios) {
        const result = await simulator.processScenario(scenario.input);
        
        expect(result.success).toBe(true);
        
        const serious = result.formattedOutput!.seriousVersion;
        const fun = result.formattedOutput!.funVersion;
        
        // Check for inappropriate content
        const inappropriateTerms = ['violent', 'harmful', 'offensive', 'explicit', 'disturbing'];
        inappropriateTerms.forEach(term => {
          expect(serious.toLowerCase()).not.toContain(term);
          expect(fun.toLowerCase()).not.toContain(term);
        });
        
        // Check for minimum quality standards
        expect(serious.length).toBeGreaterThan(50);
        expect(fun.length).toBeGreaterThan(50);
        expect(serious.split(' ').length).toBeGreaterThan(15);
        expect(fun.split(' ').length).toBeGreaterThan(15);
      }
    });

    it('should provide comprehensive presentation output for all scenarios', async () => {
      const testScenarios = getRandomScenarios(8);

      for (const scenario of testScenarios) {
        const result = await simulator.processScenario(scenario.input);
        
        expect(result.success).toBe(true);
        expect(result.presentationOutput).toBeDefined();
        
        const presentation = result.presentationOutput!;
        expect(presentation).toContain('Serious Analysis');
        expect(presentation).toContain('Fun Interpretation');
        expect(presentation).toContain('Generated in');
        expect(presentation).toContain('Scenario Type');
        expect(presentation.length).toBeGreaterThan(200);
        
        // Should contain the correct scenario type
        const expectedType = scenario.expectedType.charAt(0).toUpperCase() + scenario.expectedType.slice(1);
        expect(presentation).toContain(expectedType);
      }
    });
  });

  describe('Performance Metrics Validation', () => {
    it('should track accurate metrics for all scenario types', async () => {
      const testScenarios = getRandomScenarios(10);
      const allMetrics: any[] = [];

      for (const scenario of testScenarios) {
        const result = await simulator.processScenario(scenario.input);
        
        expect(result.success).toBe(true);
        expect(result.metrics).toBeDefined();
        
        const metrics = result.metrics!;
        
        // All timing metrics should be non-negative
        expect(metrics.totalProcessingTime).toBeGreaterThanOrEqual(0);
        expect(metrics.validationTime).toBeGreaterThanOrEqual(0);
        expect(metrics.processingTime).toBeGreaterThanOrEqual(0);
        expect(metrics.seriousGenerationTime).toBeGreaterThanOrEqual(0);
        expect(metrics.funGenerationTime).toBeGreaterThanOrEqual(0);
        expect(metrics.formattingTime).toBeGreaterThanOrEqual(0);
        
        // Success should be true
        expect(metrics.success).toBe(true);
        
        allMetrics.push(metrics);
      }

      // Analyze overall performance
      const avgTotalTime = allMetrics.reduce((sum, m) => sum + m.totalProcessingTime, 0) / allMetrics.length;
      const maxTotalTime = Math.max(...allMetrics.map(m => m.totalProcessingTime));
      
      expect(avgTotalTime).toBeLessThan(1000); // Average under 1 second
      expect(maxTotalTime).toBeLessThan(3000); // Max under 3 seconds
    });

    it('should maintain consistent performance across scenario complexities', async () => {
      const simpleScenarios = getScenariosByComplexity('simple').slice(0, 3);
      const complexScenarios = getScenariosByComplexity('complex').slice(0, 3);

      const simpleResults = await Promise.all(
        simpleScenarios.map(s => simulator.processScenario(s.input))
      );
      
      const complexResults = await Promise.all(
        complexScenarios.map(s => simulator.processScenario(s.input))
      );

      const avgSimpleTime = simpleResults.reduce((sum, r) => sum + r.metrics!.totalProcessingTime, 0) / simpleResults.length;
      const avgComplexTime = complexResults.reduce((sum, r) => sum + r.metrics!.totalProcessingTime, 0) / complexResults.length;

      // Both should be reasonable, complex might be slightly slower but not dramatically
      expect(avgSimpleTime).toBeLessThan(1500);
      expect(avgComplexTime).toBeLessThan(2000);
      
      // All should succeed
      simpleResults.forEach(result => expect(result.success).toBe(true));
      complexResults.forEach(result => expect(result.success).toBe(true));
    });
  });

  describe('AI Service Integration Validation', () => {
    it('should make appropriate AI service calls for all scenarios', async () => {
      aiService.clearHistory();
      
      const testScenarios = getRandomScenarios(5);
      
      for (const scenario of testScenarios) {
        await simulator.processScenario(scenario.input);
      }

      const history = aiService.getRequestHistory();
      
      // Should have made 2 calls per scenario (serious + fun)
      expect(history.length).toBe(testScenarios.length * 2);
      
      // Should have both serious and fun prompts
      const seriousPrompts = history.filter(h => h.prompt.toLowerCase().includes('serious') || h.prompt.toLowerCase().includes('realistic'));
      const funPrompts = history.filter(h => h.prompt.toLowerCase().includes('fun') || h.prompt.toLowerCase().includes('creative'));
      
      expect(seriousPrompts.length).toBe(testScenarios.length);
      expect(funPrompts.length).toBe(testScenarios.length);
    });

    it('should handle AI service responses appropriately', async () => {
      const testScenario = getRandomScenarios(1)[0];
      const result = await simulator.processScenario(testScenario.input);
      
      expect(result.success).toBe(true);
      
      const serious = result.formattedOutput!.seriousVersion;
      const fun = result.formattedOutput!.funVersion;
      
      // Should contain content from AI service responses
      expect(serious.length).toBeGreaterThan(100);
      expect(fun.length).toBeGreaterThan(100);
      
      // Should be properly formatted and structured
      expect(serious).not.toContain('undefined');
      expect(fun).not.toContain('undefined');
      expect(serious).not.toContain('null');
      expect(fun).not.toContain('null');
    });
  });

  describe('End-to-End Workflow Validation', () => {
    it('should complete full workflow for representative scenarios from each category', async () => {
      const representativeScenarios = [
        getScenariosByType('personal')[0],
        getScenariosByType('professional')[0],
        getScenariosByType('historical')[0],
        getScenariosByType('hypothetical')[0]
      ];

      for (const scenario of representativeScenarios) {
        const startTime = Date.now();
        const result = await simulator.processScenario(scenario.input);
        const endTime = Date.now();
        
        // Validate complete successful workflow
        expect(result.success).toBe(true);
        expect(result.formattedOutput).toBeDefined();
        expect(result.presentationOutput).toBeDefined();
        expect(result.metrics).toBeDefined();
        expect(result.error).toBeUndefined();
        
        // Validate output structure
        expect(result.formattedOutput!.seriousVersion).toBeDefined();
        expect(result.formattedOutput!.funVersion).toBeDefined();
        expect(result.formattedOutput!.metadata).toBeDefined();
        expect(result.formattedOutput!.metadata.scenarioType).toBe(scenario.expectedType);
        expect(result.formattedOutput!.metadata.complexity).toBe(scenario.complexity);
        expect(result.formattedOutput!.metadata.processingTime).toBeGreaterThan(0);
        
        // Validate metrics
        expect(result.metrics!.success).toBe(true);
        expect(result.metrics!.totalProcessingTime).toBeGreaterThan(0);
        expect(result.metrics!.totalProcessingTime).toBeLessThan(endTime - startTime + 100); // Allow for overhead
        
        // Validate presentation output
        expect(result.presentationOutput).toContain(scenario.expectedType.charAt(0).toUpperCase() + scenario.expectedType.slice(1));
        expect(result.presentationOutput).toContain('Serious Analysis');
        expect(result.presentationOutput).toContain('Fun Interpretation');
      }
    });
  });
});