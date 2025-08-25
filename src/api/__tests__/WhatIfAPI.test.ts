import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WhatIfAPI, ProcessScenarioRequest, UserFeedback } from '../WhatIfAPI.js';
import { AIService } from '../../services/SeriousOutcomeGenerator.js';

// Mock AI Service for testing
class MockAIService implements AIService {
  async generateResponse(prompt: string): Promise<string> {
    if (prompt.includes('serious')) {
      return 'This is a serious analysis of the scenario with logical consequences.';
    } else {
      return 'This is a fun and creative interpretation with humor!';
    }
  }
}

describe('WhatIfAPI', () => {
  let api: WhatIfAPI;
  let mockAIService: MockAIService;

  beforeEach(() => {
    mockAIService = new MockAIService();
    api = new WhatIfAPI(mockAIService);
  });

  describe('processScenario', () => {
    it('should process a valid scenario successfully', async () => {
      // Requirements: 4.1, 4.2, 4.3 - Clear version distinction and readable format
      const request: ProcessScenarioRequest = {
        scenario: 'What if everyone could fly?'
      };

      const response = await api.processScenario(request);

      expect(response.success).toBe(true);
      expect(response.sessionId).toBeDefined();
      expect(response.result).toBeDefined();
      expect(response.result!.seriousVersion).toBeDefined();
      expect(response.result!.funVersion).toBeDefined();
      expect(response.result!.metadata).toBeDefined();
      expect(response.result!.presentationOutput).toBeDefined();
      expect(response.metrics).toBeDefined();
    });

    it('should handle invalid scenarios gracefully', async () => {
      const request: ProcessScenarioRequest = {
        scenario: ''
      };

      const response = await api.processScenario(request);

      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
      expect(response.sessionId).toBeDefined();
    });

    it('should use provided session ID', async () => {
      const sessionId = 'test-session-123';
      const request: ProcessScenarioRequest = {
        scenario: 'What if robots took over?',
        sessionId
      };

      const response = await api.processScenario(request);

      expect(response.sessionId).toBe(sessionId);
    });

    it('should generate unique session IDs when not provided', async () => {
      const request1: ProcessScenarioRequest = {
        scenario: 'What if everyone could teleport?'
      };
      const request2: ProcessScenarioRequest = {
        scenario: 'What if time travel was possible?'
      };

      const response1 = await api.processScenario(request1);
      const response2 = await api.processScenario(request2);

      expect(response1.sessionId).toBeDefined();
      expect(response2.sessionId).toBeDefined();
      expect(response1.sessionId).not.toBe(response2.sessionId);
    });

    it('should include processing metrics', async () => {
      const request: ProcessScenarioRequest = {
        scenario: 'What if gravity was reversed?'
      };

      const response = await api.processScenario(request);

      if (response.success) {
        expect(response.metrics).toBeDefined();
        expect(response.metrics!.totalProcessingTime).toBeGreaterThanOrEqual(0);
        expect(response.metrics!.validationTime).toBeGreaterThanOrEqual(0);
        expect(response.metrics!.processingTime).toBeGreaterThanOrEqual(0);
        expect(response.metrics!.seriousGenerationTime).toBeGreaterThanOrEqual(0);
        expect(response.metrics!.funGenerationTime).toBeGreaterThanOrEqual(0);
        expect(response.metrics!.formattingTime).toBeGreaterThanOrEqual(0);
        expect(response.metrics!.success).toBe(true);
      }
    });
  });

  describe('submitFeedback', () => {
    it('should accept valid feedback', async () => {
      const feedback: Omit<UserFeedback, 'timestamp'> = {
        sessionId: 'test-session',
        scenario: 'What if everyone could fly?',
        seriousRating: 4,
        funRating: 5,
        overallSatisfaction: 4,
        comments: 'Great responses!'
      };

      const response = await api.submitFeedback(feedback);

      expect(response.success).toBe(true);
      expect(response.message).toBe('Feedback submitted successfully');
      expect(response.feedbackId).toBeDefined();
    });

    it('should reject invalid feedback - missing required fields', async () => {
      const feedback: Partial<UserFeedback> = {
        seriousRating: 4,
        funRating: 5,
        overallSatisfaction: 4
      };

      const response = await api.submitFeedback(feedback as any);

      expect(response.success).toBe(false);
      expect(response.message).toBe('Invalid feedback data provided');
    });

    it('should reject invalid feedback - ratings out of range', async () => {
      const feedback: Omit<UserFeedback, 'timestamp'> = {
        sessionId: 'test-session',
        scenario: 'What if everyone could fly?',
        seriousRating: 6, // Invalid - out of range
        funRating: 5,
        overallSatisfaction: 4
      };

      const response = await api.submitFeedback(feedback);

      expect(response.success).toBe(false);
      expect(response.message).toBe('Invalid feedback data provided');
    });

    it('should store feedback correctly', async () => {
      const sessionId = 'test-session-feedback';
      const feedback: Omit<UserFeedback, 'timestamp'> = {
        sessionId,
        scenario: 'What if everyone could fly?',
        seriousRating: 4,
        funRating: 5,
        overallSatisfaction: 4,
        comments: 'Great responses!'
      };

      await api.submitFeedback(feedback);
      const storedFeedback = await api.getFeedback(sessionId);

      expect(storedFeedback).toHaveLength(1);
      expect(storedFeedback[0].sessionId).toBe(sessionId);
      expect(storedFeedback[0].scenario).toBe(feedback.scenario);
      expect(storedFeedback[0].seriousRating).toBe(feedback.seriousRating);
      expect(storedFeedback[0].funRating).toBe(feedback.funRating);
      expect(storedFeedback[0].overallSatisfaction).toBe(feedback.overallSatisfaction);
      expect(storedFeedback[0].comments).toBe(feedback.comments);
      expect(storedFeedback[0].timestamp).toBeDefined();
    });
  });

  describe('getFeedback', () => {
    it('should return empty array for non-existent session', async () => {
      const feedback = await api.getFeedback('non-existent-session');
      expect(feedback).toEqual([]);
    });

    it('should return feedback for existing session', async () => {
      const sessionId = 'test-session-get';
      const feedbackData: Omit<UserFeedback, 'timestamp'> = {
        sessionId,
        scenario: 'What if everyone could fly?',
        seriousRating: 4,
        funRating: 5,
        overallSatisfaction: 4
      };

      await api.submitFeedback(feedbackData);
      const feedback = await api.getFeedback(sessionId);

      expect(feedback).toHaveLength(1);
      expect(feedback[0].sessionId).toBe(sessionId);
    });
  });

  describe('getFeedbackStats', () => {
    it('should return zero stats when no feedback exists', async () => {
      const stats = await api.getFeedbackStats();

      expect(stats.totalFeedbacks).toBe(0);
      expect(stats.averageSeriousRating).toBe(0);
      expect(stats.averageFunRating).toBe(0);
      expect(stats.averageOverallSatisfaction).toBe(0);
      expect(stats.sessionCount).toBe(0);
    });

    it('should calculate correct averages with feedback data', async () => {
      // Add multiple feedback entries
      const feedback1: Omit<UserFeedback, 'timestamp'> = {
        sessionId: 'session-1',
        scenario: 'What if everyone could fly?',
        seriousRating: 4,
        funRating: 5,
        overallSatisfaction: 4
      };

      const feedback2: Omit<UserFeedback, 'timestamp'> = {
        sessionId: 'session-2',
        scenario: 'What if robots took over?',
        seriousRating: 2,
        funRating: 3,
        overallSatisfaction: 2
      };

      await api.submitFeedback(feedback1);
      await api.submitFeedback(feedback2);

      const stats = await api.getFeedbackStats();

      expect(stats.totalFeedbacks).toBe(2);
      expect(stats.averageSeriousRating).toBe(3); // (4 + 2) / 2
      expect(stats.averageFunRating).toBe(4); // (5 + 3) / 2
      expect(stats.averageOverallSatisfaction).toBe(3); // (4 + 2) / 2
      expect(stats.sessionCount).toBe(2);
    });
  });

  describe('configuration management', () => {
    it('should update and retrieve configuration', () => {
      const newConfig = {
        enableLogging: false,
        maxProcessingTime: 20000
      };

      api.updateConfig(newConfig);
      const config = api.getConfig();

      expect(config.enableLogging).toBe(false);
      expect(config.maxProcessingTime).toBe(20000);
    });
  });

  describe('integration flow', () => {
    it('should handle complete user interaction flow', async () => {
      // Requirements: Complete user interaction flow testing
      
      // Step 1: Process scenario
      const processRequest: ProcessScenarioRequest = {
        scenario: 'What if everyone could read minds?'
      };

      const processResponse = await api.processScenario(processRequest);
      expect(processResponse.success).toBe(true);
      
      const sessionId = processResponse.sessionId;

      // Step 2: Submit feedback
      const feedback: Omit<UserFeedback, 'timestamp'> = {
        sessionId,
        scenario: processRequest.scenario,
        seriousRating: 4,
        funRating: 5,
        overallSatisfaction: 4,
        comments: 'Interesting perspectives!'
      };

      const feedbackResponse = await api.submitFeedback(feedback);
      expect(feedbackResponse.success).toBe(true);

      // Step 3: Retrieve feedback
      const retrievedFeedback = await api.getFeedback(sessionId);
      expect(retrievedFeedback).toHaveLength(1);
      expect(retrievedFeedback[0].scenario).toBe(processRequest.scenario);

      // Step 4: Check stats
      const stats = await api.getFeedbackStats();
      expect(stats.totalFeedbacks).toBeGreaterThan(0);
      expect(stats.sessionCount).toBeGreaterThan(0);
    });
  });
});