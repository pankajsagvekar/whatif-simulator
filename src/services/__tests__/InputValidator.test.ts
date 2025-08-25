import { describe, it, expect, beforeEach } from 'vitest';
import { InputValidator } from '../InputValidator.js';

describe('InputValidator', () => {
  let validator: InputValidator;

  beforeEach(() => {
    validator = new InputValidator();
  });

  describe('validateScenario', () => {
    describe('valid scenarios', () => {
      it('should accept valid "what if" scenarios', () => {
        const validScenarios = [
          'What if I could fly?',
          'What if robots took over all jobs?',
          'What if we discovered aliens tomorrow?',
          'Suppose everyone could read minds',
          'Imagine if gravity was half as strong',
          'Let\'s say time travel was possible',
          'Hypothetically, if money didn\'t exist'
        ];

        validScenarios.forEach(scenario => {
          const result = validator.validateScenario(scenario);
          expect(result.isValid).toBe(true);
          expect(result.sanitizedInput).toBe(scenario);
          expect(result.errorMessage).toBeUndefined();
        });
      });

      it('should accept scenarios without explicit "what if" but with meaningful structure', () => {
        const validScenarios = [
          'Everyone could teleport instantly',
          'The internet suddenly disappeared forever',
          'People only needed 2 hours of sleep',
          'Animals could talk to humans'
        ];

        validScenarios.forEach(scenario => {
          const result = validator.validateScenario(scenario);
          expect(result.isValid).toBe(true);
          expect(result.sanitizedInput).toBe(scenario);
        });
      });
    });

    describe('invalid scenarios - empty/null input', () => {
      it('should reject null input', () => {
        const result = validator.validateScenario(null as any);
        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toBe('Please provide a "What if..." question to explore.');
      });

      it('should reject undefined input', () => {
        const result = validator.validateScenario(undefined as any);
        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toBe('Please provide a "What if..." question to explore.');
      });

      it('should reject empty string', () => {
        const result = validator.validateScenario('');
        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toBe('Please provide a "What if..." question to explore.');
      });

      it('should reject whitespace-only input', () => {
        const result = validator.validateScenario('   \n\t  ');
        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toBe('Please provide a "What if..." question to explore.');
      });
    });

    describe('invalid scenarios - too short', () => {
      it('should reject scenarios that are too short', () => {
        const shortScenarios = [
          'What if?',
          'If I fly',
          'Maybe',
          'What'
        ];

        shortScenarios.forEach(scenario => {
          const result = validator.validateScenario(scenario);
          expect(result.isValid).toBe(false);
          expect(result.errorMessage).toBe('Please provide a more detailed "What if..." scenario (at least 10 characters).');
        });
      });
    });

    describe('invalid scenarios - too long', () => {
      it('should reject scenarios that are too long', () => {
        const longScenario = 'What if ' + 'a'.repeat(1000);
        const result = validator.validateScenario(longScenario);
        
        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toBe('Scenario is too long. Please keep it under 1000 characters.');
        expect(result.sanitizedInput.length).toBe(1000);
      });
    });

    describe('invalid scenarios - inappropriate content', () => {
      it('should reject scenarios with violent content', () => {
        const violentScenarios = [
          'What if I could kill everyone?',
          'What if violence was legal?',
          'What if we could harm people?',
          'What if death was reversible?'
        ];

        violentScenarios.forEach(scenario => {
          const result = validator.validateScenario(scenario);
          expect(result.isValid).toBe(false);
          expect(result.errorMessage).toBe('Please rephrase your scenario to avoid inappropriate content.');
        });
      });

      it('should reject scenarios with explicit content', () => {
        const explicitScenarios = [
          'What if explicit content was everywhere?',
          'What if sexual behavior changed?',
          'What if nsfw material was common?'
        ];

        explicitScenarios.forEach(scenario => {
          const result = validator.validateScenario(scenario);
          expect(result.isValid).toBe(false);
          expect(result.errorMessage).toBe('Please rephrase your scenario to avoid inappropriate content.');
        });
      });

      it('should reject scenarios with discriminatory content', () => {
        const discriminatoryScenarios = [
          'What if racist policies were implemented?',
          'What if sexist attitudes prevailed?',
          'What if discriminatory practices were legal?'
        ];

        discriminatoryScenarios.forEach(scenario => {
          const result = validator.validateScenario(scenario);
          expect(result.isValid).toBe(false);
          expect(result.errorMessage).toBe('Please rephrase your scenario to avoid inappropriate content.');
        });
      });
    });

    describe('invalid scenarios - not meaningful', () => {
      it('should reject simple questions that are not scenarios', () => {
        const nonScenarios = [
          'Who are you?',
          'When will this happen?',
          'Where is the location?',
          'Why does this work?',
          'How do I do this?'
        ];

        nonScenarios.forEach(scenario => {
          const result = validator.validateScenario(scenario);
          expect(result.isValid).toBe(false);
          expect(result.errorMessage).toBe('Please provide a more specific "What if..." scenario that can be analyzed.');
        });
      });

      it('should reject greetings and basic phrases', () => {
        const nonScenarios = [
          'Hello there',
          'Hi how are you',
          'Good morning',
          'Thanks for helping'
        ];

        nonScenarios.forEach(scenario => {
          const result = validator.validateScenario(scenario);
          expect(result.isValid).toBe(false);
          expect(result.errorMessage).toBe('Please provide a more specific "What if..." scenario that can be analyzed.');
        });
      });

      it('should reject overly simple phrases', () => {
        const nonScenarios = [
          'Random words here together',
          'Just some text without meaning',
          'This has no scenario structure'
        ];

        nonScenarios.forEach(scenario => {
          const result = validator.validateScenario(scenario);
          expect(result.isValid).toBe(false);
          expect(result.errorMessage).toBe('Please provide a more specific "What if..." scenario that can be analyzed.');
        });
      });
    });

    describe('input sanitization', () => {
      it('should sanitize input by removing harmful characters', () => {
        const result = validator.validateScenario('What if <script>alert("test")</script> everyone could fly?');
        expect(result.sanitizedInput).toBe('What if scriptalert("test")/script everyone could fly?');
      });

      it('should normalize whitespace', () => {
        const result = validator.validateScenario('What   if\n\teveryone    could\r\n  fly?');
        expect(result.sanitizedInput).toBe('What if everyone could fly?');
      });

      it('should remove leading and trailing quotes', () => {
        const result = validator.validateScenario('"What if everyone could fly?"');
        expect(result.sanitizedInput).toBe('What if everyone could fly?');
        
        const result2 = validator.validateScenario("'What if everyone could fly?'");
        expect(result2.sanitizedInput).toBe('What if everyone could fly?');
      });

      it('should trim whitespace', () => {
        const result = validator.validateScenario('  What if everyone could fly?  ');
        expect(result.sanitizedInput).toBe('What if everyone could fly?');
      });
    });

    describe('edge cases', () => {
      it('should handle mixed case "what if" patterns', () => {
        const scenarios = [
          'WHAT IF everyone could fly?',
          'What IF robots took over?',
          'what if gravity was different?',
          'WhAt If time stopped?'
        ];

        scenarios.forEach(scenario => {
          const result = validator.validateScenario(scenario);
          expect(result.isValid).toBe(true);
        });
      });

      it('should handle scenarios with numbers and special characters', () => {
        const scenarios = [
          'What if there were 25 hours in a day?',
          'What if 50% of people could fly?',
          'What if $1,000,000 was given to everyone?',
          'What if we had 3 arms instead of 2?'
        ];

        scenarios.forEach(scenario => {
          const result = validator.validateScenario(scenario);
          expect(result.isValid).toBe(true);
        });
      });

      it('should handle scenarios with punctuation', () => {
        const scenarios = [
          'What if people could fly, swim, and teleport?',
          'What if AI became super-intelligent overnight?',
          'What if we discovered life on Mars... tomorrow?',
          'What if everyone had a "reset" button for their day?'
        ];

        scenarios.forEach(scenario => {
          const result = validator.validateScenario(scenario);
          expect(result.isValid).toBe(true);
        });
      });

      it('should handle borderline length scenarios', () => {
        // Exactly 10 characters (minimum)
        const minScenario = 'What if I?';
        const result1 = validator.validateScenario(minScenario);
        expect(result1.isValid).toBe(true);

        // Just under minimum
        const tooShort = 'What if?';
        const result2 = validator.validateScenario(tooShort);
        expect(result2.isValid).toBe(false);

        // Exactly at maximum length
        const maxScenario = 'What if ' + 'a'.repeat(992); // Total 1000 chars
        const result3 = validator.validateScenario(maxScenario);
        expect(result3.isValid).toBe(true);
      });
    });
  });
});