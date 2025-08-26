import { ReactWhatIfService } from '../services/ReactWhatIfService';

describe('React Integration Tests', () => {
  let service: ReactWhatIfService;

  beforeEach(() => {
    service = new ReactWhatIfService();
  });

  describe('ReactWhatIfService', () => {
    test('validates input correctly', () => {
      expect(service.validateInput('')).toEqual({
        isValid: false,
        message: 'Please enter a scenario'
      });

      expect(service.validateInput('short')).toEqual({
        isValid: false,
        message: 'Please provide a more detailed scenario'
      });

      expect(service.validateInput('What if I could fly?')).toEqual({
        isValid: true
      });
    });

    test('validates long input', () => {
      const longInput = 'a'.repeat(501);
      expect(service.validateInput(longInput)).toEqual({
        isValid: false,
        message: 'Scenario is too long. Please keep it under 500 characters.'
      });
    });

    test('service is properly instantiated', () => {
      expect(service).toBeDefined();
      expect(typeof service.processScenario).toBe('function');
      expect(typeof service.validateInput).toBe('function');
    });
  });
});