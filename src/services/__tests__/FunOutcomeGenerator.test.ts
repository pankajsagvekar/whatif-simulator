import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FunOutcomeGenerator, AIService } from '../FunOutcomeGenerator';
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

    // Default creative response if no specific mock found
    return 'This is a wonderfully absurd and hilarious interpretation of the scenario with magical consequences!';
  }
}

describe('FunOutcomeGenerator', () => {
  let generator: FunOutcomeGenerator;
  let mockAIService: MockAIService;

  beforeEach(() => {
    mockAIService = new MockAIService();
    generator = new FunOutcomeGenerator(mockAIService);
  });

  describe('generateFunOutcome', () => {
    it('should generate fun outcome for simple personal scenario', async () => {
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
        'You dramatically quit your job by riding a unicorn through the office, leaving a trail of glitter and inspiring your coworkers to start a flash mob celebration!'
      );

      const result = await generator.generateFunOutcome(scenario);

      expect(result).toContain('unicorn');
      expect(result).toContain('glitter');
      expect(result).toContain('flash mob');
      expect(result.length).toBeGreaterThan(50);
    });

    it('should generate fun outcome for moderate professional scenario', async () => {
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
        'The office transforms into a magical wonderland every Friday, with desks that turn into trampolines and the coffee machine dispensing liquid motivation. Employees develop superpowers from the extra rest day!'
      );

      const result = await generator.generateFunOutcome(scenario);

      expect(result).toContain('wonderland');
      expect(result).toContain('trampolines');
      expect(result).toContain('superpowers');
    });

    it('should generate fun outcome for complex historical scenario', async () => {
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
        'The Roman Empire becomes an intergalactic civilization with toga-wearing astronauts conquering Mars using catapult-powered spaceships. Caesar becomes the first emperor of the Milky Way, and gladiators battle aliens in cosmic colosseums!'
      );

      const result = await generator.generateFunOutcome(scenario);

      expect(result).toContain('intergalactic');
      expect(result).toContain('toga-wearing astronauts');
      expect(result).toContain('cosmic colosseums');
      expect(result.length).toBeGreaterThan(200);
    });

    it('should generate fun outcome for hypothetical scenario', async () => {
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
        'Everyone becomes part-time superheroes, bouncing between buildings like human pogo sticks! Dogs learn to fly, causing chaos at dog parks. Basketball becomes a three-dimensional sport played in mid-air bubbles!'
      );

      const result = await generator.generateFunOutcome(scenario);

      expect(result).toContain('superheroes');
      expect(result).toContain('pogo sticks');
      expect(result).toContain('three-dimensional sport');
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

      await expect(generator.generateFunOutcome(scenario)).rejects.toThrow('Failed to generate fun outcome');
    });

    it('should filter inappropriate content', async () => {
      const scenario: ProcessedScenario = {
        originalText: 'What if aliens visited Earth?',
        scenarioType: 'hypothetical',
        keyElements: {
          actors: ['aliens'],
          actions: ['visited'],
          context: 'aliens visited Earth?'
        },
        complexity: 'simple'
      };

      mockAIService.setMockResponse('hypothetical scenario', 
        'The aliens bring hate and violence to Earth, causing discrimination and offensive behavior.'
      );

      const result = await generator.generateFunOutcome(scenario);

      expect(result).not.toContain('hate');
      expect(result).not.toContain('violence');
      expect(result).not.toContain('discrimination');
      expect(result).not.toContain('offensive');
      expect(result).toContain('dislike');
      expect(result).toContain('chaos');
      expect(result).toContain('unfairness');
      expect(result).toContain('silly');
    });

    it('should format short responses with creative notes', async () => {
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

      mockAIService.setMockResponse('personal scenario', 'Space adventure!');

      const result = await generator.generateFunOutcome(scenario);

      expect(result).toContain('Space adventure');
      expect(result).toContain('Plot Twist');
      expect(result).toContain('Personal adventures');
      expect(result).toContain('superpowers');
      expect(result).toContain('parallel dimensions');
      expect(result.length).toBeGreaterThan(100);
    });

    it('should enhance creative formatting with emojis and emphasis', async () => {
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
        'Electric cars become amazing dancing robots\n\n1. They perform incredible light shows\n2. Traffic jams turn into fantastic dance parties\n\nThis creates wonderful chaos everywhere'
      );

      const result = await generator.generateFunOutcome(scenario);

      expect(result).toContain('**amazing**');
      expect(result).toContain('**incredible**');
      expect(result).toContain('**fantastic**');
      expect(result).toContain('**wonderful**');
      expect(result).toContain('🎭');
      expect(result).not.toContain('\n\n\n\n');
      expect(result).toContain('!');
    });

    it('should include scenario-specific creative analysis', async () => {
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

      mockAIService.setMockResponse('professional scenario', 'Everyone works from treehouses.');

      const result = await generator.generateFunOutcome(scenario);

      expect(result).toContain('Everyone works from treehouses');
      expect(result).toContain('Office scenarios');
      expect(result).toContain('secret underground lairs');
      expect(result).toContain('time-traveling consultants');
      expect(result).toContain('parallel dimensions');
    });

    it('should handle scenarios with multiple actors and actions creatively', async () => {
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
        'Governments and companies form a superhero alliance, with CEOs wearing cape-suits and politicians wielding magic climate wands to turn pollution into rainbow butterflies!'
      );

      const result = await generator.generateFunOutcome(scenario);

      expect(result).toContain('superhero alliance');
      expect(result).toContain('cape-suits');
      expect(result).toContain('magic climate wands');
      expect(result).toContain('rainbow butterflies');
    });

    it('should maintain entertaining tone throughout', async () => {
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
        'People rediscover the ancient art of face-to-face conversation, leading to the formation of neighborhood storytelling circles where everyone becomes a professional comedian and mime artist!'
      );

      const result = await generator.generateFunOutcome(scenario);

      expect(result).toContain('ancient art');
      expect(result).toContain('storytelling circles');
      expect(result).toContain('professional comedian');
      expect(result).toContain('mime artist');
      expect(result).not.toContain('serious');
      expect(result).not.toContain('realistic');
    });

    it('should add creative headers when needed', async () => {
      const scenario: ProcessedScenario = {
        originalText: 'What if time travel was possible?',
        scenarioType: 'hypothetical',
        keyElements: {
          actors: ['time'],
          actions: ['travel'],
          context: 'time travel was possible?'
        },
        complexity: 'simple'
      };

      mockAIService.setMockResponse('hypothetical scenario',
        'Time travelers accidentally create a world where dinosaurs run coffee shops and cavemen use smartphones.'
      );

      const result = await generator.generateFunOutcome(scenario);

      expect(result).toContain('Creative Interpretation');
      expect(result).toContain('dinosaurs run coffee shops');
      expect(result).toContain('cavemen use smartphones');
    });

    it('should handle different complexity levels appropriately', async () => {
      const simpleScenario: ProcessedScenario = {
        originalText: 'What if I had superpowers?',
        scenarioType: 'personal',
        keyElements: {
          actors: ['I'],
          actions: ['had superpowers'],
          context: 'I had superpowers?'
        },
        complexity: 'simple'
      };

      const complexScenario: ProcessedScenario = {
        originalText: 'What if the internet was sentient?',
        scenarioType: 'hypothetical',
        keyElements: {
          actors: ['internet'],
          actions: ['was sentient'],
          context: 'the internet was sentient?'
        },
        complexity: 'complex'
      };

      mockAIService.setMockResponse('personal scenario', 'You become a superhero with the power to make everyone smile!');
      mockAIService.setMockResponse('hypothetical scenario', 'The internet develops a personality and starts giving everyone personalized life advice through pop-up windows, while also organizing global dance-offs and teaching cats to use social media!');

      const simpleResult = await generator.generateFunOutcome(simpleScenario);
      const complexResult = await generator.generateFunOutcome(complexScenario);

      expect(simpleResult).toContain('superhero');
      expect(complexResult).toContain('personalized life advice');
      expect(complexResult).toContain('global dance-offs');
      // Complex scenarios should have more content
      expect(complexResult).toContain('teaching cats');
    });
  });
});