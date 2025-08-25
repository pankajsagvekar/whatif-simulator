import { WhatIfSimulator, SimulationResult, SimulatorConfig } from '../services/WhatIfSimulator.js';
import { AIService } from '../services/SeriousOutcomeGenerator.js';

/**
 * User feedback for output quality
 */
export interface UserFeedback {
  sessionId: string;
  scenario: string;
  seriousRating: number; // 1-5 scale
  funRating: number; // 1-5 scale
  overallSatisfaction: number; // 1-5 scale
  comments?: string;
  timestamp: Date;
}

/**
 * API request for scenario processing
 */
export interface ProcessScenarioRequest {
  scenario: string;
  sessionId?: string;
  config?: Partial<SimulatorConfig>;
}

/**
 * API response for scenario processing
 */
export interface ProcessScenarioResponse {
  success: boolean;
  sessionId: string;
  result?: {
    seriousVersion: string;
    funVersion: string;
    metadata: {
      processingTime: number;
      scenarioType: string;
    };
    presentationOutput: string;
  };
  error?: string;
  metrics?: {
    totalProcessingTime: number;
    validationTime: number;
    processingTime: number;
    seriousGenerationTime: number;
    funGenerationTime: number;
    formattingTime: number;
    success: boolean;
    errorType?: string;
  };
}

/**
 * API response for feedback submission
 */
export interface SubmitFeedbackResponse {
  success: boolean;
  message: string;
  feedbackId?: string;
}

/**
 * WhatIfAPI provides interface methods for user interaction
 * Implements requirements 4.1, 4.2, 4.3
 */
export class WhatIfAPI {
  private simulator: WhatIfSimulator;
  private feedbackStore: Map<string, UserFeedback[]> = new Map();
  private sessionCounter: number = 0;

  constructor(aiService: AIService, config?: Partial<SimulatorConfig>) {
    this.simulator = new WhatIfSimulator(aiService, config);
  }

  /**
   * Processes a "What if..." scenario and returns formatted response
   * Requirements: 4.1 - Display results with clear labels
   *              4.2 - Format output in readable manner
   *              4.3 - Ensure versions are easily scannable
   */
  async processScenario(request: ProcessScenarioRequest): Promise<ProcessScenarioResponse> {
    const sessionId = request.sessionId || this.generateSessionId();
    
    try {
      // Process the scenario using the main simulator
      const result: SimulationResult = await this.simulator.processScenario(request.scenario);
      
      if (!result.success) {
        return {
          success: false,
          sessionId,
          error: result.error || 'Processing failed',
          metrics: result.metrics
        };
      }

      // Create response with clear version distinction
      const response: ProcessScenarioResponse = {
        success: true,
        sessionId,
        result: {
          seriousVersion: result.formattedOutput!.seriousVersion,
          funVersion: result.formattedOutput!.funVersion,
          metadata: result.formattedOutput!.metadata,
          presentationOutput: result.presentationOutput!
        },
        metrics: result.metrics
      };

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      return {
        success: false,
        sessionId,
        error: errorMessage
      };
    }
  }

  /**
   * Submits user feedback for output quality assessment
   * Requirements: User feedback mechanisms for output quality
   */
  async submitFeedback(feedback: Omit<UserFeedback, 'timestamp'>): Promise<SubmitFeedbackResponse> {
    try {
      // Validate feedback data
      if (!this.validateFeedback(feedback)) {
        return {
          success: false,
          message: 'Invalid feedback data provided'
        };
      }

      // Add timestamp and store feedback
      const completeFeedback: UserFeedback = {
        ...feedback,
        timestamp: new Date()
      };

      // Store feedback by session ID
      if (!this.feedbackStore.has(feedback.sessionId)) {
        this.feedbackStore.set(feedback.sessionId, []);
      }
      
      this.feedbackStore.get(feedback.sessionId)!.push(completeFeedback);
      
      const feedbackId = `${feedback.sessionId}_${Date.now()}`;
      
      return {
        success: true,
        message: 'Feedback submitted successfully',
        feedbackId
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit feedback';
      
      return {
        success: false,
        message: errorMessage
      };
    }
  }

  /**
   * Retrieves feedback for a specific session
   */
  async getFeedback(sessionId: string): Promise<UserFeedback[]> {
    return this.feedbackStore.get(sessionId) || [];
  }

  /**
   * Gets aggregated feedback statistics
   */
  async getFeedbackStats(): Promise<{
    totalFeedbacks: number;
    averageSeriousRating: number;
    averageFunRating: number;
    averageOverallSatisfaction: number;
    sessionCount: number;
  }> {
    const allFeedbacks: UserFeedback[] = [];
    
    for (const feedbacks of this.feedbackStore.values()) {
      allFeedbacks.push(...feedbacks);
    }

    if (allFeedbacks.length === 0) {
      return {
        totalFeedbacks: 0,
        averageSeriousRating: 0,
        averageFunRating: 0,
        averageOverallSatisfaction: 0,
        sessionCount: 0
      };
    }

    const totalSeriousRating = allFeedbacks.reduce((sum, f) => sum + f.seriousRating, 0);
    const totalFunRating = allFeedbacks.reduce((sum, f) => sum + f.funRating, 0);
    const totalSatisfaction = allFeedbacks.reduce((sum, f) => sum + f.overallSatisfaction, 0);

    return {
      totalFeedbacks: allFeedbacks.length,
      averageSeriousRating: totalSeriousRating / allFeedbacks.length,
      averageFunRating: totalFunRating / allFeedbacks.length,
      averageOverallSatisfaction: totalSatisfaction / allFeedbacks.length,
      sessionCount: this.feedbackStore.size
    };
  }

  /**
   * Updates simulator configuration
   */
  updateConfig(config: Partial<SimulatorConfig>): void {
    this.simulator.updateConfig(config);
  }

  /**
   * Gets current simulator configuration
   */
  getConfig(): SimulatorConfig {
    return this.simulator.getConfig();
  }

  /**
   * Validates feedback data
   */
  private validateFeedback(feedback: Omit<UserFeedback, 'timestamp'>): boolean {
    // Check required fields
    if (!feedback.sessionId || !feedback.scenario) {
      return false;
    }

    // Validate rating ranges (1-5)
    if (feedback.seriousRating < 1 || feedback.seriousRating > 5 ||
        feedback.funRating < 1 || feedback.funRating > 5 ||
        feedback.overallSatisfaction < 1 || feedback.overallSatisfaction > 5) {
      return false;
    }

    return true;
  }

  /**
   * Generates a unique session ID
   */
  private generateSessionId(): string {
    this.sessionCounter++;
    const timestamp = Date.now();
    return `session_${timestamp}_${this.sessionCounter}`;
  }
}