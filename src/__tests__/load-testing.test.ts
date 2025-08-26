import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WhatIfSimulator } from '../services/WhatIfSimulator.js';
import { AIService } from '../services/SeriousOutcomeGenerator.js';

// Mock AI Service for load testing with configurable delays and failure rates
class LoadTestAIService implements AIService {
  private responseDelay: number = 50;
  private failureRate: number = 0;
  private requestCount: number = 0;
  private maxConcurrentRequests: number = Infinity;
  private currentRequests: number = 0;

  async generateResponse(prompt: string): Promise<string> {
    this.requestCount++;
    this.currentRequests++;

    // Simulate rate limiting
    if (this.currentRequests > this.maxConcurrentRequests) {
      this.currentRequests--;
      throw new Error('Rate limit exceeded (429)');
    }

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, this.responseDelay + Math.random() * 20));

      // Simulate random failures
      if (Math.random() < this.failureRate) {
        throw new Error('Simulated AI service failure');
      }

      // Generate response based on prompt type
      if (prompt.toLowerCase().includes('serious') || prompt.toLowerCase().includes('realistic')) {
        return `Serious analysis #${this.requestCount}: This scenario would have significant implications for society, economics, and daily life. The consequences would ripple through various systems and require careful adaptation.`;
      } else {
        return `Fun interpretation #${this.requestCount}: What a delightfully absurd scenario! This would lead to the most wonderfully chaotic and entertaining outcomes, with unexpected magical consequences everywhere!`;
      }
    } finally {
      this.currentRequests--;
    }
  }

  // Configuration methods for testing
  setResponseDelay(delay: number) {
    this.responseDelay = delay;
  }

  setFailureRate(rate: number) {
    this.failureRate = Math.max(0, Math.min(1, rate));
  }

  setMaxConcurrentRequests(max: number) {
    this.maxConcurrentRequests = max;
  }

  getRequestCount(): number {
    return this.requestCount;
  }

  getCurrentRequests(): number {
    return this.currentRequests;
  }

  reset() {
    this.requestCount = 0;
    this.currentRequests = 0;
    this.responseDelay = 50;
    this.failureRate = 0;
    this.maxConcurrentRequests = Infinity;
  }
}

