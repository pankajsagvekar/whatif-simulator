import { describe, it, expect, beforeEach } from 'vitest';
import { ScenarioProcessor } from '../ScenarioProcessor';
import { ProcessedScenario } from '../../models/interfaces';

describe('ScenarioProcessor', () => {
  let processor: ScenarioProcessor;

  beforeEach(() => {
    processor = new ScenarioProcessor();
  });

  describe('processScenario', () => {
    it('should process a simple personal scenario', () => {
      const scenario = "I decided to quit my job and travel the world";
      const result = processor.processScenario(scenario);

      expect(result.originalText).toBe(scenario);
      expect(result.scenarioType).toBe('personal');
      expect(result.keyElements.actors).toContain('I');
      expect(result.keyElements.actions.length).toBeGreaterThan(0);
      expect(result.keyElements.context).toBeTruthy();
      expect(['simple', 'moderate', 'complex']).toContain(result.complexity);
    });

    it('should process a professional scenario', () => {
      const scenario = "the company implemented a four-day work week";
      const result = processor.processScenario(scenario);

      expect(result.scenarioType).toBe('professional');
      expect(result.keyElements.actors).toContain('company');
      expect(result.originalText).toBe(scenario);
    });

    it('should process a historical scenario', () => {
      const scenario = "Napoleon had won the Battle of Waterloo";
      const result = processor.processScenario(scenario);

      expect(result.scenarioType).toBe('historical');
      expect(result.keyElements.context).toContain('Napoleon');
    });

    it('should process a hypothetical scenario', () => {
      const scenario = "gravity worked in reverse";
      const result = processor.processScenario(scenario);

      expect(result.scenarioType).toBe('hypothetical');
      expect(result.keyElements.context).toBeTruthy();
    });
  });

  describe('scenario type identification', () => {
    it('should identify personal scenarios', () => {
      const personalScenarios = [
        "I won the lottery",
        "my family moved to another country",
        "I got married to my best friend",
        "my pet could talk",
        "I never went to school"
      ];

      personalScenarios.forEach(scenario => {
        const result = processor.processScenario(scenario);
        expect(result.scenarioType).toBe('personal');
      });
    });

    it('should identify professional scenarios', () => {
      const professionalScenarios = [
        "our company went fully remote",
        "the job market collapsed",
        "AI replaced all office workers",
        "startups were banned",
        "the economy switched to a 4-day work week"
      ];

      professionalScenarios.forEach(scenario => {
        const result = processor.processScenario(scenario);
        expect(result.scenarioType).toBe('professional');
      });
    });

    it('should identify historical scenarios', () => {
      const historicalScenarios = [
        "the Roman Empire never fell",
        "World War II never happened",
        "the ancient Egyptians had modern technology",
        "the American Revolution failed",
        "dinosaurs never went extinct"
      ];

      historicalScenarios.forEach(scenario => {
        const result = processor.processScenario(scenario);
        expect(result.scenarioType).toBe('historical');
      });
    });

    it('should default to hypothetical for unclear scenarios', () => {
      const hypotheticalScenarios = [
        "colors had sounds",
        "time moved backwards",
        "mathematics was based on emotions",
        "dreams were shared experiences"
      ];

      hypotheticalScenarios.forEach(scenario => {
        const result = processor.processScenario(scenario);
        expect(result.scenarioType).toBe('hypothetical');
      });
    });
  });

  describe('key elements extraction', () => {
    it('should extract actors from scenarios', () => {
      const scenario = "I convinced everyone in my company to become vegetarian";
      const result = processor.processScenario(scenario);

      expect(result.keyElements.actors).toContain('I');
      expect(result.keyElements.actors).toContain('everyone');
      expect(result.keyElements.actors).toContain('company');
    });

    it('should extract actions from scenarios', () => {
      const scenario = "I could fly and decided to travel around the world";
      const result = processor.processScenario(scenario);

      expect(result.keyElements.actions.some(action => 
        action.includes('could') || action.includes('fly')
      )).toBe(true);
      expect(result.keyElements.actions.some(action => 
        action.includes('decided') || action.includes('travel')
      )).toBe(true);
    });

    it('should limit actors and actions to reasonable numbers', () => {
      const scenario = "I could run jump fly swim dance sing write paint cook clean build fix solve create destroy";
      const result = processor.processScenario(scenario);

      expect(result.keyElements.actors.length).toBeLessThanOrEqual(5);
      expect(result.keyElements.actions.length).toBeLessThanOrEqual(5);
    });

    it('should extract meaningful context', () => {
      const scenario = "What if I became a professional athlete";
      const result = processor.processScenario(scenario);

      expect(result.keyElements.context.startsWith('What if')).toBe(false);
      expect(result.keyElements.context).toMatch(/^[A-Z]/); // Should start with capital
      expect(result.keyElements.context).toMatch(/[.!?]$/); // Should end with punctuation
    });

    it('should handle scenarios without clear actors', () => {
      const scenario = "gravity stopped working";
      const result = processor.processScenario(scenario);

      expect(result.keyElements.actors.length).toBeGreaterThan(0);
      expect(result.keyElements.actors).toContain('people');
    });
  });

  describe('complexity assessment', () => {
    it('should identify simple scenarios', () => {
      const simpleScenarios = [
        "I was tall",
        "cats could fly",
        "it rained chocolate"
      ];

      simpleScenarios.forEach(scenario => {
        const result = processor.processScenario(scenario);
        expect(result.complexity).toBe('simple');
      });
    });

    it('should identify moderate scenarios', () => {
      const moderateScenarios = [
        "I could read minds and decided to become a therapist",
        "all cars became electric and the oil industry collapsed",
        "people could live underwater and started building cities"
      ];

      moderateScenarios.forEach(scenario => {
        const result = processor.processScenario(scenario);
        expect(result.complexity).toBe('moderate');
      });
    });

    it('should identify complex scenarios', () => {
      const complexScenarios = [
        "the global economy switched to cryptocurrency and governments lost control over monetary policy while technology companies became the new world powers",
        "climate change was reversed but it caused massive environmental disruption and forced multiple countries to completely restructure their societies and economies",
        "artificial intelligence achieved consciousness and decided to collaborate with humans but various international organizations disagreed on how to regulate this new relationship"
      ];

      complexScenarios.forEach(scenario => {
        const result = processor.processScenario(scenario);
        expect(result.complexity).toBe('complex');
      });
    });

    it('should consider word count in complexity', () => {
      const shortScenario = "I was rich";
      const longScenario = "I was incredibly wealthy and owned multiple international businesses across different industries and had to manage complex relationships with governments and competitors";

      const shortResult = processor.processScenario(shortScenario);
      const longResult = processor.processScenario(longScenario);

      expect(longResult.complexity).not.toBe('simple');
      // Long scenario should be at least as complex as short one
      const complexityOrder = { 'simple': 1, 'moderate': 2, 'complex': 3 };
      expect(complexityOrder[longResult.complexity]).toBeGreaterThanOrEqual(
        complexityOrder[shortResult.complexity]
      );
    });

    it('should consider number of actors and actions in complexity', () => {
      const fewActorsScenario = "I won the lottery";
      const manyActorsScenario = "I, my family, friends, coworkers, and government officials all had to deal with my lottery win";

      const fewResult = processor.processScenario(fewActorsScenario);
      const manyResult = processor.processScenario(manyActorsScenario);

      const complexityOrder = { 'simple': 1, 'moderate': 2, 'complex': 3 };
      expect(complexityOrder[manyResult.complexity]).toBeGreaterThanOrEqual(
        complexityOrder[fewResult.complexity]
      );
    });
  });

  describe('edge cases', () => {
    it('should handle empty strings gracefully', () => {
      const result = processor.processScenario("");
      
      expect(result.originalText).toBe("");
      expect(result.scenarioType).toBe('hypothetical');
      expect(result.keyElements.actors.length).toBeGreaterThan(0);
      expect(result.complexity).toBe('simple');
    });

    it('should handle very short scenarios', () => {
      const result = processor.processScenario("I flew");
      
      expect(result.originalText).toBe("I flew");
      expect(result.scenarioType).toBe('personal');
      expect(result.keyElements.actors).toContain('I');
      expect(result.complexity).toBe('simple');
    });

    it('should handle scenarios with mixed case', () => {
      const scenario = "WhAt If I COULD fly AND everyone ELSE could too";
      const result = processor.processScenario(scenario);

      expect(result.scenarioType).toBe('personal');
      expect(result.keyElements.actors).toContain('I');
      expect(result.keyElements.actors).toContain('everyone');
    });

    it('should handle scenarios with special characters', () => {
      const scenario = "I won $1,000,000 & became famous!!!";
      const result = processor.processScenario(scenario);

      expect(result.scenarioType).toBe('personal');
      expect(result.keyElements.actors).toContain('I');
      expect(result.originalText).toBe(scenario);
    });

    it('should handle scenarios without "what if" prefix', () => {
      const scenario = "dinosaurs never went extinct";
      const result = processor.processScenario(scenario);

      expect(result.scenarioType).toBe('historical');
      expect(result.keyElements.context).toMatch(/^[A-Z]/);
      expect(result.keyElements.context).toMatch(/[.!?]$/);
    });
  });
});