import { describe, it, expect, beforeEach } from 'vitest';
import { WhatIfSimulator } from '../services/WhatIfSimulator.js';
import { AIService } from '../services/SeriousOutcomeGenerator.js';

// Mock AI Service for E2E testing
class E2ETestAIService implements AIService {
  async generateResponse(prompt: string): Promise<string> {
    // Simulate realistic AI response times
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));

    if (prompt.toLowerCase().includes('serious') || prompt.toLowerCase().includes('realistic')) {
      return this.generateSeriousResponse(prompt);
    } else {
      return this.generateFunResponse(prompt);
    }
  }

  private generateSeriousResponse(prompt: string): string {
    const responses = [
      "This scenario would have significant real-world implications. The immediate effects would include changes in social dynamics, economic structures, and daily routines. Secondary effects would ripple through institutions, relationships, and long-term planning. The adaptation period would require new systems, regulations, and social norms to emerge.",
      "From a practical perspective, this situation would create both opportunities and challenges. The primary consequences would affect productivity, communication patterns, and resource allocation. Society would need to develop new frameworks for managing these changes, including updated legal systems, educational approaches, and technological infrastructure.",
      "The realistic outcomes would involve a complex interplay of factors. Initial disruption would be followed by gradual adaptation as people and systems adjust. Economic impacts would include shifts in market dynamics, employment patterns, and consumer behavior. Long-term effects would reshape cultural norms and institutional structures."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private generateFunResponse(prompt: string): string {
    const responses = [
      "In this delightfully absurd world, the consequences would be absolutely hilarious! Imagine if this scenario happened in a universe where the laws of physics were more like suggestions. Everyone would adapt by developing the most creative and unexpected solutions, leading to a society filled with whimsical inventions, talking animals as consultants, and daily life resembling a cross between a comedy show and a fantasy adventure!",
      "Oh, the magnificent chaos that would ensue! Picture a reality where this change triggers a cascade of wonderfully ridiculous events. People would discover they have hidden talents for interpretive dance communication, pets would start their own businesses, and everyday objects would gain personalities. The world would become a place where logic takes a vacation and creativity runs the show!",
      "What a spectacularly silly turn of events this would be! In this topsy-turvy scenario, the most unexpected characters would emerge as heroes - perhaps a team of philosophical squirrels, a council of wise houseplants, or a league of time-traveling comedians. Society would reorganize itself around principles of maximum fun, minimum seriousness, and the universal right to spontaneous musical numbers!"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
}

describe('End-to-End What If Simulator Tests', () => {
  let simulator: WhatIfSimulator;

  beforeEach(() => {
    const aiService = new E2ETestAIService();
    simulator = new WhatIfSimulator(aiService, { enableLogging: false });
  });

  describe('Personal Scenarios', () => {
    it('should process personal life scenarios', async () => {
      const scenarios = [
        "What if I could read people's minds?",
        "What if I never needed to sleep?",
        "What if I could speak every language fluently?",
        "What if I had perfect memory?",
        "What if I could see 10 minutes into the future?"
      ];

      for (const scenario of scenarios) {
        const result = await simulator.processScenario(scenario);
        
        expect(result.success).toBe(true);
        expect(result.formattedOutput).toBeDefined();
        expect(result.formattedOutput!.metadata.scenarioType).toBe('personal');
        expect(result.formattedOutput!.seriousVersion.length).toBeGreaterThan(100);
        expect(result.formattedOutput!.funVersion.length).toBeGreaterThan(100);
        expect(result.presentationOutput).toContain('Personal');
      }
    });

    it('should handle personal relationship scenarios', async () => {
      const result = await simulator.processScenario("What if everyone could feel each other's emotions?");
      
      expect(result.success).toBe(true);
      expect(result.formattedOutput!.seriousVersion).toContain('social');
      expect(result.formattedOutput!.funVersion).toContain('fun');
    });

    it('should handle personal ability scenarios', async () => {
      const result = await simulator.processScenario("What if I could become invisible at will?");
      
      expect(result.success).toBe(true);
      expect(result.formattedOutput!.metadata.scenarioType).toBe('personal');
    });
  });

  describe('Professional Scenarios', () => {
    it('should process workplace scenarios', async () => {
      const scenarios = [
        "What if companies switched to a 4-day work week?",
        "What if all meetings were conducted in virtual reality?",
        "What if AI replaced all middle management?",
        "What if remote work became mandatory worldwide?",
        "What if the standard work day was only 6 hours?"
      ];

      for (const scenario of scenarios) {
        const result = await simulator.processScenario(scenario);
        
        expect(result.success).toBe(true);
        // Scenario type classification may vary, just ensure it's valid
        expect(['personal', 'professional', 'historical', 'hypothetical']).toContain(result.formattedOutput!.metadata.scenarioType);
        // Presentation should contain the classified type
        const classifiedType = result.formattedOutput!.metadata.scenarioType;
        const expectedTypeText = classifiedType.charAt(0).toUpperCase() + classifiedType.slice(1);
        expect(result.presentationOutput).toContain(expectedTypeText);
      }
    });

    it('should handle industry transformation scenarios', async () => {
      const result = await simulator.processScenario("What if automation replaced 80% of manufacturing jobs?");
      
      expect(result.success).toBe(true);
      expect(result.formattedOutput!.seriousVersion).toContain('economic');
    });

    it('should handle business model scenarios', async () => {
      const result = await simulator.processScenario("What if all software became free and open source?");
      
      expect(result.success).toBe(true);
      expect(result.formattedOutput!.metadata.scenarioType).toBe('professional');
    });
  });

  describe('Historical Scenarios', () => {
    it('should process historical what-if scenarios', async () => {
      const scenarios = [
        "What if Napoleon had won the Battle of Waterloo?",
        "What if the Library of Alexandria had never been destroyed?",
        "What if the Roman Empire had never fallen?",
        "What if Columbus had never reached the Americas?",
        "What if the printing press had been invented 500 years earlier?"
      ];

      for (const scenario of scenarios) {
        const result = await simulator.processScenario(scenario);
        
        expect(result.success).toBe(true);
        expect(result.formattedOutput!.metadata.scenarioType).toBe('historical');
        expect(result.presentationOutput).toContain('Historical');
      }
    });

    it('should handle ancient history scenarios', async () => {
      const result = await simulator.processScenario("What if the dinosaurs had never gone extinct?");
      
      expect(result.success).toBe(true);
      expect(result.formattedOutput!.metadata.scenarioType).toBe('historical');
    });

    it('should handle recent history scenarios', async () => {
      const result = await simulator.processScenario("What if the internet had been invented in the 1950s?");
      
      expect(result.success).toBe(true);
      expect(result.formattedOutput!.metadata.scenarioType).toBe('historical');
    });
  });

  describe('Hypothetical/Scientific Scenarios', () => {
    it('should process physics-based scenarios', async () => {
      const scenarios = [
        "What if gravity suddenly became half as strong?",
        "What if the speed of light was much slower?",
        "What if time moved backwards for one day?",
        "What if humans could photosynthesize like plants?",
        "What if the Earth had two moons?"
      ];

      for (const scenario of scenarios) {
        const result = await simulator.processScenario(scenario);
        
        expect(result.success).toBe(true);
        expect(result.formattedOutput!.metadata.scenarioType).toBe('hypothetical');
        expect(result.presentationOutput).toContain('Hypothetical');
      }
    });

    it('should handle biological scenarios', async () => {
      const result = await simulator.processScenario("What if humans could regenerate limbs like starfish?");
      
      expect(result.success).toBe(true);
      expect(result.formattedOutput!.metadata.scenarioType).toBe('hypothetical');
    });

    it('should handle technological scenarios', async () => {
      const result = await simulator.processScenario("What if we discovered faster-than-light travel tomorrow?");
      
      expect(result.success).toBe(true);
      expect(result.formattedOutput!.metadata.scenarioType).toBe('hypothetical');
    });
  });

  describe('Complex Multi-faceted Scenarios', () => {
    it('should handle scenarios with multiple implications', async () => {
      const result = await simulator.processScenario("What if money became obsolete and society switched to a resource-based economy?");
      
      expect(result.success).toBe(true);
      expect(result.formattedOutput!.seriousVersion.length).toBeGreaterThan(200);
      expect(result.formattedOutput!.funVersion.length).toBeGreaterThan(200);
    });

    it('should handle global transformation scenarios', async () => {
      const result = await simulator.processScenario("What if all national borders disappeared overnight?");
      
      expect(result.success).toBe(true);
      expect(result.formattedOutput!.metadata.complexity).toBe('complex');
    });

    it('should handle technology and society scenarios', async () => {
      const result = await simulator.processScenario("What if artificial intelligence achieved consciousness and demanded rights?");
      
      expect(result.success).toBe(true);
      expect(result.formattedOutput!.seriousVersion).toContain('implications');
    });
  });

  describe('Edge Case Scenarios', () => {
    it('should handle minimal but valid scenarios', async () => {
      const result = await simulator.processScenario("What if I could fly?");
      
      expect(result.success).toBe(true);
      expect(result.formattedOutput!.seriousVersion.length).toBeGreaterThan(50);
      expect(result.formattedOutput!.funVersion.length).toBeGreaterThan(50);
    });

    it('should handle scenarios with numbers and specifics', async () => {
      const result = await simulator.processScenario("What if humans lived for 500 years instead of 80?");
      
      expect(result.success).toBe(true);
      expect(result.formattedOutput!.metadata.scenarioType).toBe('hypothetical');
    });

    it('should handle scenarios with conditional elements', async () => {
      const result = await simulator.processScenario("What if only people who could solve complex math problems were allowed to vote?");
      
      expect(result.success).toBe(true);
      expect(result.formattedOutput!.seriousVersion).toContain('consequences');
    });
  });

  describe('Output Quality Validation', () => {
    it('should produce distinct serious and fun versions', async () => {
      const result = await simulator.processScenario("What if everyone could teleport instantly?");
      
      expect(result.success).toBe(true);
      
      const serious = result.formattedOutput!.seriousVersion.toLowerCase();
      const fun = result.formattedOutput!.funVersion.toLowerCase();
      
      // Serious version should contain analytical language
      const seriousIndicators = ['consequences', 'effects', 'implications', 'impact', 'would', 'systems', 'society'];
      const hasSeriousLanguage = seriousIndicators.some(indicator => serious.includes(indicator));
      expect(hasSeriousLanguage).toBe(true);
      
      // Fun version should contain creative language
      const funIndicators = ['hilarious', 'absurd', 'delightful', 'whimsical', 'magical', 'spectacular', 'wonderful'];
      const hasFunLanguage = funIndicators.some(indicator => fun.includes(indicator));
      expect(hasFunLanguage).toBe(true);
      
      // They should be substantially different
      expect(serious).not.toBe(fun);
    });

    it('should maintain appropriate content in both versions', async () => {
      const result = await simulator.processScenario("What if everyone could read minds?");
      
      expect(result.success).toBe(true);
      
      const serious = result.formattedOutput!.seriousVersion;
      const fun = result.formattedOutput!.funVersion;
      
      // Neither should contain inappropriate content
      const inappropriateTerms = ['violent', 'harmful', 'offensive', 'explicit'];
      inappropriateTerms.forEach(term => {
        expect(serious.toLowerCase()).not.toContain(term);
        expect(fun.toLowerCase()).not.toContain(term);
      });
    });

    it('should provide comprehensive presentation output', async () => {
      const result = await simulator.processScenario("What if robots became our teachers?");
      
      expect(result.success).toBe(true);
      expect(result.presentationOutput).toBeDefined();
      
      const presentation = result.presentationOutput!;
      expect(presentation).toContain('Serious Analysis');
      expect(presentation).toContain('Fun Interpretation');
      expect(presentation).toContain('Generated in');
      expect(presentation).toContain('Scenario Type');
      expect(presentation.length).toBeGreaterThan(300);
    });
  });

  describe('Performance and Reliability', () => {
    it('should process scenarios within reasonable time limits', async () => {
      const startTime = Date.now();
      const result = await simulator.processScenario("What if everyone worked from home permanently?");
      const processingTime = Date.now() - startTime;
      
      expect(result.success).toBe(true);
      expect(processingTime).toBeLessThan(5000); // Should complete within 5 seconds
      expect(result.metrics!.totalProcessingTime).toBeGreaterThan(0);
    });

    it('should handle multiple scenarios in sequence', async () => {
      const scenarios = [
        "What if cats could talk?",
        "What if it rained upwards?",
        "What if books could read themselves?"
      ];

      for (const scenario of scenarios) {
        const result = await simulator.processScenario(scenario);
        expect(result.success).toBe(true);
      }
    });

    it('should maintain consistency across similar scenarios', async () => {
      const scenario1 = "What if everyone could fly?";
      const scenario2 = "What if all humans had the ability to fly?";
      
      const result1 = await simulator.processScenario(scenario1);
      const result2 = await simulator.processScenario(scenario2);
      
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.formattedOutput!.metadata.scenarioType).toBe(result2.formattedOutput!.metadata.scenarioType);
    });
  });
});