describe('Load Testing and Concurrent User Scenarios', () => {
  let aiService: LoadTestAIService;
  let simulator: WhatIfSimulator;

  beforeEach(() => {
    aiService = new LoadTestAIService();
    aiService.reset();
    simulator = new WhatIfSimulator(aiService, {
      enableLogging: false,
      enableParallelGeneration: true
    });
  });

  describe('Concurrent Request Handling', () => {
    it('should handle multiple simultaneous requests', async () => {
      const scenarios = [
        "What if everyone could fly?",
        "What if robots became teachers?",
        "What if time moved backwards?",
        "What if gravity was reversed?",
        "What if animals could talk?"
      ];

      const startTime = Date.now();
      const promises = scenarios.map(scenario => simulator.processScenario(scenario));
      const results = await Promise.all(promises);
      const totalTime = Date.now() - startTime;

      // All requests should succeed
      results.forEach((result, index) => {
        expect(result.success).toBe(true);
        expect(result.formattedOutput).toBeDefined();
        expect(result.metrics!.totalProcessingTime).toBeGreaterThan(0);
      });

      // Should complete in reasonable time (parallel processing should be faster than sequential)
      expect(totalTime).toBeLessThan(3000); // 3 seconds for 5 concurrent requests
      expect(aiService.getRequestCount()).toBe(10); // 2 requests per scenario (serious + fun)
    });

    it('should handle high concurrency load', async () => {
      const concurrentRequests = 20;
      const scenarios = Array.from({ length: concurrentRequests }, (_, i) =>
        `What if scenario number ${i + 1} happened?`
      );

      const startTime = Date.now();
      const promises = scenarios.map(scenario => simulator.processScenario(scenario));
      const results = await Promise.allSettled(promises);
      const totalTime = Date.now() - startTime;

      // Count successful and failed requests
      const successful = results.filter(result => result.status === 'fulfilled' && result.value.success).length;
      const failed = results.length - successful;

      // Most requests should succeed (allow for some failures under high load)
      expect(successful).toBeGreaterThan(concurrentRequests * 0.8); // At least 80% success rate
      expect(totalTime).toBeLessThan(10000); // Should complete within 10 seconds

      console.log(`Load test: ${successful}/${concurrentRequests} successful, ${failed} failed, ${totalTime}ms total`);
    });

    it('should handle burst traffic patterns', async () => {
      // Simulate burst traffic: quick succession of requests
      const burstSize = 10;
      const bursts = 3;
      const results: any[] = [];

      for (let burst = 0; burst < bursts; burst++) {
        const burstScenarios = Array.from({ length: burstSize }, (_, i) =>
          `What if burst ${burst + 1} scenario ${i + 1} occurred?`
        );

        const burstPromises = burstScenarios.map(scenario => simulator.processScenario(scenario));
        const burstResults = await Promise.allSettled(burstPromises);
        results.push(...burstResults);

        // Small delay between bursts
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const successful = results.filter(result =>
        result.status === 'fulfilled' && result.value.success
      ).length;

      // Should handle burst patterns well
      expect(successful).toBeGreaterThan(results.length * 0.7); // At least 70% success rate
    });
  });

  describe('Performance Under Load', () => {
    it('should maintain response times under moderate load', async () => {
      const scenarios = Array.from({ length: 10 }, (_, i) =>
        `What if performance test scenario ${i + 1} happened?`
      );

      const results = await Promise.all(
        scenarios.map(scenario => simulator.processScenario(scenario))
      );

      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.metrics!.totalProcessingTime).toBeLessThan(2000); // Under 2 seconds each
      });

      // Average response time should be reasonable
      const avgResponseTime = results.reduce((sum, result) =>
        sum + result.metrics!.totalProcessingTime, 0
      ) / results.length;

      expect(avgResponseTime).toBeLessThan(1000); // Average under 1 second
    });

    it('should handle slow AI service gracefully', async () => {
      aiService.setResponseDelay(500); // Slow AI responses

      const scenarios = [
        "What if the AI was slow?",
        "What if responses took time?",
        "What if patience was required?"
      ];

      const startTime = Date.now();
      const results = await Promise.all(
        scenarios.map(scenario => simulator.processScenario(scenario))
      );
      const totalTime = Date.now() - startTime;

      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.metrics!.totalProcessingTime).toBeGreaterThan(400); // Should reflect the delay
      });

      // Should still complete in reasonable time with parallel processing
      expect(totalTime).toBeLessThan(2000); // Parallel processing should help
    });

    it('should handle AI service failures gracefully', async () => {
      aiService.setFailureRate(0.3); // 30% failure rate

      const scenarios = Array.from({ length: 15 }, (_, i) =>
        `What if failure test scenario ${i + 1} occurred?`
      );

      const results = await Promise.all(
        scenarios.map(scenario => simulator.processScenario(scenario))
      );

      // Should still provide results even with AI failures (fallback content)
      const successful = results.filter(result => result.success).length;
      expect(successful).toBeGreaterThan(0); // At least some should succeed with fallbacks

      // Failed requests should have appropriate error handling
      results.forEach(result => {
        if (!result.success) {
          expect(result.error).toBeDefined();
        } else {
          expect(result.formattedOutput).toBeDefined();
        }
      });
    });
  });

  describe('Resource Management', () => {
    it('should handle memory efficiently with many requests', async () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Process many scenarios
      const scenarios = Array.from({ length: 50 }, (_, i) =>
        `What if memory test scenario ${i + 1} happened?`
      );

      // Process in batches to avoid overwhelming the system
      const batchSize = 10;
      for (let i = 0; i < scenarios.length; i += batchSize) {
        const batch = scenarios.slice(i, i + batchSize);
        const batchPromises = batch.map(scenario => simulator.processScenario(scenario));
        await Promise.all(batchPromises);

        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 100MB for 50 requests)
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024);
    });

    it('should handle rate limiting appropriately', async () => {
      aiService.setMaxConcurrentRequests(3); // Limit concurrent requests

      const scenarios = Array.from({ length: 10 }, (_, i) =>
        `What if rate limit test ${i + 1} occurred?`
      );

      const results = await Promise.allSettled(
        scenarios.map(scenario => simulator.processScenario(scenario))
      );

      // Some requests should succeed, some might fail due to rate limiting
      const successful = results.filter(result =>
        result.status === 'fulfilled' && result.value.success
      ).length;

      const rateLimited = results.filter(result =>
        result.status === 'fulfilled' && !result.value.success &&
        result.value.error?.includes('rate limit')
      ).length;

      expect(successful + rateLimited).toBe(scenarios.length);
      expect(successful).toBeGreaterThan(0); // At least some should succeed
    });

    it('should clean up resources properly after requests', async () => {
      const scenario = "What if cleanup test occurred?";

      // Process multiple requests sequentially
      for (let i = 0; i < 10; i++) {
        const result = await simulator.processScenario(scenario);
        expect(result.success).toBe(true);
      }

      // Check that no resources are leaking
      expect(aiService.getCurrentRequests()).toBe(0);
    });
  });

  describe('Stress Testing', () => {
    it('should survive extended load testing', async () => {
      const testDuration = 5000; // 5 seconds
      const startTime = Date.now();
      const results: any[] = [];
      let requestCount = 0;

      // Continuously send requests for the test duration
      while (Date.now() - startTime < testDuration) {
        const scenario = `What if stress test request ${++requestCount} happened?`;
        const promise = simulator.processScenario(scenario);
        results.push(promise);

        // Small delay to prevent overwhelming
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Wait for all requests to complete
      const finalResults = await Promise.allSettled(results);

      const successful = finalResults.filter(result =>
        result.status === 'fulfilled' && result.value.success
      ).length;

      // Should maintain reasonable success rate under stress
      expect(successful).toBeGreaterThan(finalResults.length * 0.5); // At least 50% success
      expect(requestCount).toBeGreaterThan(10); // Should have processed multiple requests

      console.log(`Stress test: ${successful}/${finalResults.length} successful over ${testDuration}ms`);
    });

    it('should handle mixed load patterns', async () => {
      // Mix of quick and slow requests
      const quickScenarios = Array.from({ length: 5 }, (_, i) =>
        `What if quick scenario ${i + 1} happened?`
      );

      aiService.setResponseDelay(200); // Slower for some requests
      const slowScenarios = Array.from({ length: 3 }, (_, i) =>
        `What if slow scenario ${i + 1} happened?`
      );

      // Start slow requests first
      const slowPromises = slowScenarios.map(scenario => simulator.processScenario(scenario));

      // Then start quick requests
      aiService.setResponseDelay(50);
      const quickPromises = quickScenarios.map(scenario => simulator.processScenario(scenario));

      const allResults = await Promise.all([...slowPromises, ...quickPromises]);

      allResults.forEach(result => {
        expect(result.success).toBe(true);
      });

      // Quick requests should generally complete faster
      const quickResults = allResults.slice(-quickScenarios.length);
      const avgQuickTime = quickResults.reduce((sum, result) =>
        sum + result.metrics!.totalProcessingTime, 0
      ) / quickResults.length;

      expect(avgQuickTime).toBeLessThan(500); // Should be relatively fast
    });
  });

  describe('Error Recovery Under Load', () => {
    it('should recover from temporary AI service outages', async () => {
      // Start with high failure rate
      aiService.setFailureRate(0.8);

      const scenarios = Array.from({ length: 5 }, (_, i) =>
        `What if recovery test ${i + 1} happened?`
      );

      // Process some requests with high failure rate
      const initialResults = await Promise.all(
        scenarios.map(scenario => simulator.processScenario(scenario))
      );

      // Reduce failure rate (service recovery)
      aiService.setFailureRate(0.1);

      // Process more requests
      const recoveryResults = await Promise.all(
        scenarios.map(scenario => simulator.processScenario(scenario))
      );

      // Recovery phase should have better success rate
      const initialSuccess = initialResults.filter(r => r.success).length;
      const recoverySuccess = recoveryResults.filter(r => r.success).length;

      expect(recoverySuccess).toBeGreaterThanOrEqual(initialSuccess);
      expect(recoverySuccess).toBeGreaterThan(scenarios.length * 0.6); // At least 60% success after recovery
    });

    it('should maintain service during partial failures', async () => {
      aiService.setFailureRate(0.4); // Moderate failure rate

      const scenarios = Array.from({ length: 20 }, (_, i) =>
        `What if partial failure test ${i + 1} happened?`
      );

      const results = await Promise.all(
        scenarios.map(scenario => simulator.processScenario(scenario))
      );

      // Should still provide meaningful service despite failures
      const successful = results.filter(result => result.success).length;
      expect(successful).toBeGreaterThan(scenarios.length * 0.3); // At least 30% success

      // All requests should complete (no hanging requests)
      expect(results.length).toBe(scenarios.length);
    });
  });
});