import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { WhatIfSimulatorApp, createWhatIfSimulatorApp } from '../WhatIfSimulatorApp.js';
import { getConfigForEnvironment, validateConfig } from '../config.js';
import { DemoAIService } from '../demo-simulator.js';
import { AIService } from '../services/SeriousOutcomeGenerator.js';

/**
 * Final integration tests for the complete What If Simulator application
 * Tests all components working together with proper dependency injection
 */

describe('Final Integration Tests', () => {
  let app: WhatIfSimulatorApp;
  let aiService: AIService;

  beforeAll(async () => {
    // Create AI service and application with test configuration
    aiService = new DemoAIService();
    const config = getConfigForEnvironment('test');
    app = await createWhatIfSimulatorApp(aiService, config);
  });

  afterAll(async () => {
    if (app) {
      await app.shutdown();
    }
  });

  describe('Application Initialization', () => {
    it('should initialize successfully with all components', () => {
      const health = app.getHealthStatus();
      
      expect(health.status).toBe('healthy');
      expect(health.initialized).toBe(true);
      expect(health.components.simulator).toBe(true);
      expect(health.components.api).toBe(true);
      expect(health.components.cli).toBe(true);
      expect(health.components.webHandler).toBe(true);
      expect(health.components.aiService).toBe(true);
    });

    it('should have valid configuration', () => {
      const config = app.getConfig();
      const validation = validateConfig(config);
      
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should provide access to all components', () => {
      expect(() => app.getSimulator()).not.toThrow();
      expect(() => app.getAPI()).not.toThrow();
      expect(() => app.getCLI()).not.toThrow();
      expect(() => app.getWebHandler()).not.toThrow();
    });
  });

  describe('End-to-End Scenario Processing', () => {
    it('should process scenarios through the main application', async () => {
      const scenario = 'What if everyone could fly?';
      const result = await app.processScenario(scenario);
      
      expect(result.success).toBe(true);
      expect(result.formattedOutput).toBeDefined();
      expect(result.presentationOutput).toBeDefined();
      expect(result.metrics).toBeDefined();
      
      // Verify both versions are present
      expect(result.formattedOutput!.seriousVersion).toBeTruthy();
      expect(result.formattedOutput!.funVersion).toBeTruthy();
      
      // Verify metrics are collected
      expect(result.metrics!.totalProcessingTime).toBeGreaterThan(0);
      expect(result.metrics!.success).toBe(true);
    });

    it('should handle multiple concurrent scenarios', async () => {
      const scenarios = [
        'What if robots took over all jobs?',
        'What if gravity was half as strong?',
        'What if the internet disappeared?'
      ];
      
      const promises = scenarios.map(scenario => app.processScenario(scenario));
      const results = await Promise.all(promises);
      
      results.forEach((result, index) => {
        expect(result.success).toBe(true);
        expect(result.formattedOutput).toBeDefined();
        expect(result.presentationOutput).toBeDefined();
      });
    });

    it('should handle error scenarios gracefully', async () => {
      const invalidScenario = '';
      const result = await app.processScenario(invalidScenario);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.metrics).toBeDefined();
      expect(result.metrics!.success).toBe(false);
    });
  });

  describe('API Integration', () => {
    it('should process scenarios through API interface', async () => {
      const api = app.getAPI();
      const response = await api.processScenario({
        scenario: 'What if everyone could read minds?'
      });
      
      expect(response.success).toBe(true);
      expect(response.result).toBeDefined();
      expect(response.result!.seriousVersion).toBeTruthy();
      expect(response.result!.funVersion).toBeTruthy();
      expect(response.sessionId).toBeTruthy();
    });

    it('should handle feedback submission', async () => {
      const api = app.getAPI();
      
      // First process a scenario to get a session ID
      const processResponse = await api.processScenario({
        scenario: 'What if time moved backwards?'
      });
      
      expect(processResponse.success).toBe(true);
      
      // Submit feedback
      const feedbackResponse = await api.submitFeedback({
        sessionId: processResponse.sessionId,
        scenario: 'What if time moved backwards?',
        seriousRating: 4,
        funRating: 5,
        overallSatisfaction: 4,
        comments: 'Great responses!'
      });
      
      expect(feedbackResponse.success).toBe(true);
      expect(feedbackResponse.feedbackId).toBeTruthy();
    });

    it('should provide feedback statistics', async () => {
      const api = app.getAPI();
      const stats = await api.getFeedbackStats();
      
      expect(stats).toBeDefined();
      expect(typeof stats.totalFeedbacks).toBe('number');
      expect(typeof stats.sessionCount).toBe('number');
    });
  });

  describe('Web Handler Integration', () => {
    it('should handle web requests for scenario processing', async () => {
      const webHandler = app.getWebHandler();
      
      const response = await webHandler.handleRequest({
        method: 'POST',
        path: '/process',
        body: {
          scenario: 'What if humans could photosynthesize?'
        }
      });
      
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.result).toBeDefined();
    });

    it('should handle health check requests', async () => {
      const webHandler = app.getWebHandler();
      
      const response = await webHandler.handleRequest({
        method: 'GET',
        path: '/'
      });
      
      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe('healthy');
      expect(response.body.service).toBe('What If Simulator');
    });

    it('should handle configuration requests', async () => {
      const webHandler = app.getWebHandler();
      
      const response = await webHandler.handleRequest({
        method: 'GET',
        path: '/config'
      });
      
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.config).toBeDefined();
    });

    it('should handle invalid requests appropriately', async () => {
      const webHandler = app.getWebHandler();
      
      const response = await webHandler.handleRequest({
        method: 'GET',
        path: '/nonexistent'
      });
      
      expect(response.statusCode).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Configuration Management', () => {
    it('should allow configuration updates', () => {
      const originalConfig = app.getConfig();
      
      app.updateConfig({
        enableLogging: false,
        maxProcessingTime: 15000
      });
      
      const updatedConfig = app.getConfig();
      expect(updatedConfig.enableLogging).toBe(false);
      expect(updatedConfig.maxProcessingTime).toBe(15000);
      
      // Restore original config
      app.updateConfig(originalConfig);
    });

    it('should maintain configuration consistency across components', async () => {
      const config = app.getConfig();
      const api = app.getAPI();
      const apiConfig = api.getConfig();
      
      expect(apiConfig.enableLogging).toBe(config.enableLogging);
      expect(apiConfig.enableMetrics).toBe(config.enableMetrics);
      expect(apiConfig.maxProcessingTime).toBe(config.maxProcessingTime);
    });
  });

  describe('Built-in Integration Tests', () => {
    it('should pass all built-in integration tests', async () => {
      const testResult = await app.runIntegrationTest();
      
      expect(testResult.success).toBe(true);
      expect(testResult.results.simulator).toBe(true);
      expect(testResult.results.api).toBe(true);
      expect(testResult.results.webHandler).toBe(true);
      expect(testResult.errors).toHaveLength(0);
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle component failures gracefully', async () => {
      // Test with a scenario that might cause issues
      const problematicScenario = 'What if ' + 'x'.repeat(10000); // Very long scenario
      
      const result = await app.processScenario(problematicScenario);
      
      // Should either succeed or fail gracefully with proper error reporting
      if (!result.success) {
        expect(result.error).toBeDefined();
        expect(result.metrics).toBeDefined();
        expect(result.metrics!.success).toBe(false);
      }
    });

    it('should maintain health status accuracy', () => {
      const health = app.getHealthStatus();
      
      expect(health.status).toBe('healthy');
      expect(health.timestamp).toBeTruthy();
      expect(new Date(health.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('Performance and Metrics', () => {
    it('should collect comprehensive metrics', async () => {
      const scenario = 'What if everyone spoke the same language?';
      const result = await app.processScenario(scenario);
      
      expect(result.success).toBe(true);
      expect(result.metrics).toBeDefined();
      
      const metrics = result.metrics!;
      expect(metrics.totalProcessingTime).toBeGreaterThan(0);
      expect(metrics.validationTime).toBeGreaterThan(0);
      expect(metrics.processingTime).toBeGreaterThan(0);
      expect(metrics.seriousGenerationTime).toBeGreaterThan(0);
      expect(metrics.funGenerationTime).toBeGreaterThan(0);
      expect(metrics.formattingTime).toBeGreaterThan(0);
      expect(metrics.success).toBe(true);
    });

    it('should handle parallel processing correctly', async () => {
      // Ensure parallel processing is enabled
      app.updateConfig({ enableParallelGeneration: true });
      
      const scenario = 'What if money grew on trees?';
      const result = await app.processScenario(scenario);
      
      expect(result.success).toBe(true);
      expect(result.metrics).toBeDefined();
      
      // Both generation times should be recorded
      expect(result.metrics!.seriousGenerationTime).toBeGreaterThan(0);
      expect(result.metrics!.funGenerationTime).toBeGreaterThan(0);
    });
  });

  describe('Graceful Shutdown', () => {
    it('should handle shutdown gracefully', async () => {
      // Create a temporary app for shutdown testing
      const tempAiService = new DemoAIService();
      const tempConfig = getConfigForEnvironment('test');
      const tempApp = await createWhatIfSimulatorApp(tempAiService, tempConfig);
      
      // Verify it's healthy
      expect(tempApp.getHealthStatus().status).toBe('healthy');
      
      // Shutdown should not throw
      await expect(tempApp.shutdown()).resolves.not.toThrow();
      
      // Should no longer be initialized
      expect(tempApp.getHealthStatus().initialized).toBe(false);
    });
  });
});