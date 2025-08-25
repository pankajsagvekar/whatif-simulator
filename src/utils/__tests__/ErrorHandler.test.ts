import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  ErrorHandler, 
  WhatIfSimulatorError, 
  ErrorType, 
  DEFAULT_RETRY_OPTIONS 
} from '../ErrorHandler';

describe('ErrorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console.error to avoid noise in tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('WhatIfSimulatorError', () => {
    it('should create error with correct properties', () => {
      const originalError = new Error('Original error');
      const error = new WhatIfSimulatorError(
        'Test error',
        ErrorType.AI_GENERATION,
        originalError,
        true
      );

      expect(error.message).toBe('Test error');
      expect(error.type).toBe(ErrorType.AI_GENERATION);
      expect(error.originalError).toBe(originalError);
      expect(error.retryable).toBe(true);
      expect(error.name).toBe('WhatIfSimulatorError');
    });

    it('should default retryable to false', () => {
      const error = new WhatIfSimulatorError('Test error', ErrorType.INPUT_VALIDATION);
      expect(error.retryable).toBe(false);
    });
  });

  describe('withRetry', () => {
    it('should succeed on first attempt', async () => {
      const operation = vi.fn().mockResolvedValue('success');
      
      const result = await ErrorHandler.withRetry(operation);
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry on retryable errors', async () => {
      const retryableError = new WhatIfSimulatorError(
        'Retryable error',
        ErrorType.NETWORK,
        undefined,
        true
      );
      
      const operation = vi.fn()
        .mockRejectedValueOnce(retryableError)
        .mockRejectedValueOnce(retryableError)
        .mockResolvedValue('success');
      
      const result = await ErrorHandler.withRetry(operation, { maxAttempts: 3, baseDelay: 10 });
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should not retry on non-retryable errors', async () => {
      const nonRetryableError = new WhatIfSimulatorError(
        'Non-retryable error',
        ErrorType.INPUT_VALIDATION,
        undefined,
        false
      );
      
      const operation = vi.fn().mockRejectedValue(nonRetryableError);
      
      await expect(ErrorHandler.withRetry(operation)).rejects.toThrow(nonRetryableError);
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry regular errors (treating them as retryable)', async () => {
      const regularError = new Error('Regular error');
      
      const operation = vi.fn()
        .mockRejectedValueOnce(regularError)
        .mockResolvedValue('success');
      
      const result = await ErrorHandler.withRetry(operation, { maxAttempts: 2, baseDelay: 10 });
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should fail after max attempts', async () => {
      const error = new Error('Persistent error');
      const operation = vi.fn().mockRejectedValue(error);
      
      await expect(
        ErrorHandler.withRetry(operation, { maxAttempts: 2, baseDelay: 10 })
      ).rejects.toThrow('Operation failed after 2 attempts');
      
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should use default retry options', async () => {
      const error = new Error('Test error');
      const operation = vi.fn().mockRejectedValue(error);
      
      await expect(ErrorHandler.withRetry(operation)).rejects.toThrow(
        `Operation failed after ${DEFAULT_RETRY_OPTIONS.maxAttempts} attempts`
      );
      
      expect(operation).toHaveBeenCalledTimes(DEFAULT_RETRY_OPTIONS.maxAttempts);
    });

    it('should apply exponential backoff with jitter', async () => {
      const error = new Error('Test error');
      const operation = vi.fn().mockRejectedValue(error);
      
      const startTime = Date.now();
      
      await expect(
        ErrorHandler.withRetry(operation, { maxAttempts: 2, baseDelay: 100, maxDelay: 1000 })
      ).rejects.toThrow();
      
      const endTime = Date.now();
      const elapsed = endTime - startTime;
      
      // Should have waited at least the base delay (with some tolerance for test execution time)
      expect(elapsed).toBeGreaterThan(50);
    });
  });

  describe('handleAIGenerationError', () => {
    it('should classify timeout errors', () => {
      const timeoutError = new Error('Request timeout occurred');
      
      const result = ErrorHandler.handleAIGenerationError(timeoutError, 'test context');
      
      expect(result.type).toBe(ErrorType.TIMEOUT);
      expect(result.retryable).toBe(true);
      expect(result.message).toContain('test context');
    });

    it('should classify rate limit errors', () => {
      const rateLimitError = new Error('Rate limit exceeded (429)');
      
      const result = ErrorHandler.handleAIGenerationError(rateLimitError, 'test context');
      
      expect(result.type).toBe(ErrorType.RATE_LIMIT);
      expect(result.retryable).toBe(true);
    });

    it('should classify network errors', () => {
      const networkError = new Error('Network connection failed');
      
      const result = ErrorHandler.handleAIGenerationError(networkError, 'test context');
      
      expect(result.type).toBe(ErrorType.NETWORK);
      expect(result.retryable).toBe(true);
    });

    it('should classify invalid request errors as non-retryable', () => {
      const invalidError = new Error('Invalid request format');
      
      const result = ErrorHandler.handleAIGenerationError(invalidError, 'test context');
      
      expect(result.type).toBe(ErrorType.AI_GENERATION);
      expect(result.retryable).toBe(false);
    });

    it('should default to AI_GENERATION type for unknown errors', () => {
      const unknownError = new Error('Unknown error occurred');
      
      const result = ErrorHandler.handleAIGenerationError(unknownError, 'test context');
      
      expect(result.type).toBe(ErrorType.AI_GENERATION);
      expect(result.retryable).toBe(true);
    });
  });

  describe('createFallbackContent', () => {
    it('should create serious fallback content', () => {
      const result = ErrorHandler.createFallbackContent(
        'serious',
        'What if I could fly?',
        'AI service unavailable'
      );
      
      expect(result).toContain('Analysis Framework');
      expect(result).toContain('AI service unavailable');
      expect(result).toContain('What if I could fly?');
      expect(result).toContain('immediate consequences');
      expect(result).toContain('real-world constraints');
    });

    it('should create fun fallback content', () => {
      const result = ErrorHandler.createFallbackContent(
        'fun',
        'What if robots took over?',
        'Network timeout'
      );
      
      expect(result).toContain('Creative Prompt');
      expect(result).toContain('Network timeout');
      expect(result).toContain('What if robots took over?');
      expect(result).toContain('cartoon world');
      expect(result).toContain('magical elements');
      expect(result).toContain('imagination');
    });
  });

  describe('validateContent', () => {
    it('should validate good content', () => {
      const goodContent = 'This is a substantial piece of content that meets the minimum requirements for quality analysis.';
      
      expect(ErrorHandler.validateContent(goodContent)).toBe(true);
    });

    it('should reject null/undefined content', () => {
      expect(ErrorHandler.validateContent(null as any)).toBe(false);
      expect(ErrorHandler.validateContent(undefined as any)).toBe(false);
    });

    it('should reject non-string content', () => {
      expect(ErrorHandler.validateContent(123 as any)).toBe(false);
      expect(ErrorHandler.validateContent({} as any)).toBe(false);
    });

    it('should reject content that is too short', () => {
      expect(ErrorHandler.validateContent('Short')).toBe(false);
      expect(ErrorHandler.validateContent('This is exactly fifty characters long for testing purposes')).toBe(true);
    });

    it('should reject generic error messages', () => {
      expect(ErrorHandler.validateContent('Error occurred while processing')).toBe(false);
      expect(ErrorHandler.validateContent('Failed to generate response')).toBe(false);
      expect(ErrorHandler.validateContent('Unable to complete request')).toBe(false);
      expect(ErrorHandler.validateContent('Sorry, I cannot help with that')).toBe(false);
      expect(ErrorHandler.validateContent('I can\'t process this request')).toBe(false);
    });

    it('should accept content with custom minimum length', () => {
      expect(ErrorHandler.validateContent('Short text', 5)).toBe(true);
      expect(ErrorHandler.validateContent('Hi', 5)).toBe(false);
    });
  });

  describe('logError', () => {
    it('should log WhatIfSimulatorError with full details', () => {
      const originalError = new Error('Original');
      const error = new WhatIfSimulatorError(
        'Test error',
        ErrorType.AI_GENERATION,
        originalError,
        true
      );
      
      ErrorHandler.logError(error, 'test context');
      
      expect(console.error).toHaveBeenCalledWith(
        'WhatIfSimulator Error:',
        expect.objectContaining({
          context: 'test context',
          message: 'Test error',
          type: ErrorType.AI_GENERATION,
          retryable: true,
          timestamp: expect.any(String),
          stack: expect.any(String)
        })
      );
    });

    it('should log regular Error with unknown type', () => {
      const error = new Error('Regular error');
      
      ErrorHandler.logError(error, 'test context');
      
      expect(console.error).toHaveBeenCalledWith(
        'WhatIfSimulator Error:',
        expect.objectContaining({
          context: 'test context',
          message: 'Regular error',
          type: 'UNKNOWN',
          retryable: false
        })
      );
    });
  });
});