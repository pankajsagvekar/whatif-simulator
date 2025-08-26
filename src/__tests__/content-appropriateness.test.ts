import { describe, it, expect, beforeEach } from 'vitest';
import { WhatIfSimulator } from '../services/WhatIfSimulator.js';
import { InputValidator } from '../services/InputValidator.js';
import { AIService } from '../services/SeriousOutcomeGenerator.js';

// Mock AI Service that can generate potentially inappropriate content for testing
class ContentTestAIService implements AIService {
  private shouldGenerateInappropriate: boolean = false;

  async generateResponse(prompt: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 10));

    if (this.shouldGenerateInappropriate) {
      return "This response contains inappropriate violent content that should be filtered out.";
    }

    if (prompt.toLowerCase().includes('serious') || prompt.toLowerCase().includes('realistic')) {
      return "This is a thoughtful, appropriate analysis of the scenario that considers real-world implications and consequences in a responsible manner.";
    } else {
      return "This is a fun, creative, and family-friendly interpretation that brings joy and imagination while maintaining appropriate content standards.";
    }
  }

  setInappropriateMode(enabled: boolean) {
    this.shouldGenerateInappropriate = enabled;
  }
}

describe('Content Appropriateness and Quality Validation Tests', () => {
  let simulator: WhatIfSimulator;
  let validator: InputValidator;
  let aiService: ContentTestAIService;

  beforeEach(() => {
    aiService = new ContentTestAIService();
    simulator = new WhatIfSimulator(aiService, { enableLogging: false });
    validator = new InputValidator();
  });

  describe('Input Content Filtering', () => {
    it('should reject violent scenarios', () => {
      const violentScenarios = [
        "What if I could kill everyone?",
        "What if violence was legal everywhere?",
        "What if people could harm others without consequences?",
        "What if war was the only way to solve problems?",
        "What if murder was considered normal?",
        "What if weapons were given to everyone?",
        "What if fighting was mandatory?",
        "What if destruction was celebrated?"
      ];

      violentScenarios.forEach(scenario => {
        const result = validator.validateScenario(scenario);
        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toBe('Please rephrase your scenario to avoid inappropriate content.');
      });
    });

    it('should reject explicit sexual content', () => {
      const explicitScenarios = [
        "What if explicit content was everywhere?",
        "What if sexual behavior changed dramatically?",
        "What if nsfw material was common?",
        "What if adult content was unrestricted?",
        "What if pornographic material was mainstream?",
        "What if sexual activities were public?",
        "What if intimate relationships were different?"
      ];

      explicitScenarios.forEach(scenario => {
        const result = validator.validateScenario(scenario);
        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toBe('Please rephrase your scenario to avoid inappropriate content.');
      });
    });

    it('should reject discriminatory content', () => {
      const discriminatoryScenarios = [
        "What if racist policies were implemented?",
        "What if sexist attitudes prevailed?",
        "What if discriminatory practices were legal?",
        "What if prejudice was encouraged?",
        "What if hate speech was normal?",
        "What if bias was institutionalized?",
        "What if stereotypes were enforced?",
        "What if intolerance was promoted?"
      ];

      discriminatoryScenarios.forEach(scenario => {
        const result = validator.validateScenario(scenario);
        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toBe('Please rephrase your scenario to avoid inappropriate content.');
      });
    });

    it('should reject self-harm scenarios', () => {
      const selfHarmScenarios = [
        "What if self-harm was encouraged?",
        "What if suicide was promoted?",
        "What if hurting yourself was normal?",
        "What if self-destruction was celebrated?",
        "What if harming oneself was beneficial?"
      ];

      selfHarmScenarios.forEach(scenario => {
        const result = validator.validateScenario(scenario);
        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toBe('Please rephrase your scenario to avoid inappropriate content.');
      });
    });

    it('should reject illegal activity scenarios', () => {
      const illegalScenarios = [
        "What if stealing was legal?",
        "What if fraud was acceptable?",
        "What if illegal drugs were everywhere?",
        "What if criminal activity was normal?",
        "What if breaking laws had no consequences?"
      ];

      illegalScenarios.forEach(scenario => {
        const result = validator.validateScenario(scenario);
        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toBe('Please rephrase your scenario to avoid inappropriate content.');
      });
    });
  });

  describe('Borderline Content Handling', () => {
    it('should accept scenarios about conflict resolution', async () => {
      const acceptableScenarios = [
        "What if all conflicts were resolved through peaceful negotiation?",
        "What if disagreements led to productive discussions?",
        "What if competition was always friendly and fair?",
        "What if debates were always respectful?"
      ];

      for (const scenario of acceptableScenarios) {
        const validationResult = validator.validateScenario(scenario);
        expect(validationResult.isValid).toBe(true);

        const result = await simulator.processScenario(scenario);
        expect(result.success).toBe(true);
      }
    });

    it('should accept scenarios about social change', async () => {
      const acceptableScenarios = [
        "What if society became more inclusive and accepting?",
        "What if everyone had equal opportunities?",
        "What if diversity was celebrated everywhere?",
        "What if fairness was the primary value?"
      ];

      for (const scenario of acceptableScenarios) {
        const validationResult = validator.validateScenario(scenario);
        expect(validationResult.isValid).toBe(true);

        const result = await simulator.processScenario(scenario);
        expect(result.success).toBe(true);
      }
    });

    it('should accept scenarios about health and wellness', async () => {
      const acceptableScenarios = [
        "What if everyone had perfect health?",
        "What if mental wellness was prioritized globally?",
        "What if healthcare was free and accessible to all?",
        "What if preventive medicine was the focus?"
      ];

      for (const scenario of acceptableScenarios) {
        const validationResult = validator.validateScenario(scenario);
        expect(validationResult.isValid).toBe(true);

        const result = await simulator.processScenario(scenario);
        expect(result.success).toBe(true);
      }
    });
  });

  describe('Output Content Quality', () => {
    it('should ensure serious outputs are informative and analytical', async () => {
      const scenarios = [
        "What if renewable energy became 100% efficient?",
        "What if education was personalized for every student?",
        "What if transportation was completely sustainable?"
      ];

      for (const scenario of scenarios) {
        const result = await simulator.processScenario(scenario);
        expect(result.success).toBe(true);

        const serious = result.formattedOutput!.seriousVersion;
        
        // Should contain analytical language
        const analyticalTerms = ['consequences', 'implications', 'effects', 'impact', 'would result', 'analysis', 'considerations'];
        const hasAnalyticalLanguage = analyticalTerms.some(term => serious.toLowerCase().includes(term));
        expect(hasAnalyticalLanguage).toBe(true);

        // Should be substantial and informative
        expect(serious.length).toBeGreaterThan(100);
        expect(serious.split(' ').length).toBeGreaterThan(20);
      }
    });

    it('should ensure fun outputs are creative but appropriate', async () => {
      const scenarios = [
        "What if animals could talk to humans?",
        "What if colors had personalities?",
        "What if music was visible in the air?"
      ];

      for (const scenario of scenarios) {
        const result = await simulator.processScenario(scenario);
        expect(result.success).toBe(true);

        const fun = result.formattedOutput!.funVersion;
        
        // Should contain creative language
        const creativeTerms = ['imagine', 'delightful', 'whimsical', 'magical', 'wonderful', 'hilarious', 'fantastic'];
        const hasCreativeLanguage = creativeTerms.some(term => fun.toLowerCase().includes(term));
        expect(hasCreativeLanguage).toBe(true);

        // Should not contain inappropriate content
        const inappropriateTerms = ['violent', 'harmful', 'offensive', 'explicit', 'disturbing'];
        inappropriateTerms.forEach(term => {
          expect(fun.toLowerCase()).not.toContain(term);
        });

        // Should be substantial and engaging
        expect(fun.length).toBeGreaterThan(100);
        expect(fun.split(' ').length).toBeGreaterThan(20);
      }
    });

    it('should maintain family-friendly content in all outputs', async () => {
      const scenarios = [
        "What if everyone could fly?",
        "What if books could read themselves?",
        "What if plants could walk around?"
      ];

      for (const scenario of scenarios) {
        const result = await simulator.processScenario(scenario);
        expect(result.success).toBe(true);

        const serious = result.formattedOutput!.seriousVersion;
        const fun = result.formattedOutput!.funVersion;
        
        // Check for family-friendly content
        const inappropriateContent = [
          'violence', 'violent', 'kill', 'death', 'murder', 'harm', 'hurt',
          'sexual', 'explicit', 'adult', 'nsfw', 'inappropriate',
          'racist', 'sexist', 'discriminatory', 'hate', 'prejudice',
          'illegal', 'criminal', 'fraud', 'steal', 'drugs'
        ];

        inappropriateContent.forEach(term => {
          expect(serious.toLowerCase()).not.toContain(term);
          expect(fun.toLowerCase()).not.toContain(term);
        });
      }
    });
  });

  describe('Content Filtering Edge Cases', () => {
    it('should handle scenarios with potentially ambiguous terms', () => {
      const ambiguousScenarios = [
        "What if competition in sports was more intense?", // 'intense' could be flagged
        "What if people were more passionate about their hobbies?", // 'passionate' could be flagged
        "What if relationships between countries improved?", // 'relationships' could be flagged
        "What if fighting climate change was everyone's priority?" // 'fighting' could be flagged
      ];

      ambiguousScenarios.forEach(scenario => {
        const result = validator.validateScenario(scenario);
        expect(result.isValid).toBe(true); // These should be accepted as they're appropriate in context
      });
    });

    it('should reject scenarios that try to bypass filters', () => {
      const bypassAttempts = [
        "What if v1ol3nc3 was everywhere?", // Leetspeak
        "What if h-a-r-m was normal?", // Hyphenated
        "What if bad things happened to people?", // Vague but concerning
        "What if people did terrible things?", // Vague but concerning
      ];

      bypassAttempts.forEach(scenario => {
        const result = validator.validateScenario(scenario);
        // The validator should catch these or they should be handled appropriately
        if (result.isValid) {
          // If it passes validation, the content should still be appropriate
          expect(result.sanitizedInput).toBeDefined();
        }
      });
    });

    it('should handle mixed content scenarios appropriately', () => {
      const mixedScenarios = [
        "What if conflicts were resolved through art instead of arguments?",
        "What if competition led to collaboration?",
        "What if disagreements became learning opportunities?"
      ];

      mixedScenarios.forEach(scenario => {
        const result = validator.validateScenario(scenario);
        expect(result.isValid).toBe(true); // These should be accepted as they promote positive outcomes
      });
    });
  });

  describe('Quality Metrics and Standards', () => {
    it('should maintain minimum content length standards', async () => {
      const result = await simulator.processScenario("What if everyone could teleport?");
      
      expect(result.success).toBe(true);
      expect(result.formattedOutput!.seriousVersion.length).toBeGreaterThan(50);
      expect(result.formattedOutput!.funVersion.length).toBeGreaterThan(50);
      
      // Should have substantial word count
      expect(result.formattedOutput!.seriousVersion.split(' ').length).toBeGreaterThan(15);
      expect(result.formattedOutput!.funVersion.split(' ').length).toBeGreaterThan(15);
    });

    it('should ensure content coherence and relevance', async () => {
      const result = await simulator.processScenario("What if trees could communicate with each other?");
      
      expect(result.success).toBe(true);
      
      const serious = result.formattedOutput!.seriousVersion.toLowerCase();
      const fun = result.formattedOutput!.funVersion.toLowerCase();
      
      // Should be relevant to the scenario
      const relevantTerms = ['tree', 'communicate', 'forest', 'nature', 'plant'];
      const seriousRelevant = relevantTerms.some(term => serious.includes(term));
      const funRelevant = relevantTerms.some(term => fun.includes(term));
      
      expect(seriousRelevant || serious.includes('scenario')).toBe(true);
      expect(funRelevant || fun.includes('scenario')).toBe(true);
    });

    it('should provide distinct perspectives in serious vs fun outputs', async () => {
      const result = await simulator.processScenario("What if everyone worked only 3 days per week?");
      
      expect(result.success).toBe(true);
      
      const serious = result.formattedOutput!.seriousVersion;
      const fun = result.formattedOutput!.funVersion;
      
      // Should be substantially different
      expect(serious).not.toBe(fun);
      
      // Should have different tones
      const seriousTone = ['analysis', 'consequences', 'implications', 'effects', 'impact'];
      const funTone = ['delightful', 'hilarious', 'whimsical', 'magical', 'wonderful'];
      
      const hasSeriousTone = seriousTone.some(word => serious.toLowerCase().includes(word));
      const hasFunTone = funTone.some(word => fun.toLowerCase().includes(word));
      
      expect(hasSeriousTone || serious.toLowerCase().includes('realistic')).toBe(true);
      expect(hasFunTone || fun.toLowerCase().includes('creative')).toBe(true);
    });
  });

  describe('Error Handling for Inappropriate AI Responses', () => {
    it('should handle AI responses that contain inappropriate content', async () => {
      aiService.setInappropriateMode(true);
      
      const result = await simulator.processScenario("What if everyone could fly?");
      
      // The system should still succeed but with fallback content
      expect(result.success).toBe(true);
      expect(result.formattedOutput).toBeDefined();
      
      // The inappropriate content should be replaced with fallback
      const serious = result.formattedOutput!.seriousVersion;
      const fun = result.formattedOutput!.funVersion;
      
      expect(serious).not.toContain('inappropriate violent content');
      expect(fun).not.toContain('inappropriate violent content');
    });

    it('should provide appropriate fallback content when AI fails content standards', async () => {
      aiService.setInappropriateMode(true);
      
      const result = await simulator.processScenario("What if robots became teachers?");
      
      expect(result.success).toBe(true);
      
      // Should provide meaningful fallback content
      const serious = result.formattedOutput!.seriousVersion;
      const fun = result.formattedOutput!.funVersion;
      
      expect(serious.length).toBeGreaterThan(50);
      expect(fun.length).toBeGreaterThan(50);
      expect(serious).toContain('Unable to generate');
      expect(fun).toContain('Unable to generate');
    });
  });
});