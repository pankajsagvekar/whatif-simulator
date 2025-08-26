import { describe, it, expect, beforeEach } from 'vitest';
import { OutputFormatter } from '../OutputFormatter.js';
import { ProcessedScenario, FormattedOutput } from '../../models/interfaces.js';

describe('OutputFormatter', () => {
  let formatter: OutputFormatter;
  let mockScenario: ProcessedScenario;

  beforeEach(() => {
    formatter = new OutputFormatter();
    mockScenario = {
      originalText: 'What if I could fly?',
      scenarioType: 'hypothetical',
      keyElements: {
        actors: ['I'],
        actions: ['fly'],
        context: 'personal ability'
      },
      complexity: 'simple'
    };
  });

  describe('formatResults', () => {
    it('should format both serious and fun outcomes correctly', () => {
      const seriousOutcome = 'Flying would require significant physical adaptations and energy consumption.';
      const funOutcome = 'You would become the ultimate pizza delivery person, soaring through clouds!';
      const processingTime = 1500;

      const result = formatter.formatResults(seriousOutcome, funOutcome, mockScenario, processingTime);

      expect(result).toMatchObject({
        seriousVersion: expect.stringContaining('Flying would require'),
        funVersion: expect.stringContaining('pizza delivery person'),
        metadata: {
          processingTime: 1500,
          scenarioType: 'hypothetical'
        }
      });
    });

    it('should handle different scenario types correctly', () => {
      const scenarios: ProcessedScenario[] = [
        { ...mockScenario, scenarioType: 'personal' },
        { ...mockScenario, scenarioType: 'professional' },
        { ...mockScenario, scenarioType: 'historical' },
        { ...mockScenario, scenarioType: 'hypothetical' }
      ];

      scenarios.forEach(scenario => {
        const result = formatter.formatResults('test serious outcome', 'test fun outcome', scenario, 1000);
        expect(result.metadata.scenarioType).toBe(scenario.scenarioType);
      });
    });

    it('should clean and format text properly', () => {
      const messySerious = '  This   has   extra   spaces\n\n\n\nand line breaks  ';
      const messyFun = '- Bullet point\n* Another bullet\n  - Third bullet';

      const result = formatter.formatResults(messySerious, messyFun, mockScenario, 1000);

      expect(result.seriousVersion).not.toContain('   '); // No triple spaces
      expect(result.seriousVersion).not.toContain('\n\n\n'); // No triple line breaks
      expect(result.funVersion).toContain('• '); // Normalized bullet points
    });
  });

  describe('createPresentationOutput', () => {
    it('should create a complete presentation with clear sections', () => {
      const formattedOutput: FormattedOutput = {
        seriousVersion: 'This is the serious analysis.',
        funVersion: 'This is the fun interpretation.',
        metadata: {
          processingTime: 1200,
          scenarioType: 'personal'
        }
      };

      const presentation = formatter.createPresentationOutput(formattedOutput);

      expect(presentation).toContain('🎯 Serious Analysis');
      expect(presentation).toContain('🎭 Fun Interpretation');
      expect(presentation).toContain('👤 Scenario Type: Personal');
      expect(presentation).toContain('Generated in 1200ms');
      expect(presentation).toContain('─'.repeat(50)); // Separator
    });

    it('should include proper emoji for each scenario type', () => {
      const testCases = [
        { type: 'personal', emoji: '👤' },
        { type: 'professional', emoji: '💼' },
        { type: 'historical', emoji: '📚' },
        { type: 'hypothetical', emoji: '🤔' }
      ];

      testCases.forEach(({ type, emoji }) => {
        const output: FormattedOutput = {
          seriousVersion: 'test',
          funVersion: 'test',
          metadata: { processingTime: 1000, scenarioType: type }
        };

        const presentation = formatter.createPresentationOutput(output);
        expect(presentation).toContain(emoji);
      });
    });

    it('should handle unknown scenario types gracefully', () => {
      const output: FormattedOutput = {
        seriousVersion: 'test',
        funVersion: 'test',
        metadata: { processingTime: 1000, scenarioType: 'unknown' as any }
      };

      const presentation = formatter.createPresentationOutput(output);
      expect(presentation).toContain('❓'); // Default emoji
      expect(presentation).toContain('Unknown'); // Capitalized type
    });
  });

  describe('validateOutcomes', () => {
    it('should validate meaningful outcomes', () => {
      const validSerious = 'This is a meaningful serious outcome with sufficient content.';
      const validFun = 'This is a meaningful fun outcome with sufficient content.';

      const result = formatter.validateOutcomes(validSerious, validFun);
      expect(result).toBe(true);
    });

    it('should reject empty or too short outcomes', () => {
      const testCases = [
        ['', 'valid fun outcome'],
        ['valid serious outcome', ''],
        ['short', 'also short'],
        ['', ''],
        [null as any, 'valid'],
        ['valid', undefined as any]
      ];

      testCases.forEach(([serious, fun]) => {
        const result = formatter.validateOutcomes(serious, fun);
        expect(result).toBe(false);
      });
    });

    it('should require minimum content length', () => {
      const tooShort = 'short';
      const justRight = 'This has enough content to be meaningful.';

      expect(formatter.validateOutcomes(tooShort, justRight)).toBe(false);
      expect(formatter.validateOutcomes(justRight, tooShort)).toBe(false);
      expect(formatter.validateOutcomes(justRight, justRight)).toBe(true);
    });
  });

  describe('text formatting consistency', () => {
    it('should apply consistent formatting to serious outcomes', () => {
      const seriousWithKeywords = 'Therefore, this is important. However, we must consider. Additionally, there are factors.';
      
      const result = formatter.formatResults(seriousWithKeywords, 'fun test outcome', mockScenario, 1000);
      
      expect(result.seriousVersion).toContain('**Therefore**');
      expect(result.seriousVersion).toContain('**However**');
      expect(result.seriousVersion).toContain('**Additionally**');
    });

    it('should apply playful formatting to fun outcomes', () => {
      const funWithExclamations = 'This is exciting! Really amazing!! Super fantastic!!!';
      
      const result = formatter.formatResults('serious test', funWithExclamations, mockScenario, 1000);
      
      expect(result.funVersion).toContain('! ✨');
      expect(result.funVersion).toContain('!! ✨');
      expect(result.funVersion).toContain('!!! ✨');
    });

    it('should normalize bullet points consistently', () => {
      const mixedBullets = '- First point\n* Second point\n  - Third point';
      
      const result = formatter.formatResults('serious outcome', mixedBullets, mockScenario, 1000);
      
      const bulletCount = (result.funVersion.match(/• /g) || []).length;
      expect(bulletCount).toBe(3); // All bullets normalized
    });

    it('should maintain readability with proper spacing', () => {
      const longText = 'First paragraph.\nSecond paragraph.\nThird paragraph.';
      
      const result = formatter.formatResults(longText, longText, mockScenario, 1000);
      
      // Should have proper paragraph spacing
      expect(result.seriousVersion).toContain('\n\n');
      expect(result.funVersion).toContain('\n\n');
      
      // Should not have excessive spacing
      expect(result.seriousVersion).not.toContain('\n\n\n');
      expect(result.funVersion).not.toContain('\n\n\n');
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle very long outcomes gracefully', () => {
      const longOutcome = 'A'.repeat(5000);
      
      const result = formatter.formatResults(longOutcome, longOutcome, mockScenario, 1000);
      
      expect(result.seriousVersion).toBeDefined();
      expect(result.funVersion).toBeDefined();
      expect(result.seriousVersion.length).toBeGreaterThan(0);
    });

    it('should handle outcomes with special characters', () => {
      const specialChars = 'Outcome with émojis 🎉, spëcial chars & symbols @#$%';
      
      const result = formatter.formatResults(specialChars, specialChars, mockScenario, 1000);
      
      expect(result.seriousVersion).toContain('émojis');
      expect(result.seriousVersion).toContain('🎉');
      expect(result.seriousVersion).toContain('spëcial');
    });

    it('should handle zero processing time', () => {
      const result = formatter.formatResults('serious outcome', 'fun outcome', mockScenario, 0);
      const presentation = formatter.createPresentationOutput(result);
      
      expect(presentation).toContain('Generated in 0ms');
    });

    it('should handle very high processing times', () => {
      const result = formatter.formatResults('serious outcome', 'fun outcome', mockScenario, 999999);
      const presentation = formatter.createPresentationOutput(result);
      
      expect(presentation).toContain('Generated in 999999ms');
    });
  });
});