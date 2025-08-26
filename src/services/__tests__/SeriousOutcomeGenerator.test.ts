import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SeriousOutcomeGenerator, AIService } from '../SeriousOutcomeGenerator';
import { ProcessedScenario } from '../../models/interfaces';

// Mock AI Service implementation
class MockAIService implements AIService {
  private mockResponses: Map<string, string> = new Map();
  private shouldThrow = false;

  setMockResponse(promptPattern: string, response: string): void {
    this.mockResponses.set(promptPattern, response);
  }

  setShouldThrow(shouldThrow: boolean): void {
    this.shouldThrow = shouldThrow;
  }

  async generateResponse(prompt: string): Promise<string> {
    if (this.shouldThrow) {
      throw new Error('AI service error');
    }

    // Find matching mock response based on prompt content
    for (const [pattern, response] of this.mockResponses) {
      if (prompt.toLowerCase().includes(pattern.toLowerCase())) {
        return response;
      }
    }

    // Default response if no specific mock found
    return 'This is a realistic analysis of the scenario with logical cause-and-effect reasoning.';
  }
}

describe('SeriousOutcomeGenerator', () => {
  let generator: SeriousOutcomeGenerator;
  let mockAIService: MockAIService;

  beforeEach(() => {
    mockAIService = new MockAIService();
    generator = new SeriousOutcomeGenerator(mockAIService);
  });

  describe('generateSeriousOutcome', () => {
    it('should generate serious outcome for simple personal scenario', async () => {
      const scenario: ProcessedScenario = {
        originalText: 'What if I quit my job tomorrow?',
        scenarioType: 'personal',
        keyElements: {
          actors: ['I'],
          actions: ['quit'],
          context: 'I quit my job tomorrow?'
        },
        complexity: 'simple'
      };

      mockAIService.setMockResponse('personal scenario', 
        'Quitting your job without notice would likely result in immediate loss of income and potential difficulty finding new employment due to lack of references.'
      );

      const result = await generator.generateSeriousOutcome(scenario);

      expect(result).toContain('Quitting your job');
      expect(result).toContain('loss of income');
      expect(result.length).toBeGreaterThan(50);
    });

    it('should generate serious outcome for moderate professional scenario', async () => {
      const scenario: ProcessedScenario = {
        originalText: 'What if our company implemented a 4-day work week?',
        scenarioType: 'professional',
        keyElements: {
          actors: ['company'],
          actions: ['implemented'],
          context: 'our company implemented a 4-day work week?'
        },
        complexity: 'moderate'
      };

      mockAIService.setMockResponse('professional scenario',
        'Implementing a 4-day work week would require careful planning to maintain productivity. Initial challenges might include client communication adjustments and workload redistribution, but could lead to improved employee satisfaction and retention.'
      );

      const result = await generator.generateSeriousOutcome(scenario);

      expect(result).toContain('4-day work week');
      expect(result).toContain('productivity');
      expect(result).toContain('employee satisfaction');
    });

    it('should generate serious outcome for complex historical scenario', async () => {
      const scenario: ProcessedScenario = {
        originalText: 'What if the Roman Empire never fell?',
        scenarioType: 'historical',
        keyElements: {
          actors: ['Roman Empire'],
          actions: ['never fell'],
          context: 'the Roman Empire never fell?'
        },
        complexity: 'complex'
      };

      mockAIService.setMockResponse('historical scenario',
        'If the Roman Empire had never fallen, European development would have followed a dramatically different path. Centralized governance might have prevented the fragmentation that led to the Dark Ages, potentially accelerating technological and social progress. However, the empire would have faced ongoing challenges with territorial management, cultural integration, and economic sustainability across such vast distances.'
      );

      const result = await generator.generateSeriousOutcome(scenario);

      expect(result).toContain('Roman Empire');
      expect(result).toContain('European development');
      expect(result).toContain('challenges');
      expect(result.length).toBeGreaterThan(200);
    });

    it('should generate serious outcome for hypothetical scenario', async () => {
      const scenario: ProcessedScenario = {
        originalText: 'What if gravity was half as strong?',
        scenarioType: 'hypothetical',
        keyElements: {
          actors: ['people'],
          actions: ['gravity'],
          context: 'gravity was half as strong?'
        },
        complexity: 'complex'
      };

      mockAIService.setMockResponse('hypothetical scenario',
        'Reduced gravity would fundamentally alter human physiology and planetary systems. Humans would experience decreased bone density and muscle mass over time. Atmospheric retention would be compromised, potentially leading to atmospheric loss. Architecture and transportation would need complete redesign to account for different structural requirements.'
      );

      const result = await generator.generateSeriousOutcome(scenario);

      expect(result).toContain('gravity');
      expect(result).toContain('physiology');
      expect(result).toContain('atmospheric');
    });

    it('should handle AI service errors gracefully', async () => {
      const scenario: ProcessedScenario = {
        originalText: 'What if I learned to fly?',
        scenarioType: 'personal',
        keyElements: {
          actors: ['I'],
          actions: ['learned', 'fly'],
          context: 'I learned to fly?'
        },
        complexity: 'simple'
      };

      mockAIService.setShouldThrow(true);

      const result = await generator.generateSeriousOutcome(scenario);
      expect(result).toContain('Unable to generate serious analysis due to');
      expect(result).toContain('AI service error');
    });

    it('should format short responses with additional context', async () => {
      const scenario: ProcessedScenario = {
        originalText: 'What if I moved to Mars?',
        scenarioType: 'personal',
        keyElements: {
          actors: ['I'],
          actions: ['moved'],
          context: 'I moved to Mars?'
        },
        complexity: 'complex'
      };

      mockAIService.setMockResponse('personal scenario', 'Very difficult. Moving to Mars would require extensive preparation, significant financial resources, and adaptation to harsh environmental conditions. Additional Considerations include isolation from Earth-based support systems. Personal scenarios require careful planning.');

      const result = await generator.generateSeriousOutcome(scenario);

      expect(result).toContain('Very difficult');
      expect(result).toContain('Additional Considerations');
      expect(result).toContain('Personal scenarios');
      expect(result.length).toBeGreaterThan(100);
    });

    it('should add proper formatting to responses', async () => {
      const scenario: ProcessedScenario = {
        originalText: 'What if all cars were electric?',
        scenarioType: 'hypothetical',
        keyElements: {
          actors: ['cars'],
          actions: ['were electric'],
          context: 'all cars were electric?'
        },
        complexity: 'moderate'
      };

      mockAIService.setMockResponse('hypothetical scenario',
        'Electric cars would reduce emissions\n\nHowever infrastructure challenges exist\n\n\n\nBattery technology needs improvement'
      );

      const result = await generator.generateSeriousOutcome(scenario);

      expect(result).not.toContain('\n\n\n\n');
      expect(result).toContain('Electric cars');
      expect(result).toContain('infrastructure challenges');
      expect(result).toContain('Battery technology');
    });

    it('should include scenario-specific contextual analysis', async () => {
      const scenario: ProcessedScenario = {
        originalText: 'What if remote work became mandatory?',
        scenarioType: 'professional',
        keyElements: {
          actors: ['work'],
          actions: ['became mandatory'],
          context: 'remote work became mandatory?'
        },
        complexity: 'complex'
      };

      mockAIService.setMockResponse('professional scenario', 'Remote work changes everything. Professional scenarios would need to adapt to distributed teams, requiring new management approaches and technology infrastructure. This affects multiple stakeholders including employees, managers, and clients with interconnected effects.');

      const result = await generator.generateSeriousOutcome(scenario);

      expect(result).toContain('Remote work changes everything');
      expect(result).toContain('Professional scenarios');
      expect(result).toContain('multiple stakeholders');
      expect(result).toContain('interconnected effects');
    });

    it('should handle scenarios with multiple actors and actions', async () => {
      const scenario: ProcessedScenario = {
        originalText: 'What if governments and companies collaborated on climate change?',
        scenarioType: 'professional',
        keyElements: {
          actors: ['governments', 'companies'],
          actions: ['collaborated'],
          context: 'governments and companies collaborated on climate change?'
        },
        complexity: 'complex'
      };

      mockAIService.setMockResponse('professional scenario',
        'Government-corporate collaboration on climate change would create unprecedented coordination opportunities but also raise concerns about regulatory capture and conflicting interests.'
      );

      const result = await generator.generateSeriousOutcome(scenario);

      expect(result).toContain('Government-corporate collaboration');
      expect(result).toContain('climate change');
      expect(result).toContain('coordination');
    });

    it('should maintain analytical tone in responses', async () => {
      const scenario: ProcessedScenario = {
        originalText: 'What if social media disappeared overnight?',
        scenarioType: 'hypothetical',
        keyElements: {
          actors: ['social media'],
          actions: ['disappeared'],
          context: 'social media disappeared overnight?'
        },
        complexity: 'moderate'
      };

      mockAIService.setMockResponse('hypothetical scenario',
        'The sudden disappearance of social media would disrupt communication patterns, affect business models dependent on digital marketing, and potentially improve mental health outcomes while creating challenges for information dissemination.'
      );

      const result = await generator.generateSeriousOutcome(scenario);

      expect(result).toContain('social media');
      expect(result).toContain('communication patterns');
      expect(result).toContain('business models');
      expect(result).not.toContain('awesome');
      expect(result).not.toContain('terrible');
    });
  });
});