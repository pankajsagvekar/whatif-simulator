import { describe, it, expect, beforeEach } from 'vitest';
import { WhatIfWebHandler, WebRequest, WebResponse } from '../WhatIfWebHandler.js';
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

describe('WhatIfWebHandler', () => {
  let webHandler: WhatIfWebHandler;
  let mockAIService: MockAIService;

  beforeEach(() => {
    mockAIService = new MockAIService();
    webHandler = new WhatIfWebHandler(mockAIService);
  });

  describe('Health Check', () => {
    it('should handle health check requests', async () => {
      const request: WebRequest = {
        method: 'GET',
        path: '/'
      };

      const response: WebResponse = await webHandler.handleRequest(request);

      expect(response.statusCode).toBe(200);
      expect(response.headers['Content-Type']).toBe('application/json');
      expect(response.body.status).toBe('healthy');
      expect(response.body.service).toBe('What If Simulator');
      expect(response.body.version).toBe('1.0.0');
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('Scenario Processing Endpoint', () => {
    it('should process valid scenario requests', async () => {
      // Requirements: 4.1, 4.2, 4.3 - Clear version distinction and readable format
      const request: WebRequest = {
        method: 'POST',
        path: '/process',
        body: {
          scenario: 'What if everyone could fly?'
        }
      };

      const response: WebResponse = await webHandler.handleRequest(request);

      expect(response.statusCode).toBe(200);
      expect(response.headers['Content-Type']).toBe('application/json');
      expect(response.body.success).toBe(true);
      expect(response.body.sessionId).toBeDefined();
      expect(response.body.result).toBeDefined();
      expect(response.body.result.seriousVersion).toBeDefined();
      expect(response.body.result.funVersion).toBeDefined();
      expect(response.body.result.metadata).toBeDefined();
      expect(response.body.result.presentationOutput).toBeDefined();
    });

    it('should reject requests without scenario', async () => {
      const request: WebRequest = {
        method: 'POST',
        path: '/process',
        body: {}
      };

      const response: WebResponse = await webHandler.handleRequest(request);

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Scenario is required');
    });

    it('should handle processing errors gracefully', async () => {
      const request: WebRequest = {
        method: 'POST',
        path: '/process',
        body: {
          scenario: '' // Empty scenario should cause validation error
        }
      };

      const response: WebResponse = await webHandler.handleRequest(request);

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should accept custom session ID', async () => {
      const customSessionId = 'custom-session-123';
      const request: WebRequest = {
        method: 'POST',
        path: '/process',
        body: {
          scenario: 'What if robots took over?',
          sessionId: customSessionId
        }
      };

      const response: WebResponse = await webHandler.handleRequest(request);

      expect(response.statusCode).toBe(200);
      expect(response.body.sessionId).toBe(customSessionId);
    });

    it('should accept custom configuration', async () => {
      const request: WebRequest = {
        method: 'POST',
        path: '/process',
        body: {
          scenario: 'What if time travel was possible?',
          config: {
            enableLogging: false,
            maxProcessingTime: 20000
          }
        }
      };

      const response: WebResponse = await webHandler.handleRequest(request);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Feedback Endpoint', () => {
    it('should accept valid feedback submissions', async () => {
      const request: WebRequest = {
        method: 'POST',
        path: '/feedback',
        body: {
          sessionId: 'test-session',
          scenario: 'What if everyone could fly?',
          seriousRating: 4,
          funRating: 5,
          overallSatisfaction: 4,
          comments: 'Great responses!'
        }
      };

      const response: WebResponse = await webHandler.handleRequest(request);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Feedback submitted successfully');
      expect(response.body.feedbackId).toBeDefined();
    });

    it('should reject feedback without required fields', async () => {
      const request: WebRequest = {
        method: 'POST',
        path: '/feedback',
        body: {
          seriousRating: 4,
          funRating: 5
          // Missing sessionId and scenario
        }
      };

      const response: WebResponse = await webHandler.handleRequest(request);

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Session ID and scenario are required');
    });

    it('should retrieve feedback for valid session ID', async () => {
      // First submit feedback
      const submitRequest: WebRequest = {
        method: 'POST',
        path: '/feedback',
        body: {
          sessionId: 'test-session-get',
          scenario: 'What if everyone could fly?',
          seriousRating: 4,
          funRating: 5,
          overallSatisfaction: 4
        }
      };

      await webHandler.handleRequest(submitRequest);

      // Then retrieve it
      const getRequest: WebRequest = {
        method: 'GET',
        path: '/feedback',
        query: {
          sessionId: 'test-session-get'
        }
      };

      const response: WebResponse = await webHandler.handleRequest(getRequest);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.feedback).toBeDefined();
      expect(response.body.feedback).toHaveLength(1);
      expect(response.body.feedback[0].sessionId).toBe('test-session-get');
    });

    it('should require session ID for feedback retrieval', async () => {
      const request: WebRequest = {
        method: 'GET',
        path: '/feedback',
        query: {}
      };

      const response: WebResponse = await webHandler.handleRequest(request);

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Session ID is required');
    });
  });

  describe('Statistics Endpoint', () => {
    it('should return feedback statistics', async () => {
      const request: WebRequest = {
        method: 'GET',
        path: '/stats'
      };

      const response: WebResponse = await webHandler.handleRequest(request);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.stats).toBeDefined();
      expect(response.body.stats.totalFeedbacks).toBeDefined();
      expect(response.body.stats.averageSeriousRating).toBeDefined();
      expect(response.body.stats.averageFunRating).toBeDefined();
      expect(response.body.stats.averageOverallSatisfaction).toBeDefined();
      expect(response.body.stats.sessionCount).toBeDefined();
    });
  });

  describe('Configuration Endpoint', () => {
    it('should return current configuration', async () => {
      const request: WebRequest = {
        method: 'GET',
        path: '/config'
      };

      const response: WebResponse = await webHandler.handleRequest(request);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.config).toBeDefined();
      expect(response.body.config.enableLogging).toBeDefined();
      expect(response.body.config.enableMetrics).toBeDefined();
      expect(response.body.config.maxProcessingTime).toBeDefined();
      expect(response.body.config.enableParallelGeneration).toBeDefined();
    });

    it('should update configuration', async () => {
      const newConfig = {
        enableLogging: false,
        maxProcessingTime: 20000
      };

      const request: WebRequest = {
        method: 'PUT',
        path: '/config',
        body: {
          config: newConfig
        }
      };

      const response: WebResponse = await webHandler.handleRequest(request);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Configuration updated successfully');
      expect(response.body.config).toBeDefined();
      expect(response.body.config.enableLogging).toBe(false);
      expect(response.body.config.maxProcessingTime).toBe(20000);
    });

    it('should reject configuration updates without config data', async () => {
      const request: WebRequest = {
        method: 'PUT',
        path: '/config',
        body: {}
      };

      const response: WebResponse = await webHandler.handleRequest(request);

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Configuration is required');
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for unknown paths', async () => {
      const request: WebRequest = {
        method: 'GET',
        path: '/unknown'
      };

      const response: WebResponse = await webHandler.handleRequest(request);

      expect(response.statusCode).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Not Found');
    });

    it('should handle 405 for unsupported methods', async () => {
      const request: WebRequest = {
        method: 'DELETE',
        path: '/process'
      };

      const response: WebResponse = await webHandler.handleRequest(request);

      expect(response.statusCode).toBe(405);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Method Not Allowed');
    });

    it('should include CORS headers in all responses', async () => {
      const request: WebRequest = {
        method: 'GET',
        path: '/'
      };

      const response: WebResponse = await webHandler.handleRequest(request);

      expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
      expect(response.headers['Access-Control-Allow-Methods']).toBeDefined();
      expect(response.headers['Access-Control-Allow-Headers']).toBeDefined();
    });
  });

  describe('HTML Presentation', () => {
    it('should create HTML presentation for successful responses', () => {
      // Requirements: 4.1, 4.2, 4.3 - Clear distinction and readable format
      const mockResponse = {
        success: true,
        sessionId: 'test-session',
        result: {
          seriousVersion: 'This is a serious analysis of the scenario.',
          funVersion: 'This is a fun and creative interpretation!',
          metadata: {
            processingTime: 1500,
            scenarioType: 'hypothetical'
          },
          presentationOutput: 'Formatted output'
        }
      };

      const html = webHandler.createHTMLPresentation(mockResponse);

      expect(html).toContain('What If Simulator Results');
      expect(html).toContain('Serious Analysis');
      expect(html).toContain('Fun Interpretation');
      expect(html).toContain(mockResponse.result.seriousVersion);
      expect(html).toContain(mockResponse.result.funVersion);
      expect(html).toContain('Processing Details');
      expect(html).toContain('Rate This Response');
      expect(html).toContain('feedbackForm');
    });

    it('should create error HTML for failed responses', () => {
      const mockResponse = {
        success: false,
        sessionId: 'test-session',
        error: 'Processing failed'
      };

      const html = webHandler.createHTMLPresentation(mockResponse);

      expect(html).toContain('Processing Failed');
      expect(html).toContain('Processing failed');
      expect(html).toContain('error');
    });

    it('should include feedback form in successful presentations', () => {
      const mockResponse = {
        success: true,
        sessionId: 'test-session',
        result: {
          seriousVersion: 'Serious analysis',
          funVersion: 'Fun interpretation',
          metadata: {
            processingTime: 1500,
            scenarioType: 'hypothetical'
          },
          presentationOutput: 'Formatted output'
        }
      };

      const html = webHandler.createHTMLPresentation(mockResponse);

      expect(html).toContain('seriousRating');
      expect(html).toContain('funRating');
      expect(html).toContain('overallSatisfaction');
      expect(html).toContain('comments');
      expect(html).toContain('Submit Feedback');
    });
  });

  describe('Integration Flow', () => {
    it('should handle complete web interaction flow', async () => {
      // Requirements: Complete user interaction flow testing
      
      // Step 1: Process scenario
      const processRequest: WebRequest = {
        method: 'POST',
        path: '/process',
        body: {
          scenario: 'What if everyone could read minds?'
        }
      };

      const processResponse = await webHandler.handleRequest(processRequest);
      expect(processResponse.statusCode).toBe(200);
      expect(processResponse.body.success).toBe(true);
      
      const sessionId = processResponse.body.sessionId;

      // Step 2: Submit feedback
      const feedbackRequest: WebRequest = {
        method: 'POST',
        path: '/feedback',
        body: {
          sessionId,
          scenario: 'What if everyone could read minds?',
          seriousRating: 4,
          funRating: 5,
          overallSatisfaction: 4,
          comments: 'Interesting perspectives!'
        }
      };

      const feedbackResponse = await webHandler.handleRequest(feedbackRequest);
      expect(feedbackResponse.statusCode).toBe(200);
      expect(feedbackResponse.body.success).toBe(true);

      // Step 3: Retrieve feedback
      const getFeedbackRequest: WebRequest = {
        method: 'GET',
        path: '/feedback',
        query: { sessionId }
      };

      const getFeedbackResponse = await webHandler.handleRequest(getFeedbackRequest);
      expect(getFeedbackResponse.statusCode).toBe(200);
      expect(getFeedbackResponse.body.success).toBe(true);
      expect(getFeedbackResponse.body.feedback).toHaveLength(1);

      // Step 4: Check stats
      const statsRequest: WebRequest = {
        method: 'GET',
        path: '/stats'
      };

      const statsResponse = await webHandler.handleRequest(statsRequest);
      expect(statsResponse.statusCode).toBe(200);
      expect(statsResponse.body.success).toBe(true);
      expect(statsResponse.body.stats.totalFeedbacks).toBeGreaterThan(0);
    });
  });
});